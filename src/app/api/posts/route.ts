import { NextResponse } from 'next/server';

import {
  DEFAULT_POSTS_PER_PAGE,
  getFilteredPosts,
  getPaginatedPostsWithFilter,
} from '@/lib/posts';

import { responseWithCache } from '@/utils/responseWithCache';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const langParam = searchParams.get('lang');
  const lang = langParam === 'en' ? 'en' : 'tw';

  try {
    const filter = searchParams.get('filter');
    const keyword = searchParams.get('keyword');

    // 處理相關文章請求
    if (filter === 'related') {
      const currentSlug = searchParams.get('currentSlug');
      const categoriesParam = searchParams.get('categories');

      if (!currentSlug || !categoriesParam)
        return NextResponse.json(
          {
            message:
              'currentSlug and categories are required for related posts.',
          },
          { status: 400 }
        );

      const categories = categoriesParam.split(',').map((cat) => cat.trim());

      const { posts } = await getPaginatedPostsWithFilter({
        lang,
        filter: 'related',
        currentSlug,
        categories,
        postsPerPage: DEFAULT_POSTS_PER_PAGE,
      });

      const relatedResults = posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        coverImage: post.coverImage,
      }));

      return responseWithCache({ posts: relatedResults });
    }

    // 處理搜尋功能
    if (!keyword)
      return NextResponse.json(
        { message: 'Keyword is required for search.' },
        { status: 400 }
      );

    const posts = await getFilteredPosts({ lang, keyword });

    const searchResults = posts.slice(0, 10).map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
    }));

    return responseWithCache({ posts: searchResults });
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch posts.' },
      { status: 500 }
    );
  }
};
