import { DEFAULT_POSTS_PER_PAGE, SUPPORTED_LANGUAGES } from '@/config';
import { getAllCategoryByPosts, getCategoryBySlug, isPostInCategory } from '@/lib/categories';
import { getPostsMeta } from '@/lib/posts';
import { getTagsByPosts } from '@/lib/tags';
import type { Category, CategoryInfo, PostMeta } from '@/types';
import { slugify } from '@/utils/path';

// 快取 getPostsMeta 結果，同語言避免重複 fetch。
const postsMetaCache = new Map<string, Promise<PostMeta[]>>();
const cachedPostsMeta = (
  lang: Parameters<typeof getPostsMeta>[0],
  opts?: Parameters<typeof getPostsMeta>[1]
) => {
  const key = `${lang}|${JSON.stringify(opts ?? {})}`;
  if (!postsMetaCache.has(key)) postsMetaCache.set(key, getPostsMeta(lang, opts));
  return postsMetaCache.get(key)!;
};

const generatePaginationPaths = (
  totalItems: number,
  baseParams: Record<string, string>,
  perPage: number = DEFAULT_POSTS_PER_PAGE
) => {
  const safePerPage = perPage > 0 ? perPage : DEFAULT_POSTS_PER_PAGE;
  const totalPages = Math.ceil(totalItems / safePerPage) || 1;
  const paths = [];

  for (let p = 1; p <= totalPages; p++) {
    paths.push({
      params: {
        ...baseParams,
        page: p === 1 ? undefined : String(p),
      },
    });
  }

  return paths;
};

// 產生首頁分頁路徑 (/[lang]/ 第 1 頁、/[lang]/page/[N] 第 2 頁起)
export const getHomeStaticPaths = async () => {
  const paths: { params: Record<string, string | undefined> }[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    const posts = await cachedPostsMeta(lang, { includeProtected: false });
    paths.push(...generatePaginationPaths(posts.length, { lang }));
  }
  return paths;
};

// 產生給 og image 用的所有文章路徑
export const getPostStaticPaths = async () => {
  const paths = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    const posts = await cachedPostsMeta(lang);
    for (const post of posts) paths.push({ params: { slug: `${lang}/${post.slug}` } });
  }
  return paths;
};

// 產生文章頁路徑 (/[lang]/[...slug])
export const getSlugStaticPaths = async () => {
  const paths = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    const posts = await cachedPostsMeta(lang);
    for (const post of posts) paths.push({ params: { lang, slug: post.slug } });
  }
  return paths;
};

// 產生歸檔頁分頁路徑 (/archives/[...page])
export const getArchiveStaticPaths = async () => {
  const paths: { params: Record<string, string | undefined> }[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    const posts = await cachedPostsMeta(lang);
    paths.push(...generatePaginationPaths(posts.length, { lang }));
  }
  return paths;
};

// 產生標籤頁分頁路徑 (/tags/[tagSlug]/[...page])
export const getTagStaticPaths = async () => {
  const paths: { params: Record<string, string | undefined> }[] = [];
  for (const lang of SUPPORTED_LANGUAGES) {
    const posts = await cachedPostsMeta(lang);
    const tags = getTagsByPosts(posts, undefined, lang);

    for (const tag of tags) {
      const taggedPosts = posts.filter((post) =>
        post.tags.some((raw) => slugify(raw) === tag.slug)
      );
      paths.push(...generatePaginationPaths(taggedPosts.length, { lang, tagSlug: tag.slug }));
    }
  }
  return paths;
};

// 產生分類頁分頁路徑 (/categories/[catSlug]/[...page])
export const getCategoryStaticPaths = async () => {
  const paths: { params: Record<string, string | undefined> }[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const posts = await cachedPostsMeta(lang);
    const categories = getAllCategoryByPosts(posts);

    const allCatSlugs = categories.flatMap((cat) => [
      cat.slug,
      ...Object.keys(cat.subcategories ?? {}),
    ]);

    for (const catSlug of allCatSlugs) {
      const resolved = getCategoryBySlug(catSlug, posts, 'all');
      if (!resolved) continue;

      const isSubCat = 'parentSlug' in resolved && !!resolved.parentSlug;
      const subCategory = isSubCat ? (resolved as CategoryInfo) : null;

      const mainCategory =
        isSubCat && subCategory?.parentSlug
          ? getCategoryBySlug(subCategory.parentSlug, posts, 'main')
          : resolved;

      if (!mainCategory || !('subcategories' in mainCategory)) continue;

      const subcategories = (mainCategory as Category).subcategories ?? {};

      // 主分類頁：包含主分類 + 所有子分類的文章；子分類頁：只篩選該子分類
      const filteredPosts = posts.filter((post) => {
        if (subCategory) return isPostInCategory(post, subCategory.name, subCategory.slug);
        return (
          isPostInCategory(post, mainCategory.name, mainCategory.slug) ||
          Object.values(subcategories).some((sub) => isPostInCategory(post, sub.name, sub.slug))
        );
      });

      paths.push(...generatePaginationPaths(filteredPosts.length, { lang, catSlug }));
    }
  }
  return paths;
};
