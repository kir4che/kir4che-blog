'use client';

import { useLocale, useTranslations } from 'next-intl';
import { format } from 'date-fns';

import type { Language } from '@/types/language';
import type { PostMeta } from '@/types/post';
import { usePagination } from '@/hooks/usePagination';

import PostPreview from '@/components/features/post/PostPreview';
import Pagination from '@/components/ui/Pagination';
import ErrorRetry from '@/components/ui/ErrorRetry';
import Skeleton from '@/components/ui/Skeleton';

const PostsPage = () => {
  const lang = useLocale() as Language;
  const t = useTranslations('PostsPage');
  const t_common = useTranslations('common');

  const { posts, pagination, isLoading, error, retry, handlePageChange } =
    usePagination({ lang });

  // 按年份分組文章
  const postsByYear = posts.reduce(
    (acc, post) => {
      const year = format(new Date(post.date), 'yyyy');
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(post);
      return acc;
    },
    {} as Record<string, PostMeta[]>
  );

  if (error) {
    return (
      <ErrorRetry
        message={t('loadFailed')}
        retryLabel={t_common('button.retry')}
        onRetry={retry}
      />
    );
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        <Skeleton />
        <Skeleton variant='post' count={3} />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {Object.entries(postsByYear).map(([year, yearPosts]) => (
        <section key={year}>
          <p className='mb-3 font-bold text-pink-800/50 dark:text-pink-200'>
            {year}
          </p>
          <section className='card space-y-4'>
            {yearPosts.map((post) => (
              <PostPreview key={post.slug} post={post} variant='list' />
            ))}
          </section>
        </section>
      ))}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PostsPage;
