import { getPlaiceholder } from 'plaiceholder';
import fs from 'fs/promises';
import path from 'path';

import type { ImageMeta } from '@/types';

const SUPPORTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
] as const;

export const getMediaMeta = async (src: string): Promise<ImageMeta | null> => {
  if (!src || typeof src !== 'string') return null;

  const mediaPath = path.resolve(process.cwd(), 'public', src);
  const fileExtension = path.extname(mediaPath).toLowerCase();

  // 只處理圖片類型的檔案
  if (
    !SUPPORTED_IMAGE_EXTENSIONS.includes(
      fileExtension as (typeof SUPPORTED_IMAGE_EXTENSIONS)[number]
    )
  )
    return null;

  try {
    const buffer = await fs.readFile(mediaPath);
    const { base64, metadata } = await getPlaiceholder(buffer);

    if (!base64 || !metadata) return null;

    return {
      src: '/' + src.replace(/^\/+/, ''),
      blurDataURL: base64,
      originalWidth: metadata.width || 0,
      originalHeight: metadata.height || 0,
    } satisfies ImageMeta;
  } catch {
    return null;
  }
};

export const extractAndProcessImageMetas = async (
  content: string
): Promise<Record<string, ImageMeta>> => {
  if (!content || typeof content !== 'string') return {};

  const imageMetas: Record<string, ImageMeta> = {};

  // 匹配 markdown、HTML 或程式碼裡的圖片路徑
  const imageRegex =
    /!\[[^\]]*\]\((\/[^)\s]+)\)|<(?:CustomImage|Image|img)[^>]*\s+src=["'](\/[^"'\s]+)["']|src\s*[:=]\s*["'](\/[^"'\s]+)["']/g;

  // 用 Set 收集所有不重複的圖片 src
  const imageSrcs = new Set<string>();
  let match;

  // 逐個尋找符合條件的圖片路徑
  while ((match = imageRegex.exec(content)) !== null) {
    // 先找 markdown 格式的圖片，找不到再找 HTML 或程式碼裡的。
    const src = match[1] || match[2] || match[3];
    // 只處理以 / 開頭的本地圖片路徑
    if (src?.startsWith('/') && src.length > 1) {
      // 清理路徑，去除可能的查詢參數或片段識別碼。
      const cleanSrc = src.split(/[?#]/)[0];
      const isValidImage =
        cleanSrc &&
        cleanSrc !== '/' &&
        SUPPORTED_IMAGE_EXTENSIONS.some((ext) =>
          cleanSrc.toLowerCase().endsWith(ext)
        );

      if (isValidImage) imageSrcs.add(cleanSrc);
    }
  }

  if (imageSrcs.size === 0) return {};

  const metaResults = await Promise.allSettled(
    Array.from(imageSrcs).map(async (src) => {
      const meta = await getMediaMeta(src.slice(1)); // 移除開頭的 /
      return { src, meta };
    })
  );

  for (const result of metaResults)
    if (result.status === 'fulfilled' && result.value.meta)
      imageMetas[result.value.src] = result.value.meta;

  return imageMetas;
};
