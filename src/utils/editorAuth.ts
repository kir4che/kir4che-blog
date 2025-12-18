import { cookies } from 'next/headers';
import { createHash, timingSafeEqual } from 'crypto';

const { EDITOR_SESSION_SECRET } = process.env;

if (!EDITOR_SESSION_SECRET)
  throw new Error('EDITOR_SESSION_SECRET 環境變數未設定');

// 建立 session 簽章
const signSession = (token: string) =>
  createHash('sha256')
    .update(token + EDITOR_SESSION_SECRET)
    .digest('hex');

// 建立一個帶有簽章的 session 字串
export const buildEditorSession = (token: string) => {
  const signature = signSession(token);
  return `${token}.${signature}`;
};

// 驗證 session
export const verifyEditorSession = (session?: string | null) => {
  if (!session) return false;

  const [token, signature] = session.split('.');
  if (!token || !signature) return false;

  if (token.length !== 64 || signature.length !== 64) return false;

  try {
    const expected = signSession(token);

    // 避免字串比較時的時間差資訊洩漏
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
};

// 檢查當前 request 是否帶有有效的 editor session cookie
export const isRequestEditorAuthed = async () => {
  const cookieStore = await cookies();
  return verifyEditorSession(cookieStore.get('editor_auth')?.value);
};
