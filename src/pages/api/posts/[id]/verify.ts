export const prerender = false;

import type { APIRoute } from 'astro';
import { z } from 'zod';

import { resolveLanguage } from '@/lib/i18n';
import { getPostPassword, verifyPostPassword } from '@/lib/post-passwords';
import { getPostMetaBySlug, getPostUnlockCookieName } from '@/lib/posts';
import { errorResponse, jsonResponse } from '@/utils/api';

const MAX_ATTEMPTS = 3;
const LOCK_SECONDS = 60;
const ATTEMPT_TTL = 5 * 60 * 1000;

interface AttemptRecord {
  count: number;
  lockUntil: number;
  lastAttempt: number;
}

// 存放所有請求紀錄
const attemptStore = new Map<string, AttemptRecord>();

// 取得每個使用者的 Client Key
const getClientKey = (request: Request, slug: string): string => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  return `${ip}:${slug}`;
};

// 定期清理過期的嘗試紀錄
const cleanAttemptStore = () => {
  const now = Date.now();
  for (const [key, record] of attemptStore.entries()) {
    if (now - record.lastAttempt > ATTEMPT_TTL && record.lockUntil < now) attemptStore.delete(key);
  }
};

// 檢查該用戶是否還處於「鎖定狀態」
const checkLock = (clientKey: string): number => {
  const now = Date.now();
  const record = attemptStore.get(clientKey);
  if (!record) return 0;

  // 還在鎖定中的話，回傳剩餘的鎖定秒數。
  if (record.lockUntil > now) return Math.ceil((record.lockUntil - now) / 1000);
  return 0;
};

// 記錄用戶嘗試次數及鎖定狀態
const recordAttempt = (clientKey: string): { locked: boolean; lockSeconds: number } => {
  const now = Date.now();
  const record = attemptStore.get(clientKey) ?? { count: 0, lockUntil: 0, lastAttempt: now };

  if (now - record.lastAttempt > ATTEMPT_TTL) {
    record.count = 0;
    record.lockUntil = 0;
  }

  record.count += 1; // 增加次數
  record.lastAttempt = now; // 更新最後一次嘗試時間

  // 次數達到上限
  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = now + LOCK_SECONDS * 1000;
    record.count = 0;
    attemptStore.set(clientKey, record);
    return { locked: true, lockSeconds: LOCK_SECONDS };
  }

  // 還沒到上限，就單純寫回紀錄。
  attemptStore.set(clientKey, record);
  return { locked: false, lockSeconds: 0 };
};

// 驗證請求內容
const verifyPayloadSchema = z.object({
  slug: z.string().optional(),
  lang: z.string().min(1, 'Missing lang'),
  password: z.string().default(''),
});

export const POST: APIRoute = async ({ request, params }) => {
  // 先清理過期的紀錄
  cleanAttemptStore();

  const body = await request.json().catch(() => ({}));
  const parsed = verifyPayloadSchema.safeParse(body);

  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

  const { lang: langParam, password } = parsed.data;

  // 取得要看的是哪篇文章
  const slugFromParams = typeof params.id === 'string' ? params.id.trim() : '';
  const slug = slugFromParams || (parsed.data.slug?.trim() ?? '');
  if (!slug) return errorResponse('Missing slug', 400);

  // 限流檢查
  const clientKey = getClientKey(request, slug);
  const lockSeconds = checkLock(clientKey);
  if (lockSeconds > 0) return errorResponse('Too many attempts', 429, { lockSeconds });

  // 確保這篇文章存在且語系正確
  const lang = resolveLanguage(langParam);
  const meta = await getPostMetaBySlug(lang, slug);
  if (!meta?.protected) return errorResponse('Not found', 404);

  // 取得密碼
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
  // 設定解鎖 cookie（1 天有效）
  headers.append('Set-Cookie', `${cookieName}=1; Path=/; Max-Age=86400; SameSite=Lax${secure}`);

  return jsonResponse({ ok: true }, { status: 200, headers });
};
