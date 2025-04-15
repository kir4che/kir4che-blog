import { NextResponse } from 'next/server';

import { getPostsInfo } from '@/lib/posts';
import { getCategoryBySlug } from '@/lib/categories';
import { getLangFromHeader } from '@/utils/getLangFromHeader';
import { responseWithCache } from '@/utils/responseWithCache';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');

  const slug = pathParts.at(-1);

  if (!slug) return NextResponse.json({ message: 'Missing slug.' }, { status: 400 });

  try {
    const lang = getLangFromHeader(request);
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
