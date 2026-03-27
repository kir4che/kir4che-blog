import { getCollection, type CollectionEntry } from 'astro:content';

import { normalizeTag } from '@/lib/tags';
import type { Language } from '@/types';

export type OgPostData = {
  title: string;
  tags: string[];
  lang: Language;
};

export const getOgPostBySlug = async (contentSlug: string): Promise<OgPostData | null> => {
  const entries = await getCollection('blog');
  const entry = entries.find((item: CollectionEntry<'blog'>) => item.id === contentSlug);
  if (!entry) return null;

  const lang = contentSlug.split('/')[0] as Language;
  const resolvedTags = (entry.data.tags ?? [])
    .map((tag: string) => normalizeTag(tag, lang)?.name ?? tag)
    .filter((tag: string) => tag.trim().length > 0);

  return {
    title: entry.data.title,
    tags: resolvedTags,
    lang,
  };
};
