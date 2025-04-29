'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Folder } from 'lucide-react';

import type { Language, Category } from '@/types';
import { Link } from '@/i18n/navigation';
import { getCategoryStyle } from '@/lib/style';

const CategoryList: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const lang = useLocale() as Language;
  const t = useTranslations('sidebar');

  return (
    <div>
      <h3 className='mb-2 flex items-center gap-x-2 uppercase'>
        <Folder
          className='h-4 w-4 text-pink-700 dark:text-pink-500'
          aria-hidden='true'
        />
        {t('categories')}
      </h3>
      <ul className='flex flex-wrap items-center gap-2'>
        {categories.map(({ slug, name, color, postCount }) => (
          <li key={slug} style={getCategoryStyle(color)}>
            <Link
              href={`/categories/${slug}`}
              className='category text-text-primary transition-color flex items-center gap-x-0.5 text-sm hover:text-[var(--category-color)] dark:hover:text-[var(--category-color-dark)]'
            >
              <span>{name[lang]}</span>
              <span className='text-xs tracking-widest text-pink-600 dark:text-pink-200'>
                ({postCount})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
