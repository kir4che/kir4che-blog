import 'tsconfig-paths/register';

import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

import { CONFIG } from '@/config';
import {
  categoryMap as originalTaxonomyMap,
  tagMap as originalTagMap,
} from '@/config/taxonomy';
import type {
  CategoryInfo,
  CategoryMap,
  Language,
  PostInfo,
  TagMap,
} from '@/types';
import { getPostsInfo } from '@/lib/posts';
import { convertToSlug } from '@/lib/tags';

const TAXONOMY_CONFIG_PATH = path.join(
  process.cwd(),
  'src',
  'config',
  'taxonomy.ts'
);
const SITE_DATA_PATH = path.join(
  process.cwd(),
  'src',
  'generated',
  'site-data.json'
);
const TAGS_CONTENT_PATH = path.join(
  process.cwd(),
  'content',
  'taxonomy',
  'tags.yaml'
);

const DEFAULT_COLOR = {
  light: '#999999',
  dark: '#4c4c4c',
};

const languages = [...CONFIG.languages.supportedLanguages];

const cloneCategoryMap = (): CategoryMap =>
  structuredClone(originalTaxonomyMap);
const cloneTagMap = (): TagMap => structuredClone(originalTagMap);

const toKey = (value: string) => value.trim().toLowerCase();

const buildMainNameMap = (map: CategoryMap) => {
  const result: Record<string, string> = {};
  Object.entries(map).forEach(([slug, category]) => {
    languages.forEach((lang) => {
      const name = category.name?.[lang];
      if (name) result[toKey(name)] = slug;
    });
    result[toKey(slug)] = slug;
  });
  return result;
};

const buildSubNameMap = (map: CategoryMap) => {
  const result: Record<string, Record<string, string>> = {};
  Object.entries(map).forEach(([parentSlug, category]) => {
    if (!category.subcategories) return;
    result[parentSlug] = result[parentSlug] ?? {};
    Object.entries(category.subcategories).forEach(([slug, sub]) => {
      languages.forEach((lang) => {
        const name = sub.name?.[lang];
        if (name) result[parentSlug][toKey(name)] = slug;
      });
      result[parentSlug][toKey(slug)] = slug;
    });
  });
  return result;
};

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

const ensureLocalizedNames = <
  T extends { name: Record<Language, string | undefined> },
>(
  target: T,
  namesByLang: Partial<Record<Language, string>>
) => {
  let updated = false;

  languages.forEach((lang) => {
    const current: string | undefined = target.name[lang];
    if (!current || current.trim() === '') {
      target.name[lang] = namesByLang[lang] ?? namesByLang.en ?? 'fallback';
      updated = true;
    }
  });

  return updated;
};

const loadTagNamesFromContent = async () => {
  try {
    const content = await fs.readFile(TAGS_CONTENT_PATH, 'utf8');
    const parsed = YAML.parse(content) as {
      tags?: Array<{
        slug?: string;
        name?: Partial<Record<Language, string>>;
      }>;
    };

    const map = new Map<string, Partial<Record<Language, string>>>();
    if (!parsed?.tags || !Array.isArray(parsed.tags)) return map;

    parsed.tags.forEach((tag) => {
      const slug = typeof tag?.slug === 'string' ? tag.slug.trim() : '';
      if (!slug) return;

      const names = tag?.name ?? {};
      const localized: Partial<Record<Language, string>> = {};

      languages.forEach((lang) => {
        const value = names?.[lang];
        if (typeof value === 'string' && value.trim())
          localized[lang] = value.trim();
      });

      if (Object.keys(localized).length > 0) map.set(slug, localized);
    });

    return map;
  } catch (error) {
    console.warn(
      '⚠️ 無法載入 tags.yaml：',
      error instanceof Error ? error.message : String(error)
    );
    return new Map<string, Partial<Record<Language, string>>>();
  }
};

