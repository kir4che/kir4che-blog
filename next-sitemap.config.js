const path = require('path');
process.env.TS_NODE_PROJECT = path.join(
  __dirname,
  'scripts/tsconfig.scripts.json'
);
require('ts-node/register');
require('tsconfig-paths/register');

const { LANGUAGES, DEFAULT_LANGUAGE } = require('./src/config');
const { getPostsInfo } = require('./src/lib/posts');
const { getTagsByPosts } = require('./src/lib/tags');
const { getAllCategoryByPosts } = require('./src/lib/categories');
const { getLocalizedPostPath } = require('./src/lib/paths');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

// 把日期轉成 ISO 格式
const toLastmod = (value, fallbackIso) => {
  if (value) {
    const d = value instanceof Date ? value : new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return fallbackIso;
};

// 產出多語系 URL 清單
const createLocalizedEntries = (
  baseUrl,
  items,
  getPath,
  getExtras,
  languages = LANGUAGES
) =>
  languages.flatMap((lang) =>
    items.map((item) => {
      const extras = getExtras(item, lang) || {};
      return { loc: `${baseUrl}${getPath(lang, item)}`, ...extras };
    })
  );

// 為單一內容建立 hreflang 陣列
const altRefsFor = (getPath) =>
  LANGUAGES.map((lang) => ({
    href: `${SITE_URL}${getPath(lang)}`,
    hreflang: lang,
  }));

// 產出共用的 sitemap extras
const i18nExtras = (lastmod, changefreq, priority, getPath) => ({
  lastmod,
  changefreq,
  priority,
  alternateRefs: altRefsFor(getPath),
});

// 子分類正規化為陣列
const normalizeSubcategories = (category) => {
  const { subcategories } = category || {};
  if (!subcategories) return [];
  return Array.isArray(subcategories)
    ? subcategories
    : Object.values(subcategories);
};

const buildSitemapFields = async () => {
  const nowIso = new Date().toISOString();

  // 靜態頁
  const staticPaths = createLocalizedEntries(
    SITE_URL,
    ['', '/about', '/posts', '/tags'],
    (lang, route) => `/${lang}${route}`,
    (route, _lang) => i18nExtras(nowIso, 'weekly', 0.7, (l) => `/${l}${route}`)
  );

  // 文章頁（多語系）
  const localizedPosts = (
    await Promise.all(LANGUAGES.map((lang) => getPostsInfo(lang)))
  ).flat();

  const postFields = localizedPosts.map((post) => {
    const pathFor = (lang) =>
      getLocalizedPostPath({ lang, date: post.date, slug: post.slug });
    return {
      loc: `${SITE_URL}${pathFor(post.lang)}`,
      ...i18nExtras(
        toLastmod(post.updatedAt || post.date, nowIso),
        'weekly',
        0.8,
        pathFor
      ),
    };
  });

  // 用預設語系生成 tags / categories / subcategories
  const defaultPosts = localizedPosts.filter(
    ({ lang }) => lang === DEFAULT_LANGUAGE
  );

  // 標籤（/tags/...）
  const tags = getTagsByPosts(defaultPosts);
  const tagFields = createLocalizedEntries(
    SITE_URL,
    tags,
    (lang, tag) => `/${lang}/tags/${encodeURIComponent(tag.slug)}`,
    (tag) =>
      i18nExtras(
        nowIso,
        'monthly',
        0.6,
        (l) => `/${l}/tags/${encodeURIComponent(tag.slug)}`
      )
  );

  // 分類頁（/categories/...）
  const categories = await getAllCategoryByPosts(defaultPosts);
  const categoryFields = createLocalizedEntries(
    SITE_URL,
    categories,
    (lang, c) => `/${lang}/categories/${encodeURIComponent(c.slug)}`,
    (c) =>
      i18nExtras(
        nowIso,
        'monthly',
        0.6,
        (l) => `/${l}/categories/${encodeURIComponent(c.slug)}`
      )
  );

  // 子分類頁（/categories/.../...）
  const subcategoryEntries = categories.flatMap((c) =>
    normalizeSubcategories(c).map((sub) => ({
      parentSlug: c.slug,
      slug: sub.slug,
    }))
  );
  const subcategoryFields = createLocalizedEntries(
    SITE_URL,
    subcategoryEntries,
    (lang, s) =>
      `/${lang}/categories/${encodeURIComponent(s.parentSlug)}/${encodeURIComponent(s.slug)}`,
    (s) =>
      i18nExtras(
        nowIso,
        'monthly',
        0.5,
        (l) =>
          `/${l}/categories/${encodeURIComponent(s.parentSlug)}/${encodeURIComponent(s.slug)}`
      )
  );

  return [
    ...staticPaths,
    ...postFields,
    ...tagFields,
    ...categoryFields,
    ...subcategoryFields,
  ];
};

// next-sitemap 會讀這個設定檔並自動生成 sitemap
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true, // 自動生成 robots.txt
  transform: async () => null, // 不修改預設路徑格式
  additionalPaths: async () => buildSitemapFields(), // 自訂動態 sitemap entry
};
