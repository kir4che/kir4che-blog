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

const normalizeSiteDataEntry = (entry: any): SiteDataEntry => {
  const normalizedCategories: Category[] = Array.isArray(entry.categories)
    ? entry.categories
        .filter((cat: any) => cat && typeof cat === 'object')
        .map((cat: any) => {
          const subcategories = cat.subcategories || {};
          const cleanedSub: Record<string, any> = {};

          for (const [k, v] of Object.entries(subcategories)) {
            if (
              v &&
              typeof v === 'object' &&
              typeof (v as any).slug === 'string' &&
              (v as any).name &&
              (v as any).color
            )
              cleanedSub[k] = v;
          }

          return {
            name: cat.name || { tw: 'Unknown', en: 'Unknown' },
            slug: String(cat.slug || 'unknown'),
            color: cat.color || { light: '#999999', dark: '#666666' },
            postCount: typeof cat.postCount === 'number' ? cat.postCount : 0,
            ...(Object.keys(cleanedSub).length > 0 && {
              subcategories: cleanedSub,
            }),
          } satisfies Category;
        })
    : [];

  return {
    posts: Array.isArray(entry.posts) ? entry.posts : [],
    categories: normalizedCategories,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    popularPosts: Array.isArray(entry.popularPosts) ? entry.popularPosts : [],
  };
};

const siteData: SiteData = (() => {
  try {
    const rawData = rawSiteData as Record<string, any>;
    const entries: [Language, SiteDataEntry][] = [];

    for (const [lang, entry] of Object.entries(rawData))
      if (entry && typeof entry === 'object')
        entries.push([lang as Language, normalizeSiteDataEntry(entry)]);

    return Object.fromEntries(entries) as SiteData;
  } catch {
    return {} as SiteData;
  }
})();

export const getSiteData = (
  lang: Language = FALLBACK_LANGUAGE
): SiteDataEntry => {
  const data = siteData[lang] || siteData[FALLBACK_LANGUAGE];

  return (
    data || {
      posts: [],
      categories: [],
      tags: [],
      popularPosts: [],
    }
  );
};

export const getPostsFromSiteData = (lang: Language): PostInfo[] => {
  return getSiteData(lang).posts;
};

export const getSidebarData = (lang: Language) => {
  const { categories, tags, popularPosts } = getSiteData(lang);
  return { categories, tags, popularPosts };
};
