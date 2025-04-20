export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import { LANGUAGES } from '@/types/language';

import CategoryPosts from '@/components/features/category/CategoryPosts';

type Params = Promise<{
  lang: Language;
  slug: string;
}>;

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
  if (!res.ok) return [];

  const { categories } = await res.json();
  if (!Array.isArray(categories)) return [];

  return LANGUAGES.flatMap((lang) =>
    categories.map(({ slug }: { slug: string }) => ({
      slug,
      lang,
    }))
  );
}

const CategoryPage = async ({ params }: { params: Params }) => {
  const { lang, slug } = await params;

  let category;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}?lang=${lang}`
    );
    if (!res.ok) return notFound();

    const data = await res.json();
    category = data.category;

    if (!category) return notFound();
  } catch {
    return notFound();
  }

  return <CategoryPosts slug={slug} category={category} />;
};

export default CategoryPage;
