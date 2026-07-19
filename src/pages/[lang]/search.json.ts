import type { APIRoute } from 'astro';

import { getLangStaticPaths } from '@/lib/i18n';
import { getPostsMeta } from '@/lib/posts';
import type { Language } from '@/types';

export const getStaticPaths = getLangStaticPaths;

// 搜尋文章列表（僅包含 slug、title、description、tags、 categories）
export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Language;
  const posts = await getPostsMeta(lang);
  const data = posts.map(({ slug, title, description, tags, categories }) => ({
    slug,
    title,
    description,
    tags,
    categories,
  }));

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
