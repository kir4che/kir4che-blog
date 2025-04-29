'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations, useFormatter } from 'next-intl';

import type { AvailableLang, PostMeta } from '@/types';
import { Link } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';
import { convertToSlug } from '@/lib/tags';

import PostPasswordGate from '@/components/features/post/PostPasswordGate';
import TOC from '@/components/features/post/Toc';
import LangMenu from '@/components/features/post/LangMenu';
import CategoryGroup from '@/components/features/post/CategoryGroup';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';
// import RelatedPosts from '@/components/features/post/RelatedPosts';
import KofiBtn from '@/components/ui/KofiBtn';

interface PostLayoutProps {
  post: PostMeta;
  headings: { id: string; text: string; level: number }[];
  existOtherLangs: boolean;
  children: React.ReactNode;
}

const PostLayout = ({
  post,
  headings,
  existOtherLangs,
  children,
}: PostLayoutProps) => {
  const t = useTranslations('PostPage');
  const t_common = useTranslations('common');
  const t_settings = useTranslations('settings');
  const formatter = useFormatter();
  const categoryInfoMap = useCategoryInfoMap(post);

  const [unlocked, setUnlocked] = useState(false);

  const {
    title,
    slug,
    date,
    categories,
    tags,
    wordCount,
    lang,
    hasPassword,
    coverImage,
  } = post;

  const availableLangs: AvailableLang[] = [
    {
      code: lang,
      label: t_settings(`language.short.${lang}`),
      exist: existOtherLangs,
    },
  ];

  if (hasPassword && !unlocked)
    return (
      <PostPasswordGate
        slug={slug}
        lang={lang}
        onSuccess={() => setUnlocked(true)}
      />
    );

  return (
    <>
      {coverImage && (
        <Image
          src={coverImage}
          alt={title || slug}
          width={800}
          height={400}
          className='-mb-2 h-72 w-full rounded-t-md object-cover'
          priority
        />
      )}
      <article className='dark:bg-text-gray-dark/35 rounded-b-md bg-white p-4 md:p-6'>
        <header className='space-y-4'>
          <h1>{title || slug}</h1>
          <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1'>
            <CategoryGroup
              categories={categories}
              categoryInfoMap={categoryInfoMap}
            />
            <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
              <PostMetaInfo
                t={t_common}
                date={date}
                wordCount={wordCount}
                className='text-sm dark:text-white/85'
              />
              {availableLangs.length > 0 && (
                <LangMenu
                  t={t_settings}
                  currentLang={lang}
                  availableLangs={availableLangs}
                  slug={slug}
                />
              )}
            </div>
          </div>
          {post.updatedAt && (
            <p className='text-right text-xs text-pink-400 dark:text-white/50'>
              {t('lastUpdated')}{' '}
              <time dateTime={post.updatedAt}>
                {formatter
                  .dateTime(new Date(post.updatedAt), {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })
                  .replace(/\//g, '.')}
              </time>
            </p>
          )}
        </header>
        <section className='article-content'>{children}</section>
        <hr className='text-text-gray-lighter dark:text-text-gray mx-auto my-8 w-20' />
        <footer className='space-y-10'>
          <div className='space-y-4'>
            <p>{t('thanks')}</p>
            <KofiBtn />
          </div>
          {tags && tags.length > 0 && (
            <div className='mt-4 flex gap-x-2'>
              {tags.map((tag) => (
                <Link
                  key={convertToSlug(tag)}
                  href={`/tags/${convertToSlug(tag)}`}
                  className='text-sm text-nowrap text-pink-700 dark:text-pink-200'
                >
                  # {tag}
                </Link>
              ))}
            </div>
          )}
        </footer>
      </article>
      <TOC headings={headings} />
      {/* <RelatedPosts lang={lang} currentSlug={slug} categories={categories} /> */}
    </>
  );
};

export default PostLayout;
