import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => rl.question(question, resolve));
};

const formatDateTime = (date: Date): string => {
  return date.toISOString();
};

(async () => {
  const input = await askQuestion('請輸入 slug（文章資料夾名稱，僅限英文）：');

  // 將 input 轉為小寫並將空格轉為 "-"
  const slug = input.trim().toLowerCase().replace(/\s+/g, '-');

  const updatedAt = formatDateTime(new Date());
  const date = updatedAt.split('T')[0]; // 只抓日期部分（YYYY-MM-DD）

  const folderPath = path.join(__dirname, '../src/posts', slug);

  if (fs.existsSync(folderPath)) {
    console.error('❌ 資料夾已存在，請換一個 slug！');
    rl.close();
    return;
  }

  fs.mkdirSync(folderPath, { recursive: true });

  const mdxContent = `---
title: 
date: ${date}
description: 
categories: []
tags: []
updatedAt: ${updatedAt}
---

`;

  const filePath = path.join(folderPath, 'index.mdx');
  fs.writeFileSync(filePath, mdxContent, 'utf8');

  console.log(`✅ 成功建立文章：${filePath}！`);
  rl.close();
})();
