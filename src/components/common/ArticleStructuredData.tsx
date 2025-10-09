import { ArticleJsonLd } from 'next-seo';

import { CONFIG, DEFAULT_LANGUAGE, LANGUAGE_TO_LOCALE_MAP } from '@/config';
import type { PostMeta } from '@/types';

interface ArticleStructuredDataProps {
  post: Pick<
    PostMeta,
    | 'title'
    | 'description'
    | 'date'
    | 'updatedAt'
    | 'lang'
    | 'coverImage'
    | 'hasPassword'
    | 'tags'
  >;
  canonicalUrl: string;
  siteUrl: string;
}

const resolveImageUrl = (imagePath: string | undefined, siteUrl: string) => {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://'))
    return imagePath;
  return `${siteUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

const ArticleStructuredData = ({
  post,
  canonicalUrl,
  siteUrl,
}: ArticleStructuredDataProps) => {
  const {
    title,
    description,
    date,
    updatedAt,
    lang,
    coverImage,
    hasPassword,
    tags,
  } = post;

  const mainImage =
    resolveImageUrl(coverImage, siteUrl) ??
    resolveImageUrl('/images/default-og.jpg', siteUrl);
  if (!mainImage) return null;

  const publishedAt = new Date(date).toISOString();
  const modifiedAt = updatedAt ? new Date(updatedAt).toISOString() : undefined;
  const keywords = Array.isArray(tags) ? tags.join(', ') : undefined;
  const locale =
    LANGUAGE_TO_LOCALE_MAP[lang as keyof typeof LANGUAGE_TO_LOCALE_MAP] ??
    LANGUAGE_TO_LOCALE_MAP[DEFAULT_LANGUAGE];
  const publisherLogo = resolveImageUrl('/images/avatar.webp', siteUrl);

  return (
    <ArticleJsonLd
      useAppDir
      type='BlogPosting'
      url={canonicalUrl}
      title={title}
      description={description ?? ''}
      images={[mainImage]}
      datePublished={publishedAt}
      dateModified={modifiedAt}
      isAccessibleForFree={!hasPassword}
      authorName={{ name: CONFIG.siteInfo.name, url: siteUrl }}
      publisherName={CONFIG.siteInfo.name}
      publisherLogo={publisherLogo}
      inLanguage={locale}
      mainEntityOfPage={{ '@type': 'WebPage', '@id': canonicalUrl }}
      headline={title}
      {...(keywords ? { keywords } : {})}
    />
  );
};

export default ArticleStructuredData;
