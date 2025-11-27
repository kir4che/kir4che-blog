import 'tsconfig-paths/register';

import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PROJECT_ROOT = path.join(__dirname, '..');

const run = (step: string, command: string, args: string[]) => {
  console.log(step);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0)
    throw new Error(`指令失敗：${command} ${args.join(' ')}`);
};

const main = () => {
  try {
    run('ℹ️ 產生圖片模糊資料中…', 'npm', [
      'exec',
      'ts-node',
      '--',
      '--project',
      path.join(PROJECT_ROOT, 'scripts/tsconfig.scripts.json'),
      path.join(PROJECT_ROOT, 'scripts/generateImageMetas.ts'),
    ]);

    run('ℹ️ 更新文章字數統計…', 'npm', [
      'exec',
      'ts-node',
      '--',
      '--project',
      path.join(PROJECT_ROOT, 'scripts/tsconfig.scripts.json'),
      path.join(PROJECT_ROOT, 'scripts/updateWordCount.ts'),
      '--all',
    ]);

    run('ℹ️ 同步分類與標籤…', 'npm', [
      'exec',
      'ts-node',
      '--',
      '--project',
      path.join(PROJECT_ROOT, 'scripts/tsconfig.scripts.json'),
      path.join(PROJECT_ROOT, 'scripts/syncTaxonomy.ts'),
    ]);

    run('ℹ️ 更新站台資料 JSON…', 'npm', [
      'exec',
      'ts-node',
      '--',
      '--project',
      path.join(PROJECT_ROOT, 'scripts/tsconfig.scripts.json'),
      path.join(PROJECT_ROOT, 'scripts/generateSiteData.ts'),
    ]);

    console.log('✅ 內容準備完成。');
  } catch (err) {
    console.error('❌ 準備內容時發生錯誤：', err);
    process.exitCode = 1;
  }
};

main();
