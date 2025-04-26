import type { PostInfo } from '@/types';

// 將 tag name 轉換為 slug 格式
export const convertToSlug = (tag: string): string => {
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
};

// 取得所有文章的 tag 及其出現次數，且可選擇限制回傳的 tag 數量。
export const getTagsByPosts = (posts: PostInfo[], limit?: number) => {
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
    .map(([tag, postCount]) => ({
      name: tag,
      slug: convertToSlug(tag),
      postCount,
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, limit);
};
