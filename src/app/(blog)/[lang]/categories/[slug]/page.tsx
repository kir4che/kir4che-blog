import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';

import CategoryPosts from '@/components/features/category/CategoryPosts';

type Params = Promise<{
  lang: Language;
  slug: string;
}>;

const CategoryPage = async ({ params }: { params: Params }) => {
  const { lang, slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}`,
    {
      headers: {
        'Accept-Language': lang,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return notFound();

  const { category } = await res.json();
  if (!category) return notFound();

  return <CategoryPosts slug={slug} category={category} />;
};

export default CategoryPage;
