import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

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
    <section className='py-6'>
      <h5 className='mb-2 font-bold'>{t('relatedPosts')}</h5>
      <div className='grid gap-x-4 sm:grid-cols-2 md:grid-cols-3'>
        {relatedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className='group dark:bg-bg-secondary flex flex-col rounded-lg border bg-white p-4 hover:border-pink-400 dark:hover:border-pink-600'
          >
            <h3 className='mb-2 line-clamp-2 font-medium group-hover:text-pink-600 dark:group-hover:text-pink-400'>
              {post.title}
            </h3>
            {post.description && (
              <p className='line-clamp-2 text-sm text-gray-600 dark:text-gray-400'>
                {post.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
