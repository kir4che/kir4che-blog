'use client';

import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { getPostPath } from '@/lib/paths';

type PopularPost = {
  slug: string;
  title: string;
  date?: string;
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
        {posts.map(({ slug, title, date }, index) => (
          <li key={slug} className='group relative pl-6'>
            <span className='flex-center absolute top-0.5 left-0 h-4.5 w-4.5 rounded-full bg-pink-100 text-xs font-medium text-pink-700 group-hover:bg-pink-200 dark:bg-pink-800/40 dark:text-pink-300 dark:group-hover:bg-pink-700/50'>
              {index + 1}
            </span>
            <Link
              href={getPostPath({ date, slug })}
              className='block text-sm/relaxed no-underline hover:text-pink-700 hover:underline hover:underline-offset-2 dark:hover:text-pink-600'
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
