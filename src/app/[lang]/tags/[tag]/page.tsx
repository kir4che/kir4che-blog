export const dynamic = 'force-static';

import { notFound } from 'next/navigation';

import type { Language } from '@/types';
import { LANGUAGES } from '@/config';

import TagPosts from '@/components/features/tag/TagPosts';
import { getPostsByTag, getPostsInfo } from '@/lib/posts';
import { getTagsByPosts, getLocalizedTag } from '@/lib/tags';

type Params = Promise<{
  lang: Language;
  tag: string;
}>;

// 預先取得所有語系的所有 { lang, tag }
export async function generateStaticParams() {
  try {
    const params: { lang: Language; tag: string }[] = [];

    for (const lang of LANGUAGES) {
      const posts = await getPostsInfo(lang);
      const tags = getTagsByPosts(posts);
      const seen = new Set<string>();
      for (const { slug } of tags) {
        if (seen.has(slug)) continue;
        seen.add(slug);
        params.push({ lang, tag: slug });
      }
    }

    return params;
  } catch {
    return [];
  }
}

const TagPage = async ({ params }: { params: Params }) => {
  const { lang, tag } = await params;

  try {
    const posts = await getPostsByTag(tag, lang);
    if (!posts.length) return notFound();

    const localizedTag = getLocalizedTag(tag, lang);
    const tagData = {
      ...localizedTag,
      postCount: posts.length,
    };

    return <TagPosts tag={tagData} />;
  } catch {
    return notFound();
  }
};

export default TagPage;
