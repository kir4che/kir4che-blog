import { cache } from 'react';

import type { PostMeta, PostInfo, Category, CategoryInfo } from '@/types';
import { CONFIG } from '@/config';
import { categoryMap } from '@/config/category';

type NameToSlugMap = Record<string, string>;
type PostCountMap = Record<string, number>;

let cachedNameToSlugMap: NameToSlugMap | null = null;

// 建立分類名稱（多語系）與分類 slug 的映射表
export const createCategoryNameToSlugMap = (): NameToSlugMap => {
  if (cachedNameToSlugMap) return cachedNameToSlugMap;
  const langs = CONFIG.languages.supportedLanguages;

  const map: NameToSlugMap = {};
  Object.entries(categoryMap).forEach(([slug, category]) => {
    langs.forEach((lang) => {
      // 將該語系的分類名稱對應到主分類的 slug
      if (category.name[lang]) map[category.name[lang]] = slug;
    });

    // 處理子分類名稱對應
    if (category.subcategories) {
      Object.entries(category.subcategories).forEach(
        ([subSlug, subCategory]) => {
          langs.forEach((lang) => {
            if (subCategory.name[lang]) map[subCategory.name[lang]] = subSlug;
          });
        }
      );
    }
  });

  cachedNameToSlugMap = map;
  return map;
};

// 計算每個分類（含子分類）出現過的文章數量
const calculatePostCounts = (
  posts: PostMeta[],
  nameToSlugMap: NameToSlugMap
): PostCountMap => {
  return posts.reduce((counts, post) => {
    post.categories?.forEach((categoryName) => {
      const categorySlug = nameToSlugMap[categoryName]; // 根據分類名稱找對應的 slug
      if (categorySlug) counts[categorySlug] = (counts[categorySlug] || 0) + 1;
    });
    return counts;
  }, {} as PostCountMap);
};

// 計算分類的總文章數，包含其所有子分類的文章數。
const getTotalPosts = (category: Category): number => {
  const subTotal = Object.values(category.subcategories ?? {}).reduce(
    (sum, sub) => sum + (sub.postCount ?? 0),
    0
  );
  return (category.postCount ?? 0) + subTotal;
};

// 檢查某篇文章是否屬於特定分類（可比對名稱或 slug）
export const isPostInCategory = (
  post: PostInfo,
  categoryName: { tw: string; en: string },
  slug?: string
): boolean => {
  const lowerSlug = slug?.toLowerCase();

  return post.categories.some((cat) => {
    const lowerCat = cat.toLowerCase();

    // 比對所有語系名稱
    const matchByName = CONFIG.languages.supportedLanguages.some((lang) => {
      const name = categoryName[lang];
      return name && lowerCat === name.toLowerCase();
    });

    return matchByName || (lowerSlug && lowerCat === lowerSlug);
  });
};

// 處理子分類資料，僅回傳有文章的子分類資訊。
const processSubcategories = (
  subcategories: Category['subcategories'],
  parentSlug: string,
  postCounts: PostCountMap
): Record<string, CategoryInfo> => {
  if (!subcategories) return {};

  return Object.entries(subcategories).reduce(
    (acc, [subSlug, sub]) => {
      const postCount = postCounts[subSlug] || 0;
      if (postCount > 0) {
        acc[subSlug] = {
          name: sub.name,
          slug: subSlug,
          color: sub.color,
          parentSlug,
          postCount,
        };
      }
      return acc;
    },
    {} as Record<string, CategoryInfo>
  );
};

// 取得所有有文章的分類（包含子分類），依文章數量排序，可限制最大數量。
export const getAllCategoryByPosts = (
  posts: PostInfo[],
  limit?: number
): Category[] => {
  const nameToSlugMap = createCategoryNameToSlugMap();
  const postCounts = calculatePostCounts(posts, nameToSlugMap);

  return Object.entries(categoryMap)
    .reduce<Category[]>((acc, [slug, cat]) => {
      const subs = processSubcategories(cat.subcategories, slug, postCounts);
      const total =
        (postCounts[slug] || 0) +
        Object.values(subs).reduce((sum, s) => sum + (s.postCount ?? 0), 0);

      if (total > 0) {
        acc.push({
          ...cat,
          slug,
          postCount: postCounts[slug] || 0,
          subcategories: subs,
        });
      }

      return acc;
    }, [])
    .sort((a, b) => getTotalPosts(b) - getTotalPosts(a))
    .slice(0, limit);
};

// 根據 slug 或名稱取得分類詳細資料，可指定只查主分類或子分類
export const getCategoryBySlug = cache(
  (
    slugOrName: string,
    posts: PostInfo[],
    type: 'main' | 'sub' | 'all' = 'all'
  ): Category | null => {
    const nameToSlugMap = createCategoryNameToSlugMap();
    const postCounts = calculatePostCounts(posts, nameToSlugMap);

    const mainCategory = categoryMap[slugOrName];

    // 若 type 為 main 或 all，且找得到主分類。
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

      if (categoryPosts.length === 0) return null; // 沒有文章就不要回傳

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

    // 若 type 為 sub 或 all，則搜尋所有子分類。
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
