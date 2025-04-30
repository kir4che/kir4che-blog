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

const main = async () => {
  try {
    const input = await askQuestion('輸入 slug（文章資料夾名稱，僅限英文）：');

    // 將 input 轉為小寫並將空格轉為 -
    const slug = input.trim().toLowerCase().replace(/\s+/g, '-');

    const updatedAt = formatDateTime(new Date());
    const date = updatedAt.split('T')[0];

    const postsDirectory = path.join(__dirname, '../src/posts', slug);

    // 檢查資料夾是否已存在
    if (fs.existsSync(postsDirectory)) {
      console.error('❌ 資料夾已存在，請使用其他 slug！');
      return;
    }

    // 建立資料夾
    fs.mkdirSync(postsDirectory, { recursive: true });

    // 建立 MDX 文章範本
    const mdxContent = `---
title: ${slug}
date: ${date}
description: 
categories: []
tags: []
updatedAt: ${updatedAt}
---

`;

    // 寫入檔案
    const filePath = path.join(postsDirectory, 'index.mdx');
    fs.writeFileSync(filePath, mdxContent, 'utf8');

    console.log(`✅ 成功建立文章：${filePath}`);
  } catch (err) {
    console.error('❌ 建立文章時發生錯誤：', err);
  } finally {
    rl.close();
  }
};

main();
