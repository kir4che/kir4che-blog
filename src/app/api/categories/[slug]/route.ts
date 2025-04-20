import { NextResponse } from 'next/server';

import { getPostsInfo } from '@/lib/posts';
import { getCategoryBySlug } from '@/lib/categories';

import { responseWithCache } from '@/utils/responseWithCache';

export async function GET(request: Request) {
  const { pathname, searchParams } = new URL(request.url);
  const pathParts = pathname.split('/');
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  const slug = pathParts.at(-1);

  if (!slug)
    return NextResponse.json({ message: 'Missing slug.' }, { status: 400 });

  try {
    const posts = await getPostsInfo(lang);
    const category = await getCategoryBySlug(slug, posts);

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found.' },
        { status: 404 }
      );
    }

    return responseWithCache({ category });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error while fetching category.' },
      { status: 500 }
    );
  }
}
