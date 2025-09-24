import 'tsconfig-paths/register';

import fs from 'fs/promises';
import path from 'path';

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

const ensureLocalizedNames = <T extends { name: Record<Language, string> }>(
  target: T,
  namesByLang: Partial<Record<Language, string>>,
  fallback: string
) => {
  let updated = false;
  languages.forEach((lang) => {
    const existing = target.name?.[lang];
    const provided = namesByLang[lang];
    const fallbackValue =
      namesByLang[CONFIG.languages.defaultLanguage] ??
      namesByLang.en ??
      namesByLang.tw ??
      fallback;

    if (!existing) {
      target.name[lang] = provided ?? fallbackValue;
      updated = true;
      return;
    }

    if (provided && provided !== existing && existing === fallbackValue) {
      target.name[lang] = provided;
      updated = true;
    }
  });
  return updated;
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

    const fallbackMainName =
      mainNames[CONFIG.languages.defaultLanguage] ??
      mainNames.en ??
      Object.values(mainNames)[0] ??
      category.slug;

    if (ensureLocalizedNames(category, mainNames, fallbackMainName)) {
      hasCategoryChanges = true;
    }

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

      if (ensureLocalizedNames(subCategory, names, fallbackName)) {
        hasCategoryChanges = true;
      }

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

  tagNamesBySlug.forEach((namesByLang, slug) => {
    let tag = tagMap[slug];
    if (!tag) {
      tag = {
        slug,
        name: {} as Record<Language, string>,
      };
      tagMap[slug] = tag;
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
      if (tag.name[lang] === undefined) {
        tag.name[lang] = '';
        hasTagChanges = true;
      }
    });
  });

  if (!hasCategoryChanges && !hasTagChanges) {
    console.log('ℹ️ 沒有需要更新的分類或標籤。');
    return;
  }

  const content = formatTaxonomyFile(categoryMap, tagMap);
  await fs.writeFile(TAXONOMY_CONFIG_PATH, `${content}\n`, 'utf8');
  console.log('✅ 已更新分類與標籤設定。');
};

main().catch((error) => {
  console.error('❌ 同步分類與標籤時發生錯誤：', error);
  process.exitCode = 1;
});
