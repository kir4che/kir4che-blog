// 確保輸入值為合法 pathname
export const ensurePathname = (value?: string): string => {
  if (!value) return '/';
  return value.startsWith('/') ? value : `/${value}`;
};

// 移除 pathname 結尾多餘的 slash
export const normalizePathname = (pathname: string): string => pathname.replace(/\/+$/, '') || '/';
