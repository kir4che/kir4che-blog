import { getPlaiceholder } from 'plaiceholder';
import fs from 'fs/promises';
import path from 'path';

// 根據圖片路徑，取得圖片的 base64、metadata。
export async function getImageMeta(src: string) {
  const imagePath = path.resolve(process.cwd(), 'public', src);
  const buffer = await fs.readFile(imagePath);
  const { base64, metadata } = await getPlaiceholder(buffer);

  return {
    src: '/' + src.replace(/^\/+/, ''),
    width: metadata.width,
    height: metadata.height,
    blurDataURL: base64,
  };
}

// 從 MDX 或 Markdown 內容中提取所有圖片路徑
export const extractImageSources = (content: string): Set<string> => {
  const imageRegex =
    /!\[[^\]]*]\((\/[^)]+)\)|<(?:CustomImage|Image|img)[^>]*\s+src=["'](\/[^"']+)["']|src\s*[:=]\s*["'](\/[^"']+)["']/g;

  const srcs = new Set<string>();

  for (const match of content.matchAll(imageRegex)) {
    const matchedSrc = match[1] || match[2] || match[3];
    if (matchedSrc) srcs.add(matchedSrc);
  }

  return srcs;
};
