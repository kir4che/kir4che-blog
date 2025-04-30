export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';

import TagPosts from '@/components/features/tag/TagPosts';
import { getPostsByTag, getPostsInfo } from '@/lib/posts';
import { getTagsByPosts, convertToSlug } from '@/lib/tags';

type Params = Promise<{
  lang: Language;
  tag: string;
}>;

export async function generateStaticParams() {
  try {
    const posts = await getPostsInfo();
    const tags = getTagsByPosts(posts);

    return LANGUAGES.flatMap((lang) =>
      tags.map(({ name }) => ({
        tag: convertToSlug(name),
        lang,
      }))
    );
  } catch {
    return [];
  }
}

const TagPage = async ({ params }: { params: Params }) => {
  const { lang, tag } = await params;

  try {
    const posts = await getPostsByTag(tag, lang);
    if (!posts.length) return notFound();

    const tagData = {
      name: tag,
      slug: convertToSlug(tag),
      postCount: posts.length,
    };

    return <TagPosts tag={tagData} />;
  } catch {
    return notFound();
  }
};

export default TagPage;
