import React from 'react';
import { getTranslations } from 'next-intl/server';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';
import { getSiteData } from '@/lib/siteData';

import PostPreview from '@/components/features/post/PostPreview';
import Announcement from '@/components/ui/Announcement';
import Pagination from '@/components/features/home/HomePagination';

const POSTS_PER_PAGE = 10;
const AD_INSERT_INDEX = 3;

type Params = {
  lang: Language;
};

type SearchParams = {
  page?: string;
};

export async function generateStaticParams() {
  return LANGUAGES.map((lang) => ({ lang }));
}

const Home = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams?.page) || 1;

  const t = await getTranslations('HomePage');
  const { posts } = getSiteData(lang);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  const hasPosts = currentPosts.length > 0;
  const isFirstPage = currentPage === 1;

  const heroPost = isFirstPage ? currentPosts[0] : undefined;
  const highlightPosts = isFirstPage ? currentPosts.slice(1, 4) : [];
  const mobileFeaturedPosts = isFirstPage ? currentPosts.slice(0, 4) : [];
  const listPosts = isFirstPage ? currentPosts.slice(4) : currentPosts;

  const renderListPosts = () => (
    <div className='grid grid-cols-1 gap-4'>
      {listPosts.map((post) => (
        <React.Fragment key={post.slug}>
          <PostPreview post={post} variant='list' />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className='space-y-6'>
      <Announcement text={t('announcement')} />
      {hasPosts && (
        <section id='posts' className='space-y-6'>
          {isFirstPage ? (
            <>
              <div className='grid grid-cols-1 gap-4 md:hidden'>
                {mobileFeaturedPosts.map((post) => (
                  <PostPreview
                    key={post.slug}
                    post={post}
                    variant='card'
                    className={post.coverImage ? 'h-60' : 'h-auto'}
                  />
                ))}
              </div>
              <div className='hidden md:grid md:grid-cols-[5fr_4fr] md:gap-4'>
                {heroPost && (
                  <PostPreview
                    key={heroPost.slug}
                    post={heroPost}
                    variant='card'
                  />
                )}
                {highlightPosts.length > 0 && (
                  <div className='grid grid-cols-1 gap-4'>
                    {highlightPosts.map((post) => (
                      <PostPreview
                        key={post.slug}
                        post={post}
                        variant='card'
                        className={post.coverImage ? 'h-56' : 'h-auto'}
                      />
                    ))}
                  </div>
                )}
              </div>
              {listPosts.length > 0 && renderListPosts()}
            </>
          ) : (
            renderListPosts()
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </section>
      )}
    </div>
  );
};

export default Home;
