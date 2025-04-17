import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { serialize } from 'next-mdx-remote/serialize';

import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import remarkSupersub from 'remark-supersub';
import remarkGfm from 'remark-gfm';
import remarkIns from 'remark-ins';
import remarkCustomHeaderId from 'remark-custom-header-id';
import { remarkMark } from 'remark-mark-highlight';
import remarkImages from 'remark-images';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import { createInlineSvgUrl } from '@expressive-code/core';
import rehypeImageNativeLazyLoading from 'rehype-plugin-image-native-lazy-loading';

import type { Language } from '@/types/language';
import { getPostData } from '@/lib/posts';

import PostLayout from '@/components/features/post/PostLayout';
import MDXContent from '@/components/mdx/MDXContent';

type Props = {
  params: Promise<{
    lang: Language;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = (await params).lang;
  const slug = (await params).slug;

  const post = await getPostData(lang, slug);

  return {
    title: post.title,
    description: post.description,
  };
}

const terminalIconMacStyle = createInlineSvgUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="7" viewBox="0 0 34 10" preserveAspectRatio="xMidYMid meet">
  <circle cx="5" cy="5" r="4" fill="#ff5f56"/>
  <circle cx="17" cy="5" r="4" fill="#ffbd2e"/>
  <circle cx="29" cy="5" r="4" fill="#27c93f"/>
</svg>
`);

/** @type {import('rehype-expressive-code').RehypeExpressiveCodeOptions} */
const rehypeExpressiveCodeOptions = {
  themes: 'one-dark-pro',
  frames: {
    showCopyToClipboardButton: true,
  },
  styleOverrides: {
    frames: {
      terminalTitlebarBackground: '#2d2d2d',
      terminalTitlebarBorderBottomColor: '#2d2d2d',
      terminalIcon: terminalIconMacStyle,
    },
  },
  defaultProps: {
    // frame: 'terminal',
    wrap: true,
    showLineNumbers: false,
  },
  plugins: [pluginLineNumbers()],
};

const PostPage = async ({ params }: Props) => {
  const { lang, slug } = await params;

  try {
    const post = await getPostData(lang, slug);

    // serialize 會將 MDX 內容轉換成 React 組件
    const mdxSource = await serialize(post.content, {
      parseFrontmatter: true, // 解析文章開頭的配置
      mdxOptions: {
        rehypePlugins: [
          [rehypeExpressiveCode, rehypeExpressiveCodeOptions],
          [rehypeImageNativeLazyLoading as unknown as any],
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
        format: 'mdx', // 處理標準的 MDX 格式
      },
    });

    return (
      <PostLayout post={post}>
        <MDXContent content={mdxSource} />
      </PostLayout>
    );
  } catch (err) {
    console.error('Error fetching post data:', err);
    redirect(`/${lang}/`);
  }
};

export default PostPage;
