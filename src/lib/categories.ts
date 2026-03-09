import type { PostMeta, Category, CategoryInfo, CategoryColorScheme } from '@/types';
import { SUPPORTED_LANGUAGES, categoryMap } from '@/config';

type PostCountMap = Record<string, number>;

// category name / slug → slug
let categoryNameToSlugMap: ReadonlyMap<string, string> | null = null;

// 建立「分類名稱 / slug → slug」
export const createCategoryNameToSlugMap = (): ReadonlyMap<string, string> => {
  if (categoryNameToSlugMap) return categoryNameToSlugMap;

  const entries: [string, string][] = [];

  for (const [slug, category] of Object.entries(categoryMap)) {
    // 主分類 slug
    entries.push([slug.toLowerCase(), slug]);

    // 主分類各語系名稱
    for (const lang of SUPPORTED_LANGUAGES) {
      const name = category.name[lang]?.trim();
      if (name) entries.push([name.toLowerCase(), slug]);
    }

    // 子分類
    if (category.subcategories) {
      for (const [subSlug, sub] of Object.entries(category.subcategories)) {
        entries.push([subSlug.toLowerCase(), subSlug]);

        for (const lang of SUPPORTED_LANGUAGES) {
          const subName = sub.name[lang]?.trim();
          if (subName) entries.push([subName.toLowerCase(), subSlug]);
        }
      }
    }
  }

  categoryNameToSlugMap = new Map(entries);
  return categoryNameToSlugMap;
};

// 子分類 slug → 父分類 slug
const subcategoryParentMap: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();

  for (const [parentSlug, category] of Object.entries(categoryMap)) {
    if (!category.subcategories) continue;

    for (const subSlug of Object.keys(category.subcategories)) {
      map.set(subSlug, parentSlug);
    }
  }

  return map;
})();

// 計算每個分類（含父分類）的文章數量
const calculatePostCounts = (
  posts: PostMeta[],
  nameToSlugMap: ReadonlyMap<string, string>
): PostCountMap => {
  const counts: PostCountMap = {};

  for (const post of posts) {
    if (!Array.isArray(post.categories)) continue;

    // 同一篇文章中，避免同分類被算兩次
    const slugsForPost = new Set<string>();

    for (const raw of post.categories) {
      const name = raw?.trim().toLowerCase();
      if (!name) continue;

      const slug = nameToSlugMap.get(name);
      if (!slug) continue;

      slugsForPost.add(slug);

      const parent = subcategoryParentMap.get(slug);
      if (parent) slugsForPost.add(parent);
    }

    for (const slug of slugsForPost) counts[slug] = (counts[slug] ?? 0) + 1;
  }

  return counts;
};

// 處理子分類資訊（只回傳有文章的子分類）
const processSubcategories = (
  subcategories: Category['subcategories'],
  parentSlug: string,
  postCounts: PostCountMap
): Record<string, CategoryInfo> => {
  if (!subcategories) return {};

  const result: Record<string, CategoryInfo> = {};

  for (const [slug, sub] of Object.entries(subcategories)) {
    const count = postCounts[slug] ?? 0;
    if (count === 0) continue;

    result[slug] = {
      name: sub.name,
      slug,
      color: sub.color,
      parentSlug,
      postCount: count,
    };
  }

  return result;
};

// 依文章資料取得所有分類（含子分類），並計算文章數。
export const getAllCategoryByPosts = (posts: PostMeta[], limit?: number): Category[] => {
  const nameToSlugMap = createCategoryNameToSlugMap();
  const postCounts = calculatePostCounts(posts, nameToSlugMap);

  const categories = Object.entries(categoryMap)
    .reduce<Category[]>((acc, [slug, cat]) => {
      const count = postCounts[slug] ?? 0;
      if (count === 0) return acc;

      acc.push({
        ...cat,
        slug,
        postCount: count,
        subcategories: processSubcategories(cat.subcategories, slug, postCounts),
      });

      return acc;
    }, [])
    .sort((a, b) => (b.postCount ?? 0) - (a.postCount ?? 0));

  return limit ? categories.slice(0, limit) : categories;
};

// 依 slug 取得單一分類資訊（主分類或子分類）
export const getCategoryInfoBySlug = (slug: string): CategoryInfo | null => {
  // 主分類
  const main = categoryMap[slug];
  if (main) {
    return {
      name: main.name,
      slug,
      color: main.color,
    };
  }

  // 子分類
  for (const [parentSlug, category] of Object.entries(categoryMap)) {
    const sub = category.subcategories?.[slug];
    if (!sub) continue;

    return {
      name: sub.name,
      slug,
      color: sub.color,
      parentSlug,
    };
  }

  return null;
};

// 依 slug 取得分類（主分類或子分類），並包含文章數。
export const getCategoryBySlug = (
  slug: string,
  posts: PostMeta[],
  scope: 'all' | 'main' | 'sub' = 'all'
): Category | CategoryInfo | null => {
  if (!slug) return null;

  const categories = getAllCategoryByPosts(posts);
  const main = categories.find((category) => category.slug === slug);
  if (main && scope !== 'sub') return main;
  if (scope === 'main') return null;

  for (const category of categories) {
    const sub = category.subcategories?.[slug];
    if (sub) return sub;
  }

  return null;
};

// 判斷文章是否屬於指定分類
export const isPostInCategory = (
  post: PostMeta,
  name: CategoryInfo['name'],
  slug: string
): boolean => {
  if (!Array.isArray(post.categories) || !slug) return false;

  const targetSlug = slug.trim().toLowerCase();
  const nameToSlugMap = createCategoryNameToSlugMap();
  const nameCandidates = new Set(
    Object.values(name ?? {})
      .map((value) => value?.trim().toLowerCase())
      .filter(Boolean) as string[]
  );

  for (const raw of post.categories) {
    const normalized = raw?.trim().toLowerCase();
    if (!normalized) continue;

    if (normalized === targetSlug) return true;
    if (nameCandidates.has(normalized)) return true;

    const mapped = nameToSlugMap.get(normalized);
    if (mapped && mapped.toLowerCase() === targetSlug) return true;
  }

  return false;
};

// 將原始分類名稱陣列轉換為可用的 CategoryInfo 陣列
export const normalizeCategories = (rawCategories: string[] = []): CategoryInfo[] => {
  if (rawCategories.length === 0) return [];

  const result: CategoryInfo[] = [];
  const seen = new Set<string>(); // 避免重複加入分類
  const nameToSlugMap = createCategoryNameToSlugMap();

  for (const raw of rawCategories) {
    const name = raw?.trim();
    if (!name) continue;

    const slug = nameToSlugMap.get(name.toLowerCase());
    if (!slug) continue;

    const info = getCategoryInfoBySlug(slug);
    if (!info || seen.has(info.slug)) continue;

    // 有的話先加入父分類
    if (info.parentSlug && !seen.has(info.parentSlug)) {
      const parent = getCategoryInfoBySlug(info.parentSlug);
      if (parent) {
        seen.add(parent.slug);
        result.push(parent);
      }
    }

    seen.add(info.slug);
    result.push(info);
  }

  return result;
};

const isValidColor = (value: string) => /^#([0-9a-f]{3}){1,2}$/i.test(value);

// 取得分類 badge 的 CSS 變數樣式
export const getCategoryStyle = (color: CategoryColorScheme) =>
  ({
    '--category-color': isValidColor(color.light) ? color.light : '#ccc',
    '--category-color-dark': isValidColor(color.dark) ? color.dark : '#666',
  }) satisfies Record<string, string>;
