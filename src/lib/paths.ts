import type { Language } from '@/types';
import { CONFIG } from '@/config';
import { ensurePathname, normalizePathname } from '@/utils/path';
import { normalizePathSlug } from '@/utils/slug';

// 取得指定語言的基礎路徑
export const getLanguageBasePath = (lang: Language): string =>
  normalizePathname(CONFIG.paths.languagePaths[lang] ?? `/${lang}`);

// 從 pathname 中匹配語系及其基礎路徑
export const matchLanguageBasePath = (
  pathname: string
): { lang: Language; base: string } | null => {
  const entries = Object.entries(CONFIG.paths.languagePaths)
    .map(([lang, base]) => [lang as Language, normalizePathname(base)] as const)
    .sort((a, b) => b[1].length - a[1].length);

  const match = entries.find(([, base]) => pathname === base || pathname.startsWith(`${base}/`));
  return match ? { lang: match[0], base: match[1] } : null;
};

// 取得文章的相對路徑（不含語言）
export const getPostPath = (slug: string): string => ensurePathname(normalizePathSlug(slug));

// 取得包含語言的文章路徑
export const getLocalizedPostPath = ({ lang, slug }: { lang: Language; slug: string }): string => {
  const basePath = getLanguageBasePath(lang);
  return `${basePath}${getPostPath(slug)}`;
};

// 移除 pathname 中的語系前綴
export const stripLocalePrefix = (pathname: string): string => {
  const match = matchLanguageBasePath(pathname);
  if (!match) return pathname;

  const stripped = pathname.slice(match.base.length);
  return stripped.length === 0 ? '/' : stripped;
};

// 為 pathname 加上語系前綴
export const withLocalePrefix = (pathname: string, lang: Language): string => {
  const base = getLanguageBasePath(lang);
  const normalized = ensurePathname(pathname);

  return normalized === '/' ? base : `${base}${normalized}`;
};

// 將 pathname 的語系替換為指定語系
export const swapLocaleInPath = (pathname: string, lang: Language): string =>
  withLocalePrefix(stripLocalePrefix(pathname), lang);
