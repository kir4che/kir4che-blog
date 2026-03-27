import { DEFAULT_LANGUAGE } from '@/config';
import { getAllCategoryByPosts } from '@/lib/categories';
import { getPostsMeta } from '@/lib/posts';
import { getTagsByPosts } from '@/lib/tags';
import type { Language, PostMeta, SidebarCategory, SidebarTag } from '@/types';

interface SidebarData {
  posts: PostMeta[];
  categories: SidebarCategory[];
  tags: SidebarTag[];
  popularPosts: Array<{
    slug: string;
    title: string;
    date: string;
  }>;
}

const cache = new Map<Language, SidebarData>();
const isProd = import.meta.env.PROD;

// 建立側邊欄資料
const buildSidebarData = async (lang: Language): Promise<SidebarData> => {
  const posts: PostMeta[] = (await getPostsMeta(lang)) ?? [];

  const rawCategories = getAllCategoryByPosts(posts);

  // 取前 15 個文章量最多的分類、標籤
  const categories: SidebarCategory[] = rawCategories
    .map((c) => ({
      slug: c.slug,
      name: c.name[lang] ?? c.name[DEFAULT_LANGUAGE] ?? c.slug,
      color: c.color,
      postCount: c.postCount ?? 0,
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 15);

  const tags = getTagsByPosts(posts, 15, lang);

  const popularPosts = posts
    .filter((p) => p.featured)
    .map(({ slug, title, date }) => ({ slug, title: title ?? slug, date }))
    .slice(0, 5);

  return {
    posts,
    categories,
    tags,
    popularPosts,
  };
};

// 取得側邊欄資料
export const getSidebarData = async (lang: Language = DEFAULT_LANGUAGE): Promise<SidebarData> => {
  if (isProd) {
    const cached = cache.get(lang);
    if (cached) return cached;
  }

  const data = await buildSidebarData(lang);

  if (isProd) cache.set(lang, data);

  return data;
};
