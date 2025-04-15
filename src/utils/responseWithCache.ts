import { NextResponse } from 'next/server';

export const responseWithCache = (
  data: any,
  maxAge = 60,
  staleWhileRevalidate = 30
) => {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
};
