'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { Language } from '@/types/language';
import type { Tag } from '@/types/tag';
import { usePagination } from '@/hooks/usePagination';

import PostPreview from '@/components/features/post/PostPreview';
import Pagination from '@/components/ui/Pagination';
import ErrorRetry from '@/components/ui/ErrorRetry';
import Skeleton from '@/components/ui/Skeleton';

interface TagPostsProps {
  tag: Tag;
}

const TagPosts = ({ tag }: TagPostsProps) => {
  const lang = useLocale() as Language;
  const t = useTranslations('TagsPage');
  const t_common = useTranslations('common');

  const { posts, pagination, isLoading, error, retry, handlePageChange } =
    usePagination({
      type: 'tag',
      slug: tag.slug,
      lang,
    });

  return (
    <div className='space-y-6'>
      <h1 className='mb-4 flex items-baseline justify-between'>
        <span className='text-text-primary'># {tag.name}</span>
        <span className='text-text-gray dark:text-text-gray-lighter text-sm font-normal'>
          {t('postCount', { count: pagination.totalPosts })}
        </span>
      </h1>
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
          </>
        )}
      </div>
    </div>
  );
};

export default TagPosts;
