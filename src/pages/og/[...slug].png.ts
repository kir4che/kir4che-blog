export const prerender = true;

import type { APIRoute } from 'astro';

import { CONFIG, DEFAULT_LANGUAGE } from '@/config';
import { OgImage } from '@/lib/og/OgImage';
import { getOgPostBySlug } from '@/lib/og/getOgPost';
import { ImageResponse } from '@vercel/og';

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
        lang: post.lang,
      }),
      { width: 1200, height: 630 }
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
