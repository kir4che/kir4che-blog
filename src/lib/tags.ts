import type { Language, PostInfo, TagDefinition } from '@/types';
import { DEFAULT_LANGUAGE } from '@/config';
import { tagMap } from '@/config/taxonomy';

// 將標籤名稱轉換為 slug 格式
export const convertToSlug = (tag: string): string => {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // 空白替換為連字符
    .replace(/[^\w\u4e00-\u9fa5-]/g, ''); // 移除非英數中文字元
};

// 取得當前語系 Tag 的 slug、name
export const getLocalizedTag = (
  tagName: string,
  lang: Language = DEFAULT_LANGUAGE
) => {
  const slug = convertToSlug(tagName);

  const tagConfig = tagMap[slug];

  // 取得當前語系名稱
  const localizedName =
    tagConfig?.name?.[lang]?.trim() ||
    tagConfig?.name?.[DEFAULT_LANGUAGE]?.trim() ||
    tagName;

  return {
    slug,
    name: localizedName,
  };
};

// 計算並取得所有文章的 Tag 使用頻率，依使用次數排序。
export const getTagsByPosts = (
  posts: PostInfo[],
  limit?: number,
  lang: Language = DEFAULT_LANGUAGE
): Array<{ name: string; slug: string; postCount: number }> => {
  if (!Array.isArray(posts) || posts.length === 0) return [];

  const tagCounts = new Map<string, number>();

  // 計算每個標籤的使用次數
  for (const post of posts) {
    if (Array.isArray(post.tags)) {
      for (const tag of post.tags) {
        const trimmedTag = tag?.trim();
        if (trimmedTag)
          tagCounts.set(trimmedTag, (tagCounts.get(trimmedTag) || 0) + 1);
      }
    }
  }

  // 轉換為當前語系標籤並排序
  const sortedTags = Array.from(tagCounts.entries())
    .map(([tag, postCount]) => {
      const { slug, name } = getLocalizedTag(tag, lang);
      return { name, slug, postCount };
    })
    .sort((a, b) => b.postCount - a.postCount);

  return limit ? sortedTags.slice(0, limit) : sortedTags;
};
