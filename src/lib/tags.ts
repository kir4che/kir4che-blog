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
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, postCount]) => ({
      name: tag,
      slug: convertToSlug(tag),
      postCount,
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, limit);
};
