import { NextResponse } from 'next/server';

import { getPostsInfo } from '@/lib/posts';
import {
  ensureEditorAuthorized,
  resolveLanguageFromRequest,
} from '@/utils/adminApi';

// 取得所有文章清單
export const GET = async (req: Request) => {
  const unauthorized = await ensureEditorAuthorized();
  if (unauthorized) return unauthorized;

  try {
    const lang = resolveLanguageFromRequest(req);
    const posts = await getPostsInfo(lang);

    const data = Array.isArray(posts)
      ? posts.map((post) => ({
          ...post,
          lang,
        }))
      : [];

    return NextResponse.json({ posts: data });
  } catch {
    return NextResponse.json(
      { message: 'Failed to load posts.' },
      { status: 500 }
    );
  }
};
