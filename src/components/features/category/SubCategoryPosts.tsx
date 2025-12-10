'use client';

import { useLocale, useTranslations } from 'next-intl';

import { usePagination } from '@/hooks/usePagination';

import type {
  Language,
  Category,
  CategoryInfo,
  PaginationData,
  PostInfo,
  PostMeta,
} from '@/types';
import { getCategoryStyle } from '@/lib/style';
import { Link } from '@/i18n/navigation';

import PostPreview from '@/components/features/post/PostPreview';
import Pagination from '@/components/ui/Pagination';

interface SubCategoryPostsProps {
  mainCategory: Category;
  subCategory: CategoryInfo;
  mainSlug: string;
  subSlug: string;
  posts: (PostMeta | PostInfo)[];
  pagination: PaginationData;
}

const SubCategoryPosts = ({
  mainCategory,
  subCategory,
  mainSlug,
  subSlug,
  posts,
  pagination,
}: SubCategoryPostsProps) => {
  const lang = useLocale() as Language;
  const t = useTranslations('CategoriesPage');
  const { handlePageChange } = usePagination();

  return (
    <div className='space-y-6'>
      <nav className='text-text-gray-light dark:text-text-gray-lighter flex items-center space-x-2 text-sm'>
        <Link
          href='/categories'
          className='hover:text-text-primary transition-colors'
        >
          {t('breadcrumb.categories')}
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${mainSlug}`}
          className='hover:text-text-primary transition-colors'
          style={getCategoryStyle(mainCategory.color)}
        >
          {mainCategory.name[lang]}
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${mainSlug}/${subSlug}`}
          className='font-medium text-(--category-color)'
          style={getCategoryStyle(subCategory.color)}
        >
          {subCategory.name[lang]}
          <span className='ml-1 font-mono text-xs'>
            ({pagination.totalPosts})
          </span>
        </Link>
      </nav>
      <div className='space-y-4'>
        <section className='card space-y-4'>
          {posts.map((post) => (
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

export default SubCategoryPosts;
