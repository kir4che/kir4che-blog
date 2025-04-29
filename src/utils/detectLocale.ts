import { NextRequest } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

import { CONFIG } from '@/config';

// 語言偵測：從 header 中取出 Accept-Language 並做 locale 匹配
export const detectLocale = (request: NextRequest): string => {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  return matchLocale(
    languages,
    CONFIG.languages.supportedLanguages,
    CONFIG.languages.defaultLanguage
  );
};
