import type { Category, Language, PostInfo, Tag } from '@/types';

import rawSiteData from '@/generated/site-data.json';
import { CONFIG } from '@/config';

interface SiteDataEntry {
  posts: PostInfo[];
  categories: Category[];
  tags: Array<Pick<Tag, 'name' | 'slug' | 'postCount'>>;
  popularPosts: Array<{ slug: string; title: string }>;
}

type SiteData = Record<Language, SiteDataEntry>;

const FALLBACK_LANGUAGE = CONFIG.languages.defaultLanguage;
const siteData: SiteData = Object.fromEntries(
  Object.entries(rawSiteData as Record<string, any>).map(([lang, entry]) => {
    const normalizedCategories: Category[] = (entry.categories || []).map(
      (cat: any) => {
        const sub = cat.subcategories || {};
        const cleanedSub: Record<string, any> = {};
        Object.entries(sub).forEach(([k, v]: [string, any]) => {
          if (v && typeof v === 'object' && v.slug && v.name && v.color) {
            cleanedSub[k] = v;
          }
        });
        const normalized: Category = {
          name: cat.name,
          slug: cat.slug,
          color: cat.color ?? { light: '#999999', dark: '#666666' },
          postCount: cat.postCount,
          ...(Object.keys(cleanedSub).length > 0
            ? { subcategories: cleanedSub }
            : {}),
        };
        return normalized;
      }
    );

    const normalizedEntry: SiteDataEntry = {
      posts: entry.posts || [],
      categories: normalizedCategories,
      tags: entry.tags || [],
      popularPosts: entry.popularPosts || [],
    };
    return [lang, normalizedEntry];
  })
) as SiteData;

export const getSiteData = (
  lang: Language = FALLBACK_LANGUAGE
): SiteDataEntry => {
  return siteData[lang] ?? siteData[FALLBACK_LANGUAGE];
};

export const getPostsFromSiteData = (lang: Language): PostInfo[] => {
  return getSiteData(lang).posts;
};

export const getSidebarData = (lang: Language) => {
  const { categories, tags, popularPosts } = getSiteData(lang);
  return { categories, tags, popularPosts };
};