const main = async () => {
  const categoryMap = cloneCategoryMap();
  const tagMap = cloneTagMap();

  const mainNameMap = buildMainNameMap(categoryMap);
  const subNameMap = buildSubNameMap(categoryMap);

  const postsByLang: Record<Language, PostInfo[]> = {} as Record<
    Language,
    PostInfo[]
  >;
  for (const lang of languages) {
    postsByLang[lang] = await getPostsInfo(lang);
  }

  const postsBySlug = new Map<string, Partial<Record<Language, PostInfo>>>();
  for (const lang of languages) {
    for (const post of postsByLang[lang]) {
      const entry = postsBySlug.get(post.slug) ?? {};
      entry[lang] = post;
      postsBySlug.set(post.slug, entry);
    }
  }

  let hasCategoryChanges = false;
  let hasTagChanges = false;

  const addMainName = (name: string, slug: string) => {
    mainNameMap[toKey(name)] = slug;
  };

  const addSubName = (parentSlug: string, name: string, slug: string) => {
    subNameMap[parentSlug] = subNameMap[parentSlug] ?? {};
    subNameMap[parentSlug][toKey(name)] = slug;
  };

  const resolveMainSlug = (namesByLang: Partial<Record<Language, string>>) => {
    for (const name of Object.values(namesByLang)) {
      if (!name) continue;
      const match = mainNameMap[toKey(name)];
      if (match) return match;
    }
    const preferred =
      namesByLang.en ??
      namesByLang[CONFIG.languages.defaultLanguage] ??
      Object.values(namesByLang)[0];
    return convertToSlug(preferred ?? 'uncategorized');
  };

  const resolveSubSlug = (
    parentSlug: string,
    namesByLang: Partial<Record<Language, string>>
  ) => {
    const map = subNameMap[parentSlug];
    if (map) {
      for (const name of Object.values(namesByLang)) {
        if (!name) continue;
        const match = map[toKey(name)];
        if (match) return match;
      }
    }
    const preferred =
      namesByLang.en ??
      namesByLang[CONFIG.languages.defaultLanguage] ??
      Object.values(namesByLang)[0];
    return convertToSlug(preferred ?? 'subcategory');
  };

  postsBySlug.forEach((variants) => {
    const namesByIndex: Array<Partial<Record<Language, string>>> = [];

    languages.forEach((lang) => {
      const categories = variants[lang]?.categories ?? [];
      categories.forEach((name, index) => {
        if (!name) return;
        namesByIndex[index] = namesByIndex[index] ?? {};
        namesByIndex[index]![lang] = name;
      });
    });

    if (namesByIndex.length === 0) return;

    const mainNames = namesByIndex[0]!;
    const mainSlug = resolveMainSlug(mainNames);

    let category = categoryMap[mainSlug];
    if (!category) {
      const fallbackName =
        mainNames[CONFIG.languages.defaultLanguage] ??
        mainNames.en ??
        Object.values(mainNames)[0] ??
        mainSlug;

      category = {
        name: {
          tw: fallbackName,
          en: fallbackName,
        },
        slug: mainSlug,
        color: { ...DEFAULT_COLOR },
      };
      categoryMap[mainSlug] = category;
      hasCategoryChanges = true;
    }

    if (ensureLocalizedNames(category, mainNames)) hasCategoryChanges = true;

    languages.forEach((lang) => {
      const name = category.name[lang];
      if (name) addMainName(name, mainSlug);
    });

    const subCategories = namesByIndex.slice(1);
    if (subCategories.length === 0) return;

    category.subcategories = category.subcategories ?? {};

    subCategories.forEach((names) => {
      if (!names) return;
      const subSlug = resolveSubSlug(mainSlug, names);
      let subCategory = category.subcategories![subSlug] as
        | CategoryInfo
        | undefined;

      if (!subCategory) {
        const fallbackName =
          names[CONFIG.languages.defaultLanguage] ??
          names.en ??
          Object.values(names)[0] ??
          subSlug;

        subCategory = {
          name: {
            tw: fallbackName,
            en: fallbackName,
          },
          slug: subSlug,
          color: { ...DEFAULT_COLOR },
        };
        category.subcategories![subSlug] = subCategory;
        hasCategoryChanges = true;
      }

      const fallbackName =
        names[CONFIG.languages.defaultLanguage] ??
        names.en ??
        Object.values(names)[0] ??
        subCategory.slug;

      if (ensureLocalizedNames(subCategory, names)) hasCategoryChanges = true;

      languages.forEach((lang) => {
        const name = subCategory!.name[lang];
        if (name) addSubName(mainSlug, name, subSlug);
      });
    });
  });

  const tagNamesBySlug = new Map<string, Partial<Record<Language, string>>>();

  for (const lang of languages) {
    for (const post of postsByLang[lang]) {
      post.tags?.forEach((tagName) => {
        if (!tagName) return;
        const slug = convertToSlug(tagName);
        const entry = tagNamesBySlug.get(slug) ?? {};
        entry[lang] = tagName;
        tagNamesBySlug.set(slug, entry);
      });
    }
  }

  const tagNamesFromContent = await loadTagNamesFromContent();
  tagNamesFromContent.forEach((names, slug) => {
    const current = tagNamesBySlug.get(slug) ?? {};
    tagNamesBySlug.set(slug, { ...current, ...names });
  });

  tagNamesBySlug.forEach((namesByLang, slug) => {
    let tag = tagMap[slug];
    if (!tag) {
      tag = {
        slug,
        name: {} as Record<Language, string>,
      };
      languages.forEach((lang) => {
        const candidate =
          namesByLang[lang] ??
          namesByLang[CONFIG.languages.defaultLanguage] ??
          namesByLang.en ??
          Object.values(namesByLang)[0] ??
          slug;
        tag.name[lang] = candidate ?? slug;
      });
      tagMap[slug] = tag;
      hasTagChanges = true;
    } else if (tag.slug !== slug) {
      tag.slug = slug;
      hasTagChanges = true;
    }

    const fallbackName =
      namesByLang.en ??
      namesByLang[CONFIG.languages.defaultLanguage] ??
      Object.values(namesByLang)[0] ??
      tag.name.en ??
      slug;

    if (!tag.name.en || tag.name.en.trim().length === 0) {
      const next = fallbackName || slug;
      if (tag.name.en !== next) {
        tag.name.en = next;
        hasTagChanges = true;
      }
    }

    languages.forEach((lang) => {
      if (lang === 'en') return;
      const provided = namesByLang[lang];
      if (provided && tag.name[lang] !== provided) {
        tag.name[lang] = provided;
        hasTagChanges = true;
        return;
      }
      if (!tag.name[lang] || tag.name[lang].trim().length === 0) {
        const next = fallbackName || slug;
        if (tag.name[lang] !== next) {
          tag.name[lang] = next;
          hasTagChanges = true;
        }
      }
    });
  });

  if (!hasCategoryChanges && !hasTagChanges) {
    console.log('ℹ️ 沒有需要更新的分類或標籤。');
    return;
  }

  const content = formatTaxonomyFile(categoryMap, tagMap);
  await fs.writeFile(TAXONOMY_CONFIG_PATH, `${content}\n`, 'utf8');

  await fs.mkdir(path.dirname(SITE_DATA_PATH), { recursive: true });

  // 更新 site-data.json
  const siteDataJson = {
    categories: Object.keys(categoryMap),
    tags: Object.keys(tagMap),
  };
  const siteDataContent = JSON.stringify(siteDataJson, null, 2);
  await fs.writeFile(SITE_DATA_PATH, `${siteDataContent}\n`, 'utf8');

  console.log('✅ 已更新分類、標籤設定與 site-data');
};

main().catch((error) => {
  console.error('❌ 同步分類與標籤時發生錯誤：', error);
  process.exitCode = 1;
});
