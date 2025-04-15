import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import type { PostMeta } from '@/types/post';
import { Link } from '@/i18n/navigation';
import { useAlert } from '@/context/AlertContext';

interface RelatedPostsProps {
  lang: string;
  currentSlug: string;
  categories: string[];
}

const RelatedPosts = ({ lang, currentSlug, categories }: RelatedPostsProps) => {
  const t = useTranslations('PostPage');
  const { showError } = useAlert();
  const [relatedPosts, setRelatedPosts] = useState<PostMeta[]>([]);

  const categoryParam = useMemo(() => categories.join(','), [categories]);

  useEffect(() => {
    if (categories.length === 0) return;

    const fetchRelatedPosts = () => {
      const params = new URLSearchParams({
        filter: 'related',
        currentSlug,
        categories: categoryParam,
      });

      fetch(`/api/posts?${params}`, {
        headers: { 'Accept-Language': lang },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed.');
          return res.json();
        })
        .then(({ posts }) => {
          if (!posts || !Array.isArray(posts))
            throw new Error('Invalid response format.');
          setRelatedPosts(posts);
        })
        .catch((err) => {
          showError(
            'Error fetching related posts: ' +
              (err instanceof Error ? err.message : err)
          );
        });
    };

    fetchRelatedPosts();
  }, [lang, currentSlug, categories, categoryParam, showError]);

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
