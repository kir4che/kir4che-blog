import type { APIRoute } from 'astro';

import { getLangStaticPaths } from '@/lib/i18n';
import { getPostsInfo } from '@/lib/posts';
import type { Language } from '@/types';

export const getStaticPaths = getLangStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Language;
  const posts = await getPostsInfo(lang);
  const data = posts.map(({ slug, title, description }) => ({ slug, title, description }));

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
