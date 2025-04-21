export const dynamic = 'force-static';

import React from 'react';
import { redirect, notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import { LANGUAGES, LangToLocaleMap } from '@/types/language';
import { getPostInfoBySlug } from '@/lib/posts';
import { parseMDX } from '@/lib/mdx';

import PostLayout from '@/components/features/post/PostLayout';
import MDXContent from '@/components/mdx/MDXContent';

type Params = Promise<{
  lang: Language;
  slug: string;
}>;

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);
  if (!res.ok) return [];

  const { posts } = await res.json();
  if (!Array.isArray(posts)) return [];

  return LANGUAGES.flatMap((lang) =>
    posts.map(({ slug }: { slug: string }) => ({
      slug,
      lang,
    }))
  );
}

export async function generateMetadata({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const meta = await getPostInfoBySlug(lang, slug);
  if (!meta || !meta.title || !meta.date) return {};

  const { title, description, date, tags } = meta;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL!;
  const postUrl = `${baseUrl}/${lang}/posts/${slug}`;
  const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&tags=${encodeURIComponent((tags ?? []).join(','))}`;
  const locale = LangToLocaleMap[lang] ?? 'zh-TW';

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    publishedTime: new Date(date).toISOString(),
    authors: [{ name: 'kir4che', url: baseUrl }],
    publisher: 'kir4che',
    keywords: tags && tags.length > 0 ? tags : undefined,
    alternates: {
      canonical: postUrl,
      languages: {
        'zh-TW': `${baseUrl}/tw/posts/${slug}`,
        en: `${baseUrl}/en/posts/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: postUrl,
      siteName: 'kir4che',
      locale,
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
    },
    robots: 'index,follow',
  };
}

const PostPage = async ({ params }: { params: Params }) => {
  const { lang, slug } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}?lang=${lang}`
    );

    if (!res.ok) return notFound();

    const post = await res.json();
    const mdxSource = await parseMDX(post.content);

    return (
      <PostLayout post={post}>
        <MDXContent content={mdxSource} imageMetas={post.imageMetas} />
      </PostLayout>
    );
  } catch (err) {
    console.error('Error fetching post data:', err);
    redirect(`/${lang}/`);
  }
};

export default PostPage;
