import { Metadata } from 'next';

import common from '@/config/common';
import { LangToLocaleMap } from '@/types/language';

export function getSeoConfig(lang: string): Metadata {
  const url = process.env.NEXT_PUBLIC_API_URL!;
  const title = common.siteInfo.blog.title;
  const description = common.siteInfo.blog.description;
  const locale = LangToLocaleMap[lang] ?? 'zh-TW';

  return {
    metadataBase: new URL(url),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    authors: [{ name: 'kir4che', url }],
    publisher: 'kir4che',
    applicationName: title,
    generator: 'Next.js',
    keywords: ['kir4che', 'blog', '部落格', 'frontend', '前端開發', '前端技術分享', '生活紀錄'],
    alternates: {
      canonical: `${url}/${lang}`,
      languages: {
        'zh-TW': `${url}/tw`,
        en: `${url}/en`,
      },
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
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kir4che',
      creator: '@kir4che',
      title,
      description,
      images: [`${url}/images/default-og.jpg`],
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}
