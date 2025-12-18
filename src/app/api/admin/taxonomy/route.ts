import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import YAML from 'yaml';

import type { CategoryMap, TagMap, CategoryNode, TagNode } from '@/types';
import { ensureEditorAuthorized } from '@/utils/adminApi';

const categoryFile = path.join(process.cwd(), 'content', 'categories.yaml');
const tagFile = path.join(process.cwd(), 'content', 'tags.yaml');

const taxonomyConfigPath = path.join(
  process.cwd(),
  'src',
  'config',
  'taxonomy.ts'
);

// 將 category list 轉成 flat map 給前端
const toCategoryMap = (categories: CategoryNode[]): CategoryMap =>
  categories.reduce<CategoryMap>((acc, category) => {
    // 轉換子分類為 slug → 子節點資料 map
    const subcategories = category.subcategories?.reduce<Record<string, any>>(
      (subAcc, sub) => {
        subAcc[sub.slug] = {
          name: sub.name,
          slug: sub.slug,
          color: sub.color,
        };
        return subAcc;
      },
      {}
    );

    // 主分類資料
    acc[category.slug] = {
      name: category.name,
      slug: category.slug,
      color: category.color,
      ...(subcategories ? { subcategories } : {}), // 有子分類才加
    };
    return acc;
  }, {});

// 將 tag 陣列轉成 slug → tag 物件 map
const toTagMap = (tags: TagNode[]): TagMap =>
  tags.reduce<TagMap>((acc, tag) => {
    acc[tag.slug] = { name: tag.name, slug: tag.slug };
    return acc;
  }, {});

// 產生 taxonomy.ts 給前端 import
const writeTaxonomyConfig = async (
  categories: CategoryNode[],
  tags: TagNode[]
) => {
  const categoryMap = toCategoryMap(categories);
  const tagMap = toTagMap(tags);

  const fileContent = `import type { CategoryMap, TagMap } from '@/types';

export const categoryMap: CategoryMap = ${JSON.stringify(categoryMap, null, 2)};

export const tagMap: TagMap = ${JSON.stringify(tagMap, null, 2)};
`;

  await fs.writeFile(taxonomyConfigPath, fileContent, 'utf8');
};

// 取得 taxonomy (categories + tags)
export const GET = async () => {
  // 僅限已登入的編輯者
  const unauthorized = await ensureEditorAuthorized();
  if (unauthorized) return unauthorized;

  try {
    // 同步讀取 YAML
    const [categoriesRaw, tagsRaw] = await Promise.all([
      fs.readFile(categoryFile, 'utf8'),
      fs.readFile(tagFile, 'utf8'),
    ]);

    const categories = YAML.parse(categoriesRaw)?.categories ?? [];
    const tags = YAML.parse(tagsRaw)?.tags ?? [];

    return NextResponse.json({ categories, tags });
  } catch {
    return NextResponse.json(
      { message: 'Failed to load taxonomy.' },
      { status: 500 }
    );
  }
};

// 儲存 taxonomy 並更新 YAML 與 TS config
export const PUT = async (req: Request) => {
  const unauthorized = await ensureEditorAuthorized();
  if (unauthorized) return unauthorized;

  try {
    const payload = await req.json();
    const { categories = [], tags = [] } = payload as {
      categories: CategoryNode[];
      tags: TagNode[];
    };

    // 轉成 YAML 字串
    const categoriesYaml = YAML.stringify({ categories });
    const tagsYaml = YAML.stringify({ tags });

    // 1. 寫回 YAML
    // 2. 寫回 TS config（categoryMap / tagMap）
    await Promise.all([
      fs.writeFile(categoryFile, categoriesYaml, 'utf8'),
      fs.writeFile(tagFile, tagsYaml, 'utf8'),
      writeTaxonomyConfig(categories, tags),
    ]);

    return NextResponse.json({ message: 'Taxonomy saved.' });
  } catch (err) {
    console.error('Failed to save taxonomy', err);
    return NextResponse.json(
      { message: 'Failed to save taxonomy.' },
      { status: 500 }
    );
  }
};
