const enc = new TextEncoder();

// 防止 timing attack 的時間字串比較
export const timingSafeEqual = (a: string, b: string): boolean => {
  const bytesA = enc.encode(a);
  const bytesB = enc.encode(b);
  if (bytesA.length !== bytesB.length) return false;
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
};
