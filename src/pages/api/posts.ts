import type { APIRoute } from 'astro';

import { getPostsInfo } from '@/lib/posts';
import type { Language } from '@/types';

export const GET: APIRoute = async ({ url }) => {
  const keyword = url.searchParams.get('keyword')?.trim().toLowerCase();
  const lang = (url.searchParams.get('lang') || 'tw') as Language;

  if (!keyword)
    return new Response(JSON.stringify({ posts: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  const allPosts = await getPostsInfo(lang);
  const filtered = allPosts.filter(
    (post) =>
      post.title?.toLowerCase().includes(keyword) ||
      post.description?.toLowerCase().includes(keyword) ||
      post.slug.toLowerCase().includes(keyword)
  );

  return new Response(
    JSON.stringify({
      posts: filtered.slice(0, 10).map(({ slug, title }) => ({ slug, title })),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
