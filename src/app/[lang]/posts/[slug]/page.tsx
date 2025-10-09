export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language, PostInfo } from '@/types';
import { CONFIG, LANGUAGE_TO_LOCALE_MAP, DEFAULT_LANGUAGE } from '@/config';
import { getSeoConfig } from '@/utils/getSeoConfig';
import { getPostData, checkPostExistence, getPostsInfo } from '@/lib/posts';
import { parseMDX } from '@/lib/mdx';
import { loadPostComponents } from '@/lib/posts';

import PostPageClient from '@/components/features/post/PostPageClient';

type Params = Promise<{ lang: Language; slug: string }>;

export async function generateStaticParams() {
  const posts = (await getPostsInfo()) as PostInfo[];
  return posts
    .filter(
      (post): post is PostInfo =>
        post !== null && post.slug !== undefined && post.lang !== undefined
    )
    .map(({ lang, slug }) => ({ lang, slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const baseMetadata = getSeoConfig(lang);
  const metadataBase = baseMetadata.metadataBase!;

  const meta = (await getPostsInfo(lang, slug)) as Partial<PostInfo> | null;

  if (!meta?.title || !meta?.date) return baseMetadata;
  const { title, description, date, tags } = meta;

  const { langs: availableLangs } = await checkPostExistence(lang, slug);
  const languagesForAlternates =
    availableLangs.length > 0 ? availableLangs : [lang];

  const languagePath =
    CONFIG.paths.languagePaths[
      lang as keyof typeof CONFIG.paths.languagePaths
    ] ?? `/${lang}`;
  const ogImage = new URL(
    `api/og?title=${encodeURIComponent(title)}&tags=${encodeURIComponent(
      tags?.join(',') || ''
    )}`,
    metadataBase
  ).toString();
  const languageAlternates = languagesForAlternates.reduce<
    Record<string, string>
  >((acc, languageKey) => {
    const languagePath =
      CONFIG.paths.languagePaths[
        languageKey as keyof typeof CONFIG.paths.languagePaths
      ];
    if (languagePath)
      acc[languageKey] = new URL(
        `${languagePath.replace(/^\//, '')}/posts/${slug}`,
        metadataBase
      ).toString();
    return acc;
  }, {});

  const defaultLangUrl =
    languageAlternates[DEFAULT_LANGUAGE] ??
    languageAlternates[lang] ??
    new URL(
      `${languagePath.replace(/^\//, '')}/posts/${slug}`,
      metadataBase
    ).toString();

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
      canonical: new URL(
        `${languagePath.replace(/^\//, '')}/posts/${slug}`,
        metadataBase
      ).toString(),
      languages: {
        ...languageAlternates,
        'x-default': defaultLangUrl,
      },
    },
    openGraph: {
      ...baseMetadata.openGraph,
      type: 'article',
      url: new URL(
        `${languagePath.replace(/^\//, '')}/posts/${slug}`,
        metadataBase
      ).toString(),
      title,
      description,
      siteName: baseMetadata.openGraph?.siteName ?? CONFIG.siteInfo.blog.title,
      locale: LANGUAGE_TO_LOCALE_MAP[lang] ?? 'zh-TW',
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
  const { lang, slug } = await params;

  const [otherLangs, post] = await Promise.all([
    checkPostExistence(lang, slug),
    getPostData(lang, slug),
  ]);

  if (!post) return notFound();

  const { mdxSource, headings } = await parseMDX(post.content);

  const extraComponents = await loadPostComponents(slug);

  return (
    <PostPageClient
      post={{ ...post, imageMetas: post.imageMetas ?? {} }}
      headings={headings}
      otherLangs={otherLangs}
      mdxSource={mdxSource}
      extraComponents={extraComponents}
    />
  );
};

export default PostPage;
