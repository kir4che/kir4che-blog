import { getPlaiceholder } from 'plaiceholder';
import fs from 'fs/promises';
import path from 'path';

// 處理單一圖片，讀取檔案並生成 base64 模糊縮略圖。
export const getMediaMeta = async (src: string) => {
  const mediaPath = path.resolve(process.cwd(), 'public', src);
  const fileExtension = path.extname(mediaPath).toLowerCase();
  const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  // 只處理圖片類型的檔案（影片先跳過，未來處理。）
  if (validImageExtensions.includes(fileExtension)) {
    // 讀取圖片檔案成 buffer
    const buffer = await fs.readFile(mediaPath);
    // 使用 plaiceholder 生成 base64 格式的模糊縮圖
    const { base64 } = await getPlaiceholder(buffer);
    return {
      src: '/' + src.replace(/^\/+/, ''),
      blurDataURL: base64,
    };
  } else return null;
};

// 提取文章內容中的所有圖片，並生成 metadata（含模糊縮圖）。
export const extractAndProcessImageMetas = async (content: string) => {
  const imageMetas: Record<string, any> = {};

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
    if (src?.startsWith('/')) imageSrcs.add(src); // 只處理以 / 開頭（代表本地資源）的圖片
  }

  // 把所有圖片 src 丟進 getMediaMeta() 並行處理
  const metaPromises = Array.from(imageSrcs).map(async (src) => {
    try {
      const meta = await getMediaMeta(src.slice(1)); // 去除開頭的 /
      if (meta) imageMetas[src] = meta; // 成功拿到 metadata 就存起來
    } catch (err) {
      console.error(`Failed to load image metadata for ${src}:`, err);
    }
  });

  await Promise.all(metaPromises);

  return imageMetas;
};
