import { useMemo } from 'react';

import type { PostMeta, CategoryInfo } from '@/types';
import { categoryMap } from '@/config/category';
import { createCategoryNameToSlugMap } from '@/lib/categories';

export const useCategoryInfoMap = (posts: PostMeta | PostMeta[] = []) => {
  return useMemo(() => {
    const postArray = Array.isArray(posts) ? posts : [posts];
    const categoryNames = new Set<string>();

    postArray.forEach((post) => {
      post.categories?.forEach((category) => {
        categoryNames.add(category);
      });
    });

    const nameToSlugMap = createCategoryNameToSlugMap();

    const map: Record<string, CategoryInfo> = {};

    categoryNames.forEach((name) => {
      const slug = nameToSlugMap[name];
      if (!slug) return;

      const mainCategory = categoryMap[slug];
      if (mainCategory) {
        map[name] = {
          name: mainCategory.name,
          slug,
          color: mainCategory.color,
        };
        return;
      }

      for (const [parentSlug, category] of Object.entries(categoryMap)) {
        const sub = category.subcategories?.[slug];
        if (sub) {
          map[name] = {
            name: sub.name,
            slug,
            color: sub.color,
            parentSlug,
          };
          return;
        }
      }
    });

    return map;
  }, [posts]);
};
