import { z } from 'zod';

export const prerender = false;

const BANGUMI_API = 'https://api.bgm.tv/v0/users';
const REQUEST_TIMEOUT = 8_000;
const LIST_LIMIT = 12;
const FETCH_LIMIT = 50;

const subjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  name_cn: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  images: z
    .object({
      large: z.string().nullable().optional(),
      common: z.string().nullable().optional(),
      medium: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const collectionSchema = z.object({
  type: z.number().int(),
  rate: z.number().nullable().optional(),
  subject: subjectSchema.nullable().optional(),
});

const collectionsResponseSchema = z.object({
  data: collectionSchema.array(),
});

type CollectionItem = {
  id: number;
  title: string;
  originalTitle?: string;
  image?: string;
  url: string;
  rate?: number;
  date?: string;
};

const byAirDateDesc = (a: CollectionItem, b: CollectionItem) =>
  (b.date ?? '').localeCompare(a.date ?? '');

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        status === 200 ? 'public, s-maxage=86400, stale-while-revalidate=86400' : 'no-store',
    },
  });

const getSafeImageUrl = (value: string | null | undefined) => {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};

// 2 = collect, 3 = watching
const getCollections = async (username: string, type: 2 | 3) => {
  const url = new URL(`${BANGUMI_API}/${encodeURIComponent(username)}/collections`);
  url.searchParams.set('subject_type', '2');
  url.searchParams.set('type', String(type));
  url.searchParams.set('limit', String(FETCH_LIMIT));
  url.searchParams.set('offset', '0');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'kir4che-blog/1.0 (+https://kir4che.com)',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) throw new Error(`Bangumi responded with ${response.status}`);

  const payload: unknown = await response.json();
  const parsed = collectionsResponseSchema.safeParse(payload);
  if (!parsed.success) throw new Error('Unexpected Bangumi response');

  return parsed.data.data
    .filter(({ subject }) => subject)
    .map(({ subject, rate }) => {
      const item = subject!;
      const title = item.name_cn?.trim() || item.name.trim();
      const originalTitle =
        item.name_cn?.trim() && item.name.trim() !== title ? item.name.trim() : undefined;
      const date = item.date?.trim() || undefined;

      return {
        id: item.id,
        title,
        ...(originalTitle ? { originalTitle } : {}),
        image: getSafeImageUrl(item.images?.large ?? item.images?.common ?? item.images?.medium),
        url: `https://bgm.tv/subject/${item.id}`,
        ...(rate && rate > 0 ? { rate } : {}),
        ...(date ? { date } : {}),
      } satisfies CollectionItem;
    });
};

export async function GET() {
  const username = import.meta.env.BANGUMI_USERNAME?.trim();

  if (!username) return jsonResponse({ configured: false });
  if (!/^[\w-]{1,32}$/.test(username)) {
    return jsonResponse({ error: 'Invalid Bangumi username' }, 500);
  }

  try {
    const [watching, watched] = await Promise.all([
      getCollections(username, 3),
      getCollections(username, 2),
    ]);

    return jsonResponse({
      configured: true,
      watched: watched.sort(byAirDateDesc).slice(0, LIST_LIMIT),
      watching: watching.sort(byAirDateDesc).slice(0, LIST_LIMIT),
    });
  } catch {
    return jsonResponse({ error: 'Unable to load Bangumi collections' }, 502);
  }
}
