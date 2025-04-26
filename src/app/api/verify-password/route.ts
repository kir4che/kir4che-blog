import { NextResponse } from 'next/server';
import { getPostData } from '@/lib/posts';

import type { Language } from '@/types';

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { slug, password, lang } = body;

    if (
      !slug ||
      typeof slug !== 'string' ||
      !password ||
      typeof password !== 'string' ||
      !lang ||
      typeof lang !== 'string'
    ) {
      return NextResponse.json(
        { message: 'Invalid request.' },
        { status: 400 }
      );
    }

    const post = await getPostData(lang as Language, slug);

    if (!post)
      return NextResponse.json({ message: 'Post not found.' }, { status: 404 });

    if (!post.hasPassword)
      return NextResponse.json(
        { message: 'This post is not protected.' },
        { status: 400 }
      );

    if (String(password) === String(post.password))
      return NextResponse.json(
        { message: 'Password correct.' },
        { status: 200 }
      );
    else
      return NextResponse.json(
        { message: 'Incorrect password.' },
        { status: 401 }
      );
  } catch {
    return NextResponse.json({ message: 'Server error.' }, { status: 500 });
  }
};
