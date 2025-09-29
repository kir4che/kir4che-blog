import { NextResponse } from 'next/server';

interface CacheOptions {
  maxAge?: number;
  staleWhileRevalidate?: number;
}

export const responseWithCache = <T>(
  data: T,
  { maxAge = 60, staleWhileRevalidate = 30 }: CacheOptions = {}
) => {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
};
