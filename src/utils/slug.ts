// 移除 slug 前後的斜線
export const normalizePathSlug = (slug: string): string => {
  if (typeof slug !== 'string') throw new TypeError('Expected slug to be string.');

  return slug.trim().replace(/^\/+|\/+$/g, '');
};

// 將字串轉為 URL-friendly 的 slug
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)+/g, '');
