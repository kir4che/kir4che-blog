'use client';

import { useTranslations } from 'next-intl';

import type { PostMeta } from '@/types';
import { Link } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';
import { cn } from '@/lib/style';

import CategoryGroup from '@/components/features/post/CategoryGroup';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';
import LockOverlay from '@/components/features/post/LockOverlay';

interface PostPreviewProps {
  post: PostMeta;
  variant?: 'card' | 'list';
}

const PostPreview: React.FC<PostPreviewProps> = ({
  post,
  variant = 'card',
}) => {
  const t = useTranslations('common');
  const categoryInfoMap = useCategoryInfoMap(post);

  const href = `/posts/${post.slug}`;

  if (variant === 'list') {
    return (
      <Link key={post.slug} href={href} className='group block h-full'>
        <article className='bg-bg-secondary relative flex h-25 flex-col justify-between rounded-lg p-4 shadow-[2px_2px_3px_rgba(0,0,0,0.05)] transition-all duration-300'>
          <LockOverlay hasPassword={post.hasPassword} />
          <h2
            className={cn(
              'text-xl transition-colors',
              post.hasPassword && 'opacity-50'
            )}
          >
            <span className='line-clamp-1 group-hover:text-pink-700 dark:group-hover:text-pink-400'>
              {post.title}
            </span>
          </h2>
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-3 gap-y-1 text-sm',
              post.hasPassword && 'opacity-50'
            )}
          >
            <CategoryGroup
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
  }

  return (
    <Link href={href} className='block h-full'>
      <article className='group relative h-full cursor-pointer rounded-lg border border-pink-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-pink-900/10 dark:border-pink-400/20 dark:bg-pink-500/5 dark:hover:shadow-pink-200/10'>
        <LockOverlay hasPassword={post.hasPassword} />
        <div
          className={cn(
            'flex h-full flex-col justify-between px-4 pt-4 pb-3 md:px-5',
            post.hasPassword && 'opacity-50'
          )}
        >
          <h3 className='mb-2 line-clamp-2 text-lg group-hover:text-pink-700 md:text-xl dark:group-hover:text-pink-400'>
            {post.title || post.slug}
          </h3>
          {post.description && (
            <p className='text-text-primary/65 mb-2 line-clamp-3 text-xs/4.5 sm:text-sm/5.5 md:mb-0'>
              {post.description}
            </p>
          )}
          <div className='mt-auto flex flex-wrap items-center justify-between gap-y-1 md:mt-4'>
            <CategoryGroup
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
};

export default PostPreview;
