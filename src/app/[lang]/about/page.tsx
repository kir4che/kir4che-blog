export const dynamic = 'force-static';

import { Metadata } from 'next';

import type { Language } from '@/types';
import { LANGUAGES, CONFIG } from '@/config';
import { getSeoConfig } from '@/utils/getSeoConfig';

import AboutPageClient from './client';

type Params = Promise<{
  lang: Language;
}>;

export async function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lang } = await params;
  const baseMetadata = getSeoConfig(lang);

  const aboutTitle = lang === 'tw' ? '關於我' : 'About';
  const aboutDescription =
    lang === 'tw'
      ? `關於 ${CONFIG.siteInfo.name} - 前端工程師，熱愛分享技術與生活`
      : `About ${CONFIG.siteInfo.name} - Frontend Developer, sharing tech and life`;

  return {
    ...baseMetadata,
    title: aboutTitle,
    description: aboutDescription,
    openGraph: {
      ...baseMetadata.openGraph,
      title: aboutTitle,
      description: aboutDescription,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: aboutTitle,
      description: aboutDescription,
    },
  };
}

const AboutPage = async ({ params }: { params: Params }) => {
  await params; // 確保 params 被使用
  return <AboutPageClient />;
};

export default AboutPage;
