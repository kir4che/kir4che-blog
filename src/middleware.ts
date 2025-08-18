import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import routing from '@/i18n/routing';
import { CONFIG } from '@/config';
import { detectLocale } from '@/utils/detectLocale';

const LOCALES = CONFIG.languages.supportedLanguages;
const DEFAULT_PATH = CONFIG.paths.languagePaths.tw;

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

  const isEditorPage = /^\/(tw|en)\/posts\/editor(?:\/|$)?/.test(pathname);
  const locale = pathname.split('/')[1];
  if (isEditorPage && process.env.NEXT_PUBLIC_NODE_ENV !== 'development')
    return NextResponse.redirect(new URL(`/${locale}/not-found`, request.url));

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
