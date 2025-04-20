import { NextResponse } from 'next/server';

import { getPostsInfo } from '@/lib/posts';
import { getCategoriesByPosts } from '@/lib/categories';
import { getTagsByPosts } from '@/lib/tags';

import { responseWithCache } from '@/utils/responseWithCache';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30', 30);

    const posts = await getPostsInfo(lang);
    const categories = getCategoriesByPosts(posts, limit);
    const tags = getTagsByPosts(posts, limit);

    return responseWithCache({ categories, tags });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error while fetching taxonomy.' },
      { status: 500 }
    );
  }
};
