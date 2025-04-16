import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET_TOKEN)
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });

  try {
    const paths = ['/', '/posts', '/categories', '/tags'];
    for (const path of paths) revalidatePath(path);

    return NextResponse.json({ revalidated: true, paths });
  } catch {
    return NextResponse.json(
      { message: 'Revalidation failed.' },
      { status: 500 }
    );
  }
}
