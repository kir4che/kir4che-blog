export const dynamic = 'force-dynamic';

import type { Language } from '@/types';
import { getPaginatedPostsWithFilter } from '@/lib/posts';

import PostsPageClient from './client';

type Params = Promise<{
  lang: Language;
}>;

type SearchParams = Promise<{
  page?: string;
}>;

const PostsPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { lang } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const { posts, pagination } = await getPaginatedPostsWithFilter({
    lang,
    page: currentPage,
  });

  return (
    <PostsPageClient initialPosts={posts} initialPagination={pagination} />
  );
};

export default PostsPage;
