import { DEFAULT_LANGUAGE, tagMap } from '@/config';
import type { Language, PostMeta, SidebarTag, TagBadgeInfo } from '@/types';
import { slugify } from '@/utils/path';

// 依據 slug、語系，取得最後顯示用的標籤名稱。
export const getTagDisplayName = (slug: string, originalName: string, lang: Language): string => {
  const tagConfig = tagMap[slug];

  return (
    tagConfig?.name?.[lang]?.trim() || tagConfig?.name?.[DEFAULT_LANGUAGE]?.trim() || originalName
  );
};

// 文章清單中統計所有標籤的使用次數
export const getTagsByPosts = (
  posts: PostMeta[],
  limit?: number,
  lang: Language = DEFAULT_LANGUAGE
): SidebarTag[] => {
  if (!Array.isArray(posts) || posts.length === 0) return [];

  const tagCounts = new Map<string, { count: number; original: string }>();

  // 逐篇文章處理
  for (const post of posts) {
    // 逐一處理文章內的標籤
    for (const rawTag of post.tags) {
      const original = rawTag?.trim();
      if (!original) continue;

      const key = slugify(original);
      if (!key) continue;

      const entry = tagCounts.get(key);
      tagCounts.set(key, {
        count: (entry?.count ?? 0) + 1,
        original,
      });
    }
  }

  // Map → 陣列，並依使用次數由大到小排序。
  const result: SidebarTag[] = Array.from(tagCounts.entries())
    .map(([slug, { count, original }]) => ({
      slug,
      name: getTagDisplayName(slug, original, lang),
      postCount: count,
    }))
    .sort((a, b) => b.postCount - a.postCount);

  return typeof limit === 'number' ? result.slice(0, limit) : result;
};

// 將單一標籤字串解析為 slug 與顯示名稱
export const normalizeTag = (tag: string, lang: Language): TagBadgeInfo | null => {
  const original = tag?.trim();
  if (!original) return null;

  const slug = slugify(original);
  if (!slug) return null;

  const name = getTagDisplayName(slug, original, lang);
  return { slug, name };
};
