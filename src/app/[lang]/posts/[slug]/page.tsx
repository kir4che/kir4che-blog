export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language, PostInfo } from '@/types';
import { CONFIG, LANGUAGE_TO_LOCALE_MAP } from '@/config';
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

  const meta = (await getPostsInfo(lang, slug)) as Partial<PostInfo> | null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  if (!meta?.title || !meta?.date) return {};

  const { title, description, date, tags } = meta;

  const postUrl = `${baseUrl}/${lang}/posts/${slug}`;
  const tagString = tags?.join(',') || '';
  const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&tags=${encodeURIComponent(tagString)}`;
  const locale = LANGUAGE_TO_LOCALE_MAP[lang] ?? 'zh-TW';

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    publishedTime: new Date(date).toISOString(),
    authors: [{ name: CONFIG.siteInfo.name, url: baseUrl }],
    publisher: CONFIG.siteInfo.name,
    keywords: tags?.length ? tags : undefined,
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
      siteName: CONFIG.siteInfo.name,
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
      title,
      description,
      images: [ogImage],
    },
    robots: 'index,follow',
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
