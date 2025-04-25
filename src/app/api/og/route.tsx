export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'kir4che blog';
  const tagsParam = searchParams.get('tags') || '';
  const tags = tagsParam
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const key = encodeURIComponent(`${title}-${tags.join(',')}`);
  const ogImageUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/og/generate?key=${key}`;

  return Response.redirect(ogImageUrl, 302);
}
