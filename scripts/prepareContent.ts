import 'tsconfig-paths/register';

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import YAML from 'yaml';
import matter from 'gray-matter';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { getPlaiceholder } from 'plaiceholder';
import { execSync } from 'child_process';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { CONFIG } from '@/config';
import type {
  Language,
  PostInfo,
  Category,
  CategoryInfo,
  CategoryMap,
  TagMap,
  Tag,
} from '@/types';
import { getPostsInfo } from '@/lib/posts';
import { getAllCategoryByPosts } from '@/lib/categories';
import { getTagsByPosts, convertToSlug } from '@/lib/tags';

const PROJECT_ROOT = process.cwd();
const POSTS_DIRECTORY = path.join(PROJECT_ROOT, 'src', 'posts');
const IMAGE_META_OUTPUT = path.join(PROJECT_ROOT, 'public', 'imageMetas.json');
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

type ImageMeta = {
  src: string;
  blurDataURL: string;
  originalWidth?: number;
  originalHeight?: number;
};

// 圖片模糊資料
const getMediaMeta = async (src: string): Promise<ImageMeta | null> => {
  const mediaPath = path.join(PROJECT_ROOT, 'public', src);
  const fileExtension = path.extname(mediaPath).toLowerCase();

  if (!VALID_IMAGE_EXTENSIONS.includes(fileExtension)) return null;

  const buffer = await fsp.readFile(mediaPath);
  const { base64, img, metadata }: any = await getPlaiceholder(buffer);
  return {
    src: '/' + src.replace(/^\/+/, ''),
    blurDataURL: base64,
    originalWidth: img?.width ?? metadata?.width ?? undefined,
    originalHeight: img?.height ?? metadata?.height ?? undefined,
  };
};

const extractImageSrcs = (content: string): Set<string> => {
  const imageRegex =
    /!\[[^\]]*]\((\/[^)]+)\)|<(?:CustomImage|Image|img)[^>]*\s+src=["'](\/[^"']+)["']|src\s*[:=]\s*["'](\/[^"']+)["']/g;

  const srcs = new Set<string>();
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const src = match[1] || match[2] || match[3];
    if (src?.startsWith('/')) srcs.add(src);
  }

  return srcs;
};

const generateImageMetas = async () => {
  const slugs = await fsp.readdir(POSTS_DIRECTORY);
  const allImageSrcs = new Set<string>();

  for (const slug of slugs) {
    const dir = path.join(POSTS_DIRECTORY, slug);
    const files = await fsp.readdir(dir);
    const file = files.find((f) => f === 'index.mdx' || f === 'index.en.mdx');
    if (!file) continue;

    const content = await fsp.readFile(path.join(dir, file), 'utf-8');
    const { content: mdxContent } = matter(content);
    const imageSrcs = extractImageSrcs(mdxContent);
    imageSrcs.forEach((src) => allImageSrcs.add(src));
  }

  const imageMetas: Record<string, ImageMeta> = {};

  for (const src of allImageSrcs) {
    try {
      const meta = await getMediaMeta(src.slice(1));
      if (meta) imageMetas[src] = meta;
    } catch (err) {
      console.error(`❌ 無法生成圖片 ${src}：`, err);
    }
  }

  await fsp.writeFile(IMAGE_META_OUTPUT, JSON.stringify(imageMetas, null, 2));
  console.log(`✅ 圖片 meta 已生成於：${IMAGE_META_OUTPUT}`);
};

// 文章字數
const getAllPostFiles = async () => {
  const files: string[] = [];

  const walk = async (dir: string) => {
    const dirents = await fsp.readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) await walk(fullPath);
      else if (fullPath.endsWith('.mdx')) files.push(fullPath);
    }
  };

  await walk(POSTS_DIRECTORY);
  return files;
};

const getChangedMdxFiles = (): string[] => {
  const output = execSync('git diff HEAD --name-only --diff-filter=ACM', {
    encoding: 'utf8',
  });

  return output
    .split('\n')
    .filter((file) => file.endsWith('.mdx') && fs.existsSync(file));
};

