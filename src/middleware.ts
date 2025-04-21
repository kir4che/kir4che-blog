// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import common from '@/config/common';
import routing from '@/i18n/routing';

const DEFAULT_PATH = common.paths.languagePaths.tw;

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname === '/')
    return NextResponse.redirect(new URL(DEFAULT_PATH, request.url));

  return createMiddleware(routing)(request);
};

export const config = {
  matcher: [
    '/(tw|en)/:path*',
    '/((?!api|_next|.*\\..*|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
