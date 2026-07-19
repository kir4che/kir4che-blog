import { getCollection, render, type CollectionEntry } from 'astro:content';

import { isSupportedLanguage } from '@/lib/i18n';
import type { Language, Post, PostMeta } from '@/types';
import { parseToISODate } from '@/utils/date';
import { resolveUpdatedAt, toStringArray } from '@/utils/post-meta';

type PostEntry = CollectionEntry<'blog'>;
type ParsedEntry = { lang: Language | null; slug: string };

const isProd = import.meta.env.PROD;

// 計算文章字數
const countWordsFromMarkdown = (markdown: string): number => {
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

// 從文章的檔案路徑中解析出「語系、slug」
const parseEntryLangAndSlug = (entry: PostEntry): ParsedEntry => {
  const parts = entry.id.split('/').filter(Boolean);
  if (parts.length < 2) return { lang: null, slug: entry.id };

  const langCandidate = parts[0];
  if (!isSupportedLanguage(langCandidate)) return { lang: null, slug: entry.id };

  const fileName = parts[parts.length - 1];
  const cleanSlug = fileName.replace(/\.mdx?$/, '');

  return {
    lang: langCandidate,
    slug: cleanSlug,
  };
};

// process-level cache：production 避免重複讀檔，dev 永遠重新 fetch（內容頻繁修改）。
let publishedCache: Promise<PostEntry[]> | null = null;

// 取得所有「已發布」文章
const getPublishedBlogEntries = async (): Promise<PostEntry[]> => {
  if (isProd && publishedCache) return publishedCache;

  const promise = getCollection('blog', (entry: PostEntry) => !(isProd && entry.data.draft)).then(
    (entries: PostEntry[] | null) => entries ?? []
  );

  if (isProd) publishedCache = promise;
  return promise;
};

// 產生文章的簡介
const resolveDescription = (entry: PostEntry): string => {
  if (entry.data.description?.trim()) return entry.data.description.trim();
  const body = entry.body ?? '';
  const plainText = body
    .replace(/[#*`_~[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plainText.slice(0, 160);
};

// 將 Astro 預設的資料結構整理成自定義的 PostMeta 格式
const normalizePostMeta = (entry: PostEntry, lang: Language, parsed?: ParsedEntry): PostMeta => {
  const resolvedParsed = parsed ?? parseEntryLangAndSlug(entry);

  return {
    slug: resolvedParsed.slug,
    lang,
    title: entry.data.title,
    description: resolveDescription(entry),
    date: (() => {
      const dateStr = parseToISODate(entry.data.date);
      if (!dateStr) throw new Error('文章缺少有效的日期！');
      return dateStr;
    })(),
    categories: toStringArray(entry.data.categories, ['未分類']),
    tags: toStringArray(entry.data.tags),
    featured: entry.data.featured ?? false,
    draft: entry.data.draft ?? false,
    protected: entry.data.protected,
    coverImage: entry.data.coverImage,
    places: entry.data.places,
    updatedAt: resolveUpdatedAt(entry.data.updatedAt),
    wordCount: countWordsFromMarkdown(entry.body ?? ''),
  };
};

// 依語系 + slug 找對應的 entry（共用查詢）
const findEntry = async (
  lang: Language,
  slug: string
): Promise<{ entry: PostEntry; parsed: ParsedEntry } | null> => {
  const entries = await getPublishedBlogEntries();
  for (const entry of entries) {
    const parsed = parseEntryLangAndSlug(entry);
    if (parsed.lang === lang && parsed.slug === slug) return { entry, parsed };
  }
  return null;
};

// 透過語系、slug 來找單篇文章的 Metadata
export const getPostMetaBySlug = async (
  lang: Language,
  targetSlug: string
): Promise<PostMeta | null> => {
  const found = await findEntry(lang, targetSlug);
  if (!found) return null;
  return normalizePostMeta(found.entry, lang, found.parsed);
};

// 取得單篇文章的「完整內容」
export const getPost = async (lang: Language, targetSlug: string): Promise<Post | null> => {
  const found = await findEntry(lang, targetSlug);
  if (!found) return null;
  const { entry, parsed } = found;
  const meta = normalizePostMeta(entry, lang, parsed);
  const rendered = await render(entry);
  return {
    ...meta,
    content: entry.body ?? '',
    rendered,
    headings: rendered.headings,
  };
};

// 取得某個語系的所有文章的 Metadata 列表
export const getPostsMeta = async (
  lang: Language,
  options: { includeProtected?: boolean } = { includeProtected: true }
): Promise<PostMeta[]> => {
  const entries = await getPublishedBlogEntries();

  let posts = entries
    .map((entry) => {
      const parsed = parseEntryLangAndSlug(entry);
      if (parsed.lang !== lang) return null;
      return normalizePostMeta(entry, parsed.lang, parsed);
    })
    .filter((post): post is PostMeta => post !== null);

  if (!options.includeProtected) posts = posts.filter((post) => !post.protected);

  return posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
};

// 取得特定文章的可用語系列表
export const getPostAvailableLangs = async (targetSlug: string): Promise<Language[]> => {
  const entries = await getPublishedBlogEntries();
  const langs = new Set<Language>();

  for (const entry of entries) {
    const parsed = parseEntryLangAndSlug(entry);
    if (!parsed.lang) continue;
    if (parsed.slug === targetSlug) langs.add(parsed.lang);
  }
  return Array.from(langs);
};

// 產生文章解鎖用的 cookie 名稱
export const getPostUnlockCookieName = (slug: string): string => `postUnlock-${slug}`;
