import { NextResponse } from 'next/server';

import { getTagsByPosts } from '@/lib/tags';
import { getPostsInfo } from '@/lib/posts';
import { getLangFromHeader } from '@/utils/getLangFromHeader';
import { responseWithCache } from '@/utils/responseWithCache';

export async function GET(request: Request) {
  try {
    const lang = getLangFromHeader(request);

    const posts = await getPostsInfo(lang);
    const tags = getTagsByPosts(posts);

    return responseWithCache({ tags });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error while fetching tags.' },
      { status: 500 }
    );
  }
}
