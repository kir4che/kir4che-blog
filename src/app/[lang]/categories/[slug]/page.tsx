export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';

import CategoryPosts from '@/components/features/category/CategoryPosts';
import { getAllCategoryByPosts, getCategoryBySlug } from '@/lib/categories';
import { getPostsInfo } from '@/lib/posts';

type Params = Promise<{
  lang: Language;
  slug: string;
}>;

// 預先取得所有語系的所有 { lang, slug }
export async function generateStaticParams() {
  try {
    const params: { lang: Language; slug: string }[] = [];

    for (const lang of LANGUAGES) {
      const posts = await getPostsInfo(lang);
      const categories = getAllCategoryByPosts(posts);
      for (const cat of categories) params.push({ lang, slug: cat.slug });
    }

    return params;
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
