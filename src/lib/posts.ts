import { getCollection, render, type CollectionEntry } from 'astro:content';

import { isSupportedLanguage } from '@/lib/i18n';
import type { Language, Post, PostMeta } from '@/types';
import { parseToISODate } from '@/utils/date';
import { resolveUpdatedAt, toStringArray } from '@/utils/post-meta';

type PostEntry = CollectionEntry<'blog'>;
type ParsedEntry = { lang: Language | null; slug: string };

const isProd = import.meta.env.PROD;

// 取得文章的完整檔案路徑
export const getPostFilePath = (lang: Language, slug: string): string =>
  `${process.cwd()}/src/content/blog/${lang}/${slug}.mdx`;

// 計算文章字數
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

// request-level cache 避免同一請求內重複查詢
let publishedCache: Promise<PostEntry[]> | null = null;

// 取得所有「已發布」文章
const getPublishedBlogEntries = async (): Promise<PostEntry[]> => {
  if (publishedCache) return publishedCache;

  const cachePromise = getCollection('blog', (entry: PostEntry) => {
    if (isProd && entry.data.draft) return false;
    return true;
  }).then((entries: PostEntry[] | null) => entries ?? []);
  publishedCache = cachePromise;
  return cachePromise;
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

// 透過語系、slug 來找單篇文章的 Metadata
export const getPostMetaBySlug = async (
  lang: Language,
  targetSlug: string
): Promise<PostMeta | null> => {
  const entries = await getPublishedBlogEntries();

  for (const entry of entries) {
    const parsed = parseEntryLangAndSlug(entry);
    if (parsed.lang !== lang) continue;

    if (parsed.slug === targetSlug) return normalizePostMeta(entry, lang, parsed);
  }
  return null;
};

// 取得單篇文章的「完整內容」
export const getPost = async (lang: Language, targetSlug: string): Promise<Post | null> => {
  const entries = await getPublishedBlogEntries();

  for (const entry of entries) {
    const parsed = parseEntryLangAndSlug(entry);
    if (parsed.lang !== lang) continue;

    if (parsed.slug === targetSlug) {
      const meta = normalizePostMeta(entry, lang, parsed);
      const rendered = await render(entry);
      return {
        ...meta,
        content: entry.body ?? '',
        rendered,
        headings: rendered.headings,
      };
    }
  }
  return null;
};

// 取得某個語系的所有文章的 Metadata 列表
export const getPostsMeta = async (
  lang: Language | 'all' = 'all',
  options: { includeProtected?: boolean } = { includeProtected: true }
): Promise<PostMeta[]> => {
  const entries = await getPublishedBlogEntries();

  let posts = entries
    .map((entry) => {
      const parsed = parseEntryLangAndSlug(entry);
      if (!parsed.lang) return null;

      if (lang !== 'all' && parsed.lang !== lang) return null;

      // 注意這裡的第二個參數，我們傳入的是 parsed.lang (文章本身的語系)，而不是 lang (可能是 'all')
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

// Vite 的 glob 匯入，建置階段掃描所有文章目錄下的 components 檔案
// 執行時期依 slug 動態載入對應文章的客製元件
const BLOG_COMPONENT_MODULES = import.meta.glob<Record<string, unknown>>(
  '/src/content/blog/**/components.{js,jsx,ts,tsx,astro}'
);

// 取得文章對應的擴充元件
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
