import { NextResponse } from 'next/server';
import fs from 'fs';

import { responseWithCache } from '@/utils/responseWithCache';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get('src');

  try {
    if (!src)
      return NextResponse.json(
        { message: 'Missing src parameter.' },
        { status: 400 }
      );

    const imagePath = process.cwd() + '/public' + src;

    // 讀取圖片檔案成 buffer
    const buffer = await fs.promises.readFile(imagePath);
    let base64 = '';
    try {
      const mod = await import('plaiceholder');
      const { getPlaiceholder } = mod as typeof import('plaiceholder');
      // 使用 plaiceholder 生成 base64 格式的模糊縮圖
      const res = await getPlaiceholder(buffer);
      base64 = res.base64;
    } catch {
      base64 = '';
    }

    return responseWithCache({ blurDataURL: base64 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch image metadata.' },
      { status: 500 }
    );
  }
};
