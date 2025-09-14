'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';

import type { Language, PostMeta } from '@/types';
import { usePagination } from '@/hooks/usePagination';

import PostPreview from '@/components/features/post/PostPreview';
import Pagination from '@/components/ui/Pagination';
import ErrorRetry from '@/components/ui/ErrorRetry';
import Skeleton from '@/components/ui/Skeleton';

type Params = Promise<{
  lang: Language;
}>;

const PostsPage = ({ params }: { params: Params }) => {
  const { lang } = use(params);
  const t = useTranslations('PostsPage');
  const t_common = useTranslations('common');

  const { posts, pagination, isLoading, error, retry, handlePageChange } =
    usePagination({ lang });

  // 按年份分組文章
  const postsByYear = posts.reduce<Record<string, PostMeta[]>>((acc, post) => {
    const year = new Date(post.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

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
      {Object.entries(postsByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearPosts]) => (
          <section key={year}>
            <p className='mb-2.5 font-bold text-pink-800/50 dark:text-pink-200'>
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
