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

const resolveTagDefinition = (
  identifier: string
): TagDefinition | undefined => {
  const slug = convertToSlug(identifier);
  return tagMap[slug];
};

const selectTagName = (
  definition: TagDefinition | undefined,
  lang: Language
) => {
  const localized = definition?.name?.[lang]?.trim();
  if (localized) return localized;

  const fallback = definition?.name?.[DEFAULT_LANGUAGE]?.trim();
  return fallback;
};

export const getLocalizedTagName = (
  identifier: string,
  lang: Language = DEFAULT_LANGUAGE
) => {
  const definition = resolveTagDefinition(identifier);
  const name = selectTagName(definition, lang) ?? identifier;
  return name;
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
) => {
  if (!Array.isArray(posts) || posts.length === 0) return [];

  // 統計 tag 出現次數
  const tagCounts: Record<string, number> = {};

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 將 tagCounts 轉為 array 並加入 slug、postCount
  return Object.entries(tagCounts)
    .map(([tag, postCount]) => {
      const { slug, name } = getLocalizedTag(tag, lang);
      return {
        name,
        slug,
        postCount,
      };
    })
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, limit);
};

export const getTagDefinitionBySlug = (
  slug: string
): TagDefinition | undefined => {
  return tagMap[slug];
};
