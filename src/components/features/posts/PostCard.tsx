'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import type { PostMeta } from '@/types/post';
import { useRouter } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';

import CategoryGroup from '@/components/features/post/CategoryGroup';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';

interface PostCardProps {
  post: PostMeta;
}

const PostCard = ({ post }: PostCardProps) => {
  const t = useTranslations('common');
  const router = useRouter();
  const categoryInfoMap = useCategoryInfoMap(post);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    router.push(`/posts/${post.slug}`);
  };

  return (
    <article
      onClick={handleClick}
      className='group relative flex h-full cursor-pointer flex-col rounded-xl border border-pink-200 bg-white px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-pink-900/10 dark:border-pink-400/20 dark:bg-pink-500/5 dark:hover:shadow-pink-200/10'
    >
      <div className='flex flex-1 flex-col'>
        <div className='flex-1'>
          <h3 className='mb-2 line-clamp-2 font-semibold group-hover:text-pink-700 dark:group-hover:text-pink-400'>
            {post.title || post.slug}
          </h3>
          {post.description && (
            <p className='text-text-primary/65 mb-2 line-clamp-3 text-sm'>
              {post.description}
            </p>
          )}
        </div>
        <div className='flex flex-wrap items-center justify-between gap-y-1 text-sm md:mt-4'>
          <CategoryGroup
            categories={post.categories}
            categoryInfoMap={categoryInfoMap}
          />
          <PostMetaInfo
            t={t}
            date={post.date}
            wordCount={post.wordCount}
            className='ml-auto'
          />
        </div>
      </div>
    </article>
  );
};

export default PostCard;
