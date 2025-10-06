import { Metadata } from 'next';

import { CONFIG, LANGUAGE_TO_LOCALE_MAP } from '@/config';

export const getSeoConfig = (lang: string): Metadata => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'https://kir4che.com';
  const { title, description } = CONFIG.siteInfo.blog;
  const locale = LANGUAGE_TO_LOCALE_MAP[lang] ?? 'zh-TW';

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    authors: [{ name: CONFIG.siteInfo.name, url }],
    publisher: CONFIG.siteInfo.name,
    applicationName: title,
    generator: 'Next.js',
    keywords: ['kir4che', 'blog', '部落格', 'frontend', '前端開發', '前端技術分享', '生活紀錄'],
    alternates: {
      canonical: `${url}/${lang}`,
      languages: CONFIG.paths.languagePaths,
    },
    openGraph: {
      type: 'website',
      url: `${url}/${lang}`,
      title,
      description,
      siteName: title,
      locale,
      images: [
        {
          url: `${url}/images/default-og.jpg`,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
          secureUrl: `${url}/images/default-og.jpg`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: {
        url: `${url}/images/default-og.jpg`,
        alt: title,
        width: 1200,
        height: 630,
      },
    },
    icons: {
      icon: [{ url: '/favicon.ico', sizes: '32x32' }],
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
};
