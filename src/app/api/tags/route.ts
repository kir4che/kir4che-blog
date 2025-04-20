import { NextResponse } from 'next/server';

import { getTagsByPosts } from '@/lib/tags';
import { getPostsInfo } from '@/lib/posts';

import { responseWithCache } from '@/utils/responseWithCache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  try {
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
