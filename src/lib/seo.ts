import { CONFIG, DEFAULT_LANGUAGE, LANGUAGE_TO_LOCALE_MAP } from '@/config';
import { stripLocalePrefix, withLocalePrefix } from '@/lib/paths';
import type { Language } from '@/types';
import { ensurePathname } from '@/utils/path';

const getLocalizedValue = (
  map: Partial<Record<Language, string>>,
  lang: Language,
  defaultLang: Language = DEFAULT_LANGUAGE
): string | undefined => map[lang] ?? map[defaultLang];

export const getSeoConfig = (siteUrl: URL, lang: Language, url?: URL | string) => {
  const blogTitle = getLocalizedValue(CONFIG.siteInfo.blog.title, lang) ?? CONFIG.siteInfo.name;
  const blogDescription =
    getLocalizedValue(CONFIG.siteInfo.blog.description, lang) ?? 'kir4che Blog';
  const blogSiteName =
    getLocalizedValue(CONFIG.siteInfo.blog.siteName, lang) ?? CONFIG.siteInfo.name;

  const rawPathname = typeof url === 'string' ? url : url?.pathname;
  const strippedPath = stripLocalePrefix(ensurePathname(rawPathname));
  const canonicalUrl = `${siteUrl}${withLocalePrefix(strippedPath, lang)}`;

  const localeToUrl: Record<string, string> = {};
  const openGraphLocaleAlternates: string[] = [];

  for (const [languageKey, localeValue] of Object.entries(LANGUAGE_TO_LOCALE_MAP) as [
    Language,
    string,
  ][]) {
    localeToUrl[localeValue] = `${siteUrl}${withLocalePrefix(strippedPath, languageKey)}`;
    if (languageKey !== lang) openGraphLocaleAlternates.push(localeValue);
  }

  const baseImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
    type?: string;
  } = {
    url: `${siteUrl}/images/default-og.jpg`,
    alt: blogTitle,
    width: 1200,
    height: 630,
  };

  return {
    title: {
      default: blogTitle,
      template: `%s | ${blogTitle}`,
    },
    description: blogDescription,
    siteName: blogSiteName,
    canonical: canonicalUrl,
    alternates: { ...localeToUrl, 'x-default': canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: blogTitle,
      description: blogDescription,
      siteName: blogSiteName,
      locale: LANGUAGE_TO_LOCALE_MAP[lang],
      ...(openGraphLocaleAlternates.length ? { localeAlternates: openGraphLocaleAlternates } : {}),
      images: [baseImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: blogTitle,
      description: blogDescription,
      images: [baseImage.url],
    },
    robots: 'index,follow',
    verification: {
      google: import.meta.env.GOOGLE_SITE_VERIFICATION,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
};
