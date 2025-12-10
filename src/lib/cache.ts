import { cache } from 'react';
import type { Language, PostInfo } from '@/types';
import { LANGUAGES, DEFAULT_LANGUAGE } from '@/config';
import { getPostsInfo } from '@/lib/posts';
import { getTagsByPosts, convertToSlug } from '@/lib/tags';

// 快取所有語言的文章資料
export const getAllPostsCache = cache(
  async (): Promise<Record<Language, PostInfo[]>> => {
    const results = await Promise.allSettled(
      LANGUAGES.map(async (lang) => {
        const postsResult = await getPostsInfo(lang);
        const posts = Array.isArray(postsResult) ? postsResult : [];
        return { lang, posts };
      })
    );

    const postsMap: Record<Language, PostInfo[]> = {} as Record<
      Language,
      PostInfo[]
    >;

    for (const result of results)
      if (result.status === 'fulfilled')
        postsMap[result.value.lang] = result.value.posts;

    return postsMap;
  }
);

// 快取所有語言的標籤資料
export const getAllTagsCache = cache(
  async (): Promise<
    Record<Language, Array<{ name: string; slug: string; postCount: number }>>
  > => {
    const allPosts = await getAllPostsCache();
    const tagsMap: Record<
      Language,
      Array<{ name: string; slug: string; postCount: number }>
    > = {} as Record<
      Language,
      Array<{ name: string; slug: string; postCount: number }>
    >;

    for (const [lang, posts] of Object.entries(allPosts)) {
      tagsMap[lang as Language] = getTagsByPosts(
        posts,
        undefined,
        lang as Language
      );
    }

    return tagsMap;
  }
);

// 快取特定標籤的文章
export const getPostsByTagCache = cache(
  async (
    tag: string,
    lang: Language = DEFAULT_LANGUAGE
  ): Promise<PostInfo[]> => {
    const allPosts = await getAllPostsCache();
    const posts = allPosts[lang] || [];
    const tagSlug = convertToSlug(tag);

    return posts.filter((post) => {
      return (
        Array.isArray(post.tags) &&
        post.tags.some((postTag) => convertToSlug(postTag) === tagSlug)
      );
    });
  }
);

// 快取所有語言的分類資料
export const getAllCategoriesCache = cache(
  async (): Promise<Record<Language, any[]>> => {
    const { getAllCategoryByPosts } = await import('@/lib/categories');
    const allPosts = await getAllPostsCache();
    const categoriesMap: Record<Language, any[]> = {} as Record<
      Language,
      any[]
    >;

    for (const [lang, posts] of Object.entries(allPosts))
      categoriesMap[lang as Language] = getAllCategoryByPosts(posts);

    return categoriesMap;
  }
);

// 快取特定語言和分類的文章
export const getPostsByCategoryCache = cache(
  async (
    categorySlug: string,
    lang: Language,
    type: 'main' | 'sub' | 'all' = 'all'
  ): Promise<{ category: any; posts: PostInfo[] }> => {
    const { getCategoryBySlug, isPostInCategory } =
      await import('@/lib/categories');
    const allPosts = await getAllPostsCache();
    const posts = allPosts[lang] || [];

    const category = getCategoryBySlug(categorySlug, posts, type);

    if (!category)
      return {
        category,
        posts: [],
      };

    const filteredPosts = posts.filter((post) => {
      if (!post.categories || post.categories.length === 0) return false;

      if (isPostInCategory(post, category.name, category.slug)) return true;

      if (type !== 'sub' && category.subcategories)
        return Object.entries(category.subcategories).some(([subSlug, sub]) =>
          isPostInCategory(post, sub.name, subSlug)
        );

      return false;
    });

    return {
      category,
      posts: filteredPosts,
    };
  }
);
