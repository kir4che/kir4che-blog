import {
  OrganizationJsonLd,
  SiteLinksSearchBoxJsonLd,
  SocialProfileJsonLd,
  WebPageJsonLd,
} from 'next-seo';

import { CONFIG, DEFAULT_LANGUAGE, LANGUAGE_TO_LOCALE_MAP } from '@/config';
import type { Language } from '@/types';

interface StructuredDataProps {
  lang?: Language;
}

export default function StructuredData({
  lang = DEFAULT_LANGUAGE,
}: StructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return null;

  const sameAs = Object.values(CONFIG.siteInfo.socialLinks).filter(
    (url): url is string => Boolean(url)
  );

  const alternateName =
    CONFIG.siteInfo.blog.siteName?.[lang] ??
    CONFIG.siteInfo.blog.siteName?.[DEFAULT_LANGUAGE];
  const blogTitle =
    CONFIG.siteInfo.blog.title?.[lang] ??
    CONFIG.siteInfo.blog.title?.[DEFAULT_LANGUAGE];
  const blogDescription =
    CONFIG.siteInfo.blog.description?.[lang] ??
    CONFIG.siteInfo.blog.description?.[DEFAULT_LANGUAGE];
  const locale =
    LANGUAGE_TO_LOCALE_MAP[lang as keyof typeof LANGUAGE_TO_LOCALE_MAP] ??
    LANGUAGE_TO_LOCALE_MAP[DEFAULT_LANGUAGE];
  const logoUrl = `${siteUrl}/images/avatar.webp`;
  const pagePath = CONFIG.paths.languagePaths?.[lang];
  const pageUrl = pagePath ? `${siteUrl}${pagePath}` : siteUrl;
  const siteSearchUrl = process.env.NEXT_PUBLIC_SITE_SEARCH_URL;

  return (
    <>
      <OrganizationJsonLd
        useAppDir
        id={`${siteUrl}/#organization`}
        url={siteUrl}
        name={CONFIG.siteInfo.name}
        alternateName={alternateName}
        logo={logoUrl}
        sameAs={sameAs}
      />
      <SocialProfileJsonLd
        useAppDir
        type='Person'
        name={CONFIG.siteInfo.name}
        url={siteUrl}
        sameAs={sameAs}
      />
      <WebPageJsonLd
        useAppDir
        id={`${pageUrl}#webpage`}
        url={pageUrl}
        name={blogTitle ?? CONFIG.siteInfo.name}
        description={blogDescription}
        inLanguage={locale}
        isPartOf={{
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          name: blogTitle ?? CONFIG.siteInfo.name,
        }}
      />
      {siteSearchUrl ? (
        <SiteLinksSearchBoxJsonLd
          useAppDir
          url={siteUrl}
          potentialActions={[
            {
              target: siteSearchUrl,
              queryInput: 'required name=search_term_string',
            },
          ]}
        />
      ) : null}
    </>
  );
}
