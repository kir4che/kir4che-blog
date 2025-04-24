'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';

import type { Language } from '@/types/language';
import type { PostMeta } from '@/types/post';
import { Link } from '@/i18n/navigation';
import { useAlert } from '@/contexts/AlertContext';

type Post = Pick<PostMeta, 'slug' | 'title'>;

const PopularPosts: React.FC = () => {
  const lang = useLocale() as Language;
  const t = useTranslations('sidebar');
  const { showError } = useAlert();

  const [popularPosts, setPopularPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch(`/api/posts?filter=popular&limit=5&lang=${lang}`)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed.');
        return res.json();
      })
      .then((data) => setPopularPosts(data.posts ?? []))
      .catch((err) => {
        showError(err instanceof Error ? err.message : err);
        setPopularPosts([]);
      });
  }, [lang, showError]);

  if (!popularPosts || popularPosts.length === 0) return null;

  return (
    <>
      <h3 className='mb-3 flex items-center gap-x-2 font-medium uppercase'>
        <Sparkles
          className='h-4 w-4 text-pink-700 dark:text-pink-500'
          aria-hidden='true'
        />
        {t('popularPosts')}
      </h3>
      <ul className='space-y-2.5'>
        {popularPosts.map(({ slug, title }) => (
          <li key={slug}>
            <Link
              href={`/posts/${slug}`}
              className='line-clamp-1 text-sm hover:text-pink-700 hover:underline hover:underline-offset-2'
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
