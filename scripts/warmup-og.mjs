import { readdir } from 'node:fs/promises';
import path from 'node:path';

const contentRoot = path.join(process.cwd(), 'src', 'content', 'blog');

const siteUrlRaw = process.env.SITE_URL || 'http://localhost:4321';

const siteUrl = siteUrlRaw.replace(/\/+$/, '');

const concurrency = Math.max(1, Number(process.env.OG_WARMUP_CONCURRENCY ?? 5));
const limit = Math.max(0, Number(process.env.OG_WARMUP_LIMIT ?? 0));

const REQUEST_TIMEOUT_MS = Number(process.env.OG_WARMUP_TIMEOUT ?? 8000);

// 僅處理 markdown / mdx
const isContentFile = (name) => name.endsWith('.mdx') || name.endsWith('.md');

// 收集文章檔案
const collectFiles = async (dir, acc = []) => {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) await collectFiles(fullPath, acc);
    else if (entry.isFile() && isContentFile(entry.name)) acc.push(fullPath);
  }

  return acc;
};

// 收集 slug
const files = await collectFiles(contentRoot);

const slugs = files
  .map((filePath) => {
    const relative = path.relative(contentRoot, filePath);
    return relative.replace(path.extname(relative), '').split(path.sep).join('/');
  })
  .filter(Boolean);

// 產生 warm-up 目標
const targets = (limit > 0 ? slugs.slice(0, limit) : slugs).map(
  (slug) => `${siteUrl}/og/${slug}.png`
);

if (targets.length === 0) {
  console.log('[OG warmup] No targets found.');
  process.exit(0);
}

let cursor = 0;
let ok = 0;
let fail = 0;

// 取得下一個任務 index（單執行緒安全）
const nextIndex = () => cursor++;

// 單一 worker
const worker = async () => {
  while (true) {
    const current = nextIndex();
    if (current >= targets.length) return;

    const url = targets[current];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        fail += 1;
        console.warn(`[OG warmup] ${res.status} ${url}`);
        continue;
      }

      ok += 1;
    } catch (err) {
      fail += 1;
      console.warn(`[OG warmup] error ${url}`, err);
    } finally {
      clearTimeout(timeout);
    }
  }
};

await Promise.all(Array.from({ length: concurrency }, () => worker()));

console.log(`[OG warmup] done. ok=${ok} fail=${fail} total=${targets.length}`);
