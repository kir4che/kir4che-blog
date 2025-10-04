'use client';

import { useMemo } from 'react';

import { Circle } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { CategoryInfo, Language } from '@/types';
import { categoryMap } from '@/config/taxonomy';
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
  categories = [],
  categoryInfoMap,
  className,
  disableLink = false,
}: CategoryBadgeProps) => {
  const lang = useLocale() as Language;
  const router = useRouter();

  const resolvedCategories = useMemo(() => {
    if (categories.length === 0) return [];

    const result: CategoryInfo[] = [];
    const appended = new Set<string>();

    const addCategory = (info: CategoryInfo | null | undefined) => {
      if (!info) return;
      if (appended.has(info.slug)) return;
      appended.add(info.slug);
      result.push(info);
    };

    for (const catName of categories) {
      const info = categoryInfoMap[catName];
      if (!info) continue;

      if (info.parentSlug) {
        const parent = categoryMap[info.parentSlug];
        if (parent)
          addCategory({
            name: parent.name,
            slug: parent.slug,
            color: parent.color,
          });
      }

      addCategory(info);
    }

    return result;
  }, [categories, categoryInfoMap]);

  if (resolvedCategories.length === 0) return null;

  return (
    <>
      <div className='z-10 flex flex-wrap items-center gap-x-2 text-sm'>
        {resolvedCategories.map((categoryInfo) => {
          if (!categoryInfo || !categoryInfo.name) return null;

          if (disableLink)
            return (
              <button
                key={categoryInfo.slug}
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
              key={categoryInfo.slug}
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
