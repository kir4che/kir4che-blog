import { NextResponse } from 'next/server';

import { DEFAULT_POSTS_PER_PAGE, getPaginatedPosts } from '@/lib/posts';

import { responseWithCache } from '@/utils/responseWithCache';

type FilterType = 'popular' | 'related';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const langParam = searchParams.get('lang');
  const lang = langParam === 'en' ? 'en' : 'tw';

  try {
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const keyword = searchParams.get('keyword');
    const filter = searchParams.get('filter') as FilterType | null;
    const currentSlug = searchParams.get('currentSlug');
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam
      ? categoriesParam.split(',').filter(Boolean)
      : null;
    const page = Number(searchParams.get('page') || 1);
    const postsPerPage = Number(
      searchParams.get('postsPerPage') || DEFAULT_POSTS_PER_PAGE
    );

    const result = await getPaginatedPosts({
      lang,
      category,
      tag,
      keyword,
      filter,
      currentSlug,
      categories,
      page,
      postsPerPage,
    });

    return responseWithCache(result);
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === 'Missing required parameters for related posts.'
    )
      return NextResponse.json({ message: err.message }, { status: 400 });

    return NextResponse.json(
      { message: 'Failed to fetch posts.' },
      { status: 500 }
    );
  }
};
