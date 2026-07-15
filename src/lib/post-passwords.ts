import { getCollection } from 'astro:content';

import { timingSafeEqual } from '@/utils/crypto';
import type { CollectionEntry } from 'astro:content';

// 驗證密碼
export const verifyPostPassword = (input: string, stored: string): boolean => {
  try {
    return timingSafeEqual(input, stored);
  } catch {
    return false;
  }
};

// 取得特定文章對應密碼
export const getPostPassword = async (postId: string): Promise<string | undefined> => {
  const envPassword = import.meta.env.DEFAULT_POST_PASSWORD;

  const entries = await getCollection('blog');
  const entry = entries.find((item: CollectionEntry<'blog'>) => item.id === postId);
  const frontmatterPassword =
    entry?.data && 'password' in entry.data && typeof entry.data.password === 'string'
      ? entry.data.password.trim()
      : '';

  return frontmatterPassword || envPassword;
};
