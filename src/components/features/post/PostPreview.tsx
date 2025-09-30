'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import type { PostInfo, PostMeta } from '@/types';
import { Link } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';
import { cn } from '@/lib/style';

import CategoryBadge from '@/components/features/category/CategoryBadge';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';
import LockOverlay from '@/components/features/post/LockOverlay';

type PreviewPost = PostMeta | PostInfo;

interface PostPreviewProps {
  post: PreviewPost;
  variant?: 'card' | 'list';
}

const PostPreview: React.FC<PostPreviewProps> = memo(
  ({ post, variant = 'card' }) => {
    const t = useTranslations('common');
    const categoryInfoMap = useCategoryInfoMap(post);

    if (variant === 'list')
      return (
        <Link href={`/posts/${post.slug}`} className='group block h-full'>
          <article
            className={cn(
              'bg-bg-secondary relative flex h-full flex-col gap-2 rounded-lg p-4 shadow-[2px_2px_3px_rgba(0,0,0,0.05)] transition-all duration-300',
              post.hasPassword && 'opacity-50'
            )}
          >
            <LockOverlay hasPassword={post.hasPassword} />
            <h2 className='text-xl transition-colors'>
              <span className='line-clamp-1 group-hover:text-pink-700 dark:group-hover:text-pink-400'>
                {post.title}
              </span>
            </h2>
            {post.description && (
              <p className='text-text-primary/65 mb-2 line-clamp-2 text-sm/6'>
                {post.description}
              </p>
            )}
            <div className='mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
              <CategoryBadge
                showHr
                categories={post.categories}
                categoryInfoMap={categoryInfoMap}
                disableLink
              />
              <PostMetaInfo t={t} date={post.date} wordCount={post.wordCount} />
            </div>
          </article>
        </Link>
      );

    return (
      <Link href={`/posts/${post.slug}`} className='block h-full'>
        <article className='group relative h-full cursor-pointer rounded-lg border border-pink-200 bg-white hover:-translate-y-1 hover:shadow-md hover:shadow-pink-900/10 dark:border-pink-400/20 dark:bg-pink-500/5 dark:hover:shadow-pink-200/10'>
          <LockOverlay hasPassword={post.hasPassword} />
          <div
            className={cn(
              'flex h-full flex-col px-4 pt-4 pb-3 md:px-5',
              post.hasPassword && 'opacity-50'
            )}
          >
            <h3 className='mb-2 line-clamp-2 text-lg group-hover:text-pink-700 md:text-xl dark:group-hover:text-pink-400'>
              {post.title || post.slug}
            </h3>
            {post.description && (
              <p className='text-text-primary/65 mb-2 line-clamp-3 text-xs/4.5 sm:text-sm/5.5'>
                {post.description}
              </p>
            )}
            <div className='flex-1' />
            <div className='flex flex-wrap items-center justify-between gap-y-1 pt-2 md:pt-3'>
              <CategoryBadge
                categories={post.categories}
                categoryInfoMap={categoryInfoMap}
                className='text-xs sm:text-sm'
                disableLink
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
      </Link>
    );
  }
);

PostPreview.displayName = 'PostPreview';

export default PostPreview;
