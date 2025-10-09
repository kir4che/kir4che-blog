import { Metadata } from 'next';

import { CONFIG, LANGUAGE_TO_LOCALE_MAP, DEFAULT_LANGUAGE } from '@/config';

const KEYWORDS_BY_LANG: Record<string, string[]> = {
  tw: [
    'kir4che',
    'kir4che 部落格',
    '前端開發',
    'React 教學',
    'JavaScript 教學',
    '生活紀錄',
  ],
  en: [
    'kir4che',
    'kir4che blog',
    'frontend development',
    'React tutorials',
    'JavaScript tutorials',
    'personal blog',
  ],
};

export const getSeoConfig = (lang: string): Metadata => {
  const { title, description } = CONFIG.siteInfo.blog;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  const languageAlternates = {
    ...Object.fromEntries(
      Object.entries(CONFIG.paths.languagePaths).map(([languageKey, path]) => [
        languageKey,
        `${siteUrl}${path}`,
      ])
    ),
    'x-default': siteUrl,
  } satisfies Record<string, string>;

  const openGraphLocaleAlternates = Object.entries(LANGUAGE_TO_LOCALE_MAP)
    .filter(([languageKey]) => languageKey !== lang)
    .map(([, localeValue]) => localeValue);

  const defaultOgImage = `${siteUrl}/images/default-og.jpg`;
  const isSecureContext = defaultOgImage.startsWith('https://');
  const baseImage = {
    url: defaultOgImage,
    alt: title,
    width: 1200,
    height: 630,
  } as const;
  const openGraphImage = {
    ...baseImage,
    type: 'image/jpeg',
    ...(isSecureContext ? { secureUrl: defaultOgImage } : {}),
  };

  const rawKeywords =
    KEYWORDS_BY_LANG[lang] ?? KEYWORDS_BY_LANG[DEFAULT_LANGUAGE] ?? [];
  const keywords = Array.from(new Set(rawKeywords)).slice(0, 10);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    authors: [{ name: CONFIG.siteInfo.name, url: siteUrl }],
    publisher: CONFIG.siteInfo.name,
    applicationName: title,
    generator: 'Next.js',
    keywords: ['kir4che', 'blog', '部落格', 'frontend', '前端開發', '前端技術分享', '生活紀錄'],
    alternates: {
      canonical: languageAlternates[lang] ?? `${siteUrl}/${lang}`,
      languages: languageAlternates,
    },
    openGraph: {
      type: 'website',
      url: languageAlternates[lang] ?? `${siteUrl}/${lang}`,
      title,
      description,
      siteName: title,
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
      title,
      description,
      images: [baseImage],
    },
    icons: {
      icon: [{ url: '/favicon.ico', sizes: '32x32' }],
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
};
