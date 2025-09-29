import { useMemo } from 'react';

import type { PostMeta, CategoryInfo, PostInfo } from '@/types';
import { categoryMap } from '@/config/taxonomy';
import { createCategoryNameToSlugMap } from '@/lib/categories';

type SupportedPost = PostMeta | PostInfo;

export const useCategoryInfoMap = (
  posts: SupportedPost | SupportedPost[] = []
): Record<string, CategoryInfo> => {
  return useMemo(() => {
    if (!posts) return {};

    const postArray = Array.isArray(posts) ? posts : [posts];
    const categoryNames = new Set<string>();

    // 收集所有分類名稱
    for (const post of postArray) {
      if (Array.isArray(post.categories)) {
        for (const category of post.categories) {
          const trimmedCategory = category?.trim();
          if (trimmedCategory) categoryNames.add(trimmedCategory);
        }
      }
    }

    if (categoryNames.size === 0) return {};

    const nameToSlugMap = createCategoryNameToSlugMap();
    const categoryInfoMap = new Map<string, CategoryInfo>();

    for (const name of categoryNames) {
      const slug = nameToSlugMap.get(name);
      if (!slug) continue;

      // 先找主分類
      const mainCategory = categoryMap[slug];
      if (mainCategory) {
        categoryInfoMap.set(name, {
          name: mainCategory.name,
          slug,
          color: mainCategory.color,
        });
        continue;
      }

      // 再找子分類
      let found = false;
      for (const [parentSlug, category] of Object.entries(categoryMap)) {
        const sub = category.subcategories?.[slug];
        if (sub) {
          categoryInfoMap.set(name, {
            name: sub.name,
            slug,
            color: sub.color,
            parentSlug,
          });
          found = true;
          break;
        }
      }
    }

    return Object.fromEntries(categoryInfoMap);
  }, [posts]);
};
