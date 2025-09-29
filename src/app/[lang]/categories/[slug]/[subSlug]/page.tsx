import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';
import { DEFAULT_POSTS_PER_PAGE } from '@/lib/posts';

import SubCategoryPosts from '@/components/features/category/SubCategoryPosts';
import { getAllCategoriesCache, getPostsByCategoryCache } from '@/lib/cache';
import { getPaginatedPosts } from '@/lib/posts';

type Params = Promise<{
  lang: Language;
  slug: string;
  subSlug: string;
}>;

type SearchParams = Promise<{
  page?: string;
}>;

// 預先取得所有語系的所有 { lang, slug, subSlug }
export async function generateStaticParams() {
  try {
    const params: { lang: Language; slug: string; subSlug: string }[] = [];
    const allCategories = await getAllCategoriesCache();

    for (const lang of LANGUAGES) {
      const categories = allCategories[lang] || [];
      for (const cat of categories) {
        if (cat.subcategories) {
          for (const subSlug of Object.keys(cat.subcategories))
            params.push({ lang, slug: cat.slug, subSlug });
        }
      }
    }

    return params;
  } catch {
    return [];
  }
}

const SubCategoryPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { lang, slug, subSlug } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  try {
    const { category, posts } = await getPostsByCategoryCache(
      slug,
      lang,
      'main'
    );

    if (!category || !category.subcategories?.[subSlug]) return notFound();

    const subCategory = category.subcategories[subSlug];

    // 篩選屬於子分類的文章
    const subCategoryPosts = posts.filter((post) => {
      return post.categories?.some((categoryName) => {
        return (
          categoryName === subCategory.name[lang] ||
          categoryName === subCategory.name.tw ||
          categoryName === subCategory.name.en
        );
      });
    });

    if (subCategoryPosts.length === 0) return notFound();

    const { posts: initialPosts, pagination } = await getPaginatedPosts(
      posts,
      currentPage,
      DEFAULT_POSTS_PER_PAGE
    );
    return (
      <SubCategoryPosts
        mainCategory={category}
        subCategory={subCategory}
        mainSlug={slug}
        subSlug={subSlug}
        posts={initialPosts}
        pagination={pagination}
      />
    );
  } catch {
    return notFound();
  }
};

export default SubCategoryPage;
