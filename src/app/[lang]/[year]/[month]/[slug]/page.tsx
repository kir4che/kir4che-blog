export const dynamic = 'force-static';

import { notFound, redirect } from 'next/navigation';

import type { Language, PostInfo } from '@/types';
import {
  CONFIG,
  LANGUAGE_TO_LOCALE_MAP,
  DEFAULT_LANGUAGE,
  LANGUAGES,
} from '@/config';
import { getSeoConfig } from '@/utils/getSeoConfig';
import { getPostData, checkPostExistence, getPostsInfo } from '@/lib/posts';
import { parseMDX } from '@/lib/mdx';
import { loadPostComponents } from '@/lib/posts';
import {
  getAbsolutePostUrl,
  getLocalizedPostPath,
  getPostDateSegments,
} from '@/utils/postPaths';

import PostLayout from '@/components/features/post/PostLayout';

type Params = Promise<{
  lang: Language;
  year: string;
  month: string;
  slug: string;
}>;

export async function generateStaticParams() {
  const postsByLang = await Promise.all(
    LANGUAGES.map(async (lang) => {
      const posts = await getPostsInfo(lang);
      return Array.isArray(posts) ? posts : [];
    })
  );

  return postsByLang.flatMap((posts) =>
    posts.flatMap((post) => {
      if (!post?.slug || !post?.date) return [];
      const segments = getPostDateSegments(post.date);
      if (!segments) return [];

      return [
        {
          lang: post.lang,
          slug: post.slug,
          year: segments.year,
          month: segments.month,
        },
      ];
    })
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const baseMetadata = getSeoConfig(lang);
  const metadataBase = baseMetadata.metadataBase!;

  const meta = (await getPostsInfo(lang, slug)) as Partial<PostInfo> | null;

  if (!meta?.title || !meta?.date) return baseMetadata;
  const { title, description, date, tags } = meta;

  const { langs: availableLangs, metadata: languageMetadata } =
    await checkPostExistence(lang, slug);

  const languagesForAlternates =
    availableLangs.length > 0 ? availableLangs : [lang];

  const ogImage = new URL(
    `api/og?lang=${lang}&title=${encodeURIComponent(title)}&tags=${encodeURIComponent(
      tags?.join(',') || ''
    )}`,
    metadataBase
  ).toString();

  const languageAlternates = Object.fromEntries(
    languagesForAlternates.map((languageKey) => {
      const alternateUrl = getAbsolutePostUrl({
        metadataBase,
        lang: languageKey,
        date: languageMetadata[languageKey]?.date ?? date,
        slug,
      });

      return [languageKey, alternateUrl];
    })
  );

  const defaultLangUrl =
    languageAlternates[DEFAULT_LANGUAGE] ??
    languageAlternates[lang] ??
    getAbsolutePostUrl({ metadataBase, lang, date, slug });

  const openGraphLocaleAlternates = Array.from(
    new Set(
      languagesForAlternates
        .filter((languageKey) => languageKey !== lang)
        .map(
          (languageKey) => LANGUAGE_TO_LOCALE_MAP[languageKey] ?? languageKey
        )
    )
  );

  const baseKeywords = Array.isArray(baseMetadata.keywords)
    ? baseMetadata.keywords
    : baseMetadata.keywords
      ? [baseMetadata.keywords]
      : [];
  const normalizedTags = Array.isArray(tags)
    ? tags.map((tag) => tag.trim()).filter(Boolean)
    : [];
  const combinedKeywords = Array.from(
    new Set([...baseKeywords, ...normalizedTags])
  ).slice(0, 10);

  const canonicalUrl = getAbsolutePostUrl({
    metadataBase,
    lang,
    date,
    slug,
  });

  return {
    ...baseMetadata,
    metadataBase,
    title,
    description,
    keywords: combinedKeywords.length
      ? combinedKeywords
      : baseMetadata.keywords,
    alternates: {
      ...baseMetadata.alternates,
      canonical: canonicalUrl,
      languages: {
        ...languageAlternates,
        'x-default': defaultLangUrl,
      },
    },
    openGraph: {
      ...baseMetadata.openGraph,
      type: 'article',
      url: canonicalUrl,
      title,
      description,
      siteName:
        baseMetadata.openGraph?.siteName ??
        CONFIG.siteInfo.blog.siteName?.[lang] ??
        CONFIG.siteInfo.blog.siteName?.[DEFAULT_LANGUAGE],
      locale: LANGUAGE_TO_LOCALE_MAP[lang] ?? 'zh-TW',
      authors: [CONFIG.siteInfo.name],
      ...(openGraphLocaleAlternates.length
        ? { localeAlternate: openGraphLocaleAlternates }
        : {}),
      publishedTime: new Date(date).toISOString(),
      images: [
        {
          url: ogImage,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      creator: baseMetadata.creator ?? CONFIG.siteInfo.name,
      images: [
        {
          url: ogImage,
          alt: title,
          width: 1200,
          height: 630,
        },
      ],
    },
    authors: baseMetadata.authors ?? [
      { name: CONFIG.siteInfo.name, url: metadataBase.origin },
    ],
    publisher: CONFIG.siteInfo.name,
    robots: baseMetadata.robots ?? 'index,follow',
  };
}

const PostPage = async ({ params }: { params: Params }) => {
  const { lang, slug, year, month } = await params;

  const [otherLangs, post] = await Promise.all([
    checkPostExistence(lang, slug),
    getPostData(lang, slug),
  ]);

  if (!post) return notFound();

  const segments = getPostDateSegments(post.date);
  if (segments && (segments.year !== year || segments.month !== month)) {
    const targetPath = getLocalizedPostPath({
      lang,
      date: post.date,
      slug: post.slug,
    });

    redirect(targetPath);
  }

  const { mdxSource, headings } = await parseMDX(post.content);

  const extraComponents = await loadPostComponents(slug);

  return (
    <PostLayout
      post={{ ...post, imageMetas: post.imageMetas ?? {} }}
      headings={headings}
      otherLangs={otherLangs}
      mdxSource={mdxSource}
      extraComponents={extraComponents}
    />
  );
};

export default PostPage;
