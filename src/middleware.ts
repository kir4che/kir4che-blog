import { DEFAULT_LANGUAGE } from '@/config';
import { isSupportedLanguage } from '@/lib/i18n';
import { matchLanguageBasePath } from '@/lib/paths';
import type { MiddlewareHandler } from 'astro';

// 根據 Accept-Language header 偵測最佳語系
const detectLocale = (request: Request): string => {
  const header = request.headers.get('accept-language');
  if (!header) return DEFAULT_LANGUAGE;
  const lang = header.split(',')[0].split('-')[0].toLowerCase();
  return isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;
};

export const onRequest: MiddlewareHandler = async ({ request, url }, next) => {
  const { pathname } = url; // 目前路徑

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_astro') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/404') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    /\.[^/]+$/.test(pathname)
  )
    return next();

  // 若路徑中沒有語系前綴，則進行偵測並重新導向。
  if (!matchLanguageBasePath(pathname)) {
    const locale = detectLocale(request);
    return Response.redirect(new URL(`/${locale}${pathname}`, url), 308);
  }

  return next();
};
