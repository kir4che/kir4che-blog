import { useEffect, useState } from 'react';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';

import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';
import remarkIns from 'remark-ins';
import { remarkMark } from 'remark-mark-highlight';
import remarkImages from 'remark-images';
import remarkCustomHeaderId from 'remark-custom-header-id';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeExpressiveCode from 'rehype-expressive-code';

import { rehypeExpressiveCodeOptions } from '@/config/expressiveCode';
import { rehypeHeadings } from '@/lib/mdx/rehypeHeadings';

// 即時預覽 MDX
export const useMDXPreview = (content: string) => {
  // 存放編譯後的 MDX 資料（給 MDXRemote 用）
  const [previewSource, setPreviewSource] =
    useState<MDXRemoteSerializeResult | null>(null);

  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!content.trim()) {
      setPreviewSource(null);
      setPreviewLoading(false);
      return undefined;
    }

    setPreviewLoading(true);

    // 編譯 MDX，沿用正式頁面相同的 remark/rehype 設定
    serialize(content, {
      parseFrontmatter: true,
      mdxOptions: {
        rehypePlugins: [
          [rehypeExpressiveCode, rehypeExpressiveCodeOptions],
          rehypeUnwrapImages,
          rehypeSlug,
          rehypeHighlight,
          rehypeHeadings,
        ],
        remarkPlugins: [
          remarkSupersub,
          remarkIns,
          remarkMark,
          remarkCustomHeaderId,
          remarkImages,
          remarkGfm,
        ],
        format: 'mdx',
        development: process.env.NODE_ENV === 'development',
      },
    })
      .then((compiled) => {
        if (!cancelled) setPreviewSource(compiled);
      })
      .catch(() => {
        if (!cancelled) setPreviewSource(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [content]);

  return { previewSource, previewLoading };
};
