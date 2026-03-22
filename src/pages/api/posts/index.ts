export const prerender = false;

import type { APIRoute } from 'astro';

import { DEFAULT_LANGUAGE } from '@/config';
import { jsonResponse } from '@/lib/api';
import { resolveLanguage } from '@/lib/i18n';
import { getPostsInfo } from '@/lib/posts';

export const GET: APIRoute = async ({ url }) => {
  const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
  const lang = resolveLanguage(url.searchParams.get('lang') || DEFAULT_LANGUAGE);

  if (!keyword) return jsonResponse({ posts: [] }, { status: 200 });

  const allPosts = await getPostsInfo(lang);
  const filtered = allPosts.filter(
    (post) =>
      post.title?.toLowerCase().includes(keyword) ||
      post.description?.toLowerCase().includes(keyword) ||
      post.slug.toLowerCase().includes(keyword)
  );

  return jsonResponse(
    {
      posts: filtered.slice(0, 10).map(({ slug, title }) => ({ slug, title })),
    },
    { status: 200 }
  );
};
