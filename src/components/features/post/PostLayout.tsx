'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations, useFormatter } from 'next-intl';
import { Share2, Copy } from 'lucide-react';

import type { Language, PostMeta } from '@/types';
import { Link } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';
import { getLocalizedTag } from '@/lib/tags';
import { useAlert } from '@/contexts/AlertContext';

import PostPasswordGate from '@/components/features/post/PostPasswordGate';
import TOC from '@/components/features/post/Toc';
import LangMenu from '@/components/features/post/LangMenu';
import CategoryGroup from '@/components/features/post/CategoryGroup';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';
import RelatedPosts from '@/components/features/post/RelatedPosts';
import KofiBtn from '@/components/ui/KofiBtn';
import PostComments from '@/components/features/post/PostComments';

import styles from './PostLayout.module.css';

interface PostLayoutProps {
  post: PostMeta;
  headings: { id: string; text: string; level: number }[];
  otherLangs: { exist: boolean; langs: Language[] };
  children: React.ReactNode;
}

interface ImageMeta {
  blurDataURL: string;
}

const PostLayout = ({
  post,
  headings,
  otherLangs,
  children,
}: PostLayoutProps) => {
  const t = useTranslations('PostPage');
  const t_common = useTranslations('common');
  const t_settings = useTranslations('settings');
  const formatter = useFormatter();
  const categoryInfoMap = useCategoryInfoMap(post);
  const { showError, showSuccess } = useAlert();

  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);
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

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/posts/${slug}`
      : `/posts/${slug}`;

  useEffect(() => {
    if (!post.coverImage) return;

    fetch(`/api/image-meta?src=${post.coverImage}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.blurDataURL) setImageMeta(data);
      })
      .catch((err) => {
        showError(err instanceof Error ? err.message : String(err));
      });
  }, [post.coverImage, showError]);

  const handleCopyLink = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard)
        throw new Error(t('share.copyUnavailable'));

      await navigator.clipboard.writeText(shareUrl);
      showSuccess(t('share.copySuccess'));
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: title || slug,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        showError(err instanceof Error ? err.message : String(err));
        return;
      }
    }

    await handleCopyLink();
  };

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
        <div className='overflow-hidden rounded-t-md'>
          <Image
            src={coverImage}
            alt={title || slug}
            width={1200}
            height={630}
            className='-mb-2 h-45 w-full object-cover lg:h-64'
            placeholder={imageMeta?.blurDataURL ? 'blur' : undefined}
            blurDataURL={imageMeta?.blurDataURL}
            priority
          />
        </div>
      )}
      <article className='dark:bg-text-gray-dark/35 rounded-b-md bg-white px-4 py-6 transition-all duration-300 md:p-6'>
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
              {otherLangs.exist && (
                <LangMenu
                  t={t_settings}
                  curLang={lang}
                  langs={otherLangs.langs}
                  slug={slug}
                />
              )}
            </div>
          </div>
          {post.updatedAt && (
            <p className='-mt-1 text-right text-xs text-pink-500 dark:text-white/50'>
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
        <section className={styles.articleContent}>{children}</section>
        <hr className='text-text-gray-lighter dark:text-text-gray mx-auto my-8 w-20' />
        <footer className='space-y-4'>
          <div className='space-y-4'>
            <p>{t('thanks')}</p>
            <KofiBtn />
          </div>
          <PostComments slug={slug} />
          <div className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-4'>
            {tags && tags.length > 0 && (
              <div className='flex flex-wrap gap-x-2'>
                {tags.map((tag) => {
                  const localized = getLocalizedTag(tag, lang);

                  return (
                    <Link
                      key={localized.slug}
                      href={`/tags/${localized.slug}`}
                      className='text-sm text-nowrap text-pink-700 dark:text-pink-200'
                    >
                      # {localized.name}
                    </Link>
                  );
                })}
              </div>
            )}
            <div className='flex flex-wrap items-center gap-2 text-sm text-pink-700 dark:text-pink-200'>
              <button
                type='button'
                onClick={handleCopyLink}
                className='flex items-center gap-x-1 rounded-md border border-pink-200 px-3 py-1 text-sm transition-colors hover:border-pink-400 hover:text-pink-600 dark:border-pink-300/40 dark:hover:border-pink-200/70'
              >
                <Copy className='size-4' aria-hidden='true' />
                {t('share.copyLink')}
              </button>
              <button
                type='button'
                onClick={handleNativeShare}
                className='flex items-center gap-x-1 rounded-md border border-pink-200 px-3 py-1 text-sm transition-colors hover:border-pink-400 hover:text-pink-600 dark:border-pink-300/40 dark:hover:border-pink-200/70'
              >
                <Share2 className='size-4' aria-hidden='true' />
                {t('share.native')}
              </button>
            </div>
          </div>
        </footer>
      </article>
      <RelatedPosts lang={lang} currentSlug={slug} categories={categories} />
      {headings && headings.length > 0 && <TOC headings={headings} />}
    </>
  );
};

export default PostLayout;
