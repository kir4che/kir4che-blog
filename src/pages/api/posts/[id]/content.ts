export const prerender = false;

import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

import { isAuthenticated } from '@/lib/admin';
import { errorResponse, jsonResponse } from '@/lib/api';
import { resolveLanguage } from '@/lib/i18n';
import { getPostMetaBySlug, getPostUnlockCookieName } from '@/lib/posts';

export const GET: APIRoute = async ({ params, url, cookies }) => {
  const slug = typeof params.id === 'string' ? params.id.trim() : '';
  if (!slug) return errorResponse('Missing slug', 400);

  const lang = resolveLanguage(url.searchParams.get('lang'));

  const meta = await getPostMetaBySlug(lang, slug);
  if (!meta?.protected) return errorResponse('Not found', 404);

  // 驗證 unlock cookie 或是否為後台管理員
  const cookieName = getPostUnlockCookieName(slug);
  const hasUnlock = cookies.has(cookieName);
  const isAdmin = await isAuthenticated(cookies);

  if (!hasUnlock && !isAdmin) return errorResponse('Unauthorized', 401);

  // 從 collection entry 取得 rendered HTML 或 raw body
  const entries = await getCollection('blog');
  const entryId = `${lang}/${slug}`;
  const entry = entries.find((e: CollectionEntry<'blog'>) => e.id === entryId);
  if (!entry) return errorResponse('Content not available', 500);

  const html = (entry as any).rendered?.html ?? '';
  const body = entry.body ?? '';

  return jsonResponse({
    html,
    body,
    headings: (entry as any).rendered?.headings ?? [],
    meta,
  });
};
