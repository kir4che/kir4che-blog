import { getPlaiceholder } from 'plaiceholder';
import fs from 'fs/promises';
import path from 'path';

import type { ImageMeta } from '@/types';

export const getMediaMeta = async (src: string): Promise<ImageMeta | null> => {
  const mediaPath = path.resolve(process.cwd(), 'public', src);
  const fileExtension = path.extname(mediaPath).toLowerCase();

  // 只處理圖片類型的檔案
  if (
    !['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension as any)
  )
    return null;

  try {
    const buffer = await fs.readFile(mediaPath);
    const { base64, metadata } = await getPlaiceholder(buffer);

    return {
      src: '/' + src.replace(/^\/+/, ''),
      blurDataURL: base64,
      originalWidth: metadata?.width,
      originalHeight: metadata?.height,
    };
  } catch (err) {
    console.error(`Failed to process image ${src}:`, err);
    return null;
  }
};

export const extractAndProcessImageMetas = async (
  content: string
): Promise<Record<string, ImageMeta>> => {
  const imageMetas: Record<string, ImageMeta> = {};

  // 匹配 markdown、HTML 或程式碼裡的圖片路徑
  const imageRegex =
    /!\[[^\]]*]\((\/[^)]+)\)|<(?:CustomImage|Image|img)[^>]*\s+src=["'](\/[^"']+)["']|src\s*[:=]\s*["'](\/[^"']+)["']/g;

  // 用 Set 收集所有不重複的圖片 src
  const imageSrcs = new Set<string>();
  let match;

  // 逐個尋找符合條件的圖片路徑
  while ((match = imageRegex.exec(content)) !== null) {
    // 先找 markdown 格式的圖片，找不到再找 HTML 或程式碼裡的。
    const src = match[1] || match[2] || match[3];
    // 只處理以 / 開頭（代表本地資源）的圖片
    if (src?.startsWith('/')) imageSrcs.add(src);
  }

  // 把所有圖片 src 丟進 getMediaMeta() 並行處理
  const metaPromises = Array.from(imageSrcs).map(async (src) => {
    const meta = await getMediaMeta(src.slice(1)); // 去除開頭的 /
    // 成功拿到 metadata 就存起來
    if (meta) imageMetas[src] = meta;
  });

  await Promise.all(metaPromises);

  return imageMetas;
};
