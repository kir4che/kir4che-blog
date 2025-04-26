import { NextResponse } from 'next/server';

import { getPostsInfo } from '@/lib/posts';
import { getAllCategoryByPosts } from '@/lib/categories';
import { getTagsByPosts } from '@/lib/tags';

import { responseWithCache } from '@/utils/responseWithCache';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30', 30);

    const posts = await getPostsInfo(lang);
    const categories = getAllCategoryByPosts(posts, limit);
    const tags = getTagsByPosts(posts, limit);

    return responseWithCache({ categories, tags });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error while fetching taxonomy.' },
      { status: 500 }
    );
  }
};
