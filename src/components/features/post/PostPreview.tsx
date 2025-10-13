'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { PostInfo, PostMeta } from '@/types';
import { Link } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';
import { cn } from '@/lib/style';
import { getPostPath } from '@/lib/paths';

import CategoryBadge from '@/components/features/category/CategoryBadge';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';
import LockOverlay from '@/components/features/post/LockOverlay';

type PreviewPost = PostMeta | PostInfo;

interface PostPreviewProps {
  post: PreviewPost;
  variant?: 'card' | 'list';
  className?: string;
}

const PostPreview: React.FC<PostPreviewProps> = memo(
  ({ post, variant = 'card', className }) => {
    const t = useTranslations('common');
    const categoryInfoMap = useCategoryInfoMap(post);

    if (variant === 'list')
      return (
        <Link
          href={getPostPath({ date: post.date, slug: post.slug })}
          className={cn('group relative block h-full', className)}
        >
          <LockOverlay hasPassword={post.hasPassword} />
          <article
            className={cn(
              'bg-bg-secondary flex h-full flex-col gap-2 rounded-lg p-4 shadow-[2px_2px_3px_rgba(0,0,0,0.05)] transition-all duration-300',
              post.hasPassword && 'opacity-50'
            )}
          >
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
      <Link
        href={getPostPath({ date: post.date, slug: post.slug })}
        className={cn('block h-full overflow-hidden rounded-lg', className)}
      >
        <article className='group relative h-full cursor-pointer'>
          <LockOverlay hasPassword={post.hasPassword} />
          {post?.coverImage ? (
            <div className='relative h-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-xl group-hover:ring-pink-500/20'>
              <Image
                src={post.coverImage}
                alt={post.title || post.slug}
                fill
                sizes='(max-width: 768px) 100vw, 50vw'
                priority={false}
                className='object-cover brightness-[0.97] transition-all duration-700 ease-in-out group-hover:scale-110 group-hover:brightness-105'
              />
              <div
                className={cn(
                  'absolute inset-0 flex flex-col p-4 transition-all duration-300',
                  post.hasPassword && 'opacity-50'
                )}
              >
                <h3 className='mb-2 line-clamp-2 text-xl font-semibold text-white drop-shadow-md transition-all duration-300 ease-in-out group-hover:translate-y-[-2px]'>
                  {post.title || post.slug}
                </h3>
                {post.description && (
                  <p className='mb-2 line-clamp-3 text-sm/5.5 text-white drop-shadow backdrop-blur-[1px] transition-all duration-300'>
                    {post.description}
                  </p>
                )}
                <div className='flex-1' />
                <div className='z-10 flex flex-wrap items-center justify-between gap-y-1 pt-2 opacity-90 transition-opacity duration-300 group-hover:opacity-100 md:pt-3'>
                  <CategoryBadge
                    categories={post.categories}
                    categoryInfoMap={categoryInfoMap}
                    className='force-dark-category rounded-full bg-black/30 px-2.5 py-0.5 text-xs shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-black/40 sm:text-sm'
                    disableLink
                  />
                  <PostMetaInfo
                    t={t}
                    date={post.date}
                    wordCount={post.wordCount}
                    className='ml-auto rounded-full bg-black/30 px-2.5 py-0.5 text-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-black/40 group-hover:text-white'
                  />
                </div>
              </div>
              <div
                className='absolute inset-0 z-0 opacity-75 transition-all duration-500 group-hover:opacity-85'
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 85%, transparent 100%)`,
                }}
              />
            </div>
          ) : (
            <div className='h-full rounded-lg border border-pink-200 bg-white hover:-translate-y-1 hover:shadow-md hover:shadow-pink-900/10 dark:border-pink-400/20 dark:bg-pink-500/5 dark:hover:shadow-pink-200/10'>
              <div
                className={cn(
                  'flex h-full flex-col px-4 pt-4 pb-3 md:px-5',
                  post.hasPassword && 'opacity-50'
                )}
              >
                <h3 className='mb-2 line-clamp-2 text-xl font-semibold group-hover:text-pink-700 dark:group-hover:text-pink-400'>
                  {post.title || post.slug}
                </h3>
                {post.description && (
                  <p className='text-text-primary/65 mb-2 line-clamp-3 text-sm/5.5'>
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
            </div>
          )}
        </article>
      </Link>
    );
  }
);

PostPreview.displayName = 'PostPreview';

export default PostPreview;
