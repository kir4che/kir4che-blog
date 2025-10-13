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

// 取得單篇或多篇文章的 metadata
export const getPostsInfo = cache(
  async (
    lang: Language = DEFAULT_LANGUAGE,
    slug?: string
  ): Promise<PostInfo[] | Partial<PostInfo> | null> => {
    if (typeof window !== 'undefined') return slug ? null : [];

    if (slug) {
      // 單篇文章
      const postDir = path.join(postsDirectory, slug);
      if (!fs.existsSync(postDir)) return null;

      const files = await fs.promises.readdir(postDir);
      const targetFileName = getTargetFileName(lang);
      const mdxFile = files.find((file) => file === targetFileName);
      if (!mdxFile) return null;

      const filePath = path.join(postDir, mdxFile);
      const fileContents = await fs.promises.readFile(filePath, 'utf8');
      const { data } = matter(fileContents);

      // 驗證必要欄位
      if (!data.title || !data.date) return null;

      return {
        title: data.title,
        description: data.description || '',
        date: data.date,
        tags: data.tags || [],
      };
    } else {
      // 多篇文章
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
  }
);

// 根據語系和 slug 取得特定文章的完整資料（包括內容）
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
      if (!data.title || !data.date) return null;

      // 正式環境下禁止顯示草稿
      if (data.draft && process.env.NODE_ENV === 'production') {
        const err = new Error('This post is a draft.');
        (err as any).code = 'DRAFT_POST';
        throw err;
      }

      // 從預先生成的 imageMetas.json 中讀取模糊圖資料
      let imageMetas: Record<string, any> = {};
      try {
        const imageMetasPath = path.join(
          process.cwd(),
          'public',
          'imageMetas.json'
        );
        const imageMetasFile = await fs.promises.readFile(
          imageMetasPath,
          'utf8'
        );
        const imageMetasRaw: Record<string, any> = JSON.parse(imageMetasFile);

        // 篩出此文章實際使用的圖片 metadata
        for (const [src, meta] of Object.entries(imageMetasRaw)) {
          if (typeof src === 'string' && content.includes(src))
            imageMetas[src] = meta;
        }
      } catch (err) {
        console.warn(
          'Failed to load image metas:',
          err instanceof Error ? err.message : String(err)
        );
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

// 根據分類路徑取得相應文章列表
export const getPostsByCategory = async (
  categoryPath: string,
  lang: Language = DEFAULT_LANGUAGE
): Promise<PostInfo[]> => {
  const postsResult = await getPostsInfo(lang);
  const posts = Array.isArray(postsResult) ? postsResult : [];

  if (posts.length === 0) return [];

  const category = await getCategoryBySlug(categoryPath, posts);
  if (!category) return [];

  return posts.filter((post) => isPostInCategory(post, category.name));
};

// 建立一個標籤 slug → 文章列表的映射表
const getTagToPostsMap = cache(async (lang: Language) => {
  const postsResult = await getPostsInfo(lang);
  const posts = Array.isArray(postsResult) ? postsResult : [];
  const map = new Map<string, PostInfo[]>();

  for (const post of posts) {
    if (post?.tags && Array.isArray(post.tags)) {
      for (const postTag of post.tags) {
        const slug = convertToSlug(postTag);
        if (!map.has(slug)) map.set(slug, []);
        map.get(slug)!.push(post);
      }
    }
  }
  return map;
});

// 根據 tag name 或 slug 查 Map 取得相應文章列表
export const getPostsByTag = async (
  tag: string,
  lang: Language = DEFAULT_LANGUAGE
): Promise<PostInfo[]> => {
  const tagSlug = convertToSlug(tag);
  const tagMap = await getTagToPostsMap(lang);
  return tagMap.get(tagSlug) || [];
};

// 檢查特定文章是否存在，並回傳存在的語系。
type PostExistenceMetadata = {
  date?: string;
};

export const checkPostExistence = cache(
  async (
    curLang: Language,
    slug: string
  ): Promise<{
    exist: boolean;
    langs: Language[];
    metadata: Partial<Record<Language, PostExistenceMetadata>>;
  }> => {
    const postDir = path.join(postsDirectory, slug);

    if (!fs.existsSync(postDir))
      return { exist: false, langs: [], metadata: {} };

    try {
      const files = await fs.promises.readdir(postDir);

      // 找出哪些語系的文章存在
      const langs = LANGUAGES.filter((lang) => {
        const filename = getTargetFileName(lang);
        return files.includes(filename);
      });

      // 是否有除了 curLang 外的其他語系的文章存在
      const exist = langs.some((lang) => lang !== curLang);

      const metadataEntries = await Promise.all(
        langs.map(async (language) => {
          try {
            const info = await getPostsInfo(language, slug);
            if (!info || Array.isArray(info)) return [language, {}];

            const { date } = info as Partial<PostInfo>;
            return [language, date ? { date: String(date) } : {}];
          } catch {
            return [language, {}];
          }
        })
      );

      const metadata = Object.fromEntries(metadataEntries) as Partial<
        Record<Language, PostExistenceMetadata>
      >;

      return { exist, langs, metadata };
    } catch {
      return { exist: false, langs: [], metadata: {} };
    }
  }
);

export const DEFAULT_POSTS_PER_PAGE = 6;
const MAX_RELATED_POSTS = 3;

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
export const getPaginatedPosts = (
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

// 根據篩選條件取得文章列表
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
  else {
    const postsResult = await getPostsInfo(lang);
    posts = Array.isArray(postsResult) ? postsResult : [];
  }

  // 關鍵字搜尋：在標題、描述、分類、標籤中搜尋
  if (keyword && keyword.trim()) {
    const lowerKeyword = keyword.toLowerCase().trim();
    posts = posts.filter(
      ({ title, categories = [], tags = [], description = '' }) => {
        const searchFields = [title, description, ...categories, ...tags]
          .filter(Boolean)
          .map((field) => field.toLowerCase());

        return searchFields.some((field) => field.includes(lowerKeyword));
      }
    );
  }

  // 所有文章依照日期排序（由新到舊）
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// 根據篩選條件與分頁參數取得文章列表
export const getPaginatedPostsWithFilter = async ({
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

  // 根據篩選類型處理文章
  if (filter === 'popular') {
    posts = posts.filter((post) => post.featured);
  } else if (filter === 'related') {
    // 相關文章：同分類且非目前文章
    if (!currentSlug || !categories?.length)
      throw new Error('Missing required parameters for related posts.');

    posts = posts
      .filter((post) => {
        return (
          post.slug !== currentSlug &&
          Array.isArray(post.categories) &&
          post.categories.some((categoryName) =>
            categories.includes(categoryName)
          )
        );
      })
      .slice(0, MAX_RELATED_POSTS);
  }

  return getPaginatedPosts(posts, page, postsPerPage);
};

// 動態載入指定文章的自定義元件
export const loadPostComponents = async (
  slug: string
): Promise<MDXComponents> => {
  try {
    // 檢查是否有自定義組件存在
    const postDir = path.join(postsDirectory, slug);

    // 檢查是否存在自定義元件檔案
    const componentFiles = ['components.jsx', 'components.js'];
    const hasComponents = componentFiles.some((filename) =>
      fs.existsSync(path.join(postDir, filename))
    );

    if (!hasComponents) return {};

    const componentsModule = await import(`@/posts/${slug}/components`);
    return componentsModule.default || {};
  } catch (err) {
    console.warn(`Failed to load components for post: ${slug}`, err);
    return {};
  }
};
