let passwordStore: Record<string, string> | null = null;

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

const timingSafeEqual = (a: string, b: string): boolean => {
  const enc = new TextEncoder();
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

// 取得文章密碼
export const getPostPassword = (postId: string): string | undefined => getStore()[postId];

// 設定/更新文章密碼
export const setPostPassword = (postId: string, password: string): void => {
  const store = getStore();
  store[postId] = password;
};

// 移除文章密碼
export const removePostPassword = (postId: string): void => {
  const store = getStore();
  delete store[postId];
};

// 重命名 postId（slug 或語系變更時）
export const renamePostPassword = (oldId: string, newId: string): void => {
  if (oldId === newId) return;

  const store = getStore();
  if (!(oldId in store)) return;

  store[newId] = store[oldId];
  delete store[oldId];
};
