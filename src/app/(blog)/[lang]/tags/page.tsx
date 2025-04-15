import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import type { Language } from '@/types/language';
import { Link } from '@/i18n/navigation';

type Params = Promise<{
  lang: Language;
}>;

const TagsPage = async ({ params }: { params: Params }) => {
  const { lang } = await params;
  const t = await getTranslations('TagsPage');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`, {
    headers: {
      'Accept-Language': lang,
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return notFound();

  const { tags } = await res.json();
  if (!Array.isArray(tags)) return notFound();

  return (
    <>
      <h1 className='mb-4'>{t('title')}</h1>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-5'>
        {tags.map(({ name, slug, postCount }) => (
          <Link
            key={slug}
            href={`/tags/${slug}`}
            className='bg-bg-secondary dark:bg-text-gray-dark transition-color flex w-40 items-center justify-between rounded-full p-3 shadow-[2px_2px_3px_rgba(0,0,0,0.05)] transition-all duration-150 hover:scale-105'
          >
            <h2 className='text-sm text-nowrap'># {name}</h2>
            <span className='flex h-4 w-4 items-center justify-center rounded-full border border-pink-500 text-[10px] font-semibold text-pink-600 dark:border-pink-400 dark:text-pink-500'>
              {postCount}
            </span>
          </Link>
        ))}
      </div>
      {tags.length === 0 && (
        <p className='text-text-gray dark:text-text-gray-lighter text-sm'>
          {t('noTags')}
        </p>
      )}
    </>
  );
};

export default TagsPage;
