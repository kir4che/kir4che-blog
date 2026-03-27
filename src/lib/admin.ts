import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { SUPPORTED_LANGUAGES } from '@/config';
import {
  deleteGithubFile,
  getGithubFile,
  getGithubFilePath,
  listGithubDir,
  putGithubFile,
} from '@/lib/github';
import { isSupportedLanguage } from '@/lib/i18n';
import {
  getPostPassword,
  removePostPassword,
  renamePostPassword,
  setPostPassword,
} from '@/lib/post-passwords';
import type { AdminPost, Language, PostMeta, TripPlace } from '@/types';
import { parseToISODate } from '@/utils/date';
import { resolveUpdatedAt, toStringArray } from '@/utils/post-meta';

// 解析文章 Frontmatter
const parseFrontmatter = (source: string): { data: Record<string, any>; content: string } => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: source };
  return { data: (parseYaml(match[1]) as Record<string, any>) ?? {}, content: match[2] };
};

// 將文章內容與 Frontmatter 組合成完整的 Markdown 文字
const stringifyFrontmatter = (content: string, data: Record<string, any>): string =>
  `---\n${stringifyYaml(data)}---\n${content}`;

const POST_EXTENSION = '.mdx';

// 確認路徑只包含允許的字元
const sanitizeSegment = (input: string): string => {
  if (!/^[a-z0-9-_]+$/i.test(input)) throw new Error('無效的路徑片段');
  return input;
};

// 確認是否為支援語系
const sanitizeLanguage = (input: string): Language => {
  const sanitized = sanitizeSegment(input);
  if (!isSupportedLanguage(sanitized)) throw new Error('不支援的語系');
  return sanitized;
};

// 將不穩定的原始資料轉換成標準且安全的 PostMeta 格式
const parseCoordPair = (raw: string): { lat: number; lng: number } | null => {
  const [latRaw, lngRaw, extra] = raw.split(',').map((part) => part.trim());
  if (!latRaw || !lngRaw || extra) return null;

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
};

const normalizePlaces = (value: unknown): TripPlace[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== 'object' || item === null) return [];

    const lat = Number((item as { lat?: unknown }).lat);
    const lng = Number((item as { lng?: unknown }).lng);
    const coord = (item as { coord?: unknown }).coord;
    const icon = (item as { icon?: unknown }).icon;
    if (typeof icon !== 'string') return [];

    const trimmedIcon = icon.trim();
    if (!trimmedIcon) return [];

    if (Number.isFinite(lat) && Number.isFinite(lng)) return [{ lat, lng, icon: trimmedIcon }];

    if (typeof coord === 'string') {
      const parsed = parseCoordPair(coord);
      if (!parsed) return [];

      return [{ lat: parsed.lat, lng: parsed.lng, icon: trimmedIcon }];
    }

    return [];
  });
};

const buildMeta = (data: any = {}, slug: string, lang: Language): PostMeta => ({
  slug,
  lang,
  title: typeof data.title === 'string' && data.title.trim() ? data.title : 'Untitled',
  date: parseToISODate(data.date) ?? new Date().toISOString(),
  description: typeof data.description === 'string' ? data.description : '',
  tags: toStringArray(data.tags),
  categories: toStringArray(data.categories),
  draft: !!data.draft,
  featured: !!data.featured,
  protected: !!data.protected,
  coverImage: typeof data.coverImage === 'string' ? data.coverImage : undefined,
  places: normalizePlaces(data.places),
  showUpdatedAt: !!data.showUpdatedAt,
  updatedAt: resolveUpdatedAt(data.updatedAt),
});

// 去除副檔名
const stripPostExtension = (filename: string): string =>
  filename.endsWith(POST_EXTENSION) ? filename.slice(0, -POST_EXTENSION.length) : filename;

// 從後台的 ID 格式（zh-tw/my-post）拆解並驗證出「語系、slug」
const parseAdminPostId = (id: string) => {
  const parts = id.split('/');
  return parts.length === 2
    ? { safeLang: sanitizeLanguage(parts[0]), safeSlug: sanitizeSegment(parts[1]) }
    : null;
};

