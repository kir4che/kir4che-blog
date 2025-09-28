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
      <h3 className='mb-2 flex items-center gap-x-2 font-medium uppercase'>
        <Sparkles
          className='size-4 text-pink-700 dark:text-pink-500'
          aria-hidden='true'
        />
        {t('popularPosts')}
      </h3>
      <ul className='space-y-2'>
        {posts.map(({ slug, title }) => (
          <li key={slug}>
            <Link
              href={`/posts/${slug}`}
              className='text-sm hover:text-pink-700 hover:underline hover:underline-offset-2'
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
