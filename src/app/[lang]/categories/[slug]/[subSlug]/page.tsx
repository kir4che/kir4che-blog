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
  subSlug: string;
}>;

// 預先取得所有語系的所有 { lang, subSlug }
export async function generateStaticParams() {
  try {
    const posts = await getPostsInfo();

    const allCategories = posts.flatMap((post) => post.categories || []);
    const names = [...new Set(allCategories)];

    const slugs: string[] = [];

    for (const n of names) {
      const category = getCategoryBySlug(n, posts, 'sub');
      if (category) slugs.push(category.slug);
    }

    return LANGUAGES.flatMap((lang) =>
      slugs.map((slug) => ({ lang, subSlug: slug }))
    );
  } catch {
    return [];
  }
}

const SubCategoryPage = async ({ params }: { params: Params }) => {
  const { lang, subSlug } = await params;

  try {
    const posts = await getPostsInfo(lang);
    const category = await getCategoryBySlug(subSlug, posts, 'sub');

    if (!category) return notFound();

    return <CategoryPosts category={category} slug={subSlug} />;
  } catch {
    return notFound();
  }
};

export default SubCategoryPage;
