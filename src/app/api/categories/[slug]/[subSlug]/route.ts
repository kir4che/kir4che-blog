import { NextResponse } from 'next/server';

import { getSubcategoryBySlug } from '@/lib/categories';
import { getPostsInfo } from '@/lib/posts';
import { getLangFromHeader } from '@/utils/getLangFromHeader';
import { responseWithCache } from '@/utils/responseWithCache';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const slug = parts.at(-2);
  const subSlug = parts.at(-1);

  if (!slug || !subSlug)
    return NextResponse.json(
      { message: 'Missing parameters.' },
      { status: 400 }
    );

  try {
    const lang = getLangFromHeader(request);
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
