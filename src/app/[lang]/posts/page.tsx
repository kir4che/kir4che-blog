export const dynamic = 'force-static';

import type { Language } from '@/types';
import { getPaginatedPosts } from '@/lib/posts';

import PostsPageClient from './PostsPageClient';

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
