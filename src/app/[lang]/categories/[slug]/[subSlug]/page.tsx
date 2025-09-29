export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';

import CategoryPosts from '@/components/features/category/CategoryPosts';
import { getAllCategoryByPosts, getCategoryBySlug } from '@/lib/categories';
import { getPaginatedPosts, getPostsInfo } from '@/lib/posts';

type Params = Promise<{
  lang: Language;
  slug: string;
  subSlug: string;
}>;

// 預先取得所有語系的所有 { lang, subSlug }
export async function generateStaticParams() {
  try {
    const params: { lang: Language; slug: string; subSlug: string }[] = [];

    for (const lang of LANGUAGES) {
      const posts = await getPostsInfo(lang);
      const categories = getAllCategoryByPosts(posts);
      for (const cat of categories) {
        const subs = cat.subcategories ?? {};
        for (const sub of Object.values(subs)) {
          params.push({ lang, slug: cat.slug, subSlug: sub.slug });
        }
      }
    }

    return params;
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

    const { posts: initialPosts, pagination } = await getPaginatedPosts({
      lang,
      category: subSlug,
    });

    return (
      <CategoryPosts
        category={category}
        slug={subSlug}
        initialPosts={initialPosts}
        initialPagination={pagination}
      />
    );
  } catch {
    return notFound();
  }
};

export default SubCategoryPage;
