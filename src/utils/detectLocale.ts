import { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

import common from '@/config/common';

const LOCALES = common.languages.langs;
const DEFAULT_LOCALE = common.languages.defaultLocale;

// 語言偵測：從 header 中取出 Accept-Language 並做 locale 匹配
export const detectLocale = (request: NextRequest): string => {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  return matchLocale(languages, LOCALES, DEFAULT_LOCALE);
};
