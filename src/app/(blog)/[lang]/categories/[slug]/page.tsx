import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import { LANGUAGES } from '@/types/language';

import CategoryPosts from '@/components/features/category/CategoryPosts';

type Params = {
  lang: Language;
  slug: string;
};

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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}?lang=${lang}`,
    { cache: 'force-cache' }
  );

  if (!res.ok) return notFound();

  const { category } = await res.json();
  if (!category) return notFound();

  return <CategoryPosts slug={slug} category={category} />;
};

export default CategoryPage;
