'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { Language, CategoryInfo } from '@/types';
import { getCategoryStyle } from '@/lib/style';
import { cn } from '@/lib/style';

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  subcategories?: Record<string, CategoryInfo>;
}

const CategoryTabs = ({
  activeTab,
  onTabChange,
  subcategories,
}: CategoryTabsProps) => {
  const lang = useLocale() as Language;
  const t = useTranslations('common');

  if (!subcategories || Object.keys(subcategories).length === 0) return null;

  return (
    <div className='bg-bg-secondary mb-6 flex gap-x-2 rounded-t-xl transition-colors duration-300'>
      <button
        onClick={() => onTabChange('all')}
        className={cn(
          'relative px-4 py-2.5 text-sm font-medium',
          activeTab === 'all' &&
            'text-text-primary border-text-primary border-b-2 font-semibold'
        )}
      >
        {t('all')}
      </button>
      {Object.entries(subcategories).map(([key, subCat]) => (
        <button
          key={subCat.slug}
          onClick={() => onTabChange(key)}
          className={cn(
            'relative px-4 py-2.5 text-sm font-medium text-[var(--category-color)] hover:brightness-110',
            activeTab === key && 'border-b-2 font-semibold'
          )}
          style={getCategoryStyle(subCat.color)}
          role='tab'
          aria-selected={activeTab === key}
        >
          {subCat.name[lang]}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
