import { NextResponse } from 'next/server';

import { getPostsByTag } from '@/lib/posts';
import { convertToSlug } from '@/lib/tags';

import { responseWithCache } from '@/utils/responseWithCache';

export const GET = async (request: Request) => {
  const { pathname, searchParams } = new URL(request.url);
  const pathParts = pathname.split('/');
  const tagName = decodeURIComponent(pathParts.at(-1) || '');
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  if (!tagName)
    return NextResponse.json({ message: 'Missing tag name.' }, { status: 400 });

  try {
    const posts = await getPostsByTag(tagName, lang);

    return responseWithCache({
      tag: {
        name: tagName,
        slug: convertToSlug(tagName),
        postCount: posts.length,
      },
    });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error while fetching posts by tag.' },
      { status: 500 }
    );
  }
};
