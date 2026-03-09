export const prerender = false;

import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';
import { readFile } from 'node:fs/promises';
import { CONFIG, DEFAULT_LANGUAGE } from '@/config';
import { ogStorage } from '@/lib/og/storage.instance';
import { OgImage } from '@/lib/og/OgImage';
import { getOgPostBySlug } from '@/lib/og/getOgPost';

export const GET: APIRoute = async ({ params }) => {
  const slugParam = params.slug;
  if (!slugParam) return new Response('Not found', { status: 404 });

  // ✅ catch-all slug → string
  const contentSlug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam;

  const key = `${contentSlug}.png`;

  // ✅ 已存在 → 直接回傳
  const isProd = import.meta.env.PROD;
  if (isProd && (await ogStorage.exists(key))) {
    const data = await ogStorage.read(key);
    return new Response(Buffer.from(data), {
      headers: { 'Content-Type': 'image/png' },
    });
  }

  // ❌ 不存在 → 產生
  const post = await getOgPostBySlug(contentSlug);
  if (!post) return new Response('Not found', { status: 404 });

  const siteName =
    CONFIG.siteInfo.blog.siteName[post.lang] ?? CONFIG.siteInfo.blog.siteName[DEFAULT_LANGUAGE];
  let fonts:
    | Array<{
        name: string;
        data: Buffer;
        weight: 400 | 500 | 700;
        style: 'normal' | 'italic';
      }>
    | undefined;
  try {
    const [regularFont, mediumFont, boldFont] = await Promise.all([
      readFile(new URL('../../../public/fonts/GenSenRounded2TW-R.otf', import.meta.url)),
      readFile(new URL('../../../public/fonts/GenSenRounded2TW-M.otf', import.meta.url)),
      readFile(new URL('../../../public/fonts/GenSenRounded2TW-B.otf', import.meta.url)),
    ]);
    fonts = [
      { name: 'GenSenRounded2TW', data: regularFont, weight: 400 as const, style: 'normal' },
      { name: 'GenSenRounded2TW', data: mediumFont, weight: 500 as const, style: 'normal' },
      { name: 'GenSenRounded2TW', data: boldFont, weight: 700 as const, style: 'normal' },
    ];
  } catch {
    fonts = undefined;
  }

  try {
    const image = new ImageResponse(
      OgImage({
        siteName,
        title: post.title,
        tags: post.tags,
        lang: post.lang,
      }),
      { width: 1200, height: 630, fonts }
    );

    const buffer = new Uint8Array(await image.arrayBuffer());
    if (isProd) await ogStorage.write(key, buffer);

    return new Response(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    const fallbackPath = new URL('../../../public/images/default-og.jpg', import.meta.url);
    const fallbackBuffer = await readFile(fallbackPath);

    return new Response(fallbackBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
};
