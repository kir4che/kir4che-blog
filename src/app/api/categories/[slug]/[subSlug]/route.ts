import { NextResponse } from 'next/server';

import { getSubcategoryBySlug } from '@/lib/categories';
import { getPostsInfo } from '@/lib/posts';
import { responseWithCache } from '@/utils/responseWithCache';

export async function GET(request: Request) {
  const { pathname, searchParams } = new URL(request.url);
  const parts = pathname.split('/');
  const slug = parts.at(-2);
  const subSlug = parts.at(-1);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  if (!slug || !subSlug)
    return NextResponse.json(
      { message: 'Missing parameters.' },
      { status: 400 }
    );

  try {
    const posts = await getPostsInfo(lang);
    const category = await getSubcategoryBySlug(slug, subSlug, posts);

    if (!category) {
      return NextResponse.json(
        { message: 'Subcategory not found.' },
        { status: 404 }
      );
    }

    return responseWithCache({ category });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error while fetching subcategory.' },
      { status: 500 }
    );
  }
}
