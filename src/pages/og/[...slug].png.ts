export const prerender = false;

import type { APIRoute } from 'astro';

import { CONFIG, DEFAULT_LANGUAGE } from '@/config';
import { OgImage } from '@/lib/og/OgImage';
import { getOgPostBySlug } from '@/lib/og/getOgPost';
import { ImageResponse } from '@vercel/og';
import notoSansTCFontUrl from '@/assets/og/NotoSansTC-Bold.ttf?inline';

const notoSansTCFont = Uint8Array.from(
  Buffer.from(notoSansTCFontUrl.split(',')[1], 'base64')
).buffer;
const ogFonts = [
  { name: 'Noto Sans TC', data: notoSansTCFont, weight: 700 as const, style: 'normal' as const },
];

export const GET: APIRoute = async ({ params, url }) => {
  const slugParam = params.slug;
  if (!slugParam) return new Response('Not found', { status: 404 });

  const contentSlug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam;

  const post = await getOgPostBySlug(contentSlug);
  if (!post) return new Response('Not found', { status: 404 });

  const siteName =
    CONFIG.siteInfo.blog.siteName[post.lang] ?? CONFIG.siteInfo.blog.siteName[DEFAULT_LANGUAGE];

  try {
    const image = new ImageResponse(
      OgImage({
        siteName,
        title: post.title,
        tags: post.tags,
      }),
      {
        width: 1200,
        height: 630,
        fonts: ogFonts,
      }
    );

    const buffer = new Uint8Array(await image.arrayBuffer());

    return new Response(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    const fallbackResponse = await fetch(new URL('/images/default-og.jpg', url));
    const fallbackBuffer = Buffer.from(await fallbackResponse.arrayBuffer());

    return new Response(fallbackBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }
};
