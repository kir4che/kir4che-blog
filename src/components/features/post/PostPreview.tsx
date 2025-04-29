'use client';

import { useTranslations } from 'next-intl';

import type { PostMeta } from '@/types';
import { useRouter, Link } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';

import CategoryGroup from '@/components/features/post/CategoryGroup';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';

interface PostPreviewProps {
  post: PostMeta;
  variant?: 'card' | 'list';
}

const PostPreview: React.FC<PostPreviewProps> = ({
  post,
  variant = 'card',
}) => {
  const t = useTranslations('common');
  const router = useRouter();
  const categoryInfoMap = useCategoryInfoMap(post);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    router.push(`/posts/${post.slug}`);
  };

  if (variant === 'list') {
    return (
      <article
        key={post.slug}
        className='card-body bg-bg-secondary h-25 justify-between rounded-xl p-4 shadow-[2px_2px_3px_rgba(0,0,0,0.05)]'
      >
        <h2 className='card-title text-xl'>
          <Link
            href={`/posts/${post.slug}`}
            className='line-clamp-1 hover:text-pink-700 dark:hover:text-pink-400'
          >
            {post.title}
          </Link>
        </h2>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
          <CategoryGroup
            showHr={true}
            categories={post.categories}
            categoryInfoMap={categoryInfoMap}
          />
          <PostMetaInfo t={t} date={post.date} wordCount={post.wordCount} />
        </div>
      </article>
    );
  }

  return (
    <article
      onClick={handleClick}
      className='card group h-full cursor-pointer border border-pink-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-pink-900/10 dark:border-pink-400/20 dark:bg-pink-500/5 dark:hover:shadow-pink-200/10'
    >
      <div className='card-body px-4 pt-4 pb-3 md:px-5'>
        <div className='flex-1'>
          <h3 className='card-title mb-2 line-clamp-2 text-lg group-hover:text-pink-700 md:text-xl dark:group-hover:text-pink-400'>
            {post.title || post.slug}
          </h3>
          {post.description && (
            <p className='text-text-primary/65 mb-2 line-clamp-3 text-xs/5 sm:text-sm/6 md:mb-0'>
              {post.description}
            </p>
          )}
        </div>
        <div className='flex flex-wrap items-center justify-between gap-y-1 md:mt-4'>
          <CategoryGroup
            categories={post.categories}
            categoryInfoMap={categoryInfoMap}
            className='text-xs sm:text-sm'
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

export default PostPreview;
