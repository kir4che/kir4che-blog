import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATE_SECRET_TOKEN)
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });

  try {
    const locales = ['/tw', '/en'];
    const basePaths = ['/', '/posts', '/categories', '/tags'];

    // 組合出完整的多語系路徑
    const paths = locales.flatMap((locale) =>
      basePaths.map((base) => (base === '/' ? locale : `${locale}${base}`))
    );

    // 逐一重新驗證每個路徑（使用 ISR）
    for (const path of paths) revalidatePath(path);

    return NextResponse.json({ revalidated: true, paths });
  } catch {
    return NextResponse.json(
      { message: 'Revalidation failed.' },
      { status: 500 }
    );
  }
}
