import { visit } from 'unist-util-visit'; // 遍歷 HAST 樹（HTML AST）
import { toString } from 'hast-util-to-string'; // 將節點轉換成純文字內容

// 取得文章中的所有 heading 資訊（id、文字、階層）
export const rehypeHeadings = () => {
  return (tree: any, file: any) => {
    const headings: { id: string; text: string; level: number }[] = [];

    // 遍歷所有 HTML 元素節點（h1 ~ h6）
    visit(tree, 'element', (node) => {
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        const headingId = node.properties?.id || '';
        const headingText = toString(node);

        headings.push({
          id: headingId,
          text: headingText,
          level: parseInt(node.tagName[1], 10), // 從 tagName 中取出階層（h2 → 2）
        });
      }
    });

    file.data = file.data || {};
    file.data.headings = headings;
  };
};
