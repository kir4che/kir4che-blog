import 'tsconfig-paths/register';

import fs from 'fs/promises';
import path from 'path';

import { CONFIG } from '@/config';
import type { Language, PostInfo, Category, Tag } from '@/types';
import { getPostsInfo } from '@/lib/posts';
import { getAllCategoryByPosts } from '@/lib/categories';
import { getTagsByPosts } from '@/lib/tags';

interface SiteDataEntry {
  posts: PostInfo[];
  categories: Category[];
  tags: Array<Pick<Tag, 'name' | 'slug' | 'postCount'>>;
  popularPosts: Array<{ slug: string; title: string }>;
}

type SiteData = Record<Language, SiteDataEntry>;

const OUTPUT_DIR = path.join(process.cwd(), 'src', 'generated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'site-data.json');

async function ensureDirectory(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('❌ 建立資料夾失敗：', dir);
    throw err;
  }
}

async function main() {
  const languages = CONFIG.languages.supportedLanguages;
  const data = {} as SiteData;

  for (const lang of languages) {
    const posts = await getPostsInfo(lang);
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

  await ensureDirectory(OUTPUT_DIR);
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`✅ 站台資料已更新：${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error('❌ 產出站台資料時發生錯誤：', error);
  process.exitCode = 1;
});
