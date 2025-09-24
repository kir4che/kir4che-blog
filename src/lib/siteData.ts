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
const siteData = rawSiteData as SiteData;

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