const preparePostContent = (
  meta: Partial<PostMeta>,
  content: string,
  existingMeta: Record<string, any>,
  safeLang: Language,
  safeSlug: string,
  safeOldSlug?: string
): string => {
  const baseMeta = buildMeta(existingMeta, safeSlug, safeLang);
  const showUpdatedAt = meta.showUpdatedAt ?? baseMeta.showUpdatedAt;
  const isRenaming = !!safeOldSlug && safeOldSlug !== safeSlug;
  const postId = `${safeLang}/${safeSlug}`;

  const finalMeta: Record<string, any> = {
    ...existingMeta,
    title: meta.title?.trim() || baseMeta.title,
    description: meta.description ?? baseMeta.description,
    date: meta.date ? (parseToISODate(meta.date) ?? new Date().toISOString()) : baseMeta.date,
    tags: meta.tags ? toStringArray(meta.tags) : baseMeta.tags,
    categories: meta.categories ? toStringArray(meta.categories) : baseMeta.categories,
    draft: meta.draft ?? baseMeta.draft,
    featured: meta.featured ?? baseMeta.featured,
    showUpdatedAt,
  };

  // 處理文章密碼鎖邏輯
  if (meta.protected === true) {
    if (!getPostPassword(postId) && import.meta.env.DEFAULT_POST_PASSWORD?.trim()) {
      setPostPassword(postId, import.meta.env.DEFAULT_POST_PASSWORD.trim());
    }
    finalMeta.protected = true;
  } else if (meta.protected === false) {
    removePostPassword(postId);
    delete finalMeta.protected;
  } else {
    if (isRenaming && safeOldSlug) renamePostPassword(`${safeLang}/${safeOldSlug}`, postId);
    if (baseMeta.protected) finalMeta.protected = true;
    else delete finalMeta.protected;
  }

  if (meta.coverImage !== undefined) {
    if (meta.coverImage.trim()) finalMeta.coverImage = meta.coverImage.trim();
    else delete finalMeta.coverImage;
  }
  if (isRenaming && finalMeta.coverImage === `https://cdn.kir4che.com/${safeOldSlug}/cover.webp`) {
    finalMeta.coverImage = `https://cdn.kir4che.com/${safeSlug}/cover.webp`;
  }

  if (showUpdatedAt) finalMeta.updatedAt = new Date().toISOString();
  else delete finalMeta.updatedAt;

  return stringifyFrontmatter(content, finalMeta);
};

// 遍歷並讀取 GitHub 文章目錄，取得所有文章的語系、slug。
const fetchAllPostPathsFromGithub = async (): Promise<{ lang: Language; slug: string }[]> => {
  const results = await Promise.allSettled(
    SUPPORTED_LANGUAGES.map((lang) =>
      listGithubDir(`src/content/blog/${lang}`).then((files) =>
        (files as { name: string }[])
          .filter((f) => f.name.endsWith(POST_EXTENSION))
          .map((f) => ({ lang, slug: stripPostExtension(f.name) }))
      )
    )
  );

  return results.flatMap((result) => {
    if (result.status === 'rejected') return [];
    return result.value;
  });
};

// 取得後台文章列表的所有文章資料，並根據日期由新到舊排序。
export const getAdminPosts = async (): Promise<AdminPost[]> => {
  const postPaths = await fetchAllPostPathsFromGithub();
  const posts = await Promise.all(
    postPaths.map(({ lang, slug }) => getAdminPost(`${lang}/${slug}`))
  );
  return posts
    .filter((p): p is AdminPost => p !== null)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));
};

// 從 GitHub 讀取單篇後台文章的完整內容
export const getAdminPost = async (id: string): Promise<AdminPost | null> => {
  const ids = parseAdminPostId(id);
  if (!ids) return null;

  const githubPath = getGithubFilePath(ids.safeLang, ids.safeSlug);
  const file = await getGithubFile(githubPath);
  if (!file) return null;

  const { data, content } = parseFrontmatter(file.content);
  return {
    id,
    lang: ids.safeLang,
    slug: ids.safeSlug,
    fullPath: githubPath,
    meta: buildMeta(data, ids.safeSlug, ids.safeLang),
    content,
  };
};

// 從 GitHub 刪除文章
export const deleteAdminPost = async (id: string) => {
  const ids = parseAdminPostId(id);
  if (ids) {
    const path = getGithubFilePath(ids.safeLang, ids.safeSlug);
    const existingFile = await getGithubFile(path);
    if (existingFile) await deleteGithubFile(path, `🗑️ delete post ${id}`, existingFile.sha);
  }
};

// 儲存文章到 GitHub
export const saveAdminPostToGithub = async (
  lang: string,
  slug: string,
  meta: Partial<PostMeta>,
  content: string,
  oldSlug?: string
): Promise<void> => {
  const safeLang = sanitizeLanguage(lang);
  const safeSlug = sanitizeSegment(slug);
  const safeOldSlug = oldSlug && oldSlug !== slug ? sanitizeSegment(oldSlug) : undefined;

  const newGithubPath = getGithubFilePath(safeLang, safeSlug);
  const sourceGithubPath = safeOldSlug ? getGithubFilePath(safeLang, safeOldSlug) : newGithubPath;

  const existingFile = await getGithubFile(sourceGithubPath);
  const existingMeta = existingFile ? parseFrontmatter(existingFile.content).data : {};

  const finalContent = preparePostContent(
    meta,
    content,
    existingMeta,
    safeLang,
    safeSlug,
    safeOldSlug
  );

  if (safeOldSlug && existingFile) {
    await deleteGithubFile(
      sourceGithubPath,
      `🔄 rename ${safeLang}/${safeOldSlug} → ${safeSlug}`,
      existingFile.sha
    );
    await putGithubFile(newGithubPath, finalContent, `✨ add post ${safeLang}/${safeSlug}`);
  } else {
    await putGithubFile(
      newGithubPath,
      finalContent,
      existingFile
        ? `✏️ update post ${safeLang}/${safeSlug}`
        : `✨ add post ${safeLang}/${safeSlug}`,
      existingFile?.sha
    );
  }
};
