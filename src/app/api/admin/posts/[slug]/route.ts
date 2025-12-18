import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';

import { createMDXContent } from '@/utils/mdxWriter';
import type { Language } from '@/types';
import { DEFAULT_LANGUAGE } from '@/config';
import {
  ensureEditorAuthorized,
  resolveLanguageFromFormData,
  resolveLanguageFromRequest,
} from '@/utils/adminApi';
import { triggerPrepareContent } from '@/utils/prepareContent';

const postsRoot = path.join(process.cwd(), 'src', 'posts');
const publicPostsRoot = path.join(process.cwd(), 'public', 'posts');

const getFileName = (lang: Language) =>
  lang === 'en' ? 'index.en.mdx' : 'index.mdx';

const loadPostFile = async (slug: string, lang: Language) => {
  const candidates: Array<{ lang: Language; filePath: string }> = [
    { lang, filePath: path.join(postsRoot, slug, getFileName(lang)) },
  ];

  // 如果指定語系的檔案不存在，使用預設語系做為後備。
  if (lang !== DEFAULT_LANGUAGE)
    candidates.push({
      lang: DEFAULT_LANGUAGE,
      filePath: path.join(postsRoot, slug, getFileName(DEFAULT_LANGUAGE)),
    });

  for (const candidate of candidates) {
    try {
      const file = await fs.readFile(candidate.filePath, 'utf8');
      return { file, lang: candidate.lang };
    } catch {}
  }

  return null;
};

// 取得單一文章內容
export const GET = async (
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const unauthorized = await ensureEditorAuthorized();
  if (unauthorized) return unauthorized;

  try {
    const { slug } = await params;
    const lang = resolveLanguageFromRequest(req);

    const loaded = await loadPostFile(slug, lang);
    if (!loaded)
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });

    const { file, lang: resolvedLang } = loaded;

    // gray-matter 解析 frontmatter 與內容
    const { data, content } = matter(file);

    return NextResponse.json({
      slug,
      lang: resolvedLang,
      title: data.title ?? '',
      description: data.description ?? '',
      date: data.date ?? '',
      categories: data.categories ?? [],
      tags: data.tags ?? [],
      draft: data.draft ?? false,
      featured: data.featured ?? false,
      password: data.password ?? '',
      coverImage: data.coverImage ?? '',
      updatedAt: data.updatedAt ?? '',
      content,
    });
  } catch {
    // 找不到檔案 → 回傳 404
    return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
  }
};

// 更新單一文章內容
export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const unauthorized = await ensureEditorAuthorized();
  if (unauthorized) return unauthorized;

  try {
    const { slug } = await params;
    const formData = await req.formData();

    const lang: Language = resolveLanguageFromFormData(formData);

    const incomingSlug = (formData.get('slug') as string)?.trim();
    const targetSlug = incomingSlug || slug;

    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string) ?? '';
    const content = (formData.get('content') as string) ?? '';
    const tags = JSON.parse((formData.get('tags') as string) || '[]');
    const categories = JSON.parse(
      (formData.get('categories') as string) || '[]'
    );
    const draft = formData.get('draft') === 'true';
    const featured = formData.get('featured') === 'true';
    const password = (formData.get('password') as string)?.trim();

    const coverImageFile = formData.get('coverImage') as File | null;
    const fallbackCover = (formData.get('coverImagePath') as string) ?? '';

    if (!title)
      return NextResponse.json(
        { message: 'Title is required.' },
        { status: 400 }
      );

    if (!content)
      return NextResponse.json(
        { message: 'Content is required.' },
        { status: 400 }
      );

    // 取得原始檔案位置（舊 slug）
    const originalFilePath = path.join(postsRoot, slug, getFileName(lang));

    // 讀取原有內容，用來取得原本的 frontmatter。
    const existingRaw = await fs.readFile(originalFilePath, 'utf8');
    const { data } = matter(existingRaw);

    // date 沒提供就繼承舊文章的 date
    const date = (formData.get('date') as string) || data.date || '';

    const updatedAt = new Date().toISOString();

    if (targetSlug !== slug) {
      // 檢查新 slug 是否已存在資料夾
      const nextDir = path.join(postsRoot, targetSlug);
      try {
        await fs.access(nextDir);
        return NextResponse.json(
          { message: 'Slug already exists.' },
          { status: 409 }
        );
      } catch {}

      await fs.rename(path.join(postsRoot, slug), nextDir);

      const originalPublic = path.join(publicPostsRoot, slug);
      const targetPublic = path.join(publicPostsRoot, targetSlug);
      try {
        await fs.rename(originalPublic, targetPublic);
      } catch {}
    }

    const resolvedDir = path.join(postsRoot, targetSlug);
    const targetFilePath = path.join(resolvedDir, getFileName(lang));

    // 確保資料夾存在
    await fs.mkdir(resolvedDir, { recursive: true });

    // 處理封面圖片
    let coverImagePath = fallbackCover || data.coverImage || '';
    if (coverImageFile && coverImageFile.size > 0) {
      const bytes = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = coverImageFile.name.split('.').pop();
      const coverFileName = `cover.${ext}`;

      const targetPublicDir = path.join(publicPostsRoot, targetSlug);
      await fs.mkdir(targetPublicDir, { recursive: true });

      const filePath = path.join(targetPublicDir, coverFileName);
      await fs.writeFile(filePath, buffer);

      coverImagePath = `/posts/${targetSlug}/${coverFileName}`;
    } else if (coverImagePath && targetSlug !== slug) {
      coverImagePath = coverImagePath.replace(
        `/posts/${slug}/`,
        `/posts/${targetSlug}/`
      );
    }

    // 建立 MDX 內容
    const mdx = createMDXContent(
      {
        title,
        description,
        tags,
        categories,
        draft,
        featured,
        password: password || undefined,
        coverImage: coverImagePath || undefined,
        date: date || new Date().toISOString(),
        updatedAt,
      },
      content
    );

    // 寫入文章檔案
    await fs.writeFile(targetFilePath, mdx, 'utf8');

    // 更新或改名後，同步重新產出衍生內容。
    triggerPrepareContent();

    return NextResponse.json({
      message: 'Post updated.',
      slug: targetSlug,
      date: date || new Date().toISOString(),
      updatedAt,
    });
  } catch {
    return NextResponse.json(
      { message: 'Failed to update post.' },
      { status: 500 }
    );
  }
};
