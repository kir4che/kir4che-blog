import type { MetadataRoute } from 'next';
import { LANGUAGES } from '@/types/language';
import { getPostsInfo } from '@/lib/posts';
import { getTagsByPosts } from '@/lib/tags';
import { getCategoriesByPosts } from '@/lib/categories';

export const revalidate = 86400; // 每 24 小時更新一次

const langs = LANGUAGES;
const staticRoutes = ['', '/about', '/portfolio', '/posts', '/tags'];

export type SitemapFile = {
  url: string;
  lastModified: Date;
  changeFrequency: 'daily' | 'weekly' | 'monthly';
  priority: number;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths: SitemapFile[] = langs.flatMap((lang) =>
    staticRoutes.map((route) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/${lang}${route}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  );

  const posts = await getPostsInfo();
  const postPaths: SitemapFile[] = langs.flatMap((lang) =>
    posts.map((post) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/${lang}/posts/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  );

  const tags = await getTagsByPosts(posts);
  const tagPaths: SitemapFile[] = langs.flatMap((lang) =>
    tags.map((tag) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/${lang}/tags/${tag.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))
  );

  const categories = await getCategoriesByPosts(posts);
  const categoryPaths: SitemapFile[] = langs.flatMap((lang) =>
    categories.flatMap((cat) => {
      const main = {
        url: `${process.env.NEXT_PUBLIC_API_URL}/${lang}/categories/${cat.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
        priority: 0.6,
      };

      const sub = Array.isArray(cat.subcategories)
        ? cat.subcategories.map((sub) => ({
            url: `${process.env.NEXT_PUBLIC_API_URL}/${lang}/categories/${cat.slug}/${sub.slug}`,
            lastModified: now,
            changeFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
            priority: 0.5,
          }))
        : [];

      return [main, ...sub];
    })
  );

  return [...staticPaths, ...postPaths, ...tagPaths, ...categoryPaths];
}
