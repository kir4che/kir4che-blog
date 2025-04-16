'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { Language } from '@/types/language';
import type { Category } from '@/types/category';
import { getCategoryStyle } from '@/lib/style';
import { usePagination } from '@/hooks/usePagination';

import PostList from '@/components/features/posts/PostList';
import Pagination from '@/components/ui/Pagination';
import CategoryTabs from '@/components/features/category/CategoryTabs';
import ErrorRetry from '@/components/ui/ErrorRetry';
import Skeleton from '@/components/ui/Skeleton';

interface CategoryPostsProps {
  category: Category;
  slug: string;
}

const CategoryPosts = ({ category, slug }: CategoryPostsProps) => {
  const lang = useLocale() as Language;
  const t = useTranslations('CategoriesPage');
  const t_common = useTranslations('common');

  const [activeTab, setActiveTab] = useState<string>('all');

  const { posts, pagination, isLoading, error, retry, handlePageChange } =
    usePagination({
      type: 'category',
      slug:
        activeTab === 'all'
          ? slug
          : category.subcategories?.[activeTab]?.slug || slug,
      lang,
    });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className='space-y-6'>
      <h1 className='mb-4 flex items-baseline justify-between'>
        <span
          className='text-[var(--category-color)]'
          style={getCategoryStyle(category.color)}
        >
          {category?.name?.[lang]}
        </span>
        <span className='text-text-gray dark:text-text-gray-lighter text-sm font-normal'>
          {t('postCount', { count: Number(pagination.totalPosts) })}
        </span>
      </h1>
      {category?.subcategories &&
        Object.keys(category.subcategories).length > 0 && (
          <CategoryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            subcategories={category.subcategories}
          />
        )}
      <div className='space-y-4'>
        {error ? (
          <ErrorRetry
            message={t('loadFailed')}
            retryLabel={t_common('button.retry')}
            onRetry={retry}
          />
        ) : isLoading ? (
          <Skeleton variant='post' />
        ) : (
          <>
            <PostList t={t_common} posts={posts} />
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPosts;
