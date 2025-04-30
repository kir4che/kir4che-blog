export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES, LANGUAGE_TO_LOCALE_MAP } from '@/config';
import {
  getPostsMeta,
  getPostInfoBySlug,
  getPostData,
  checkPostExistence,
} from '@/lib/posts';
import { parseMDX } from '@/lib/mdx';

import PostLayout from '@/components/features/post/PostLayout';
import MDXContent from '@/components/mdx/MDXContent';

type Params = Promise<{
  lang: Language;
  slug: string;
}>;

// 預先取得所有語系的所有 { lang, slug }
export async function generateStaticParams() {
  const posts = await getPostsMeta();
  return LANGUAGES.flatMap((lang) => posts.map(({ slug }) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { lang, slug } = await params;

  const meta = await getPostInfoBySlug(lang, slug);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL!;

  if (!meta?.title || !meta?.date) return {};

  const { title, description, date, tags } = meta;

  const postUrl = `${baseUrl}/${lang}/posts/${slug}`;
  const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&tags=${encodeURIComponent((tags ?? []).join(','))}`;
  const locale = LANGUAGE_TO_LOCALE_MAP[lang] ?? 'zh-TW';

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
  const existOtherLangs = await checkPostExistence(lang, slug);

  const post = await getPostData(lang, slug);
  if (!post) return notFound();

  const { mdxSource, headings } = await parseMDX(post.content);

  return (
    <PostLayout
      post={post}
      headings={headings}
      existOtherLangs={existOtherLangs}
    >
      <MDXContent content={mdxSource} imageMetas={post.imageMetas} />
    </PostLayout>
  );
};

export default PostPage;
