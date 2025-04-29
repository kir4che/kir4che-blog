import fs from 'fs';
import matter from 'gray-matter';
import { execSync } from 'child_process';

// 取得 git 暫存區的 .mdx 檔案
const getStagedMdxFiles = (): string[] => {
  const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
    encoding: 'utf8',
  });

  return output
    .split('\n')
    .filter((file) => file.endsWith('.mdx') && fs.existsSync(file));
};

const updateUpdatedAt = () => {
  const files = getStagedMdxFiles();
  const now = new Date().toISOString();

  files.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: mdxContent } = matter(content);

    if (data.updatedAt === now) return;

    data.updatedAt = now;
    const updated = matter.stringify(mdxContent, data);
    fs.writeFileSync(filePath, updated);
    console.log(`✅ 已更新 ${filePath} 的 updatedAt: ${now}！`);
    execSync(`git add "${filePath}"`); // 重新加回 Git 暫存區
  });
};

updateUpdatedAt();
