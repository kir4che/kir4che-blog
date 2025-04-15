// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

import common from '@/config/common';
import { routing } from '@/i18n/routing';

const LOCALES = common.languages.langs;
const DEFAULT_LOCALE = common.languages.defaultLocale;
const DEFAULT_PATH = common.paths.languagePaths.tw;

// 語言偵測：從 header 中取出 Accept-Language 並做 locale 匹配
const detectLocale = (request: NextRequest): string => {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  return matchLocale(languages, LOCALES, DEFAULT_LOCALE);
};

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // 若是根目錄，自動導向預設語言路徑。
  if (pathname === '/')
    return NextResponse.redirect(new URL(DEFAULT_PATH, request.url));

  // 檢查目前 URL 是否缺少語言前綴
  const isMissingLocale = LOCALES.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (isMissingLocale) {
    const locale = detectLocale(request);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return createMiddleware(routing)(request);
};

// 作用的路徑範圍
export const config = {
  matcher: [
    '/(tw|en)/:path*', // 包含語系的路徑
    // 其他需要導向的（不包含 api、靜態資源等）
    '/((?!api|_next|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
