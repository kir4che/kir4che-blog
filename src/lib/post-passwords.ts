const enc = new TextEncoder();

// 防止 timing attack 的時間字串比較
const timingSafeEqual = (a: string, b: string): boolean => {
  const bytesA = enc.encode(a);
  const bytesB = enc.encode(b);
  let diff = 0;
  const maxLen = Math.max(bytesA.length, bytesB.length);
  for (let i = 0; i < maxLen; i++) diff |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
  return diff === 0 && bytesA.length === bytesB.length;
};

// 驗證密碼
export const verifyPostPassword = (input: string, stored: string): boolean => {
  try {
    return timingSafeEqual(input, stored);
  } catch {
    return false;
  }
};

// 取得唯一的文章密碼
export const getPostPassword = (): string | undefined => {
  return import.meta.env.DEFAULT_POST_PASSWORD || undefined;
};
