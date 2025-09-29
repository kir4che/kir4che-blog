'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useFormatter, useTranslations } from 'next-intl';
import { Calendar, ImageOff } from 'lucide-react';

import type { PostMeta } from '@/types';
import { Link } from '@/i18n/navigation';
import { useAlert } from '@/contexts/AlertContext';

interface RelatedPostsProps {
  lang: string;
  currentSlug: string;
  categories: string[];
}

const RelatedPosts = ({ lang, currentSlug, categories }: RelatedPostsProps) => {
  const t = useTranslations('PostPage');
  const formatter = useFormatter();
  const { showError } = useAlert();
  const [relatedPosts, setRelatedPosts] = useState<PostMeta[]>([]);
  const categoryParam = useMemo(() => {
    const uniqueCategories = Array.from(new Set(categories));
    return uniqueCategories.join(',');
  }, [categories]);

  useEffect(() => {
    if (!categoryParam) return;

    const controller = new AbortController();

    const fetchRelatedPosts = async () => {
      try {
        const params = new URLSearchParams({
          filter: 'related',
          currentSlug,
          categories: categoryParam,
        });

        const res = await fetch(`/api/posts?${params}&lang=${lang}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to load related posts.');

        const data = await res.json();

        if (!data?.posts || !Array.isArray(data.posts))
          throw new Error('Invalid related posts response.');

        setRelatedPosts(data.posts);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        showError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchRelatedPosts();

    return () => controller.abort();
  }, [lang, currentSlug, categoryParam, showError]);

  if (!relatedPosts.length) return null;

  return (
    <section className='space-y-4 py-6' aria-labelledby='related-posts'>
      <div className='flex items-center justify-between gap-2'>
        <h2 className='text-base font-semibold text-pink-700 dark:text-pink-200'>
          {t('relatedPosts')}
        </h2>
        <span
          className='h-[1px] flex-1 rounded-full bg-gradient-to-r from-pink-200/60 to-transparent dark:from-pink-200/20'
          aria-hidden='true'
        />
      </div>
      <div className='relative overflow-hidden'>
        <div
          className='flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-pink-300/60 dark:[&::-webkit-scrollbar-thumb]:bg-pink-200/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-pink-100/40 dark:[&::-webkit-scrollbar-track]:bg-white/10'
          role='list'
          aria-label={t('relatedPosts')}
        >
          {relatedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              role='listitem'
              className='group dark:bg-text-gray-dark/60 relative flex max-w-[18rem] min-w-[18rem] snap-start flex-col overflow-hidden rounded-md border border-pink-200/40 bg-white/85 p-4 hover:border-pink-400/60 dark:border-pink-200/15 dark:hover:border-pink-200/40'
            >
              {post.coverImage ? (
                <div className='relative mb-3 h-36 overflow-hidden rounded-md bg-pink-100/40 dark:bg-white/10'>
                  <Image
                    src={post.coverImage}
                    alt={post.title || post.slug}
                    fill
                    sizes='(min-width: 1024px) 280px, (min-width: 768px) 240px, 70vw'
                    className='object-cover'
                  />
                </div>
              ) : (
                <div className='flex-center mb-3 h-36 rounded-md border border-dashed border-pink-200/60 bg-pink-50/40 text-pink-300 dark:border-white/20 dark:bg-white/10 dark:text-white/50'>
                  <ImageOff size={24} aria-hidden='true' />
                  <span className='ml-2 text-xs font-medium tracking-wide'>
                    {t('relatedPostsFallback', {
                      defaultValue: 'No cover image',
                    })}
                  </span>
                </div>
              )}
              <div className='flex flex-1 flex-col gap-2'>
                <h3 className='text-text-primary line-clamp-2 text-base leading-tight font-semibold transition-colors group-hover:text-pink-600 dark:text-white dark:group-hover:text-pink-300'>
                  {post.title}
                </h3>
                {post.description && (
                  <p className='text-text-primary/70 line-clamp-3 text-sm leading-relaxed dark:text-white/75'>
                    {post.description}
                  </p>
                )}
                <div className='text-text-gray-light mt-auto flex items-center gap-2 text-xs dark:text-white/65'>
                  <Calendar className='size-3.5' aria-hidden='true' />
                  <time
                    dateTime={post.date}
                    className='font-medium tracking-wide'
                  >
                    {formatter
                      .dateTime(new Date(post.date), {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })
                      .replace(/\./g, ' ')}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedPosts;
