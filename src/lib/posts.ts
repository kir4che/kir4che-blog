import { getCollection, type CollectionEntry } from 'astro:content';
import { statSync } from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { toString } from 'mdast-util-to-string';

import type { Language, Post, PostMeta } from '@/types';
import { DEFAULT_LANGUAGE } from '@/config';
import { isSupportedLanguage } from '@/lib/i18n';
import { toISODateOrThrow } from '@/utils/date';

type PostEntry = CollectionEntry<'blog'>;
type ParsedEntry = { lang: Language | null; slug: string };

const isProd = import.meta.env.PROD;

const postsInfoCache = new Map<Language, PostMeta[]>();
const entriesCache: { value: PostEntry[] | null } = { value: null };
const wordCountCache = new Map<string, number>();
const postIndexCache: {
  value: {
    postIdToLangs: Map<string, Language[]>;
    slugToPostId: Map<string, string>;
    langSlugToEntry: Map<string, { entry: PostEntry; parsed: ParsedEntry }>;
  } | null;
} = { value: null };
const renderCache = new Map<string, Awaited<ReturnType<PostEntry['render']>>>();
const markdownParser = unified().use(remarkParse).use(remarkMdx);
const CJK_CHAR_REGEX = /[\u4e00-\u9fff]/g;

// 從 entry.slug 解析語言與實際 slug
const parseEntryLangAndSlug = (entry: PostEntry): ParsedEntry => {
  const parts = entry.slug.split('/').filter(Boolean);
  if (parts.length < 2) return { lang: null, slug: entry.slug };

  const [langCandidate, ...rest] = parts;
  if (!isSupportedLanguage(langCandidate)) return { lang: null, slug: entry.slug };

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
const resolveUpdatedAt = (entry: PostEntry): string | undefined => {
  if (typeof entry.data.updatedAt === 'string' && entry.data.updatedAt.trim())
    return entry.data.updatedAt.trim();

  try {
    const filePath = path.join(process.cwd(), 'src', 'content', entry.collection, entry.id);
    return statSync(filePath).mtime.toISOString();
  } catch {
    return undefined;
  }
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

// 解析文章描述，以 frontmatter.description 為主；否則從文章內容擷取前 160 字。
const resolveDescription = (entry: PostEntry): string =>
  entry.data.description?.trim() || entry.body.replace(/\s+/g, ' ').trim().slice(0, 160);

// 解析文章 postId
const resolvePostId = (entry: PostEntry, parsed?: ParsedEntry): string => {
  const postId = entry.data.postId;
  if (typeof postId === 'string' && postId.trim()) return postId.trim();

  if (!isProd) throw new Error(`Missing postId in frontmatter for ${entry.id}`);

  return (parsed ?? parseEntryLangAndSlug(entry)).slug;
};

// 從 markdown 內容計算字數
const countWordsFromMarkdown = (markdown: string): number => {
  if (!markdown?.trim()) return 0;

  const tree = markdownParser.parse(markdown);
  const text = toString(tree);
  if (!text.trim()) return 0;

  const cjkChars = text.match(CJK_CHAR_REGEX)?.length ?? 0;
  const latinWords = text.replace(CJK_CHAR_REGEX, ' ').trim().split(/\s+/).filter(Boolean).length;

  return cjkChars + latinWords;
};

// 取得文章字數（production 有快取）
const getWordCount = (entry: PostEntry): number => {
  if (!isProd) return countWordsFromMarkdown(entry.body);

  const updatedAt = resolveUpdatedAt(entry) ?? '';
  const key = `${entry.id}:${updatedAt}`;

  const cached = wordCountCache.get(key);
  if (cached !== undefined) return cached;

  const count = countWordsFromMarkdown(entry.body);
  wordCountCache.set(key, count);
  return count;
};

// 將 entry 正規化為 PostMeta
const normalizePostMeta = (entry: PostEntry, lang: Language, parsed?: ParsedEntry): PostMeta => {
  const rawCategories = entry.data.categories;
  const resolvedParsed = parsed ?? parseEntryLangAndSlug(entry);

  const categories =
    Array.isArray(rawCategories) && rawCategories.length > 0 ? rawCategories : ['未分類'];

  return {
    slug: resolveSlugFromFrontmatter(entry, lang, resolvedParsed),
    lang,
    title: entry.data.title,
    description: resolveDescription(entry),
    date: toISODateOrThrow(entry.data.date, 'Post is missing a valid date.'),
    postId: resolvePostId(entry, resolvedParsed),
    categories,
    tags: entry.data.tags ?? [],
    featured: entry.data.featured ?? false,
    draft: entry.data.draft ?? false,
    passwordHash: entry.data.passwordHash,
    coverImage: entry.data.coverImage,
    updatedAt: resolveUpdatedAt(entry),
    wordCount: getWordCount(entry),
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
const getPostIndex = async (): Promise<{
  postIdToLangs: Map<string, Language[]>;
  slugToPostId: Map<string, string>;
  langSlugToEntry: Map<string, { entry: PostEntry; parsed: ParsedEntry }>;
}> => {
  if (isProd && postIndexCache.value) return postIndexCache.value;

  const entries = await getBlogEntries();
  const postIdToLangs = new Map<string, Set<Language>>();
  const slugToPostId = new Map<string, string>();
  const langSlugToEntry = new Map<string, { entry: PostEntry; parsed: ParsedEntry }>();

  for (const entry of entries) {
    const parsed = parseEntryLangAndSlug(entry);
    if (!parsed.lang) continue;

    const postId = resolvePostId(entry, parsed);
    const slug = resolveSlugFromFrontmatter(entry, parsed.lang, parsed);
    if (slug) {
      const existing = slugToPostId.get(slug);
      if (existing && existing !== postId) {
        if (!isProd)
          throw new Error(`Slug "${slug}" maps to multiple postIds: "${existing}" and "${postId}"`);
      } else if (!existing) {
        slugToPostId.set(slug, postId);
      }

      const key = `${parsed.lang}:${slug}`;
      if (!langSlugToEntry.has(key)) langSlugToEntry.set(key, { entry, parsed });
    }

    const langs = postIdToLangs.get(postId) ?? new Set<Language>();
    langs.add(parsed.lang);
    postIdToLangs.set(postId, langs);
  }

  const resolved = {
    postIdToLangs: new Map(
      Array.from(postIdToLangs.entries(), ([key, set]) => [key, Array.from(set)])
    ),
    slugToPostId,
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
    rendered = await entry.render();
    if (isProd) renderCache.set(entry.id, rendered);
  }

  return {
    ...normalizePostMeta(entry, lang, parsed),
    content: entry.body,
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

  const posts: PostMeta[] = [];
  for (const entry of entries) {
    if (entry.data.draft && isProd) continue;
    const parsed = parseEntryLangAndSlug(entry);
    if (parsed.lang !== lang) continue;
    posts.push(normalizePostMeta(entry, lang, parsed));
  }

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
export const getPostUnlockCookieName = (postId: string): string => `postUnlock:${postId}`;

// 取得同一篇文章支援的所有語言
export const getPostAvailableLangs = async (
  input: { slug?: string; postId?: string } | string
): Promise<Language[]> => {
  const { slug, postId } = typeof input === 'string' ? { slug: input } : input;
  if (!postId && !slug) return [];

  const { postIdToLangs, slugToPostId } = await getPostIndex();
  const resolvedPostId = postId ?? (slug ? slugToPostId.get(slug) : undefined);
  if (!resolvedPostId) return [];

  return postIdToLangs.get(resolvedPostId) ?? [];
};
