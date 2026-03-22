import type { AstroCookies } from 'astro';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

import { deleteGithubFile, getGithubFile, putGithubFile } from '@/lib/github';
import { isSupportedLanguage } from '@/lib/i18n';
import {
  getPostPassword,
  removePostPassword,
  renamePostPassword,
  setPostPassword,
} from '@/lib/post-passwords';
import type { AdminPost, Language, PostMeta } from '@/types';
import { parseToISODate } from '@/utils/date';

// 解析 YAML frontmatter
const parseFrontmatter = (source: string): { data: Record<string, any>; content: string } => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: source };
  return { data: (parseYaml(match[1]) as Record<string, any>) ?? {}, content: match[2] };
};

// 將內容與 metadata 組合成帶 frontmatter 的字串
const stringifyFrontmatter = (content: string, data: Record<string, any>): string =>
  `---\n${stringifyYaml(data)}---\n${content}`;

const ADMIN_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_SECONDS * 1000;
const POST_EXTENSION = '.mdx';

// 組合出單篇文章的完整路徑
const getPostFilePath = (lang: Language, slug: string): string =>
  path.join(getContentDir(), lang, `${slug}${POST_EXTENSION}`);

// 把檔名最後的 .mdx 拿掉，只留文章 slug。
const stripPostExtension = (filename: string): string =>
  filename.endsWith(POST_EXTENSION) ? filename.slice(0, -POST_EXTENSION.length) : filename;

const utf8 = new TextEncoder();
const utf8Decode = (b: Uint8Array) => new TextDecoder().decode(b);

const encodeBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

const encodeBase64UrlStr = (input: string): string => encodeBase64Url(utf8.encode(input));

const decodeBase64UrlStr = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return utf8Decode(Uint8Array.from(atob(padded), (c) => c.charCodeAt(0)));
};

const timingSafeEqual = (a: string, b: string): boolean => {
  const bytesA = utf8.encode(a);
  const bytesB = utf8.encode(b);
  if (bytesA.length !== bytesB.length) return false;
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
};

const hmacSign = async (secret: string, payload: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    utf8.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, utf8.encode(payload));
  return encodeBase64Url(new Uint8Array(sig));
};

// 取得 session 簽章用的 secret
const getSessionSecret = (): string => {
  if (import.meta.env.SESSION_SECRET) return import.meta.env.SESSION_SECRET;
  throw new Error('缺少 SESSION_SECRET');
};

// 驗證 admin 帳密
export const verifyAdminCredentials = (username?: string, password?: string): boolean => {
  if (!username || !password || !import.meta.env.ADMIN_USERNAME || !import.meta.env.ADMIN_PASSWORD)
    return false;
  return (
    timingSafeEqual(username, import.meta.env.ADMIN_USERNAME) &&
    timingSafeEqual(password, import.meta.env.ADMIN_PASSWORD)
  );
};

// 建立簽章後的 session cookie
const signSessionCookie = async (): Promise<string> => {
  const payload = JSON.stringify({ authenticated: true, exp: Date.now() + SESSION_MAX_AGE_MS });
  const hmac = await hmacSign(getSessionSecret(), payload);
  return `${encodeBase64UrlStr(payload)}.${hmac}`;
};

// 驗證 session cookie
const verifySessionCookie = async (cookieValue?: string | null): Promise<boolean> => {
  if (!cookieValue) return false;
  const [payloadB64, signature] = cookieValue.split('.');
  if (!payloadB64 || !signature) return false;

  try {
    const payload = decodeBase64UrlStr(payloadB64);
    const expectedSignature = await hmacSign(getSessionSecret(), payload);
    if (!timingSafeEqual(signature, expectedSignature)) return false;
    const parsed = JSON.parse(payload);
    return parsed.authenticated === true && parsed.exp > Date.now();
  } catch {
    return false;
  }
};

// 是否已登入後台
export const isAuthenticated = (cookies: AstroCookies): Promise<boolean> =>
  verifySessionCookie(cookies.get(ADMIN_COOKIE_NAME)?.value);

// 設定 admin session cookie
export const setAdminSessionCookie = async (cookies: AstroCookies) => {
  cookies.set(ADMIN_COOKIE_NAME, await signSessionCookie(), {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
};

// 清除 admin session cookie
export const clearAdminSessionCookie = (cookies: AstroCookies) => {
  cookies.delete(ADMIN_COOKIE_NAME, { path: '/' });
};

// 驗證路徑 segment（防止 path traversal）
const sanitizeSegment = (input: string): string => {
  if (!/^[a-z0-9-_]+$/i.test(input)) throw new Error('無效的路徑片段');
  return input;
};

// 檢查是否為支援的語系
const sanitizeLanguage = (input: string): Language => {
  const sanitized = sanitizeSegment(input);
  if (!isSupportedLanguage(sanitized)) throw new Error('不支援的語言');
  return sanitized;
};

// 把不確定格式的 tags/categories 轉為乾淨的字串陣列
const toStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
    : [];

// 統一建立 metadata
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
  showUpdatedAt: !!data.showUpdatedAt,
  updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
});

// 取得所有文章
export const getAdminPosts = async (): Promise<AdminPost[]> => {
  try {
    const langs = await fs.readdir(getContentDir());
    const posts = await Promise.all(
      langs.filter(isSupportedLanguage).map(async (lang) => {
        const langDir = path.join(getContentDir(), lang);
        const files = await fs.readdir(langDir);

        return Promise.all(
          files
            .filter((file) => file.endsWith(POST_EXTENSION)) // 只找 .mdx 檔
            .map(async (file) => {
              const slug = stripPostExtension(file);
              const fullPath = path.join(langDir, file);
              const { data, content } = matter(await fs.readFile(fullPath, 'utf-8'));

              return {
                id: `${lang}/${slug}`,
                lang,
                slug,
                meta: buildMeta(data, slug, lang),
                content,
                fullPath,
              };
            })
        );
      })
    );
    return posts.flat().sort((a, b) => b.meta.date.localeCompare(a.meta.date));
  } catch (err: any) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
};

