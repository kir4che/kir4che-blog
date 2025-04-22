import { VFile } from 'vfile'; // 包裝文章內容，讓 plugin 可以讀寫 metadata。
import { serialize } from 'next-mdx-remote/serialize'; // 把 MDX內容轉換成可以被 React 渲染的格式

// Remark 插件（處理 Markdown 部分）
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';
import remarkIns from 'remark-ins';
import { remarkMark } from 'remark-mark-highlight';
import remarkImages from 'remark-images';
import remarkCustomHeaderId from 'remark-custom-header-id';

// Rehype 插件（處理 HTML 部分）
import rehypeUnwrapImages from 'rehype-unwrap-images';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeExpressiveCode from 'rehype-expressive-code';
import { rehypeExpressiveCodeOptions } from '@/config/expressiveCode';
import { rehypeHeadings } from '@/utils/rehypeHeadings';

export const parseMDX = async (content: string) => {
  // 用 VFile 包起來，這樣 rehypeHeadings 才能寫入 file.data.headings。
  const file = new VFile({ value: content });

  const mdxSource = await serialize(file, {
    parseFrontmatter: true, // 自動解析 YAML frontmatter
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
      format: 'mdx', // 明確指定格式為 MDX
    },
  });

  const headings = Array.isArray(file.data.headings) ? file.data.headings : [];

  return { mdxSource, headings };
};
