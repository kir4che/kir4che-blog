import { CONFIG, LANGUAGE_TO_LOCALE_MAP } from '@/config';
import { stripLocalePrefix, withLocalePrefix } from '@/lib/paths';
import type { Language } from '@/types';
import { ensurePathname } from '@/utils/path';

type SeoConfig = {
  title: {
    default: string;
    template: string;
  };
  description: string;
  siteName: string;
  canonical: string;
  alternates: Record<string, string>;
  openGraph: {
    type: 'website';
    url: string;
    title: string;
    description: string;
    siteName: string;
    locale: string;
    localeAlternates?: string[];
    images: Array<{
      url: string;
      alt: string;
      width: number;
      height: number;
      type?: string;
      secureUrl?: string;
    }>;
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
  robots: string;
  keywords: string[];
  verification?: {
    google?: string;
  };
  icons: {
    icon: string;
    shortcut: string;
    apple: string;
  };
};

const getLocalizedValue = <T extends Record<Language, string>>(
  map: T,
  lang: Language
): string | undefined => map[lang] ?? Object.values(map)[0];

const KEYWORDS_BY_LANG: Record<Language, string[]> = {
  tw: ['kir4che', 'kir4che 部落格', '前端開發', 'React 教學', 'JavaScript 教學'],
  en: [
    'kir4che',
    'kir4che blog',
    'frontend development',
    'React tutorials',
    'JavaScript tutorials',
  ],
};

export const getSeoConfig = (siteUrl: URL, lang: Language, url?: URL | string): SeoConfig => {
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

  const baseImage = {
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
      locale: lang,
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
    keywords: KEYWORDS_BY_LANG[lang] ?? Object.values(KEYWORDS_BY_LANG)[0] ?? [],
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
};