// 解析文章的 ID
const parseAdminPostId = (id: string) => {
  const parts = id.split('/');
  return parts.length === 2
    ? { safeLang: sanitizeLanguage(parts[0]), safeSlug: sanitizeSegment(parts[1]) }
    : null;
};

// 取得單篇文章
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

// 儲存文章
export const saveAdminPost = async (
  lang: string,
  slug: string,
  meta: Partial<PostMeta>,
  content: string,
  oldSlug?: string // 若傳了舊的 slug，代表有改 slug。
) => {
  const safeLang = sanitizeLanguage(lang);
  const safeSlug = sanitizeSegment(slug);
  const newFullPath = getPostFilePath(safeLang, safeSlug);
  const isRenaming = oldSlug && oldSlug !== slug;
  const safeOldSlug = isRenaming ? sanitizeSegment(oldSlug) : undefined;
  const targetReadPath = isRenaming ? getPostFilePath(safeLang, safeOldSlug!) : newFullPath;

  const existingFile = await getGithubFile(sourceGithubPath);
  const existingMeta: Record<string, any> = existingFile
    ? parseFrontmatter(existingFile.content).data
    : {};

  const baseMeta = buildMeta(existingMeta, safeSlug, safeLang);
  const showUpdatedAt = meta.showUpdatedAt ?? baseMeta.showUpdatedAt;

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

  // 文章密碼保護
  const postId = `${safeLang}/${safeSlug}`;
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

  // 設定新的封面圖片
  if (meta.coverImage !== undefined) {
    if (meta.coverImage.trim()) {
      finalMeta.coverImage = meta.coverImage.trim();
    } else {
      delete finalMeta.coverImage;
    }
  }

  // 處理改名時同步修改 CDN 封面 URL (如果封面圖剛好指向舊的 slug)
  if (
    isRenaming &&
    safeOldSlug &&
    finalMeta.coverImage === `https://cdn.kir4che.com/${safeOldSlug}/cover.webp`
  ) {
    finalMeta.coverImage = `https://cdn.kir4che.com/${safeSlug}/cover.webp`;
  }

  if (showUpdatedAt) finalMeta.updatedAt = new Date().toISOString();
  else delete finalMeta.updatedAt;

  const finalContent = stringifyFrontmatter(content, finalMeta);

  if (isRenaming && safeOldSlug) {
    await fs.rm(targetReadPath, { force: true });
  }
};

// 刪除文章
export const deleteAdminPost = async (id: string) => {
  const ids = parseAdminPostId(id);
  if (ids) await fs.rm(getPostFilePath(ids.safeLang, ids.safeSlug), { force: true });
};

// GitHub 文章路徑
const getGithubFilePath = (lang: Language, slug: string): string =>
  `src/content/blog/${lang}/${slug}${POST_EXTENSION}`;

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
  const newGithubPath = getGithubFilePath(safeLang, safeSlug);
  const isRenaming = oldSlug && oldSlug !== slug;
  const safeOldSlug = isRenaming ? sanitizeSegment(oldSlug) : undefined;
  const sourceGithubPath = isRenaming ? getGithubFilePath(safeLang, safeOldSlug!) : newGithubPath;

  const existingFile = await getGithubFile(sourceGithubPath);
  const existingMeta: Record<string, any> = existingFile ? matter(existingFile.content).data : {};

  const baseMeta = buildMeta(existingMeta, safeSlug, safeLang);
  const showUpdatedAt = meta.showUpdatedAt ?? baseMeta.showUpdatedAt;

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

  const postId = `${safeLang}/${safeSlug}`;
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

  if (
    isRenaming &&
    safeOldSlug &&
    finalMeta.coverImage === `https://cdn.kir4che.com/${safeOldSlug}/cover.webp`
  )
    finalMeta.coverImage = `https://cdn.kir4che.com/${safeSlug}/cover.webp`;

  if (showUpdatedAt) finalMeta.updatedAt = new Date().toISOString();
  else delete finalMeta.updatedAt;

  const finalContent = matter.stringify(content, finalMeta);

  if (isRenaming && safeOldSlug && existingFile) {
    await deleteGithubFile(
      sourceGithubPath,
      `chore: rename ${safeLang}/${safeOldSlug} → ${safeSlug}`,
      existingFile.sha
    );
    await putGithubFile(newGithubPath, finalContent, `feat: add post ${safeLang}/${safeSlug}`);
  } else
    await putGithubFile(
      newGithubPath,
      finalContent,
      existingFile
        ? `chore: update post ${safeLang}/${safeSlug}`
        : `feat: add post ${safeLang}/${safeSlug}`,
      existingFile?.sha
    );
};

// 取得複製文章的下一個 slug
export const getNextCopySlug = (slug: string, existingSlugs: string[]): string => {
  // 找出最原始的檔名
  const baseSlug = slug.replace(/-copy-\d+$/i, '');
  const matcher = new RegExp(
    `^${baseSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-copy-(\\d+)$`,
    'i'
  );

  const maxSuffix = existingSlugs.reduce((max, candidate) => {
    const match = candidate.match(matcher);
    // 找出目前最大的是 -copy- 多少
    return match ? Math.max(max, parseInt(match[1], 10) || 0) : max;
  }, 0);

  return `${baseSlug}-copy-${maxSuffix + 1}`;
};
