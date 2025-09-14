export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';

import CategoryPosts from '@/components/features/category/CategoryPosts';
import { getCategoryBySlug } from '@/lib/categories';
import { getPostsInfo } from '@/lib/posts';

type Params = Promise<{
  lang: Language;
  slug: string;
}>;

// 預先取得所有語系的所有 { lang, slug }
export async function generateStaticParams() {
  try {
    const posts = await getPostsInfo();
    const allCategories = posts.flatMap((post) => post.categories || []);
    const names = [...new Set(allCategories)];

    const slugs: string[] = [];

    for (const n of names) {
      const category = getCategoryBySlug(n, posts, 'main');
      if (category) slugs.push(category.slug);
    }

    return LANGUAGES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
  } catch {
    return [];
  }
}

const CategoryPage = async ({ params }: { params: Params }) => {
  const { lang, slug } = await params;

  try {
    const posts = await getPostsInfo(lang);
    const category = await getCategoryBySlug(slug, posts);

    if (!category) return notFound();

    return <CategoryPosts category={category} slug={slug} />;
  } catch {
    return notFound();
  }
};

export default CategoryPage;
