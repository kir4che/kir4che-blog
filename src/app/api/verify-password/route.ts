import { NextResponse } from 'next/server';
import { getPostData } from '@/lib/posts';
import type { Language } from '@/types';

// 暫存每個 IP + 文章的嘗試次數、最後錯誤時間
const attemptsMap = new Map<string, { count: number; last: number }>();
const MAX_ATTEMPTS = 2; // 最多可錯幾次
const LOCK_TIME = 60 * 1000; // 鎖定秒數

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { slug, password, lang } = body;

    if (
      !slug ||
      typeof slug !== 'string' ||
      !password ||
      typeof password !== 'string' ||
      !lang ||
      typeof lang !== 'string'
    ) {
      return NextResponse.json(
        { message: 'Invalid request.' },
        { status: 400 }
      );
    }

    // 以 IP + slug 當作唯一 key
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${slug}`;
    const now = Date.now();
    const record = attemptsMap.get(key);

    // 檢查是否已經鎖定
    if (record && record.count >= MAX_ATTEMPTS) {
      // 還在鎖定期間，回傳剩餘秒數。
      if (now - record.last < LOCK_TIME) {
        const remaining = LOCK_TIME - (now - record.last);
        return NextResponse.json(
          {
            message: 'Too many attempts. Please try again later.',
            lockSeconds: remaining,
          },
          { status: 429 }
        );
        // 鎖定時間過了就自動解鎖
      } else attemptsMap.delete(key);
    }

    const post = await getPostData(lang as Language, slug);
    if (!post)
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });
    if (!post.hasPassword)
      return NextResponse.json(
        { message: 'This post is not protected.' },
        { status: 400 }
      );

    if (String(password) === String(post.password)) {
      attemptsMap.delete(key); // 清除錯誤記錄
      return NextResponse.json(
        { message: 'Password correct.' },
        { status: 200 }
      );
    }

    const newCount = record ? record.count + 1 : 1; // 累加錯誤次數
    attemptsMap.set(key, { count: newCount, last: now });

    return NextResponse.json(
      { message: 'Incorrect password.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ message: 'Server error.' }, { status: 500 });
  }
};
