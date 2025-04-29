import { useMemo } from 'react';

import type { PostMeta } from '@/types';
import { getCategoryInfo } from '@/lib/categories';

export const useCategoryInfoMap = (posts: PostMeta | PostMeta[] = []) => {
  return useMemo(() => {
    const postArray = Array.isArray(posts) ? posts : [posts];
    const categoryNames = new Set<string>();

    postArray.forEach((post) => {
      post.categories?.forEach((category) => {
        categoryNames.add(category);
      });
    });

    const map: Record<
      string,
      NonNullable<ReturnType<typeof getCategoryInfo>>
    > = {};
    categoryNames.forEach((name) => {
      const info = getCategoryInfo(name);
      if (info) map[name] = info;
    });

    return map;
  }, [posts]);
};
