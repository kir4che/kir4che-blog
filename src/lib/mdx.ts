import { serialize } from 'next-mdx-remote/serialize';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import remarkSupersub from 'remark-supersub';
import remarkGfm from 'remark-gfm';
import remarkIns from 'remark-ins';
import remarkCustomHeaderId from 'remark-custom-header-id';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkImages from 'remark-images';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { remarkMark } from 'remark-mark-highlight';

import { rehypeExpressiveCodeOptions } from '@/config/expressiveCode';

export const parseMDX = async (content: string) => {
  // serialize 會將 MDX 內容轉換成 React 組件
  return serialize(content, {
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
        remarkImages,
        remarkGfm,
      ],
      format: 'mdx',
    },
  });
};
