import { NextResponse } from 'next/server';

import type { Language } from '@/types/language';
import type { PostInfo } from '@/types/post';
import { getPostsInfo, getPostsByCategory, getPostsByTag } from '@/lib/posts';

import { responseWithCache } from '@/utils/responseWithCache';

const DEFAULT_POSTS_PER_PAGE = 6;

// 分頁處理
const paginate = (posts: PostInfo[], page: number, postsPerPage: number) => {
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;
  const paginated = posts.slice(start, end);

  return {
    posts: paginated,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      postsPerPage,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
  };
};

const getFilteredPosts = async (
  lang: Language = 'tw',
  category?: string | null,
  tag?: string | null,
  keyword?: string | null
) => {
  let posts: PostInfo[] = [];

  // 根據分類或標籤來取得文章
  if (category) posts = await getPostsByCategory(category, lang);
  else if (tag) posts = await getPostsByTag(tag, lang);
  else posts = await getPostsInfo(lang);

  // 如果有關鍵字，進行標題、分類、標籤與敘述的搜尋。
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    posts = posts.filter(
      ({ title, categories = [], tags = [], description = '' }) => {
        const haystacks = [title, description, ...categories, ...tags];
        return haystacks.some((field) =>
          field?.toLowerCase().includes(lowerKeyword)
        );
      }
    );
  }

  // 所有文章依照日期排序（由新到舊）
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'tw';

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const keyword = searchParams.get('keyword');
    const filter = searchParams.get('filter');
    const page = Number(searchParams.get('page') || 1);
    const postsPerPage = Number(
      searchParams.get('postsPerPage') || DEFAULT_POSTS_PER_PAGE
    );

    let posts = await getFilteredPosts(lang, category, tag, keyword);

    // 處理不同的篩選文章的條件
    if (filter === 'popular') {
      posts = posts.filter((post) => post.featured);
      // .sort((a, b) => (b.views ?? 0) - (a.views ?? 0)); // 暫時以精選代替熱門，未來再調整。
    } else if (filter === 'related') {
      const currentSlug = searchParams.get('currentSlug');
      const categories = searchParams.get('categories')?.split(',') || [];

      if (!currentSlug || categories.length === 0) {
        return NextResponse.json(
          { message: 'Missing required parameters for related posts.' },
          { status: 400 }
        );
      }

      posts = posts
        .filter(
          (post) =>
            post.slug !== currentSlug &&
            post.categories.some((category) => categories.includes(category))
        )
        .slice(0, 3); // 限制相關文章數量為 3
    }

    const result = paginate(posts, page, postsPerPage);
    return responseWithCache(result);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch posts.' },
      { status: 500 }
    );
  }
}
