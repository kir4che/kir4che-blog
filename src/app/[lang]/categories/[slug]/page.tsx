import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';
import { DEFAULT_POSTS_PER_PAGE } from '@/lib/posts';

import CategoryPosts from '@/components/features/category/CategoryPosts';
import { getAllCategoriesCache, getPostsByCategoryCache } from '@/lib/cache';
import { getPaginatedPosts } from '@/lib/posts';

type Params = Promise<{
  lang: Language;
  slug: string;
}>;

type SearchParams = Promise<{
  page?: string;
  tab?: string;
}>;

// 預先取得所有語系的所有 { lang, slug }
export async function generateStaticParams() {
  try {
    const params: { lang: Language; slug: string }[] = [];
    const allCategories = await getAllCategoriesCache();

    for (const lang of LANGUAGES) {
      const categories = allCategories[lang] || [];
      for (const cat of categories) params.push({ lang, slug: cat.slug });
    }

    return params;
  } catch {
    return [];
  }
}

const CategoryPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { lang, slug } = await params;
  const { page, tab } = await searchParams;
  const currentPage = Number(page) || 1;

  try {
    const { category, posts } = await getPostsByCategoryCache(
      slug,
      lang,
      'main'
    );

    if (!category || posts.length === 0) return notFound();

    const { posts: initialPosts, pagination } = await getPaginatedPosts(
      posts,
      currentPage,
      DEFAULT_POSTS_PER_PAGE
    );

    return (
      <CategoryPosts
        category={category}
        slug={slug}
        posts={initialPosts}
        pagination={pagination}
        defaultTab={tab}
      />
    );
  } catch {
    return notFound();
  }
};

export default CategoryPage;
