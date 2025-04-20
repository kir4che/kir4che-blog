export const dynamic = 'force-static';

import React from 'react';
import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import { LANGUAGES } from '@/types/language';

import TagPosts from '@/components/features/tag/TagPosts';

type Params = Promise<{
  lang: Language;
  tag: string;
}>;

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`);
  if (!res.ok) return [];

  const { tags } = await res.json();
  if (!Array.isArray(tags)) return [];

  return LANGUAGES.flatMap((lang) =>
    tags.map(({ slug }) => ({
      tag: slug,
      lang,
    }))
  );
}

const TagPage = async ({ params }: { params: Params }) => {
  const { lang, tag } = await params;

  let tagData;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tags/${tag}?lang=${lang}`
    );
    if (!res.ok) return notFound();

    const data = await res.json();
    tagData = data.tag;

    if (!tagData) return notFound();
  } catch {
    return notFound();
  }

  return <TagPosts tag={tagData} />;
};

export default TagPage;
