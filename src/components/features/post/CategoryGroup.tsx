'use client';

import React from 'react';
import { Circle } from 'lucide-react';

import type { CategoryInfo } from '@/types/category';
import { Link } from '@/i18n/navigation';
import { getCategoryStyle } from '@/lib/style';

interface CategoryGroupProps {
  showHr?: boolean;
  categories: string[];
  categoryInfoMap: Record<string, CategoryInfo>;
}

const CategoryGroup = ({ showHr = false, categories, categoryInfoMap }: CategoryGroupProps) => {
  if (!categories || categories.length === 0) return null;

  return (
    <>
      <div className='z-10 flex flex-wrap items-center gap-x-2 text-sm'>
        {categories.map((catName) => {
          const categoryInfo = categoryInfoMap[catName];
          return (
            <Link
              key={catName}
              href={`/categories${categoryInfo?.parentSlug ? `/${categoryInfo.parentSlug}` : ''}/${categoryInfo?.slug ?? ''}`}
              className='flex items-center gap-x-1 text-[var(--category-color)] hover:opacity-85'
              style={
                categoryInfo ? getCategoryStyle(categoryInfo.color) : undefined
              }
            >
              <Circle
                className='h-2 w-2'
                fill='currentColor'
                aria-hidden='true'
              />
              <span>{catName}</span>
            </Link>
          );
        })}
      </div>
      {showHr && categories.length > 0 && <hr className='xs:block border-text-gray-light hidden h-3.5 border-[0.5px] dark:border-white/50' />}
    </>
  );
};

export default CategoryGroup;
