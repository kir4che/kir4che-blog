export const revalidate = 3600;

import { getTranslations } from 'next-intl/server';
import { ChevronRight } from 'lucide-react';

import type { Language } from '@/types';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/style';
import { getSiteData } from '@/lib/siteData';

import PostPreview from '@/components/features/post/PostPreview';
import Announcement from '@/components/ui/Announcement';

type Params = Promise<{
  lang: Language;
}>;

const Home = async ({ params }: { params: Params }) => {
  const { lang } = await params;
  const t = await getTranslations('HomePage');
  const { posts } = getSiteData(lang);
  const latestPosts = posts.slice(0, 4);

  return (
    <div className='space-y-8 py-2'>
      <Announcement text={t('announcement')} />
      {/* 最新文章 */}
      {latestPosts.length > 0 && (
        <section id='posts'>
          <div className='flex items-baseline justify-between'>
            <h2 className='mb-3 text-lg font-bold tracking-wider text-pink-600 dark:text-pink-400'>
              {t('latestPosts')}
            </h2>
            <Link
              href='/posts'
              className='group relative flex h-[30px] items-center gap-x-1 text-sm text-pink-600 dark:text-pink-200'
              tabIndex={0}
              aria-label={t('morePosts')}
            >
              <span className='relative h-[20px] overflow-hidden p-0'>
                <div className='transform transition-transform duration-400 ease-in-out group-hover:-translate-y-[20px]'>
                  <span className='block origin-right transition-transform duration-400 ease-in-out group-hover:rotate-[20deg]'>
                    {t('morePosts')}
                  </span>
                  <span className='block origin-left rotate-[20deg] transition-transform duration-400 ease-in-out group-hover:rotate-0'>
                    {t('morePosts')}
                  </span>
                </div>
              </span>
              <div className='flex-center relative size-4 overflow-hidden'>
                <ChevronRight
                  className='absolute size-4 transition-transform duration-400 ease-in-out group-hover:translate-x-[40px]'
                  aria-hidden='true'
                />
                <ChevronRight
                  className='absolute size-4 -translate-x-[40px] transition-transform duration-400 ease-in-out group-hover:translate-x-0'
                  aria-hidden='true'
                />
              </div>
            </Link>
          </div>
          <div
            className={cn(
              'grid gap-3 md:gap-4 xl:gap-6',
              latestPosts.length === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 md:grid-cols-2'
            )}
          >
            {latestPosts.length ? (
              latestPosts.map((post) => (
                <PostPreview key={post.slug} post={post} variant='card' />
              ))
            ) : (
              <p className='text-text-gray-dark dark:text-text-gray-light col-span-full py-8 text-center'>
                {t('PostsPage.noPosts')}
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
