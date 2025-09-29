'use client';

import { useMemo } from 'react';

import type { Language, PaginationData, PostInfo } from '@/types';
import { usePagination } from '@/hooks/usePagination';

import PostPreview from '@/components/features/post/PostPreview';
import Pagination from '@/components/ui/Pagination';

interface PostsPageClientProps {
  initialPosts: PostInfo[];
  initialPagination: PaginationData;
}

const PostsPageClient = ({
  initialPosts,
  initialPagination,
}: PostsPageClientProps) => {
  const { handlePageChange } = usePagination();

  // 按年份分組文章
  const postsByYear = useMemo(() => {
    return initialPosts.reduce<Record<string, PostInfo[]>>((acc, post) => {
      const year = new Date(post.date).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    }, {});
  }, [initialPosts]);

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
      {initialPagination.totalPages > 1 && (
        <Pagination
          currentPage={initialPagination.currentPage}
          totalPages={initialPagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PostsPageClient;
