export const dynamic = 'force-static';

import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';
import { Link } from '@/i18n/navigation';
import { getAllTagsCache } from '@/lib/cache';

type Params = Promise<{
  lang: Language;
}>;

export async function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

const TagsList = async ({ lang }: { lang: Language }) => {
  const t = await getTranslations('TagsPage');

  try {
    const allTags = await getAllTagsCache();
    const tags = allTags[lang] || [];

    if (!Array.isArray(tags) || tags.length === 0)
      return (
        <p className='text-text-gray dark:text-text-gray-lighter text-sm'>
          {t('noTags')}
        </p>
      );

    return (
      <div className='flex flex-wrap items-center gap-x-4 gap-y-5 transition-colors duration-300'>
        {tags.map(({ name, slug, postCount }) => (
          <Link
            key={slug}
            href={`/tags/${slug}`}
            className='bg-bg-secondary dark:bg-text-gray-dark flex w-40 items-center justify-between rounded-full p-3 shadow-[2px_2px_3px_rgba(0,0,0,0.05)] hover:scale-105'
            aria-label={`${name} (${postCount} posts)`}
          >
            <h2 className='text-sm text-nowrap'># {name}</h2>
            <span className='flex-center size-4 rounded-full border border-pink-500 text-[10px] font-semibold text-pink-600 dark:border-pink-400 dark:text-pink-500'>
              {postCount}
            </span>
          </Link>
        ))}
      </div>
    );
  } catch {
    return notFound();
  }
};

const TagsPage = async ({ params }: { params: Params }) => {
  const { lang } = await params;
  const t = await getTranslations('TagsPage');

  return (
    <>
      <h1 className='mb-4'>{t('title')}</h1>
      <TagsList lang={lang} />
    </>
  );
};

export default TagsPage;
