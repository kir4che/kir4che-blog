import path from 'path';
import fs from 'fs';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import matter from 'gray-matter';
import { execSync } from 'child_process';
import { visit } from 'unist-util-visit';
import { unified } from 'unified';

const postsDirectory = path.join(__dirname, '../src/posts');

// 兩種更新方式：
// 1. --all：更新所有文章（.mdx）的字數
const getAllPostFiles = async () => {
  const files: string[] = [];

  const walk = async (dir: string) => {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        await walk(fullPath);
      } else if (fullPath.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }
  };

  await walk(postsDirectory);
  return files;
};

// 2. 不加參數：僅更新有變動的文章（.mdx）字數
const getChangedMdxFiles = (): string[] => {
  const output = execSync('git diff HEAD --name-only --diff-filter=ACM', {
    encoding: 'utf8',
  });

  return output
    .split('\n')
    .filter((file) => file.endsWith('.mdx') && fs.existsSync(file));
};

// 計算文章字數（中文字 + 英文單字）
const calculateWordCount = async (content: string) => {
  // 使用 remark 解析 MDX 內容
  const tree = unified().use(remarkParse).use(remarkMdx).parse(content);

  let textContent = '';

  // 提取純文字內容
  visit(tree, 'text', (node) => {
    textContent += node.value + ' ';
  });

  // 計算中文字數
  const chineseChars = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length;

  // 計算英文單字數（移除中文後按空格分割）
  const englishWords = textContent
    .replace(/[\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter((word) => word.trim().length > 0).length;

  return chineseChars + englishWords;
};

// 更新單一檔案的字數統計
const updateWordCount = async (filePath: string) => {
  try {
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const wordCount = await calculateWordCount(content);

    // 只在字數有變更時才更新檔案
    if (data.wordCount !== wordCount) {
      const updatedContent = matter.stringify(content, { ...data, wordCount });
      await fs.promises.writeFile(filePath, updatedContent, 'utf8');
      console.log(`✅ 已更新文章字數：${filePath}`);
    } else {
      console.log(`ℹ️ 文章字數無變更：${filePath}`);
    }
  } catch (err) {
    console.error(`❌ 更新文章字數時發生錯誤 ${filePath}：`, err);
  }
};

const main = async () => {
  try {
    const args = process.argv.slice(2);
    const isAll = args.includes('--all');

    // 根據參數決定要處理的檔案範圍
    const files = isAll ? await getAllPostFiles() : await getChangedMdxFiles();

    if (files.length === 0) {
      console.log('ℹ️ 沒有需要更新的文章。');
      return;
    }

    // 更新每個檔案的字數
    for (const filePath of files) await updateWordCount(filePath);
  } catch (err) {
    console.error('❌ 執行過程發生錯誤：', err);
    process.exit(1);
  }
};

main();
