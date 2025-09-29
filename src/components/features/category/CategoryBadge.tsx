'use client';

import { Circle } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { CategoryInfo, Language } from '@/types';
import { Link, useRouter } from '@/i18n/navigation';
import { cn, getCategoryStyle } from '@/lib/style';

interface CategoryBadgeProps {
  showHr?: boolean;
  categories: string[];
  categoryInfoMap: Record<string, CategoryInfo>;
  className?: string;
  disableLink?: boolean;
}

const CategoryBadge = ({
  showHr = false,
  categories,
  categoryInfoMap,
  className,
  disableLink = false,
}: CategoryBadgeProps) => {
  const lang = useLocale() as Language;
  const router = useRouter();
  if (!categories || categories.length === 0) return null;

  return (
    <>
      <div className='z-10 flex flex-wrap items-center gap-x-2 text-sm'>
        {categories.map((catName) => {
          const categoryInfo = categoryInfoMap[catName];

          if (!categoryInfo || !categoryInfo.name) return null;

          if (disableLink)
            return (
              <button
                key={catName}
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(
                    `/categories${categoryInfo.parentSlug ? `/${categoryInfo.parentSlug}/${categoryInfo.slug}` : `/${categoryInfo.slug}`}`
                  );
                }}
                className={cn(
                  'flex items-center gap-x-1 text-sm text-[var(--category-color)] hover:opacity-85',
                  className
                )}
                style={getCategoryStyle(categoryInfo.color)}
              >
                <Circle
                  className='h-2 w-2'
                  fill='currentColor'
                  aria-hidden='true'
                />
                <span>{categoryInfo.name[lang]}</span>
              </button>
            );

          return (
            <Link
              key={catName}
              href={`/categories${categoryInfo.parentSlug ? `/${categoryInfo.parentSlug}/${categoryInfo.slug}` : `/${categoryInfo.slug}`}`}
              className={cn(
                'flex items-center gap-x-1 text-sm text-[var(--category-color)] hover:opacity-85',
                className
              )}
              style={getCategoryStyle(categoryInfo.color)}
            >
              <Circle
                className='h-2 w-2'
                fill='currentColor'
                aria-hidden='true'
              />
              <span>{categoryInfo.name[lang]}</span>
            </Link>
          );
        })}
      </div>
      {showHr && categories.length > 0 && (
        <hr className='xs:block border-text-gray-light hidden h-3.5 border-[0.5px] dark:border-white/50' />
      )}
    </>
  );
};

export default CategoryBadge;
