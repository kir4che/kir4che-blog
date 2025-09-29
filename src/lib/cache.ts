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
        const posts = await getPostsInfo(lang);
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

// 快取標籤到文章的映射
export const getTagToPostsMapCache = cache(
  async (lang: Language): Promise<Map<string, PostInfo[]>> => {
    const allPosts = await getAllPostsCache();
    const posts = allPosts[lang] || [];
    const map = new Map<string, PostInfo[]>();

    for (const post of posts) {
      if (post.tags) {
        for (const postTag of post.tags) {
          const slug = convertToSlug(postTag);
          if (!map.has(slug)) map.set(slug, []);
          map.get(slug)!.push(post);
        }
      }
    }
    return map;
  }
);

// 快取特定標籤的文章
export const getPostsByTagCache = cache(
  async (
    tag: string,
    lang: Language = DEFAULT_LANGUAGE
  ): Promise<PostInfo[]> => {
    const tagSlug = convertToSlug(tag);
    const tagMap = await getTagToPostsMapCache(lang);
    return tagMap.get(tagSlug) || [];
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
    const { getCategoryBySlug } = await import('@/lib/categories');
    const allPosts = await getAllPostsCache();
    const posts = allPosts[lang] || [];

    const category = getCategoryBySlug(categorySlug, posts, type);

    return {
      category,
      posts: posts.filter((post) =>
        post.categories?.some(
          (cat) =>
            cat.toLowerCase() === categorySlug.toLowerCase() ||
            (category &&
              category.name &&
              Object.values(category.name).some(
                (name) => cat.toLowerCase() === name.toLowerCase()
              ))
        )
      ),
    };
  }
);
