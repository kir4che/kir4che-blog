import { NextResponse } from 'next/server';

import { getPostData } from '@/lib/posts';
import { getLangFromHeader } from '@/utils/getLangFromHeader';
import { responseWithCache } from '@/utils/responseWithCache';

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const slug = pathParts.at(-1);

  if (!slug) return NextResponse.json({ message: 'Missing slug.' }, { status: 400 });

  try {
    const lang = getLangFromHeader(request);
    const checkExistence = request.headers.get('X-Check-Existence') === 'true';

    try {
      const post = await getPostData(lang, slug);

      if (checkExistence) return responseWithCache({ exists: !!post });
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
      if (checkExistence) return responseWithCache({ exists: false });
      throw err;
    }
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch post.' },
      { status: 500 }
    );
  }
};
