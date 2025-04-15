import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';

import CategoryPosts from '@/components/features/category/CategoryPosts';

type Params = Promise<{
  lang: Language;
  slug: string;
  subSlug: string;
}>;

const SubCategoryPage = async ({ params }: { params: Params }) => {
  const { lang, slug, subSlug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}/${subSlug}`,
    {
      headers: { 'Accept-Language': lang },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return notFound();

  const { category } = await res.json();
  if (!category) return notFound();

  return <CategoryPosts slug={subSlug} category={category} />;
}

export default SubCategoryPage;