import { NextResponse } from 'next/server';

import { getCategoriesByPosts } from '@/lib/categories';
import { getPostsInfo } from '@/lib/posts';
import { responseWithCache } from '@/utils/responseWithCache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  try {
    const posts = await getPostsInfo(lang);
    const categories = getCategoriesByPosts(posts);

    return responseWithCache({ categories });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error while fetching categories.' },
      { status: 500 }
    );
  }
}
