import path from 'path';
import matter from 'gray-matter';
import * as fs from 'fs';
import { cache } from 'react';

import type { MDXComponents } from 'mdx/types';
import type { Language, PostInfo } from '@/types';
import { LANGUAGES, DEFAULT_LANGUAGE } from '@/config';
import { isPostInCategory, getCategoryBySlug } from '@/lib/categories';
import { convertToSlug } from '@/lib/tags';

// 文章所在的資料夾路徑
const postsDirectory = path.join(process.cwd(), 'src', 'posts');

// 回傳所有文章所在的資料夾路徑
const getPostsDirs = cache(async (): Promise<string[]> => {
  if (typeof window !== 'undefined') return [];

  // 讀取 postsDirectory 資料夾內的所有內容（資料夾、檔案）
  const entries = await fs.promises.readdir(postsDirectory, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(postsDirectory, entry.name));
});

// 根據當前語系取得所有文章的 metadata，並依照日期排序（由新到舊）。
const MDX_FILES = {
  default: 'index.mdx',
  en: 'index.en.mdx',
} as const;

const getTargetFileName = (lang: Language): string => {
  return lang === 'en' ? MDX_FILES.en : MDX_FILES.default;
};

export const getPostsInfo = cache(
  async (lang: Language = DEFAULT_LANGUAGE): Promise<PostInfo[]> => {
    if (typeof window !== 'undefined') return [];

    const dirs = await getPostsDirs();
    const targetFileName = getTargetFileName(lang);

    const postsResults = await Promise.allSettled(
      dirs.map(async (dirPath): Promise<PostInfo | null> => {
        const files = await fs.promises.readdir(dirPath);
        const targetFile = files.find((f) => f === targetFileName);

        if (!targetFile) return null;

        const filePath = path.join(dirPath, targetFile);
        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        const { data } = matter(fileContents);

        // 驗證必要欄位
        if (!data.title || !data.date) return null;

        // 正式環境下跳過草稿
        if (data.draft && process.env.NODE_ENV === 'production') return null;

        const post: PostInfo = {
          slug: path.basename(dirPath),
          title: String(data.title).trim(),
          description: data.description
            ? String(data.description).trim()
            : undefined,
          date: data.date,
          categories: Array.isArray(data.categories) ? data.categories : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          wordCount: typeof data.wordCount === 'number' ? data.wordCount : 0,
          lang,
          featured: Boolean(data.featured),
          coverImage: data.coverImage
            ? String(data.coverImage).trim()
            : undefined,
          hasPassword: Boolean(data.password),
        };

        return post;
      })
    );

    // 篩選成功的結果並按日期排序
    const validPosts = postsResults
      .filter(
        (result): result is PromiseFulfilledResult<PostInfo | null> =>
          result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => result.value!);

    return validPosts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
);

// 根據當前語系、slug 取得特定文章的 metadata 與內容
export const getPostData = cache(
  async (lang: Language = DEFAULT_LANGUAGE, slug: string) => {
    try {
      const postDir = path.join(postsDirectory, slug);
      if (!fs.existsSync(postDir)) return null;

      const targetFileName = getTargetFileName(lang);
      const files = await fs.promises.readdir(postDir);
      const mdxFile = files.find((file) => file === targetFileName);
      if (!mdxFile) return null;

      // 讀取並解析 MDX 文件
      const filePath = path.join(postDir, mdxFile);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      // 驗證必要欄位
      if (!data.title && !data.date) return null;
      // 防止顯示 draft 文章
      if (data.draft && process.env.NODE_ENV === 'production') {
        const err = new Error('This post is a draft.');
        (err as any).code = 'DRAFT_POST';
        throw err;
      }

      // 從預先生成的 imageMetas.json 中讀取模糊圖資料
      const imageMetasPath = path.join(
        process.cwd(),
        'public',
        'imageMetas.json'
      );
      let imageMetasRaw: Record<string, any> = {};
      try {
        const imageMetasFile = await fs.promises.readFile(
          imageMetasPath,
          'utf8'
        );
        imageMetasRaw = JSON.parse(imageMetasFile);
      } catch (err) {
        console.warn(
          `Failed to load image metas:`,
          err instanceof Error ? err.message : String(err)
        );
      }

      // 過濾出這篇文章實際有用到的圖片 metadata
      const imageMetas: Record<string, any> = {};
      for (const [src, meta] of Object.entries(imageMetasRaw)) {
        if (typeof src === 'string' && content.includes(src))
          imageMetas[src] = meta;
      }

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
    } catch {
      return null;
    }
  }
);

// 根據 slug 取得文章的 title、description、date、tags 等 metadata
export const getPostInfoBySlug = cache(
  async (
    lang: Language = DEFAULT_LANGUAGE,
    slug: string
  ): Promise<Partial<PostInfo> | null> => {
    const postDir = path.join(postsDirectory, slug);

    if (!fs.existsSync(postDir)) return null;
    const files = await fs.promises.readdir(postDir);

    // 根據當前語系選擇對應的 mdx 檔案
    const targetFileName = getTargetFileName(lang);
    const mdxFile = files.find((file) => file === targetFileName);

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
  lang: Language = DEFAULT_LANGUAGE
): Promise<PostInfo[]> => {
  const posts = await getPostsInfo(lang);
  const category = await getCategoryBySlug(categoryPath, posts);

  if (!category) return [];

  return posts.filter((post) => isPostInCategory(post, category.name));
};

const getTagToPostsMap = cache(async (lang: Language) => {
  const posts = await getPostsInfo(lang);
  const map = new Map<string, PostInfo[]>();

  for (const post of posts) {
    if (post.tags) {
      for (const postTag of post.tags) {
        const slug = convertToSlug(postTag);
        if (!map.has(slug)) map.set(slug, []);

        map.get(slug)!.push(post);
      }
    }
  }
  return map;
});

// 根據 tag name 或 slug 取得相應文章
export const getPostsByTag = async (
  tag: string,
  lang: Language = DEFAULT_LANGUAGE
): Promise<PostInfo[]> => {
  const tagSlug = convertToSlug(tag);
  const tagMap = await getTagToPostsMap(lang);
  return tagMap.get(tagSlug) || [];
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

export const checkPostExistence = cache(
  async (
    curLang: Language,
    slug: string
  ): Promise<{ exist: boolean; langs: Language[] }> => {
    const postDir = path.join(postsDirectory, slug);

    if (!fs.existsSync(postDir)) return { exist: false, langs: [] };

    try {
      const files = await fs.promises.readdir(postDir);

      // 找出哪些語系的文章存在
      const langs = LANGUAGES.filter((lang) => {
        const filename = getTargetFileName(lang);
        return files.includes(filename);
      });

      // 是否有除了 curLang 外的其他語系的文章存在
      const exist = langs.some((lang) => lang !== curLang);

      return { exist, langs };
    } catch {
      return { exist: false, langs: [] };
    }
  }
);

export const DEFAULT_POSTS_PER_PAGE = 8;

type PostFilterType = 'popular' | 'related';

interface FilteredPostParams {
  lang?: Language;
  category?: string | null;
  tag?: string | null;
  keyword?: string | null;
}

interface PaginatedPostParams extends FilteredPostParams {
  filter?: PostFilterType | null;
  currentSlug?: string | null;
  categories?: string[] | null;
  page?: number;
  postsPerPage?: number;
}

// 分頁處理
const paginatePosts = (
  posts: PostInfo[],
  page: number,
  postsPerPage: number
) => {
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;
  const paginated = posts.slice(start, end);

  return {
    posts: paginated,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      postsPerPage,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
  };
};

export const getFilteredPosts = async ({
  lang = DEFAULT_LANGUAGE,
  category,
  tag,
  keyword,
}: FilteredPostParams): Promise<PostInfo[]> => {
  let posts: PostInfo[] = [];

  // 根據分類或標籤來取得文章
  if (category) posts = await getPostsByCategory(category, lang);
  else if (tag) posts = await getPostsByTag(tag, lang);
  else posts = await getPostsInfo(lang);

  // 如果有關鍵字，進行標題、分類、標籤與敘述的搜尋。
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    posts = posts.filter(
      ({ title, categories = [], tags = [], description = '' }) => {
        const haystacks = [title, description, ...categories, ...tags];
        return haystacks.some((field) =>
          field?.toLowerCase().includes(lowerKeyword)
        );
      }
    );
  }

  // 所有文章依照日期排序（由新到舊）
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getPaginatedPosts = async ({
  lang = DEFAULT_LANGUAGE,
  category,
  tag,
  keyword,
  filter,
  currentSlug,
  categories,
  page = 1,
  postsPerPage = DEFAULT_POSTS_PER_PAGE,
}: PaginatedPostParams) => {
  let posts = await getFilteredPosts({ lang, category, tag, keyword });

  // 處理不同的篩選文章的條件
  if (filter === 'popular') {
    posts = posts.filter((post) => post.featured);
    // .sort((a, b) => (b.views ?? 0) - (a.views ?? 0)); // 暫時以精選代替熱門，未來再調整。
  } else if (filter === 'related') {
    if (!currentSlug || !categories?.length)
      throw new Error('Missing required parameters for related posts.');

    posts = posts
      .filter(
        (post) =>
          post.slug !== currentSlug &&
          post.categories.some((categoryName) =>
            categories.includes(categoryName)
          )
      )
      .slice(0, 3); // 限制相關文章數量為 3
  }

  return paginatePosts(posts, page, postsPerPage);
};

// 動態載入指定文章的自定義元件
export const loadPostComponents = async (
  slug: string
): Promise<MDXComponents> => {
  try {
    // 檢查是否有自定義組件存在
    const postDir = path.join(postsDirectory, slug);

    const hasComponents = ['components.jsx', 'components.js'].some((filename) =>
      fs.existsSync(path.join(postDir, filename))
    );

    if (!hasComponents) return {};

    const componentsModule = await import(`@/posts/${slug}/components`);
    return componentsModule.default || {};
  } catch {
    return {};
  }
};
