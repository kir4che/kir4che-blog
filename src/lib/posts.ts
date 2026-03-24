import { getCollection, render, type CollectionEntry } from 'astro:content';

import { DEFAULT_LANGUAGE } from '@/config';
import { isSupportedLanguage } from '@/lib/i18n';
import type { Language, Post, PostMeta } from '@/types';
import { parseToISODate } from '@/utils/date';

type PostEntry = CollectionEntry<'blog'>;
type ParsedEntry = { lang: Language | null; slug: string };

const isProd = import.meta.env.PROD;

const postsInfoCache = new Map<Language, PostMeta[]>();
const entriesCache: { value: PostEntry[] | null } = { value: null };
const wordCountCache = new Map<string, number>();
const updatedAtCache = new Map<string, string | undefined>();
const postIndexCache: {
  value: {
    slugToLangs: Map<string, Language[]>;
    langSlugToEntry: Map<string, { entry: PostEntry; parsed: ParsedEntry }>;
  } | null;
} = { value: null };
const renderCache = new Map<string, Awaited<ReturnType<typeof render>>>();

// 從 entry.id 解析語言與實際 slug
const parseEntryLangAndSlug = (entry: PostEntry): ParsedEntry => {
  const parts = entry.id.split('/').filter(Boolean);
  if (parts.length < 2) return { lang: null, slug: entry.id };

  const [langCandidate, ...rest] = parts;
  if (!isSupportedLanguage(langCandidate)) return { lang: null, slug: entry.id };

  return {
    lang: langCandidate,
    slug: rest.join('/'),
  };
};

/**
 * 取得文章 updatedAt
 * 優先序：
 * 1. frontmatter.updatedAt
 * 2. 實體檔案的 mtime
 * 3. 無法取得時回傳 undefined
 */
const resolveUpdatedAt = async (entry: PostEntry): Promise<string | undefined> => {
  if (typeof entry.data.updatedAt === 'string' && entry.data.updatedAt.trim())
    return entry.data.updatedAt.trim();

  // 💡 在 Cloudflare 等 Edge 環境無法直接存取檔案系統。
  // 若 entry.data 沒寫，建議在靜態建置時透過 CI/CD 注入或手動管理。
  // 這裡我們安全地回傳 undefined 以避免 build crash。
  return undefined;
};

// 解析文章 slug
const resolveSlugFromFrontmatter = (
  entry: PostEntry,
  lang: Language,
  parsed?: ParsedEntry
): string => {
  const fm = entry.data as unknown;

  if (typeof fm === 'object' && fm !== null && 'slug' in fm) {
    const raw = (fm as { slug?: unknown }).slug;

    if (typeof raw === 'string' && raw.trim()) return raw.trim();

    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      const resolved = obj[lang] ?? obj[DEFAULT_LANGUAGE];
      if (typeof resolved === 'string' && resolved.trim()) return resolved.trim();
    }
  }

  return (parsed ?? parseEntryLangAndSlug(entry)).slug;
};

