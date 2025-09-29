export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';
import { DEFAULT_POSTS_PER_PAGE } from '@/lib/posts';

import TagPosts from '@/components/features/tag/TagPosts';
import { getAllTagsCache, getPostsByTagCache } from '@/lib/cache';
import { getPaginatedPosts } from '@/lib/posts';
import { getLocalizedTag } from '@/lib/tags';

type Params = Promise<{
  lang: Language;
  tag: string;
}>;

type SearchParams = Promise<{
  page?: string;
}>;

export async function generateStaticParams() {
  try {
    const allTags = await getAllTagsCache();

    return LANGUAGES.flatMap((lang) => {
      const tags = allTags[lang] || [];
      const seen = new Set<string>();

      return tags
        .filter(({ slug }) => {
          if (seen.has(slug)) return false;
          seen.add(slug);
          return true;
        })
        .map(({ slug }) => ({ lang, tag: slug }));
    });
  } catch {
    return [];
  }
}

const TagPostsList = async ({
  lang,
  tag,
  currentPage,
}: {
  lang: Language;
  tag: string;
  currentPage: number;
}) => {
  try {
    const posts = await getPostsByTagCache(tag, lang);

    if (posts.length === 0) return notFound();

    const { posts: paginatedPosts, pagination } = await getPaginatedPosts(
      posts,
      currentPage,
      DEFAULT_POSTS_PER_PAGE
    );

    const localizedTag = getLocalizedTag(tag, lang);
    const tagData = {
      ...localizedTag,
      postCount: pagination.totalPosts,
    };

    return (
      <TagPosts tag={tagData} posts={paginatedPosts} pagination={pagination} />
    );
  } catch {
    return notFound();
  }
};

const TagPage = async ({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) => {
  const { lang, tag } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  return <TagPostsList lang={lang} tag={tag} currentPage={currentPage} />;
};

export default TagPage;
