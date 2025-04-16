import path from 'path';
import matter from 'gray-matter';
import * as fs from 'fs';

import type { Language } from '@/types/language';
import type { PostMeta, PostInfo } from '@/types/post';
import { isPostInCategory, getCategoryBySlug } from '@/lib/categories';
import { convertToSlug } from '@/lib/tags';

if (typeof window !== 'undefined')
  throw new Error('This module must be used on the server side.');

// 文章所在的資料夾路徑
const postsDirectory = path.join(process.cwd(), 'src', 'posts');

// 回傳所有文章所在的資料夾路徑
export const getPostsDirs = async (): Promise<string[]> => {
  if (typeof window !== 'undefined')
    throw new Error('This function can only be called on the server side.');

  // 讀取 postsDirectory 資料夾內的所有內容（資料夾、檔案）
  const entries = await fs.promises.readdir(postsDirectory, {
    withFileTypes: true,
  });

  // 篩選出資料夾並排除隱藏資料夾，並回傳資料夾的完整路徑。
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(postsDirectory, entry.name));
};

// 計算字數：中文字符數量 + 英文單詞數量
const calculateWordCount = (content: string): number => {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = content
    .replace(/[\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter((word) => word.trim().length > 0).length;

  return chineseChars + englishWords;
};

// 如果 frontmatter 中沒有 wordCount 或 wordCount 不一致，則更新檔案的 wordCount。
const updateWordCount = async (
  filePath: string,
  content: string,
  data: any
) => {
  const wordCount = calculateWordCount(content);
  if (
    data.wordCount !== wordCount &&
    process.env.NEXT_PUBLIC_NODE_ENV === 'development'
  ) {
    const updatedContent = matter.stringify(content, { ...data, wordCount });
    await fs.promises.writeFile(filePath, updatedContent, 'utf8');
  }
  return wordCount;
};

// 根據當前語系取得所有文章的 metadata，並依照日期排序（由新到舊）。
export const getPostsInfo = async (
  lang: Language = 'tw'
): Promise<PostInfo[]> => {
  if (typeof window !== 'undefined')
    throw new Error('This function can only be called on the server side.');

  const dirs = await getPostsDirs();

  const postsData = await Promise.all(
    dirs.map(async (dirPath) => {
      try {
        const files = await fs.promises.readdir(dirPath);

        // 根據語系選擇對應的檔案
        const targetFile =
          lang === 'en'
            ? files.find((f) => f === 'index.en.mdx')
            : files.find((f) => f === 'index.mdx');

        // 如果找不到對應語系的檔案，跳過這篇文章。
        if (!targetFile) return null;

        const filePath = path.join(dirPath, targetFile);
        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        // 沒有日期、草稿也跳過
        if (
          !data.date ||
          (data.draft && process.env.NEXT_PUBLIC_NODE_ENV !== 'development')
        )
          return null;

        const wordCount = await updateWordCount(filePath, content, data);

        const post: PostInfo = {
          slug: path.basename(dirPath),
          title: data.title,
          description: data.description,
          date: data.date,
          categories: data.categories || [],
          tags: data.tags || [],
          wordCount: wordCount,
          lang,
          featured: data.featured ?? false,
          coverImage: data.coverImage,
        };

        return post;
      } catch (err) {
        throw new Error(`Error loading post ${dirPath}: ${err.message}.`);
      }
    })
  );

  // 篩掉讀取失敗的文章
  const validPosts = postsData.filter(
    (post): post is PostInfo => post !== null
  );
  // 根據日期排序
  return validPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// 根據當前語系、slug 取得特定文章的 metadata 與內容
export const getPostData = async (
  lang: Language = 'tw',
  slug: string
): Promise<PostMeta & { content: string }> => {
  const postDir = path.join(postsDirectory, slug);

  let files: string[];
  try {
    files = await fs.promises.readdir(postDir);
  } catch (err) {
    throw new Error(`Error reading directory ${postDir}: ${err.message}.`);
  }

  // 根據當前語系選擇對應的 mdx 檔案
  const mdxFile = files.find((file) => {
    if (lang === 'en') return file === 'index.en.mdx';
    return file === 'index.mdx';
  });

  if (!mdxFile)
    throw new Error(`No MDX file found for slug ${slug} and lang ${lang}.`);

  const filePath = path.join(postDir, mdxFile);
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  if (!data.date)
    throw new Error(`Missing "date" in frontmatter for post: ${slug}`);

  // 防止顯示 draft 文章
  if (data.draft && process.env.NEXT_PUBLIC_NODE_ENV !== 'development') {
    const err = new Error('This post is a draft.');
    (err as any).code = 'DRAFT_POST';
    throw err;
  }

  const wordCount = await updateWordCount(filePath, content, data);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    categories: data.categories || [],
    tags: data.tags || [],
    wordCount: wordCount,
    lang,
    password: data.password,
    hasPassword: !!data.password,
    draft: data.draft ?? false,
    featured: data.featured ?? false,
    coverImage: data.coverImage,
    updatedAt: data.updatedAt,
    content,
  };
};

// 根據 category name、slug 取得相應文章
export const getPostsByCategory = async (
  categoryPath: string,
  lang: Language = 'tw'
): Promise<PostInfo[]> => {
  const posts = await getPostsInfo(lang);
  const category = await getCategoryBySlug(categoryPath, posts);

  if (!category) return [];

  return posts.filter((post) => isPostInCategory(post, category.name));
};

// 根據 tag name 或 slug 取得相應文章
export const getPostsByTag = async (
  tag: string,
  lang: Language = 'tw'
): Promise<PostInfo[]> => {
  const posts = await getPostsInfo(lang);

  return posts.filter((post) => {
    return (
      post.tags &&
      post.tags.some(
        (postTag) =>
          postTag.toLowerCase() === tag.toLowerCase() ||
          convertToSlug(postTag) === convertToSlug(tag)
      )
    );
  });
};
