import { getCollection } from 'astro:content';
import type { Language } from '@/types';
import { normalizeTag } from '@/lib/tags';

export type OgPostData = {
  title: string;
  tags: string[];
  lang: Language;
};

export async function getOgPostBySlug(contentSlug: string): Promise<OgPostData | null> {
  const entries = await getCollection('blog');

  for (const entry of entries) {
    if (entry.slug !== contentSlug) continue;

    const lang = contentSlug.split('/')[0] as Language;
    const resolvedTags = (entry.data.tags ?? [])
      .map((tag: string) => normalizeTag(tag, lang)?.name ?? tag)
      .filter((tag: string): tag is string => Boolean(tag?.trim()));

    return {
      title: entry.data.title,
      tags: resolvedTags,
      lang,
    };
  }

  return null;
}
