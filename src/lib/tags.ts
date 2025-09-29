import type { Language, PostInfo, TagDefinition } from '@/types';
import { DEFAULT_LANGUAGE } from '@/config';
import { tagMap } from '@/config/taxonomy';

// 將 tag name 轉換為 slug 格式
export const convertToSlug = (tag: string): string => {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
};

const getTagDefinition = (identifier: string): TagDefinition | undefined => {
  const slug = convertToSlug(identifier);
  return tagMap[slug];
};

const getTagName = (
  definition: TagDefinition | undefined,
  lang: Language
): string => {
  return (
    definition?.name?.[lang]?.trim() ||
    definition?.name?.[DEFAULT_LANGUAGE]?.trim() ||
    ''
  );
};

const getLocalizedTagName = (
  identifier: string,
  lang: Language = DEFAULT_LANGUAGE
): string => {
  const definition = getTagDefinition(identifier);
  const name = getTagName(definition, lang);
  return name || identifier;
};

export const getLocalizedTag = (
  identifier: string,
  lang: Language = DEFAULT_LANGUAGE
) => {
  const slug = convertToSlug(identifier);

  return {
    slug,
    name: getLocalizedTagName(identifier, lang),
  };
};

// 取得所有文章的 tag 及其出現次數，且可選擇限制回傳的 tag 數量。
export const getTagsByPosts = (
  posts: PostInfo[],
  limit?: number,
  lang: Language = DEFAULT_LANGUAGE
): Array<{ name: string; slug: string; postCount: number }> => {
  if (!Array.isArray(posts) || posts.length === 0) return [];

  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    if (Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        const trimmedTag = tag?.trim();
        if (trimmedTag)
          tagCounts.set(trimmedTag, (tagCounts.get(trimmedTag) || 0) + 1);
      }
    }
  }

  const sortedTags = Array.from(tagCounts.entries())
    .map(([tag, postCount]) => {
      const { slug, name } = getLocalizedTag(tag, lang);
      return { name, slug, postCount };
    })
    .sort((a, b) => b.postCount - a.postCount);

  return limit ? sortedTags.slice(0, limit) : sortedTags;
};
