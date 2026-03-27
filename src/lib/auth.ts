import type { AstroCookies } from 'astro';

import { timingSafeEqual } from '@/utils/crypto';
import { decodeBase64UrlStr, encodeBase64Url, encodeBase64UrlStr } from '@/utils/encoding';

const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;

// 使用 HMAC-SHA256 對 payload 進行簽名
const hmacSign = async (secret: string, payload: string): Promise<string> => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return encodeBase64Url(new Uint8Array(sig));
};

const getSessionSecret = (): string => {
  if (import.meta.env.SESSION_SECRET) return import.meta.env.SESSION_SECRET;
  throw new Error('缺少 SESSION_SECRET');
};

// 驗證帳號密碼是否正確
export const verifyAdminCredentials = (username?: string, password?: string): boolean => {
  if (!username || !password || !import.meta.env.ADMIN_USERNAME || !import.meta.env.ADMIN_PASSWORD)
    return false;
  return (
    timingSafeEqual(username, import.meta.env.ADMIN_USERNAME) &&
    timingSafeEqual(password, import.meta.env.ADMIN_PASSWORD)
  );
};

// 產生 session cookie 的內容
const signSessionCookie = async (): Promise<string> => {
  // payload 內容（是否已登入 + 過期時間）
  const payload = JSON.stringify({
    authenticated: true,
    exp: Date.now() + SESSION_MAX_AGE_MS,
  });

  const hmac = await hmacSign(getSessionSecret(), payload);

  return `${encodeBase64UrlStr(payload)}.${hmac}`;
};

// 驗證 cookie 是否有效
const verifySessionCookie = async (cookieValue?: string | null): Promise<boolean> => {
  if (!cookieValue) return false;

  // 拆出 payload 與簽名
  const [payloadB64, signature] = cookieValue.split('.');
  if (!payloadB64 || !signature) return false;

  try {
    const payload = decodeBase64UrlStr(payloadB64);
    const expectedSignature = await hmacSign(getSessionSecret(), payload);
    if (!timingSafeEqual(signature, expectedSignature)) return false;

    const parsed = JSON.parse(payload);

    return parsed.authenticated === true && parsed.exp > Date.now();
  } catch {
    return false;
  }
};

// 檢查是否已登入
export const isAuthenticated = (cookies: AstroCookies): Promise<boolean> =>
  verifySessionCookie(cookies.get(ADMIN_COOKIE_NAME)?.value);

// 設定登入 cookie
export const setAdminSessionCookie = async (cookies: AstroCookies) => {
  cookies.set(ADMIN_COOKIE_NAME, await signSessionCookie(), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

// 清除登入 cookie（登出）
export const clearAdminSessionCookie = (cookies: AstroCookies) => {
  cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
};
