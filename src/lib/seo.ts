import { Metadata } from 'next';

import { CONFIG, LANGUAGE_TO_LOCALE_MAP, DEFAULT_LANGUAGE } from '@/config';

const getLocalizedValue = (map: Record<string, string>, lang: string) =>
  map[lang] ?? map[DEFAULT_LANGUAGE];

const KEYWORDS_BY_LANG: Record<string, string[]> = {
  tw: [
    'kir4che',
    'kir4che 部落格',
    '前端開發',
    'React 教學',
    'JavaScript 教學',
  ],
  en: [
    'kir4che',
    'kir4che blog',
    'frontend development',
    'React tutorials',
    'JavaScript tutorials',
  ],
};

export const getSeoConfig = (lang: string): Metadata => {
  const blogTitle =
    getLocalizedValue(CONFIG.siteInfo.blog.title, lang) ?? CONFIG.siteInfo.name;
  const blogDescription =
    getLocalizedValue(CONFIG.siteInfo.blog.description, lang) ?? 'kir4che Blog';
  const blogSiteName =
    getLocalizedValue(CONFIG.siteInfo.blog.siteName, lang) ??
    CONFIG.siteInfo.name;

  const fallbackSiteUrl = 'https://kir4che.com';
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteUrl;

  const siteUrl = rawSiteUrl.replace(/\/+$/, '');

  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(siteUrl);
  } catch {
    metadataBase = undefined;
  }

  const localeToUrl = Object.fromEntries(
    Object.entries(CONFIG.paths.languagePaths).map(([languageKey, path]) => [
      LANGUAGE_TO_LOCALE_MAP[
        languageKey as keyof typeof LANGUAGE_TO_LOCALE_MAP
      ] || languageKey,
      `${siteUrl}${path}`,
    ])
  ) as Record<string, string>;

  const languageAlternates = {
    ...localeToUrl,
    'x-default': siteUrl,
  } satisfies Record<string, string>;

  const openGraphLocaleAlternates = Object.entries(LANGUAGE_TO_LOCALE_MAP)
    .filter(([languageKey]) => languageKey !== lang)
    .map(([, localeValue]) => localeValue);

  const defaultOgImage = `${siteUrl}/images/default-og.jpg`;
  const isSecureContext = defaultOgImage.startsWith('https://');
  const baseImage = {
    url: defaultOgImage,
    alt: blogTitle,
    width: 1200,
    height: 630,
  } as const;
  const openGraphImage = {
    ...baseImage,
    type: 'image/jpeg',
    ...(isSecureContext ? { secureUrl: defaultOgImage } : {}),
  };

  const canonicalUrl =
    localeToUrl[
      LANGUAGE_TO_LOCALE_MAP[lang as keyof typeof LANGUAGE_TO_LOCALE_MAP] ||
        lang
    ] ?? `${siteUrl}/${lang}`;

  return {
    metadataBase,
    title: {
      default: blogTitle,
      template: `%s | ${blogTitle}`,
    },
    description: blogDescription,
    authors: [{ name: CONFIG.siteInfo.name, url: siteUrl }],
    creator: CONFIG.siteInfo.name,
    publisher: CONFIG.siteInfo.name,
    applicationName: blogTitle,
    generator: 'Next.js 15.3.1',
    referrer: 'origin-when-cross-origin',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    keywords:
      KEYWORDS_BY_LANG[lang] ?? KEYWORDS_BY_LANG[DEFAULT_LANGUAGE] ?? [],
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: blogTitle,
      description: blogDescription,
      siteName: blogSiteName,
      locale:
        LANGUAGE_TO_LOCALE_MAP[lang as keyof typeof LANGUAGE_TO_LOCALE_MAP] ??
        'zh-TW',
      ...(openGraphLocaleAlternates.length
        ? { localeAlternate: openGraphLocaleAlternates }
        : {}),
      images: [openGraphImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: blogTitle,
      description: blogDescription,
      images: [baseImage],
    },
    icons: {
      icon: [{ url: '/favicon.ico', sizes: '32x32' }],
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
};
