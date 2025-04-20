import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import type { Language } from '@/types/language';
import type { CategoryInfo } from '@/types/category';
import { LANGUAGES } from '@/types/language';
import { Link } from '@/i18n/navigation';
import { getCategoryStyle } from '@/lib/style';

type Params = {
  lang: Language;
};

export async function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

const CategoriesPage = async ({ params }: { params: Params }) => {
  const { lang } = await params;
  const t = await getTranslations('CategoriesPage');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories?lang=${lang}`,
    { cache: 'force-cache' }
  );

  if (!res.ok) return notFound();

  const { categories } = await res.json();
  if (!Array.isArray(categories)) return notFound();

  return (
    <>
      <h1 className='mb-4'>{t('title')}</h1>
      {categories.length > 0 ? (
        <div className='xs:grid-cols-2 grid grid-cols-1 gap-4 xl:grid-cols-4'>
          {categories.map(({ name, slug, color, postCount, subcategories }) => (
            <div
              key={slug}
              className='h-full w-full'
              style={getCategoryStyle(color)}
            >
              <div className='bg-bg-secondary transition-color flex h-full w-full flex-col rounded-lg border-2 border-[var(--category-color)] p-3 duration-300 dark:border-[var(--category-color-dark)]'>
                <h2 className='mb-1 flex flex-wrap items-baseline justify-between text-xl text-[var(--category-color)] dark:text-[var(--category-color-dark)]'>
                  <Link
                    href={`/categories/${slug}`}
                    className='block transition-transform hover:scale-[1.02]'
                  >
                    {name[lang]}
                  </Link>
                  <span className='text-text-primary text-sm font-normal'>
                    {t('postCount', { count: postCount })}
                  </span>
                </h2>
                {subcategories && (
                  <div className='flex flex-wrap gap-2 pt-2'>
                    {Object.entries(
                      subcategories as Record<string, CategoryInfo>
                    ).map(([subSlug, subCategory]) => (
                      <Link
                        key={subSlug}
                        href={`/categories/${slug}/${subSlug}`}
                        className='block rounded-full bg-[var(--subcategory-color)] px-2.5 py-1 transition-transform hover:scale-[1.02]'
                        style={
                          {
                            '--subcategory-color': subCategory.color.light,
                            '--subcategory-color-dark': subCategory.color.dark,
                          } as React.CSSProperties
                        }
                      >
                        <h3 className='text-text-secondary text-sm font-medium'>
                          {subCategory.name[lang]}
                        </h3>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className='text-text-gray-light text-sm'>{t('noCategories')}</p>
      )}
    </>
  );
};

export default CategoriesPage;
