export const normalizePathSlug = (slug: string): string => {
  if (typeof slug !== 'string') throw new TypeError('Expected slug to be string.');

  return slug.trim().replace(/^\/+|\/+$/g, '');
};

export const slugifyTag = (tag: string): string =>
  tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '');