// 解析文章敘述
const resolveDescription = (entry: PostEntry): string => {
  if (entry.data.description?.trim()) return entry.data.description.trim();
  const body = entry.body ?? '';
  const plainText = body
    .replace(/[#*`_~[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plainText.slice(0, 160);
};

// 從 markdown 內容計算字數
export const countWordsFromMarkdown = (markdown: string): number => {
  if (!markdown?.trim()) return 0;

  const cleanText = markdown
    .replace(/^#+\s+/gm, '')
    .replace(/(!\[.*?\]\(.*?\))|(\[.*?\]\(.*?\))/g, '$2')
    .replace(/[`*_{}[\]()#+\-.!]/g, ' ')
    .replace(/<[^>]*>/g, '');

  if (!cleanText.trim()) return 0;

  const cjkChars = cleanText.match(/[\u4e00-\u9fff]/g)?.length ?? 0;

  const latinWords = cleanText
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return cjkChars + latinWords;
};

// 取得文章字數（production 有快取）
const getWordCount = (entry: PostEntry, updatedAt: string | undefined): number => {
  const body = entry.body ?? '';
  if (!isProd) return countWordsFromMarkdown(body);

  const key = `${entry.id}:${updatedAt ?? ''}`;

  const cached = wordCountCache.get(key);
  if (cached !== undefined) return cached;

  const count = countWordsFromMarkdown(body);
  wordCountCache.set(key, count);
  return count;
};

// 正規化 PostMeta
const normalizePostMeta = async (
  entry: PostEntry,
  lang: Language,
  parsed?: ParsedEntry
): Promise<PostMeta> => {
  const rawCategories = entry.data.categories;
  const resolvedParsed = parsed ?? parseEntryLangAndSlug(entry);

  const categories =
    Array.isArray(rawCategories) && rawCategories.length > 0 ? rawCategories : ['未分類'];

  const updatedAt = await resolveUpdatedAt(entry);

  return {
    slug: resolveSlugFromFrontmatter(entry, lang, resolvedParsed),
    lang,
    title: entry.data.title,
    description: resolveDescription(entry),
    date: (() => {
      const dateStr = parseToISODate(entry.data.date);
      if (!dateStr) throw new Error('文章缺少有效的日期！');
      return dateStr;
    })(),
    categories,
    tags: entry.data.tags ?? [],
    featured: entry.data.featured ?? false,
    draft: entry.data.draft ?? false,
    protected: entry.data.protected,
    coverImage: entry.data.coverImage,
    updatedAt,
    wordCount: getWordCount(entry, updatedAt),
  };
};

// 取得 blog collection entries
const getBlogEntries = async (): Promise<PostEntry[]> => {
  if (isProd && entriesCache.value) return entriesCache.value;

  const entries = await getCollection('blog');
  if (isProd) entriesCache.value = entries;
  return entries;
};

// 建立文章索引
export const getPostIndex = async () => {
  if (isProd && postIndexCache.value) return postIndexCache.value;

  const entries = await getBlogEntries();
  const slugToLangsSet = new Map<string, Set<Language>>();
  const langSlugToEntry = new Map<string, { entry: PostEntry; parsed: ParsedEntry }>();

  for (const entry of entries) {
    const parsed = parseEntryLangAndSlug(entry);
    if (!parsed.lang) continue;

    const slug = resolveSlugFromFrontmatter(entry, parsed.lang, parsed);
    if (!slug) continue;

    const key = `${parsed.lang}:${slug}`;
    if (!langSlugToEntry.has(key)) langSlugToEntry.set(key, { entry, parsed });

    const langs = slugToLangsSet.get(slug) ?? new Set<Language>();
    langs.add(parsed.lang);
    slugToLangsSet.set(slug, langs);
  }

  const resolved = {
    slugToLangs: new Map(
      Array.from(slugToLangsSet.entries(), ([key, set]) => [key, Array.from(set)])
    ),
    langSlugToEntry,
  };
  if (isProd) postIndexCache.value = resolved;
  return resolved;
};

// 取得單篇文章完整內容
export const getPost = async (lang: Language, slug: string): Promise<Post | null> => {
  const { langSlugToEntry } = await getPostIndex();
  const resolved = langSlugToEntry.get(`${lang}:${slug}`);
  const entry = resolved?.entry;
  const parsed = resolved?.parsed;

  if (!entry || (entry.data.draft && isProd)) return null;

  let rendered = renderCache.get(entry.id);
  if (!rendered) {
    rendered = await render(entry);
    if (isProd) renderCache.set(entry.id, rendered);
  }

  return {
    ...(await normalizePostMeta(entry, lang, parsed)),
    content: entry.body ?? '',
    rendered,
    headings: rendered.headings,
  };
};

const sortByDateDesc = (posts: PostMeta[]) =>
  [...posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

// 取得指定語言的文章 meta 清單
export const getPostsInfo = async (lang: Language): Promise<PostMeta[]> => {
  if (isProd) {
    const cached = postsInfoCache.get(lang);
    if (cached) return cached;
  }

  const entries = await getBlogEntries();

  const posts = (
    await Promise.all(
      entries.map(async (entry) => {
        if (entry.data.draft && isProd) return null;
        const parsed = parseEntryLangAndSlug(entry);
        if (parsed.lang !== lang) return null;
        return normalizePostMeta(entry, lang, parsed);
      })
    )
  ).filter((post): post is PostMeta => post !== null);

  const sorted = sortByDateDesc(posts);

  if (isProd) postsInfoCache.set(lang, sorted);

  return sorted;
};

// 取得單篇文章的 meta 資料
export const getPostMetaBySlug = async (lang: Language, slug: string): Promise<PostMeta | null> => {
  const { langSlugToEntry } = await getPostIndex();
  const resolved = langSlugToEntry.get(`${lang}:${slug}`);
  const entry = resolved?.entry;
  const parsed = resolved?.parsed;
  if (!entry || (entry.data.draft && isProd)) return null;
  return normalizePostMeta(entry, lang, parsed);
};

// 取得文章解鎖用的 Cookie 名稱
export const getPostUnlockCookieName = (slug: string): string => `postUnlock-${slug}`;

// 取得同一篇文章支援的所有語言
export const getPostAvailableLangs = async (slug: string): Promise<Language[]> => {
  if (!slug) return [];
  const { slugToLangs } = await getPostIndex();
  return slugToLangs.get(slug) ?? [];
};

const BLOG_COMPONENT_MODULES = import.meta.glob<Record<string, unknown>>(
  '/src/content/blog/**/components.{js,jsx,ts,tsx,astro}'
);

// 取得文章的額外組件（有的話）
export const getPostExtraComponents = async (slug: string) => {
  const normalizedSlug = typeof slug === 'string' ? slug.trim() : '';
  if (!normalizedSlug) return undefined;

  const matchKey = Object.keys(BLOG_COMPONENT_MODULES).find((filePath) =>
    filePath.includes(`/blog/${normalizedSlug}/components.`)
  );
  if (!matchKey) return undefined;

  const mod = await BLOG_COMPONENT_MODULES[matchKey]();
  if (typeof mod !== 'object' || mod === null) return undefined;

  return (mod.default ?? mod) as Record<string, unknown>;
};
