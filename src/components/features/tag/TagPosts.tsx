'use client';

import { useTranslations } from 'next-intl';

import { usePagination } from '@/hooks/usePagination';

import type { PaginationData, PostInfo, PostMeta, Tag } from '@/types';

import PostPreview from '@/components/features/post/PostPreview';
import Pagination from '@/components/ui/Pagination';

interface TagPostsProps {
  tag: Tag;
  posts: (PostMeta | PostInfo)[];
  pagination: PaginationData;
}

const TagPosts = ({ tag, posts, pagination }: TagPostsProps) => {
  const t = useTranslations('TagsPage');
  const { handlePageChange } = usePagination();

  return (
    <div className='space-y-6'>
      <h1 className='mb-4 flex items-baseline justify-between'>
        <span className='text-text-primary'># {tag.name}</span>
        <span className='text-text-gray dark:text-text-gray-lighter font-mono text-sm font-normal'>
          {t('postCount', { count: pagination.totalPosts })}
        </span>
      </h1>
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

export default TagPosts;
