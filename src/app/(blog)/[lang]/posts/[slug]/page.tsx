import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';

import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import remarkSupersub from 'remark-supersub';
import remarkGfm from 'remark-gfm';
import remarkIns from 'remark-ins';
import remarkCustomHeaderId from 'remark-custom-header-id';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import { remarkMark } from 'remark-mark-highlight';
import remarkImages from 'remark-images';
import rehypeExpressiveCode from 'rehype-expressive-code';

import type { Language } from '@/types/language';
import { rehypeExpressiveCodeOptions } from '@/config/expressiveCode';

import PostLayout from '@/components/features/post/PostLayout';
import MDXContent from '@/components/mdx/MDXContent';

interface Props {
  params: Promise<{
    lang: Language;
    slug: string;
  }>;
}

const PostPage = async ({ params }: Props) => {
  const { lang, slug } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`,
      {
        headers: {
          'Accept-Language': lang,
        },
      }
    );

    if (!res.ok) return notFound();

    const post = await res.json();

    // serialize 會將 MDX 內容轉換成 React 組件
    const mdxSource = await serialize(post.content, {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          [rehypeExpressiveCode, rehypeExpressiveCodeOptions],
          rehypeUnwrapImages,
          rehypeSlug,
          rehypeHighlight,
        ],
        remarkPlugins: [
          remarkSupersub,
          remarkIns,
          remarkMark,
          remarkCustomHeaderId,
          remarkImages, // 貼圖片 link 會直接顯示圖片
          remarkGfm,
        ],
        format: 'mdx',
      },
    });

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
