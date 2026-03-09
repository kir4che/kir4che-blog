import type { APIRoute } from 'astro';
import { scryptSync, timingSafeEqual } from 'node:crypto';

import { resolveLanguage } from '@/lib/i18n';
import { getPostMetaBySlug, getPostUnlockCookieName } from '@/lib/posts';

const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 60;
const attemptStore = new Map<string, { count: number; lockUntil: number }>();

const verifyPasswordHash = (password: string, storedHash: string): boolean => {
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const salt = Buffer.from(parts[1], 'base64');
  const expected = Buffer.from(parts[2], 'base64');
  if (!salt.length || !expected.length) return false;

  const derived = scryptSync(password, salt, expected.length);
  return timingSafeEqual(expected, derived);
};

// 依據 IP + slug 組合出 client key，用於限流與鎖定
const getClientKey = (request: Request, slug: string): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : 'unknown';
  return `${ip}:${slug}`;
};

export const POST: APIRoute = async ({ request }) => {
  let payload: { slug?: string; lang?: string; password?: string } = {};

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), { status: 400 });
  }

  const slug = typeof payload.slug === 'string' ? payload.slug.trim() : '';
  const langParam = typeof payload.lang === 'string' ? payload.lang : '';
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!slug || !langParam)
    return new Response(JSON.stringify({ message: 'Missing slug or lang' }), { status: 400 });

  const clientKey = getClientKey(request, slug);
  const now = Date.now();
  const record = attemptStore.get(clientKey);

  // 若在鎖定時間內，直接回傳 429。
  if (record && record.lockUntil > now)
    return new Response(
      JSON.stringify({
        message: 'Too many attempts',
        lockSeconds: Math.ceil((record.lockUntil - now) / 1000),
      }),
      { status: 429 }
    );

  const lang = resolveLanguage(langParam);
  const meta = await getPostMetaBySlug(lang, slug);

  // 找不到文章或文章未設定密碼
  if (!meta || !meta.passwordHash)
    return new Response(JSON.stringify({ message: 'Not found' }), { status: 404 });

  // 密碼錯誤處理
  if (!verifyPasswordHash(password, meta.passwordHash)) {
    const nextCount = (record?.count ?? 0) + 1; // 累加嘗試次數

    // 若達到最大嘗試次數，進入鎖定狀態。
    if (nextCount >= MAX_ATTEMPTS) {
      const lockUntil = now + LOCK_SECONDS * 1000;
      attemptStore.set(clientKey, { count: 0, lockUntil });
      return new Response(
        JSON.stringify({ message: 'Too many attempts', lockSeconds: LOCK_SECONDS }),
        { status: 429 }
      );
    }

    // 更新嘗試次數
    attemptStore.set(clientKey, { count: nextCount, lockUntil: 0 });

    return new Response(JSON.stringify({ message: 'Incorrect password' }), { status: 401 });
  }

  // 密碼正確，清除嘗試紀錄。
  attemptStore.delete(clientKey);

  const postId = meta.postId ?? meta.slug;
  const cookieName = getPostUnlockCookieName(postId);
  const headers = new Headers();

  // 設定 HttpOnly Cookie（1 天）
  headers.append('Set-Cookie', `${cookieName}=1; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly`);

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