const calculateWordCount = async (content: string) => {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(content);

  let textContent = '';
  visit(tree, 'text', (node) => {
    textContent += node.value + ' ';
  });

  const chineseChars = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length;

  const englishWords = textContent
    .replace(/[\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter((word) => word.trim().length > 0).length;

  return chineseChars + englishWords;
};

const updateWordCount = async (filePath: string) => {
  const fileContents = await fsp.readFile(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  const wordCount = await calculateWordCount(content);

  if (data.wordCount !== wordCount) {
    const updatedContent = matter.stringify(content, { ...data, wordCount });
    await fsp.writeFile(filePath, updatedContent, 'utf8');
    console.log(`✅ 已更新文章字數：${filePath}`);
  } else console.log(`ℹ️ 文章字數無變更：${filePath}`);
};

const updateWordCounts = async (mode: 'all' | 'changed' = 'all') => {
  const files =
    mode === 'all' ? await getAllPostFiles() : await getChangedMdxFiles();

  if (files.length === 0) {
    console.log('ℹ️ 沒有需要更新的文章。');
    return;
  }

  for (const filePath of files) await updateWordCount(filePath);
};

// 分類與標籤
const TAXONOMY_CONFIG_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'config',
  'taxonomy.ts'
);
const CATEGORIES_CONTENT_PATH = path.join(
  PROJECT_ROOT,
  'content',
  'categories.yaml'
);
const SITE_DATA_PATH = path.join(
  PROJECT_ROOT,
  'src',
  'generated',
  'site-data.json'
);
const TAGS_CONTENT_PATH = path.join(PROJECT_ROOT, 'content', 'tags.yaml');

const DEFAULT_COLOR = {
  light: '#999999',
  dark: '#4c4c4c',
};

const languages: Language[] = [...CONFIG.languages.supportedLanguages];

type LocalizedNames = Partial<Record<Language, string>>;

const cleanLocalizedNames = (names?: LocalizedNames): LocalizedNames => {
  const cleaned: LocalizedNames = {};
  languages.forEach((lang) => {
    const raw = names?.[lang];
    if (typeof raw !== 'string') return;
    const trimmed = raw.trim();
    if (trimmed) cleaned[lang] = trimmed;
  });
  return cleaned;
};

const pickName = (names: LocalizedNames, fallback?: string) => {
  const trimmedFallback =
    typeof fallback === 'string' && fallback.trim().length > 0
      ? fallback.trim()
      : undefined;
  return (
    names[CONFIG.languages.defaultLanguage] ??
    names.en ??
    Object.values(names).find(Boolean) ??
    trimmedFallback ??
    'fallback'
  );
};

const createNameRecord = (value: string): Record<Language, string> =>
  languages.reduce(
    (acc, lang) => {
      acc[lang] = value;
      return acc;
    },
    {} as Record<Language, string>
  );

const ensureLocalizedNames = <T extends { name: Record<Language, string> }>(
  target: T,
  names: LocalizedNames,
  fallbackHint: string
) => {
  const cleaned = cleanLocalizedNames(names);
  const fallback = pickName(cleaned, fallbackHint);
  let updated = false;

  languages.forEach((lang) => {
    const provided = cleaned[lang];
    if (provided && target.name[lang] !== provided) {
      target.name[lang] = provided;
      updated = true;
      return;
    }

    const current = target.name[lang];
    if (!current || current.trim().length === 0) {
      if (current !== fallback) {
        target.name[lang] = fallback;
        updated = true;
      }
    }
  });

  return updated;
};

const ensureColor = (
  current: { light: string; dark: string } | undefined,
  next?: Partial<{ light: string; dark: string }>
) => {
  const pick = (value?: string, fallback?: string) => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
    return fallback;
  };

  return {
    light: pick(next?.light, current?.light) ?? DEFAULT_COLOR.light,
    dark: pick(next?.dark, current?.dark) ?? DEFAULT_COLOR.dark,
  };
};

const sortKeys = (input: unknown): unknown => {
  if (Array.isArray(input)) return input.map(sortKeys);
  if (input && typeof input === 'object') {
    return Object.keys(input as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((input as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return input;
};

const cloneTagMap = (): TagMap =>
  structuredClone((require('@/config/taxonomy') as { tagMap: TagMap }).tagMap);

const quote = (value: string) =>
  `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const formatCategoryMap = (map: CategoryMap): string => {
  const lines: string[] = [];
  lines.push('export const categoryMap: CategoryMap = {');

  Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([slug, category]) => {
      lines.push(`  ${slug}: {`);
      lines.push('    name: {');
      languages.forEach((lang) => {
        lines.push(`      ${lang}: ${quote(category.name[lang])},`);
      });
      lines.push('    },');
      lines.push(`    slug: ${quote(category.slug)},`);
      lines.push('    color: {');
      lines.push(`      light: ${quote(category.color.light)},`);
      lines.push(`      dark: ${quote(category.color.dark)},`);
      lines.push('    },');

      const subcategories = category.subcategories;
      if (subcategories && Object.keys(subcategories).length > 0) {
        lines.push('    subcategories: {');
        Object.entries(subcategories)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([subSlug, sub]) => {
            lines.push(`      ${subSlug}: {`);
            lines.push('        name: {');
            languages.forEach((lang) => {
              lines.push(`          ${lang}: ${quote(sub.name[lang])},`);
            });
            lines.push('        },');
            lines.push(`        slug: ${quote(sub.slug)},`);
            lines.push('        color: {');
            lines.push(`          light: ${quote(sub.color.light)},`);
            lines.push(`          dark: ${quote(sub.color.dark)},`);
            lines.push('        },');
            lines.push('      },');
          });
        lines.push('    },');
      }

      lines.push('  },');
    });

  lines.push('};');
  return lines.join('\n');
};

const formatTagMap = (map: TagMap): string => {
  const lines: string[] = [];
  lines.push('export const tagMap: TagMap = {');

  Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([slug, tag]) => {
      lines.push(`  ${slug}: {`);
      lines.push('    name: {');
      languages.forEach((lang) => {
        lines.push(`      ${lang}: ${quote(tag.name[lang] ?? '')},`);
      });
      lines.push('    },');
      lines.push(`    slug: ${quote(tag.slug)},`);
      lines.push('  },');
    });

  lines.push('};');
  return lines.join('\n');
};

const formatTaxonomyFile = (categories: CategoryMap, tags: TagMap): string => {
  const sections = [
    "import type { CategoryMap, TagMap } from '@/types';",
    '',
    formatCategoryMap(categories),
    '',
    formatTagMap(tags),
    '',
  ];

  return sections.join('\n');
};

const loadTagNamesFromContent = async () => {
  try {
    const content = await fsp.readFile(TAGS_CONTENT_PATH, 'utf8');
    const parsed = YAML.parse(content) as {
      tags?: Array<{
        slug?: string;
        name?: LocalizedNames;
      }>;
    };

    const map = new Map<string, LocalizedNames>();
    if (!parsed?.tags || !Array.isArray(parsed.tags)) return map;

    parsed.tags.forEach((tag) => {
      const slug = typeof tag?.slug === 'string' ? tag.slug.trim() : '';
      if (!slug) return;

      const localized = cleanLocalizedNames(tag?.name);
      if (Object.keys(localized).length > 0) map.set(slug, localized);
    });

    return map;
  } catch (err) {
    console.warn(
      '⚠️ 無法載入 tags.yaml：',
      err instanceof Error ? err.message : String(err)
    );
    return new Map<string, LocalizedNames>();
  }
};

type CategoryDefinition = {
  slug?: string;
  name?: LocalizedNames;
  color?: Partial<{ light: string; dark: string }>;
  subcategories?: Array<{
    slug?: string;
    name?: LocalizedNames;
    color?: Partial<{ light: string; dark: string }>;
  }>;
};

const loadCategoryDefinitions = async (): Promise<CategoryDefinition[]> => {
  try {
    const content = await fsp.readFile(CATEGORIES_CONTENT_PATH, 'utf8');
    const parsed = YAML.parse(content) as { categories?: CategoryDefinition[] };
    if (!parsed?.categories || !Array.isArray(parsed.categories)) return [];
    return parsed.categories;
  } catch (err) {
    console.warn(
      '⚠️ 無法載入 categories.yaml：',
      err instanceof Error ? err.message : String(err)
    );
    return [];
  }
};

const buildCategoryMapFromDefinitions = (
  definitions: CategoryDefinition[]
): CategoryMap => {
  const sortedDefinitions = [...definitions].sort((a, b) => {
    const aSlug = a.slug?.trim() ?? '';
    const bSlug = b.slug?.trim() ?? '';
    return aSlug.localeCompare(bSlug);
  });

  const map: CategoryMap = {};

  sortedDefinitions.forEach((definition) => {
    const slug = definition.slug?.trim();
    if (!slug) return;

    const categoryNames = cleanLocalizedNames(definition.name);
    const fallbackCategoryName = pickName(categoryNames, slug);

    const category: Category = {
      name: createNameRecord(fallbackCategoryName),
      slug,
      color: ensureColor(undefined, definition.color),
    };

    ensureLocalizedNames(category, definition.name ?? {}, fallbackCategoryName);

    const sortedSubcategories = [...(definition.subcategories ?? [])].sort(
      (a, b) => (a.slug?.trim() ?? '').localeCompare(b.slug?.trim() ?? '')
    );

    if (sortedSubcategories.length > 0) {
      category.subcategories = {};

      sortedSubcategories.forEach((subDefinition) => {
        const subSlug = subDefinition.slug?.trim();
        if (!subSlug) return;

        const subNames = cleanLocalizedNames(subDefinition.name);
        const fallbackSubName = pickName(subNames, subSlug);

        const subCategory: CategoryInfo = {
          name: createNameRecord(fallbackSubName),
          slug: subSlug,
          color: ensureColor(undefined, subDefinition.color),
        };

        ensureLocalizedNames(
          subCategory,
          subDefinition.name ?? {},
          fallbackSubName
        );

        category.subcategories![subSlug] = subCategory;
      });
    }

    map[slug] = category;
  });

  return map;
};

const syncTaxonomy = async () => {
  const { categoryMap: originalTaxonomyMap } = require('@/config/taxonomy') as {
    categoryMap: CategoryMap;
  };

  const categoryDefinitions = await loadCategoryDefinitions();
  const categoryMap = buildCategoryMapFromDefinitions(categoryDefinitions);
  const tagMap = cloneTagMap();

  const hasCategoryChanges =
    JSON.stringify(sortKeys(categoryMap)) !==
    JSON.stringify(sortKeys(originalTaxonomyMap));

  const postsByLang: Record<Language, PostInfo[]> = {} as Record<
    Language,
    PostInfo[]
  >;
  for (const lang of languages) {
    const postsResult = await getPostsInfo(lang);
    postsByLang[lang] = Array.isArray(postsResult) ? postsResult : [];
  }
  let hasTagChanges = false;

  const tagNamesBySlug = new Map<string, LocalizedNames>();

  for (const lang of languages) {
    for (const post of postsByLang[lang]) {
      post.tags?.forEach((tagName) => {
        const trimmed = typeof tagName === 'string' ? tagName.trim() : '';
        if (!trimmed) return;
        const slug = convertToSlug(trimmed);
        const entry = tagNamesBySlug.get(slug) ?? {};
        entry[lang] = trimmed;
        tagNamesBySlug.set(slug, entry);
      });
    }
  }

  const tagNamesFromContent = await loadTagNamesFromContent();
  tagNamesFromContent.forEach((names, slug) => {
    const current = tagNamesBySlug.get(slug) ?? {};
    const merged: LocalizedNames = {
      ...current,
      ...cleanLocalizedNames(names),
    };
    tagNamesBySlug.set(slug, merged);
  });

  tagNamesBySlug.forEach((namesByLang, slug) => {
    const cleanedNames = cleanLocalizedNames(namesByLang);
    const existing = tagMap[slug];

    if (!existing) {
      const fallbackName = pickName(cleanedNames, slug);
      tagMap[slug] = {
        slug,
        name: createNameRecord(fallbackName),
      };
      hasTagChanges = true;
    } else if (existing.slug !== slug) {
      existing.slug = slug;
      hasTagChanges = true;
    }

    const tag = tagMap[slug];
    if (!tag) return;

    const fallbackName = pickName(cleanedNames, tag.name.en ?? slug);

    if (ensureLocalizedNames(tag, cleanedNames, fallbackName))
      hasTagChanges = true;
  });

  if (!hasCategoryChanges && !hasTagChanges) {
    console.log('ℹ️ 沒有需要更新的分類或標籤。');
    return;
  }

  const content = formatTaxonomyFile(categoryMap, tagMap);
  await fsp.writeFile(TAXONOMY_CONFIG_PATH, `${content}\n`, 'utf8');

  await fsp.mkdir(path.dirname(SITE_DATA_PATH), { recursive: true });

  const siteDataJson = {
    categories: Object.keys(categoryMap),
    tags: Object.keys(tagMap),
  };
  const siteDataContent = JSON.stringify(siteDataJson, null, 2);
  await fsp.writeFile(SITE_DATA_PATH, `${siteDataContent}\n`, 'utf8');

  console.log('✅ 已更新分類、標籤設定與 site-data');
};

// 站台資料
const generateSiteData = async () => {
  const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src', 'generated');
  const OUTPUT_PATH = path.join(OUTPUT_DIR, 'site-data.json');

  const languages = CONFIG.languages.supportedLanguages;
  const data = {} as Record<
    Language,
    {
      posts: PostInfo[];
      categories: Category[];
      tags: Array<Pick<Tag, 'name' | 'slug' | 'postCount'>>;
      popularPosts: Array<{ slug: string; title: string }>;
    }
  >;

  for (const lang of languages) {
    const postsResult = await getPostsInfo(lang);
    const posts: PostInfo[] = Array.isArray(postsResult) ? postsResult : [];

    const categories = getAllCategoryByPosts(posts);
    const tags = getTagsByPosts(posts, undefined, lang).map(
      ({ name, slug, postCount }) => ({
        name,
        slug,
        postCount,
      })
    );
    const popularPosts = posts
      .filter((post) => post.featured)
      .slice(0, 5)
      .map(({ slug, title }) => ({ slug, title: title ?? slug }));

    data[lang] = {
      posts,
      categories,
      tags,
      popularPosts,
    };
  }

  await fsp.mkdir(OUTPUT_DIR, { recursive: true });
  const content = JSON.stringify(data, null, 2);
  await fsp.writeFile(OUTPUT_PATH, `${content}\n`, 'utf8');
  console.log(`✅ 站台資料已更新：${OUTPUT_PATH}`);
};

// Orchestration
const STEPS: Array<{ label: string; action: () => Promise<void> }> = [
  {
    label: 'ℹ️ 產生圖片模糊資料中…',
    action: generateImageMetas,
  },
  {
    label: 'ℹ️ 更新文章字數統計…',
    action: () => updateWordCounts('all'),
  },
  {
    label: 'ℹ️ 同步分類與標籤…',
    action: syncTaxonomy,
  },
  {
    label: 'ℹ️ 更新站台資料 JSON…',
    action: generateSiteData,
  },
];

const main = async () => {
  try {
    for (const step of STEPS) {
      console.log(step.label);
      await step.action();
    }
    console.log('✅ 內容準備完成。');
  } catch (err) {
    console.error('❌ 準備內容時發生錯誤：', err);
    process.exitCode = 1;
  }
};

main();
