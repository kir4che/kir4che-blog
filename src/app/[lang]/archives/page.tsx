export const dynamic = 'force-static';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';
import { getPaginatedPostsWithFilter, getPostsInfo } from '@/lib/posts';

import PostsPageClient from './client';

type Params = Promise<{
  lang: Language;
}>;

type SearchParams = Promise<{
  page?: string;
}>;

export async function generateStaticParams() {
  const allParams: Array<{ lang: Language; page: string }> = [];

  for (const lang of LANGUAGES) {
    const posts = await getPostsInfo(lang);
    const postsArray = Array.isArray(posts) ? posts : [];
    const totalPages = Math.ceil(postsArray.length / 10); // 假設每頁 10 篇

    // 生成所有分頁
    for (let page = 1; page <= totalPages; page++) {
      allParams.push({
        lang,
        page: page.toString(),
      });
    }
  }

  return allParams;
}

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
