export const dynamic = 'force-static';

import React from 'react';
import { redirect, notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import { LANGUAGES } from '@/types/language';
import { getPostMetaBySlug } from '@/lib/posts';
import { parseMDX } from '@/lib/mdx';
import common from '@/config/common';

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
  const meta = await getPostMetaBySlug(lang, slug);
  if (!meta) return {};
  const { title, description } = meta;

  return { title, description };
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
