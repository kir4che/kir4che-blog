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
  Category,
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
const CATEGORIES_CONTENT_PATH = path.join(
  process.cwd(),
  'content',
  'taxonomy',
  'categories.yaml'
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

const cloneTagMap = (): TagMap => structuredClone(originalTagMap);

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
    const content = await fs.readFile(TAGS_CONTENT_PATH, 'utf8');
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
    const content = await fs.readFile(CATEGORIES_CONTENT_PATH, 'utf8');
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

const main = async () => {
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
    let tag = tagMap[slug];
    if (!tag) {
      const fallbackName = pickName(cleanedNames, slug);
      tag = {
        slug,
        name: createNameRecord(fallbackName),
      };
      tagMap[slug] = tag;
      hasTagChanges = true;
    } else if (tag.slug !== slug) {
      tag.slug = slug;
      hasTagChanges = true;
    }

    const fallbackName = pickName(cleanedNames, tag.name.en ?? slug);

    if (ensureLocalizedNames(tag, cleanedNames, fallbackName))
      hasTagChanges = true;
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
