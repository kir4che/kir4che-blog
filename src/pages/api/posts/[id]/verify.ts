export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';

import { errorResponse, jsonResponse } from '@/lib/api';
import { resolveLanguage } from '@/lib/i18n';
import { getPostPassword, verifyPostPassword } from '@/lib/post-passwords';
import { getPostMetaBySlug, getPostUnlockCookieName } from '@/lib/posts';

const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 60;
const ATTEMPT_TTL = 5 * 60 * 1000;

interface AttemptRecord {
  count: number;
  lockUntil: number;
  lastAttempt: number;
}

const attemptStore = new Map<string, AttemptRecord>();

// 取得 client key（IP + slug 組合）
const getClientKey = (request: Request, slug: string): string => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  return `${ip}:${slug}`;
};

// 清除過期的嘗試紀錄
const cleanAttemptStore = () => {
  const now = Date.now();
  for (const [key, record] of attemptStore.entries()) {
    if (now - record.lastAttempt > ATTEMPT_TTL && record.lockUntil < now) attemptStore.delete(key);
  }
};

const checkLock = (clientKey: string): number => {
  const now = Date.now();
  const record = attemptStore.get(clientKey);
  if (!record) return 0;
  if (record.lockUntil > now) return Math.ceil((record.lockUntil - now) / 1000);
  return 0;
};

// 記錄一次嘗試，並回傳是否被鎖定以及剩餘鎖定秒數。
const recordAttempt = (clientKey: string): { locked: boolean; lockSeconds: number } => {
  const now = Date.now();
  const record = attemptStore.get(clientKey) ?? { count: 0, lockUntil: 0, lastAttempt: now };

  if (now - record.lastAttempt > ATTEMPT_TTL) {
    record.count = 0;
    record.lockUntil = 0;
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = now + LOCK_SECONDS * 1000;
    record.count = 0;
    attemptStore.set(clientKey, record);
    return { locked: true, lockSeconds: LOCK_SECONDS };
  }

  attemptStore.set(clientKey, record);
  return { locked: false, lockSeconds: 0 };
};

const verifyPayloadSchema = z.object({
  slug: z.string().optional(),
  lang: z.string().min(1, 'Missing lang'),
  password: z.string().default(''),
});

export const POST: APIRoute = async ({ request, params }) => {
  // 先清理過期紀錄
  cleanAttemptStore();

  const body = await request.json().catch(() => ({}));
  const parsed = verifyPayloadSchema.safeParse(body);

  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const { lang: langParam, password } = parsed.data;

  const slugFromParams = typeof params.id === 'string' ? params.id.trim() : '';
  const slug = slugFromParams || (parsed.data.slug?.trim() ?? '');
  if (!slug) return errorResponse('Missing slug', 400);

  // 限流檢查
  const clientKey = getClientKey(request, slug);
  const lockSeconds = checkLock(clientKey);
  if (lockSeconds > 0) return errorResponse('Too many attempts', 429, { lockSeconds });

  // 取得文章
  const lang = resolveLanguage(langParam);
  const meta = await getPostMetaBySlug(lang, slug);
  if (!meta?.protected) return errorResponse('Not found', 404);

  const storedPassword = getPostPassword(`${lang}/${slug}`);
  if (!storedPassword) return errorResponse('Not found', 404);

  // 驗證密碼
  if (!verifyPostPassword(password, storedPassword)) {
    const attempt = recordAttempt(clientKey);
    if (attempt.locked)
      return errorResponse('Too many attempts', 429, { lockSeconds: attempt.lockSeconds });
    return errorResponse('Incorrect password', 401);
  }

  // 驗證成功後清除該 Client 的嘗試次數
  attemptStore.delete(clientKey);

  const cookieName = getPostUnlockCookieName(slug);
  const headers = new Headers();
  const secure = import.meta.env.PROD ? '; Secure' : '';
  headers.append(
    'Set-Cookie',
    `${cookieName}=1; Path=/; Max-Age=86400; SameSite=Lax; HttpOnly${secure}`
  );

  return jsonResponse({ ok: true }, { status: 200, headers });
};
