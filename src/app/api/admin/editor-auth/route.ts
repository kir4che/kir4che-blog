import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

import { buildEditorSession, verifyEditorSession } from '@/utils/editorAuth';

const { EDITOR_PASSWORD_HASH, EDITOR_PASSWORD_SALT } = process.env;

if (!EDITOR_PASSWORD_HASH || !EDITOR_PASSWORD_SALT)
  throw new Error('Editor auth 環境變數未設定');

const PASSWORD_HASH = Buffer.from(EDITOR_PASSWORD_HASH, 'hex');

export const GET = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get('editor_auth')?.value;

  if (!verifyEditorSession(session))
    return NextResponse.json({ ok: false }, { status: 401 });

  return NextResponse.json({ ok: true });
};

export const POST = async (req: Request) => {
  try {
    const { password = '' } = await req.json();

    const incomingHash = scryptSync(password, EDITOR_PASSWORD_SALT, 32);

    if (
      incomingHash.length !== PASSWORD_HASH.length ||
      !timingSafeEqual(incomingHash, PASSWORD_HASH)
    )
      return NextResponse.json({ message: '密碼錯誤' }, { status: 401 });

    // 登入成功 → 建立 session
    const rawToken = randomBytes(32).toString('hex');
    const sessionValue = buildEditorSession(rawToken);

    const res = NextResponse.json({ ok: true });

    res.cookies.set('editor_auth', sessionValue, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ message: '驗證失敗' }, { status: 400 });
  }
};
