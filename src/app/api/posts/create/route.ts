import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

import { createMDXContent } from '@/utils/mdxWriter';
import {
  ensureEditorAuthorized,
  resolveLanguageFromFormData,
} from '@/utils/adminApi';
import { triggerPrepareContent } from '@/utils/prepareContent';

export const POST = async (req: Request) => {
  const unauthorized = await ensureEditorAuthorized();
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const tags = JSON.parse((formData.get('tags') as string) || '[]');
    const categories = JSON.parse(
      (formData.get('categories') as string) || '[]'
    );
    const lang = resolveLanguageFromFormData(formData);
    const draft = formData.get('draft') === 'true';
    const featured = formData.get('featured') === 'true';
    const password = formData.get('password') as string;
    const coverImageFile = formData.get('coverImage') as File;

    if (!title?.trim())
      return NextResponse.json(
        { message: 'Title is required!' },
        { status: 400 }
      );

    if (!slug?.trim())
      return NextResponse.json(
        { message: 'Slug is required!' },
        { status: 400 }
      );

    if (!content?.trim()) {
      return NextResponse.json(
        { message: 'Content is required!' },
        { status: 400 }
      );
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { message: 'At least one category is required!' },
        { status: 400 }
      );
    }

    // 產生資料夾路徑
    const postsDir = path.join(process.cwd(), 'src', 'posts'); // 放置所有文章的資料夾
    const postDir = path.join(postsDir, slug); // 單篇文章資料夾

    // 檢查 slug 是否重複
    try {
      await fs.access(postDir);
      return NextResponse.json(
        {
          message:
            'A post with this slug already exists. Please choose a different slug.',
        },
        { status: 409 }
      );
    } catch {
      // 資料夾不存在，才可以建立新文章。
    }

    // 建立文章資料夾
    await fs.mkdir(postDir, { recursive: true });

    let coverImagePath = '';

    // 處理封面圖片檔案上傳
    if (coverImageFile && coverImageFile.size > 0) {
      const bytes = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 封面圖要放在 public 目錄（給前端直接載入）
      const publicPostsDir = path.join(process.cwd(), 'public', 'posts', slug);
      await fs.mkdir(publicPostsDir, { recursive: true });

      const fileExtension = coverImageFile.name.split('.').pop(); // 取副檔名
      const coverImageFileName = `cover.${fileExtension}`; // 命名為 cover.xxx
      const coverImageFilePath = path.join(publicPostsDir, coverImageFileName);

      await writeFile(coverImageFilePath, buffer); // 寫入圖片檔案

      // 存取路徑給 mdx 用
      coverImagePath = `/posts/${slug}/${coverImageFileName}`;
    }

    const filename = lang === 'en' ? 'index.en.mdx' : 'index.mdx';
    const filePath = path.join(postDir, filename);

    const now = new Date().toISOString();

    const mdxContent = createMDXContent(
      {
        title,
        description,
        tags,
        categories,
        draft,
        featured,
        password: password?.trim() || undefined,
        coverImage: coverImagePath || undefined,
        date: now,
      },
      content
    );

    // 寫入 mdx 檔案
    await fs.writeFile(filePath, mdxContent, 'utf8');

    // 文章建立後自動更新衍生內容。
    triggerPrepareContent();

    return NextResponse.json(
      {
        message: draft ? 'Post saved as draft.' : 'Post created successfully!',
        slug,
        date: now,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Failed to create post.' },
      { status: 500 }
    );
  }
};
