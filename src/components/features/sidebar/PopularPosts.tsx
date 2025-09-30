'use client';

import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

import { Link } from '@/i18n/navigation';

type PopularPost = {
  slug: string;
  title: string;
};

interface PopularPostsProps {
  posts: PopularPost[];
}

const PopularPosts: React.FC<PopularPostsProps> = ({ posts }) => {
  const t = useTranslations('sidebar');

  if (!posts || posts.length === 0) return null;

  return (
    <>
      <h3 className='mb-3 flex items-center gap-x-2 font-medium uppercase'>
        <Sparkles
          className='size-4 text-pink-700 dark:text-pink-300'
          aria-hidden='true'
        />
        <span className='text-gradient'>{t('popularPosts')}</span>
      </h3>
      <ul className='space-y-2.5'>
        {posts.map(({ slug, title }, index) => (
          <li key={slug} className='group relative pl-6'>
            <span className='absolute top-0.5 left-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-pink-100 text-xs font-medium text-pink-700 group-hover:bg-pink-200 dark:bg-pink-800/40 dark:text-pink-300 dark:group-hover:bg-pink-700/50'>
              {index + 1}
            </span>
            <Link
              href={`/posts/${slug}`}
              className='block text-sm/relaxed transition-colors hover:text-pink-700 dark:hover:text-pink-400'
            >
              {title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default PopularPosts;
