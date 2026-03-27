import { timingSafeEqual } from '@/utils/crypto';

let passwordStore: Record<string, string> | null = null;

// 取得密碼紀錄表
const getStore = (): Record<string, string> => {
  if (!passwordStore) {
    try {
      passwordStore = JSON.parse(import.meta.env.POST_PASSWORDS ?? '{}') as Record<string, string>;
    } catch {
      passwordStore = {};
    }
  }
  return passwordStore;
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
export const getPostPassword = (postId: string): string | undefined =>
  getStore()[postId] || import.meta.env.DEFAULT_POST_PASSWORD;

// 設定或更新特定文章的密碼
export const setPostPassword = (postId: string, password: string): void => {
  const store = getStore();
  store[postId] = password;
};

// 移除特定文章的密碼
export const removePostPassword = (postId: string): void => {
  const store = getStore();
  delete store[postId];
};

// 重新命名紀錄表裡的文章 ID
export const renamePostPassword = (oldId: string, newId: string): void => {
  if (oldId === newId) return;

  const store = getStore();
  if (!(oldId in store)) return;

  store[newId] = store[oldId];
  delete store[oldId];
};
