import path from 'path';
import matter from 'gray-matter';
import * as fs from 'fs';
import { cache } from 'react';

import type { Language } from '@/types/language';
import type { PostMeta, PostInfo } from '@/types/post';
import { LANGUAGES } from '@/types/language';
import { isPostInCategory, getCategoryBySlug } from '@/lib/categories';
import { convertToSlug } from '@/lib/tags';
import { getImageMeta, extractImageSources } from '@/lib/image';

// 文章所在的資料夾路徑
const postsDirectory = path.join(process.cwd(), 'src', 'posts');

// 回傳所有文章所在的資料夾路徑
export const getPostsDirs = cache(async (): Promise<string[]> => {
  if (typeof window !== 'undefined') return [];

  // 讀取 postsDirectory 資料夾內的所有內容（資料夾、檔案）
  const entries = await fs.promises.readdir(postsDirectory, {
    withFileTypes: true,
  });

  // 篩選出資料夾並排除隱藏資料夾，並回傳資料夾的完整路徑。
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(postsDirectory, entry.name));
});

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
export const getPostsInfo = cache(
  async (lang: Language = 'tw'): Promise<PostInfo[]> => {
    if (typeof window !== 'undefined') return [];

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
        } catch {
          return null;
        }
      })
    );

    // 篩掉讀取失敗的文章，並根據日期排序。
    return postsData
      .filter((post): post is PostInfo => post !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
);

// 根據當前語系、slug 取得特定文章的 metadata 與內容
export const getPostData = cache(
  async (
    lang: Language = 'tw',
    slug: string
  ): Promise<
    (PostMeta & { content: string; imageMetas: Record<string, any> }) | null
  > => {
    const postDir = path.join(postsDirectory, slug);

    if (!fs.existsSync(postDir)) return null;
    const files = await fs.promises.readdir(postDir);

    // 根據當前語系選擇對應的 mdx 檔案
    const mdxFile = files.find((file) => {
      if (lang === 'en') return file === 'index.en.mdx';
      return file === 'index.mdx';
    });

    if (!mdxFile) return null;

    const filePath = path.join(postDir, mdxFile);
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    if (!data.date) return null;

    // 防止顯示 draft 文章
    if (data.draft && process.env.NEXT_PUBLIC_NODE_ENV !== 'development') {
      const err = new Error('This post is a draft.');
      (err as any).code = 'DRAFT_POST';
      throw err;
    }

    const wordCount = await updateWordCount(filePath, content, data);

    // 抓取所有本地圖片路徑
    const imageMetas: Record<string, any> = {};
    const imageSrcs = extractImageSources(content);

    // 加載圖片 meta（並行）
    await Promise.all(
      Array.from(imageSrcs).map(async (src) => {
        if (!src.startsWith('/')) return;
        try {
          imageMetas[src] = await getImageMeta(src.slice(1));
        } catch {
          return null;
        }
      })
    );

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
      imageMetas,
    };
  }
);

// 根據 slug 取得文章的 title、description、date、tags 等 metadata
export const getPostInfoBySlug = cache(
  async (
    lang: Language = 'tw',
    slug: string
  ): Promise<Partial<PostInfo> | null> => {
    const postDir = path.join(postsDirectory, slug);

    if (!fs.existsSync(postDir)) return null;
    const files = await fs.promises.readdir(postDir);

    // 根據當前語系選擇對應的 mdx 檔案
    const mdxFile = files.find((file) => {
      if (lang === 'en') return file === 'index.en.mdx';
      return file === 'index.mdx';
    });

    if (!mdxFile) return null;

    const filePath = path.join(postDir, mdxFile);
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const { data } = matter(fileContents);

    if (!data.title || !data.date) return null;

    return {
      title: data.title,
      description: data.description || '',
      date: data.date,
      tags: data.tags || [],
    };
  }
);

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

export const getPostsMeta = async () => {
  const allPosts = await Promise.all(
    LANGUAGES.map((lang) => getPostsInfo(lang))
  );
  return allPosts.flat().map((post) => ({
    slug: post.slug,
    lang: post.lang,
    title: post.title,
    date: post.date,
  }));
};
