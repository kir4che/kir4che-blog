import { LANGUAGE_TO_LOCALE_MAP, CONFIG } from '@/config';
import type { Language } from '@/types';
import { resolveLanguage } from '@/lib/i18n';
import { stripLocalePrefix, withLocalePrefix } from '@/lib/paths';
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

// 依語系取得對應文字，若無則 fallback 到第一個可用值。
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

export const getSeoConfig = (lang: Language, url?: URL | string): SeoConfig => {
  const blogTitle = getLocalizedValue(CONFIG.siteInfo.blog.title, lang) ?? CONFIG.siteInfo.name;
  const blogDescription =
    getLocalizedValue(CONFIG.siteInfo.blog.description, lang) ?? 'kir4che Blog';
  const blogSiteName =
    getLocalizedValue(CONFIG.siteInfo.blog.siteName, lang) ?? CONFIG.siteInfo.name;

  const rawSiteUrl =
    import.meta.env.PUBLIC_SITE_URL || process.env.SITE_URL || 'https://kir4che.com';
  const siteUrl = rawSiteUrl.replace(/\/+$/, '');

  const rawPathname = typeof url === 'string' ? url : url?.pathname;
  const pathname = ensurePathname(rawPathname);

  const strippedPath = stripLocalePrefix(pathname);

  const localeToUrl = Object.fromEntries(
    (Object.entries(LANGUAGE_TO_LOCALE_MAP) as [Language, string][]).map(
      ([languageKey, localeValue]) => [
        localeValue,
        `${siteUrl}${withLocalePrefix(strippedPath, languageKey)}`,
      ]
    )
  );

  const languageAlternates: Record<string, string> = {
    ...localeToUrl,
    'x-default': `${siteUrl}${withLocalePrefix(strippedPath, lang)}`,
  };

  const openGraphLocaleAlternates = (Object.entries(LANGUAGE_TO_LOCALE_MAP) as [Language, string][])
    .filter(([languageKey]) => languageKey !== lang)
    .map(([, localeValue]) => localeValue);

  const defaultOgImage = `${siteUrl}/images/default-og.jpg`;

  const baseImage = {
    url: defaultOgImage,
    alt: blogTitle,
    width: 1200,
    height: 630,
  };

  const canonicalUrl = `${siteUrl}${withLocalePrefix(strippedPath, lang)}`;

  return {
    title: {
      default: blogTitle,
      template: `%s | ${blogTitle}`,
    },
    description: blogDescription,
    siteName: blogSiteName,
    canonical: canonicalUrl,
    alternates: languageAlternates,
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: blogTitle,
      description: blogDescription,
      siteName: blogSiteName,
      locale: resolveLanguage(lang),
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
      google: import.meta.env.GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION,
    },
    keywords: KEYWORDS_BY_LANG[lang] ?? Object.values(KEYWORDS_BY_LANG)[0] ?? [],
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
};
