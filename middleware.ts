import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import common from '@/config/common';
import routing from '@/i18n/routing';
import { detectLocale } from '@/utils/detectLocale';

const LOCALES = common.languages.langs;
const DEFAULT_PATH = common.paths.languagePaths.tw;

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
