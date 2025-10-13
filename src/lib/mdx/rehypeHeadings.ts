import { visit } from 'unist-util-visit'; // 遍歷 HAST 樹（HTML AST）
import { toString } from 'hast-util-to-string'; // 將節點轉換成純文字內容
import type { VFile } from 'vfile';

interface HeadingInfo {
  id: string;
  text: string;
  level: number;
}

// 取得文章中的所有 heading 資訊（id、文字、階層）
export const rehypeHeadings = () => {
  return (tree: any, file: VFile) => {
    const headings: HeadingInfo[] = [];

    // 遍歷所有 HTML 元素節點（h1 ~ h6）
    visit(tree, 'element', (node) => {
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        const headingId = node.properties?.id || '';
        const headingText = toString(node);
        const level = parseInt(node.tagName[1], 10);

        headings.push({ id: headingId, text: headingText, level });
      }
    });

    file.data = file.data || {};
    file.data.headings = headings;
  };
};
