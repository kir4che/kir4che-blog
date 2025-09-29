export const revalidate = 3600;

import type { Language } from '@/types';
import { getPaginatedPosts } from '@/lib/posts';

import PostsPageClient from './client';

type Params = Promise<{
  lang: Language;
}>;

const PostsPage = async ({ params }: { params: Params }) => {
  const { lang } = await params;
  const { posts, pagination } = await getPaginatedPosts({ lang });

  return (
    <PostsPageClient
      lang={lang}
      initialPosts={posts}
      initialPagination={pagination}
    />
  );
};

export default PostsPage;
