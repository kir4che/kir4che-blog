import { NextResponse } from 'next/server';

import { checkPostExistence, getPostData } from '@/lib/posts';
import { responseWithCache } from '@/utils/responseWithCache';

export const GET = async (request: Request) => {
  const { pathname, searchParams } = new URL(request.url);
  const pathParts = pathname.split('/');
  const slug = pathParts.at(-1);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  if (!slug)
    return NextResponse.json({ message: 'Missing slug.' }, { status: 400 });

  try {
    const checkExistence = request.headers.get('X-Check-Existence') === 'true';

    if (checkExistence) {
      const exist = await checkPostExistence(lang, slug);
      return responseWithCache({ exist });
    }

    try {
      const post = await getPostData(lang, slug);
      if (!post)
        return NextResponse.json(
          { message: 'Post not found.' },
          { status: 404 }
        );

      return responseWithCache({
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        tags: post.tags,
        categories: post.categories,
        wordCount: post.wordCount,
        lang: post.lang,
        hasPassword: !!post.password,
        coverImage: post.coverImage,
        updatedAt: post.updatedAt,
        content: post.content,
      });
    } catch (err) {
      if (checkExistence) return responseWithCache({ exist: false });
      throw err;
    }
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch post.' },
      { status: 500 }
    );
  }
};
