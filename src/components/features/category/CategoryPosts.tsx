'use client';

import { useMemo, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { usePagination } from '@/hooks/usePagination';

import type {
  Language,
  Category,
  PaginationData,
  PostInfo,
  PostMeta,
} from '@/types';
import { getCategoryStyle } from '@/lib/style';

import PostPreview from '@/components/features/post/PostPreview';
import Pagination from '@/components/ui/Pagination';
import CategoryTabs from '@/components/features/category/CategoryTabs';

interface CategoryPostsProps {
  category: Category;
  slug: string;
  posts: (PostMeta | PostInfo)[];
  pagination: PaginationData;
  defaultTab?: string;
}

const CategoryPosts = ({
  category,
  posts,
  pagination,
  defaultTab = 'all',
}: CategoryPostsProps) => {
  const lang = useLocale() as Language;
  const t = useTranslations('CategoriesPage');
  const { handlePageChange } = usePagination();

  const [activeTab, setActiveTab] = useState<string>(
    defaultTab && category.subcategories?.[defaultTab] ? defaultTab : 'all'
  );

  useEffect(() => {
    if (defaultTab && category.subcategories?.[defaultTab])
      setActiveTab(defaultTab);
    else setActiveTab('all');
  }, [defaultTab, category.subcategories]);

  // 根據 activeTab 篩選文章
  const filteredPosts = useMemo(() => {
    if (activeTab === 'all') return posts;

    const subCategory = category.subcategories?.[activeTab];
    if (!subCategory) return posts;

    // 篩選屬於該子分類的文章
    return posts.filter((post) => {
      return post.categories?.some(
        (categoryName) =>
          categoryName === subCategory.name[lang] ||
          categoryName === subCategory.name.tw ||
          categoryName === subCategory.name.en
      );
    });
  }, [posts, activeTab, category.subcategories, lang]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className='space-y-6'>
      <h1 className='mb-4 flex items-baseline justify-between'>
        <span
          className='text-(--category-color)'
          style={getCategoryStyle(category.color)}
        >
          {category?.name?.[lang]}
        </span>
        <span className='text-text-gray dark:text-text-gray-lighter font-mono text-sm font-normal'>
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
        <section className='card space-y-4'>
          {filteredPosts.map((post) => (
            <PostPreview key={post.slug} post={post} variant='list' />
          ))}
        </section>
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryPosts;
