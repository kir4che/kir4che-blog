import { cache } from 'react';
import { categoryMap } from '@/config/category';
import type { Category, CategoryInfo } from '@/types/category';
import type { PostMeta, PostInfo } from '@/types/post';

type NameToSlugMap = Record<string, string>;
type PostCountMap = Record<string, number>;

let cachedNameToSlugMap: NameToSlugMap | null = null;

// 建立分類名稱（所有語系）與 slug 的映射表
const createCategoryNameToSlugMap = (): NameToSlugMap => {
  if (cachedNameToSlugMap) return cachedNameToSlugMap;

  const map: NameToSlugMap = {};

  Object.entries(categoryMap).forEach(([slug, category]) => {
    map[category.name.tw] = slug;
    map[category.name.en] = slug;

    if (category.subcategories) {
      Object.entries(category.subcategories).forEach(
        ([subSlug, subCategory]) => {
          map[subCategory.name.tw] = subSlug;
          map[subCategory.name.en] = subSlug;
        }
      );
    }
  });

  cachedNameToSlugMap = map;
  return map;
};

// 根據某一語系的 name 取得分類資訊（所有語系名稱、slug、color、parentSlug）
export const getCategoryInfo = (name: string): CategoryInfo | null => {
  if (!name.trim()) return null;

  const nameToSlugMap = createCategoryNameToSlugMap();
  const slug = nameToSlugMap[name];
  if (!slug) return null;

  // 嘗試從主分類取得
  const mainCategory = categoryMap[slug];
  if (mainCategory) {
    return {
      name: mainCategory.name,
      slug,
      color: mainCategory.color,
    };
  }

  // 嘗試從子分類取得
  for (const [parentSlug, category] of Object.entries(categoryMap)) {
    const subcategory = category.subcategories?.[slug];
    if (subcategory) {
      return {
        name: subcategory.name,
        slug,
        color: subcategory.color,
        parentSlug,
      };
    }
  }

  return null;
};

// 計算每個分類的文章數量
const calculatePostCounts = (
  posts: PostMeta[],
  nameToSlugMap: NameToSlugMap
): PostCountMap => {
  return posts.reduce((counts, post) => {
    post.categories?.forEach((categoryName) => {
      const categorySlug = nameToSlugMap[categoryName];
      if (categorySlug) {
        counts[categorySlug] = (counts[categorySlug] || 0) + 1;
      }
    });
    return counts;
  }, {} as PostCountMap);
};

// 計算分類的總文章數（包含子分類）
const getTotalPosts = (category: Category): number => {
  const subCategoryPosts = category.subcategories
    ? Object.values(category.subcategories).reduce(
        (sum, sub) => sum + (sub.postCount || 0),
        0
      )
    : 0;
  return (category.postCount || 0) + subCategoryPosts;
};

// 檢查文章是否屬於特定分類
export const isPostInCategory = (
  post: PostInfo,
  categoryName: { tw: string; en: string },
  slug?: string
): boolean => {
  const lowerSlug = slug?.toLowerCase();
  return post.categories.some((cat) => {
    const lower = cat.toLowerCase();
    return (
      lower === categoryName.tw.toLowerCase() ||
      lower === categoryName.en.toLowerCase() ||
      (lowerSlug && lower === lowerSlug)
    );
  });
};

// 處理子分類的資訊
const processSubcategories = (
  subcategories: Category['subcategories'],
  postCounts: PostCountMap,
  parentSlug: string
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

// 回傳所有有文章的分類（含子分類），並根據文章數排序。
export const getCategoriesByPosts = (
  posts: PostInfo[],
  limit?: number
): Category[] => {
  const nameToSlugMap = createCategoryNameToSlugMap();
  const postCounts = calculatePostCounts(posts, nameToSlugMap);

  const categories = Object.entries(categoryMap).reduce<Category[]>(
    (acc, [slug, category]) => {
      const processedSubcategories = processSubcategories(
        category.subcategories,
        postCounts,
        slug
      );

      const categoryPostCount = postCounts[slug] || 0;
      const hasSubcategoriesWithPosts =
        Object.keys(processedSubcategories).length > 0;

      if (categoryPostCount > 0 || hasSubcategoriesWithPosts) {
        acc.push({
          ...category,
          slug,
          postCount: categoryPostCount,
          subcategories: processedSubcategories,
        });
      }

      return acc;
    },
    []
  );

  return categories
    .sort((a, b) => getTotalPosts(b) - getTotalPosts(a))
    .slice(0, limit);
};

// 根據 slug 取得分類資訊（所有語系名稱、slug、color、parentSlug、postCount、子分類）
export const getCategoryBySlug = cache(
  (slug: string, posts: PostInfo[]): Category | null => {
    const mainCategory = categoryMap[slug];

    // 處理子分類
    if (!mainCategory) {
      for (const [parentSlug, category] of Object.entries(categoryMap)) {
        const subcategory = category.subcategories?.[slug];
        if (subcategory) {
          const categoryPosts = posts.filter((post) =>
            isPostInCategory(post, subcategory.name, slug)
          );

          if (categoryPosts.length === 0) return null;

          return {
            ...subcategory,
            slug,
            parentSlug,
            postCount: categoryPosts.length,
            subcategories: {},
          };
        }
      }
      return null;
    }

    // 處理主分類
    const categoryPosts = posts.filter((post) => {
      const isMainCategory = isPostInCategory(post, mainCategory.name, slug);
      const hasSubcategory =
        mainCategory.subcategories &&
        Object.values(mainCategory.subcategories).some((sub) =>
          isPostInCategory(post, sub.name, sub.slug)
        );

      return isMainCategory || hasSubcategory;
    });

    const nameToSlugMap = createCategoryNameToSlugMap();
    const postCounts = calculatePostCounts(categoryPosts, nameToSlugMap);
    const processedSubcategories = processSubcategories(
      mainCategory.subcategories,
      postCounts,
      slug
    );

    if (categoryPosts.length === 0) return null;

    return {
      ...mainCategory,
      slug,
      postCount: categoryPosts.length,
      subcategories: processedSubcategories,
    };
  }
);

// 根據主分類和子分類的 slug 取得子分類的分類資訊
export const getSubcategoryBySlug = cache(
  (parentSlug: string, subSlug: string, posts: PostInfo[]): Category | null => {
    const mainCategory = categoryMap[parentSlug];
    if (!mainCategory) return null;

    const subCategory = mainCategory.subcategories?.[subSlug];
    if (!subCategory) return null;

    const categoryPosts = posts.filter((post) =>
      isPostInCategory(post, subCategory.name, subSlug)
    );
    if (categoryPosts.length === 0) return null;

    return {
      ...subCategory,
      slug: subSlug,
      parentSlug,
      postCount: categoryPosts.length,
      subcategories: {},
    };
  }
);
