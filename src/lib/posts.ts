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
const cachedDirs = new Map<string, string[]>();

// 回傳所有文章所在的資料夾路徑
export const getPostsDirs = cache(
  async (lang: Language = 'tw'): Promise<string[]> => {
    if (typeof window !== 'undefined') return [];
    if (cachedDirs.has(lang)) return cachedDirs.get(lang) || [];

    // 讀取 postsDirectory 資料夾內的所有內容（資料夾、檔案）
    const entries = await fs.promises.readdir(postsDirectory, {
      withFileTypes: true,
    });

    // 篩選出資料夾並排除隱藏資料夾，並回傳資料夾的完整路徑。
    const dirs = entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => path.join(postsDirectory, entry.name));

    cachedDirs.set(lang, dirs);

    return dirs;
  }
);

// 根據當前語系取得所有文章的 metadata，並依照日期排序（由新到舊）。
export const getPostsInfo = cache(
  async (lang: Language = 'tw'): Promise<PostInfo[]> => {
    if (typeof window !== 'undefined') return [];

    const dirs = await getPostsDirs(lang);

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
          const { data } = matter(fileContents);

          // 沒有日期、草稿也跳過
          if (
            !data.date ||
            (data.draft && process.env.NEXT_PUBLIC_NODE_ENV !== 'development')
          )
            return null;

          const post: PostInfo = {
            slug: path.basename(dirPath),
            title: data.title,
            description: data.description,
            date: data.date,
            categories: data.categories || [],
            tags: data.tags || [],
            wordCount: data.wordCount || 0,
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

    // 抓取所有本地圖片路徑
    const imageMetas: Record<string, any> = {};
    const imageSrcs = extractImageSources(content);

    // 優化圖片 metadata 加載：限制最大並行數
    const MAX_CONCURRENT = 5;
    let concurrentCount = 0;

    const loadImageMeta = async (src: string) => {
      if (!src.startsWith('/')) return;
      try {
        imageMetas[src] = await getImageMeta(src.slice(1));
      } catch (err) {
        console.error(`Failed to load image metadata for ${src}:`, err);
      } finally {
        concurrentCount--;
      }
    };

    const imagePromises = Array.from(imageSrcs).map((src) => {
      // 控制並發數量
      return new Promise<void>((resolve) => {
        const loadNext = async () => {
          if (concurrentCount >= MAX_CONCURRENT) {
            setTimeout(loadNext, 100); // 等待直到有空閒
            return;
          }

          concurrentCount++;
          await loadImageMeta(src);
          resolve();
        };
        loadNext();
      });
    });

    // 等待所有圖片 metadata 加載完成
    await Promise.all(imagePromises);

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      categories: data.categories || [],
      tags: data.tags || [],
      wordCount: data.wordCount || 0,
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

export const checkPostExistence = async (
  lang: Language,
  slug: string
): Promise<boolean> => {
  const postDir = path.join(postsDirectory, slug);

  if (!fs.existsSync(postDir)) return false;

  try {
    const files = await fs.promises.readdir(postDir);

    // 根據語系選擇對應的檔案
    const mdxFile =
      lang === 'tw'
        ? files.find((file) => file === 'index.en.mdx')
        : files.find((file) => file === 'index.mdx');
    if (!mdxFile) return false;

    return !!mdxFile;
  } catch {
    return false;
  }
};
