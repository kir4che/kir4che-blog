import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

const enc = new TextEncoder();

// 防止 timing attack 的時間字串比較
const timingSafeEqual = (a: string, b: string): boolean => {
  const bytesA = enc.encode(a);
  const bytesB = enc.encode(b);
  if (bytesA.length !== bytesB.length) return false;
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
};

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
