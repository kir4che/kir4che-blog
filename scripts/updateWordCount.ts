import path from 'path';
import util from 'util';
import fs from 'fs';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { exec } from 'child_process';
import { visit } from 'unist-util-visit';
import { unified } from 'unified';
import matter from 'gray-matter';

const execPromise = util.promisify(exec);

const postsDirectory = path.join(__dirname, '../src/posts');

// 掃描整個 posts 資料夾底下的 mdx 檔案
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

// 只掃目前 git 狀態下的變更檔案
const getChangedFiles = async () => {
  try {
    const { stdout: diffStdout } = await execPromise('git diff --name-only');
    const diffFiles = diffStdout
      .split('\n')
      .filter((file) => file.endsWith('.mdx'));

    const { stdout: stagedStdout } = await execPromise(
      'git diff --name-only --cached'
    );
    const stagedFiles = stagedStdout
      .split('\n')
      .filter((file) => file.endsWith('.mdx'));

    return [...new Set([...diffFiles, ...stagedFiles])];
  } catch (error) {
    console.error('❌ Error getting changed files: ', error);
    return [];
  }
};

// 解析並計算字數（中文 + 英文，不包含 markdown 語法）
const calculateWordCount = async (content: string) => {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(content);

  let textContent = '';

  visit(tree, 'text', (node) => {
    textContent += node.value + ' ';
  });

  const chineseChars = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length;

  const englishWords = textContent
    .replace(/[\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter((word) => word.trim().length > 0).length;

  return chineseChars + englishWords;
};

// 更新 wordCount
const updateWordCount = async (filePath: string) => {
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const wordCount = await calculateWordCount(content);

  if (data.wordCount !== wordCount) {
    const updatedContent = matter.stringify(content, { ...data, wordCount });
    await fs.promises.writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated word count for: ${filePath}`);
  } else {
    console.log(`✅ Word count is already up to date for: ${filePath}`);
  }
};

// 執行流程
const updatePosts = async () => {
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');

  const files = isAll ? await getAllPostFiles() : await getChangedFiles();

  if (files.length === 0) {
    console.log('ℹ️ No posts to update.');
    return;
  }

  for (const filePath of files) {
    await updateWordCount(filePath);
  }
};

updatePosts().catch((err) => {
  console.error('❌ 更新 wordCount 時發生錯誤: ', err);
});
