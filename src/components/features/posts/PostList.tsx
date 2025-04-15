import React from 'react';

import type { PostMeta } from '@/types/post';
import { Link } from '@/i18n/navigation';
import { useCategoryInfoMap } from '@/hooks/useCategoryInfoMap';

import CategoryGroup from '@/components/features/post/CategoryGroup';
import PostMetaInfo from '@/components/features/post/PostMetaInfo';

interface PostListProps {
  t: (key: string) => string;
  posts: PostMeta[];
}

const PostList: React.FC<PostListProps> = ({ t, posts }) => {
  const categoryInfoMap = useCategoryInfoMap(posts);

  return (
    <section className='space-y-4'>
      {posts.map((post) => (
        <article
          key={post.slug}
          className='bg-bg-secondary rounded-xl px-4 py-6 shadow-[2px_2px_3px_rgba(0,0,0,0.05)]'
        >
          <h2 className='mb-4 text-xl'>
            <Link
              href={`/posts/${post.slug}`}
              className='line-clamp-1 hover:text-pink-700 dark:hover:text-pink-400'
            >
              {post.title}
            </Link>
          </h2>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm'>
            <CategoryGroup showHr={true} categories={post.categories} categoryInfoMap={categoryInfoMap} />
            <PostMetaInfo t={t} date={post.date} wordCount={post.wordCount} />
          </div>
        </article>
      ))}
    </section>
  );
};

export default PostList;
