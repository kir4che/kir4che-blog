import { cache } from 'react';

import type { PostInfo, Category, CategoryInfo } from '@/types';
import { CONFIG } from '@/config';
import { categoryMap } from '@/config/taxonomy';

type PostCountMap = Record<string, number>;

// 建立分類名稱 → slug 的映射表
export const createCategoryNameToSlugMap = cache(
  (): ReadonlyMap<string, string> => {
    const langs = CONFIG.languages.supportedLanguages;
    const entries: [string, string][] = [];

    for (const [slug, category] of Object.entries(categoryMap)) {
      entries.push([slug, slug]);

      for (const lang of langs) {
        const categoryName = category.name[lang]?.trim();
        if (categoryName) entries.push([categoryName, slug]);
      }

      // 處理子分類名稱對應
      if (category.subcategories) {
        for (const [subSlug, subCategory] of Object.entries(
          category.subcategories
        )) {
          entries.push([subSlug, subSlug]);

          for (const lang of langs) {
            const subCategoryName = subCategory.name[lang]?.trim();
            if (subCategoryName) entries.push([subCategoryName, subSlug]);
          }
        }
      }
    }

    return new Map(entries);
  }
);

// 建立子分類對應 → 父分類的映射表
const subcategoryParentMap: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();

  for (const [parentSlug, category] of Object.entries(categoryMap)) {
    if (!category.subcategories) continue;

    for (const subSlug of Object.keys(category.subcategories))
      map.set(subSlug, parentSlug);
  }

  return map;
})();

// 計算每個分類（含子分類）出現過的文章數量
const calculatePostCounts = (
  posts: PostInfo[],
  nameToSlugMap: ReadonlyMap<string, string>
): PostCountMap => {
  const counts: PostCountMap = {};

  for (const post of posts) {
    if (!Array.isArray(post.categories) || post.categories.length === 0)
      continue;

    const slugsForPost = new Set<string>();

    for (const categoryName of post.categories) {
      const trimmedName = categoryName?.trim();
      if (!trimmedName) continue;

      const categorySlug = nameToSlugMap.get(trimmedName);
      if (!categorySlug) continue;

      slugsForPost.add(categorySlug);

      // 如果是子分類，也要計入父分類。
      const parentSlug = subcategoryParentMap.get(categorySlug);
      if (parentSlug) slugsForPost.add(parentSlug);
    }

    for (const slug of slugsForPost) counts[slug] = (counts[slug] || 0) + 1;
  }

  return counts;
};

// 檢查文章是否屬於指定分類
export const isPostInCategory = (
  post: PostInfo,
  categoryName: { tw: string; en: string },
  slug?: string
): boolean => {
  if (!Array.isArray(post.categories)) return false;

  const lowerSlug = slug?.toLowerCase();

  return post.categories.some((cat) => {
    if (!cat || typeof cat !== 'string') return false;

    const lowerCat = cat.toLowerCase();

    // 比對所有支援語系的 name
    const matchByName = CONFIG.languages.supportedLanguages.some((lang) => {
      const name = categoryName[lang];
      return name && lowerCat === name.toLowerCase();
    });

    // 比對 slug 或 name
    return matchByName || (lowerSlug && lowerCat === lowerSlug);
  });
};

// 處理子分類資料，只保留有文章的子分類。
const processSubcategories = (
  subcategories: Category['subcategories'],
  parentSlug: string,
  postCounts: PostCountMap
): Record<string, CategoryInfo> => {
  if (!subcategories) return {};

  const result: Record<string, CategoryInfo> = {};

  for (const [subSlug, sub] of Object.entries(subcategories)) {
    const postCount = postCounts[subSlug] || 0;

    if (postCount > 0)
      result[subSlug] = {
        name: sub.name,
        slug: subSlug,
        color: sub.color,
        parentSlug,
        postCount,
      };
  }

  return result;
};

// 取得所有有文章的分類，依文章數排序。
export const getAllCategoryByPosts = (
  posts: PostInfo[],
  limit?: number
): Category[] => {
  const nameToSlugMap = createCategoryNameToSlugMap();
  const postCounts = calculatePostCounts(posts, nameToSlugMap);

  const categories = Object.entries(categoryMap)
    .reduce<Category[]>((acc, [slug, cat]) => {
      const subs = processSubcategories(cat.subcategories, slug, postCounts);
      const total = postCounts[slug] || 0;

      if (total > 0)
        acc.push({
          ...cat,
          slug,
          postCount: total,
          subcategories: subs,
        });

      return acc;
    }, [])
    .sort((a, b) => (b.postCount ?? 0) - (a.postCount ?? 0));

  return limit ? categories.slice(0, limit) : categories;
};

// 根據 slug 或名稱查找特定分類的詳細資料
export const getCategoryBySlug = cache(
  (
    slugOrName: string,
    posts: PostInfo[],
    type: 'main' | 'sub' | 'all' = 'all'
  ): Category | null => {
    const nameToSlugMap = createCategoryNameToSlugMap();
    const postCounts = calculatePostCounts(posts, nameToSlugMap);

    const mainCategory = categoryMap[slugOrName];

    // 搜尋主分類
    if ((type === 'main' || type === 'all') && mainCategory) {
      const categoryPosts = posts.filter((post) => {
        // 判斷是否屬於該主分類或其子分類
        const isMainCategory = isPostInCategory(
          post,
          mainCategory.name,
          slugOrName
        );

        const hasSubcategory =
          mainCategory.subcategories &&
          Object.values(mainCategory.subcategories).some((sub) =>
            isPostInCategory(post, sub.name, sub.slug)
          );

        return isMainCategory || hasSubcategory;
      });

      if (categoryPosts.length === 0) return null;

      const processedSubcategories = processSubcategories(
        mainCategory.subcategories,
        slugOrName,
        postCounts
      );

      return {
        ...mainCategory,
        slug: slugOrName,
        postCount: categoryPosts.length,
        subcategories: processedSubcategories,
      };
    }

    // 搜尋子分類
    if (type === 'sub' || type === 'all') {
      for (const [parentSlug, category] of Object.entries(categoryMap)) {
        const subcategory = category.subcategories?.[slugOrName];

        if (subcategory) {
          const categoryPosts = posts.filter((post) =>
            isPostInCategory(post, subcategory.name, slugOrName)
          );

          if (categoryPosts.length === 0) return null;

          return {
            ...subcategory,
            slug: slugOrName,
            parentSlug,
            postCount: categoryPosts.length,
            subcategories: {},
          };
        }
      }
    }

    return null;
  }
);
