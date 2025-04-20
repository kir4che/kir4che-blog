import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import { LANGUAGES } from '@/types/language';

import CategoryPosts from '@/components/features/category/CategoryPosts';

type Params = {
  lang: Language;
  slug: string;
  subSlug: string;
};

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
  if (!res.ok) return [];

  const { categories } = await res.json();
  if (!Array.isArray(categories)) return [];

  const subCategoryParams = categories.flatMap(
    (category: { slug: string; subCategories?: { slug: string }[] }) => {
      if (!Array.isArray(category.subCategories)) return [];

      return category.subCategories.map((sub) => ({
        slug: category.slug,
        subSlug: sub.slug,
      }));
    }
  );

  return LANGUAGES.flatMap((lang) =>
    subCategoryParams.map(({ slug, subSlug }) => ({
      lang,
      slug,
      subSlug,
    }))
  );
}

const SubCategoryPage = async ({ params }: { params: Params }) => {
  const { lang, slug, subSlug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}/${subSlug}?lang=${lang}`,
    { cache: 'force-cache' }
  );

  if (!res.ok) return notFound();

  const { category } = await res.json();
  if (!category) return notFound();

  return <CategoryPosts slug={subSlug} category={category} />;
};

export default SubCategoryPage;
