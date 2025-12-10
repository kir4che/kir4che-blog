export const dynamic = 'force-static';

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import type { Language, CategoryInfo } from '@/types';
import { LANGUAGES } from '@/config';
import { Link } from '@/i18n/navigation';
import { getCategoryStyle } from '@/lib/style';
import { getAllCategoriesCache } from '@/lib/cache';

type Params = Promise<{
  lang: Language;
}>;

export async function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

const CategoriesPage = async ({ params }: { params: Params }) => {
  const { lang } = await params;
  const t = await getTranslations('CategoriesPage');

  try {
    const allCategories = await getAllCategoriesCache();
    const categories = allCategories[lang] || [];

    if (!Array.isArray(categories) || categories.length === 0)
      return notFound();

    return (
      <>
        <h1 className='mb-4'>{t('title')}</h1>
        {categories?.length ? (
          <div className='xs:grid-cols-2 grid grid-cols-1 gap-4 xl:grid-cols-4'>
            {categories.map(
              ({ name, slug, color, postCount, subcategories }) => (
                <div
                  key={slug}
                  className='size-full'
                  style={getCategoryStyle(color)}
                >
                  <div className='bg-bg-secondary transition-color flex size-full flex-col rounded-lg border-2 border-(--category-color) p-3 duration-300 dark:border-(--category-color-dark)'>
                    <h2 className='mb-1 flex flex-wrap items-baseline justify-between text-xl text-(--category-color) dark:text-(--category-color-dark)'>
                      <Link
                        href={`/categories/${slug}`}
                        className='block transition-transform hover:scale-[1.02]'
                        aria-label={`${name[lang]} (${postCount} posts)`}
                      >
                        {name[lang]}
                      </Link>
                      <span className='text-text-primary text-sm font-normal'>
                        {t('postCount', { count: Number(postCount) })}
                      </span>
                    </h2>
                    {subcategories && (
                      <div className='flex flex-wrap gap-1.5 pt-2'>
                        {Object.entries(
                          subcategories as Record<
                            string,
                            CategoryInfo & { postCount: number }
                          >
                        ).map(([subSlug, subCategory]) => (
                          <Link
                            key={subSlug}
                            href={`/categories/${slug}/${subSlug}`}
                            className='block rounded-full border border-(--subcategory-color)/50 bg-(--subcategory-color)/10 px-2.5 py-1 transition-transform hover:scale-[1.02] dark:border-(--subcategory-color-dark)/80 dark:bg-(--subcategory-color-dark)/20'
                            style={
                              {
                                '--subcategory-color': subCategory.color.light,
                                '--subcategory-color-dark':
                                  subCategory.color.dark,
                              } as React.CSSProperties
                            }
                            aria-label={`${subCategory.name[lang]} (${subCategory.postCount || 0} posts)`}
                          >
                            <h3 className='text-xs font-medium text-(--subcategory-color) dark:text-(--subcategory-color-dark)'>
                              {subCategory.name[lang]}
                            </h3>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p className='text-text-gray-light text-sm'>{t('noCategories')}</p>
        )}
      </>
    );
  } catch {
    return notFound();
  }
};

export default CategoriesPage;
