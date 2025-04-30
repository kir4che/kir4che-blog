import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getPlaiceholder } from 'plaiceholder';

const postsDirectory = path.join(__dirname, '../src/posts');
const outputPath = path.join(process.cwd(), 'public', 'imageMetas.json');

// 定義有效的圖片副檔名
const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// 取得媒體檔案的 meta（包含 blur 效果的 base64）
const getMediaMeta = async (src: string) => {
  const mediaPath = path.join(process.cwd(), 'public', src);
  const fileExtension = path.extname(mediaPath).toLowerCase();

  if (validImageExtensions.includes(fileExtension)) {
    const buffer = await fs.readFile(mediaPath);
    const { base64 } = await getPlaiceholder(buffer);
    return {
      src: '/' + src.replace(/^\/+/, ''),
      blurDataURL: base64,
    };
  }

  return null;
};

// 從 MDX 內容中提取所有圖片的 src
const extractImageSrcs = (content: string): Set<string> => {
  // 匹配 Markdown 圖片語法、CustomImage/Image/img 標籤和其他可能的圖片引用
  const imageRegex =
    /!\[[^\]]*]\((\/[^)]+)\)|<(?:CustomImage|Image|img)[^>]*\s+src=["'](\/[^"']+)["']|src\s*[:=]\s*["'](\/[^"']+)["']/g;

  const srcs = new Set<string>();
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const src = match[1] || match[2] || match[3];
    if (src?.startsWith('/')) {
      srcs.add(src);
    }
  }

  return srcs;
};

const main = async () => {
  try {
    // 讀取所有文章目錄
    const slugs = await fs.readdir(postsDirectory);
    const allImageSrcs = new Set<string>();

    // 遍歷每篇文章並提取圖片路徑
    for (const slug of slugs) {
      const dir = path.join(postsDirectory, slug);
      const files = await fs.readdir(dir);
      const file = files.find((f) => f === 'index.mdx' || f === 'index.en.mdx');
      if (!file) continue;

      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      const { content: mdxContent } = matter(content);
      const imageSrcs = extractImageSrcs(mdxContent);

      imageSrcs.forEach((src) => allImageSrcs.add(src));
    }

    const imageMetas: Record<string, any> = {};

    // 為每張圖片生成 meta
    for (const src of allImageSrcs) {
      try {
        const meta = await getMediaMeta(src.slice(1)); // 移除開頭的 "/"
        if (meta) imageMetas[src] = meta;
      } catch (err) {
        console.error(`❌ 無法生成圖片 ${src}：`, err);
      }
    }

    // 寫入檔案
    await fs.writeFile(outputPath, JSON.stringify(imageMetas, null, 2));
    console.log(`✅ 圖片 meta 已生成於：${outputPath}`);
  } catch (err) {
    console.error('❌ 執行過程發生錯誤：', err);
    process.exit(1);
  }
};

main();
