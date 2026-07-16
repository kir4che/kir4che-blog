export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';

import { resolveLanguage } from '@/lib/i18n';
import { getPostPassword, verifyPostPassword } from '@/lib/post-passwords';
import { getPostMetaBySlug, getPostUnlockCookieName } from '@/lib/posts';
import { checkLock, deleteRecord, getClientKey, recordAttempt } from '@/lib/rate-limit';
const buildHeaders = (headers?: HeadersInit): HeadersInit => {
  const merged = new Headers(headers);
  if (!merged.has('Content-Type')) merged.set('Content-Type', 'application/json');
  return merged;
};

const jsonResponse = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), { ...init, headers: buildHeaders(init.headers) });

const errorResponse = (
  message: string,
  status: number,
  extra?: Record<string, unknown>
): Response => jsonResponse({ message, ...(extra ?? {}) }, { status });

// 驗證請求內容
const verifyPayloadSchema = z.object({
  slug: z.string().optional(),
  lang: z.string().min(1, 'Missing lang'),
  password: z.string().default(''),
});

export const POST: APIRoute = async ({ request, params }) => {
  const body = await request.json().catch(() => ({}));
  const parsed = verifyPayloadSchema.safeParse(body);

  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const { lang: langParam, password } = parsed.data;

  // 取得要看的是哪篇文章
  const slugFromParams = typeof params.slug === 'string' ? params.slug.trim() : '';
  const slug = slugFromParams || (parsed.data.slug?.trim() ?? '');
  if (!slug) return errorResponse('Missing slug', 400);

  // 限流檢查
  const clientKey = getClientKey(request, slug);
  const lockSeconds = await checkLock(clientKey);
  if (lockSeconds > 0) return errorResponse('Too many attempts', 429, { lockSeconds });

  // 確保這篇文章存在且語系正確
  const lang = resolveLanguage(langParam);
  const meta = await getPostMetaBySlug(lang, slug);
  if (!meta?.protected) return errorResponse('Not found', 404);

  // 取得密碼
  const storedPassword = getPostPassword();
  if (!storedPassword) return errorResponse('Not found', 404);

  // 驗證密碼
  if (!verifyPostPassword(password, storedPassword)) {
    const attempt = await recordAttempt(clientKey);
    if (attempt.locked)
      return errorResponse('Too many attempts', 429, { lockSeconds: attempt.lockSeconds });
    return errorResponse('Incorrect password', 401);
  }

  // 驗證成功後清除該 Client 的嘗試次數
  await deleteRecord(clientKey);

  const cookieName = getPostUnlockCookieName(slug);
  const headers = new Headers();
  const secure = import.meta.env.PROD ? '; Secure' : '';
  // 設定解鎖 cookie（1 天有效）
  headers.append('Set-Cookie', `${cookieName}=1; Path=/; Max-Age=86400; SameSite=Lax${secure}`);

  return jsonResponse({ ok: true }, { status: 200, headers });
};
