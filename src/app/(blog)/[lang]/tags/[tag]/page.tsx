import React from 'react';
import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import { LANGUAGES } from '@/types/language';

import TagPosts from '@/components/features/tag/TagPosts';

type Params = {
  lang: Language;
  tag: string;
};

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`);
  const { tags } = await res.json();

  return LANGUAGES.flatMap((lang) =>
    tags.map(({ slug }) => ({
      tag: slug,
      lang,
    }))
  );
}

const TagPage = async ({ params }: { params: Params }) => {
  const { lang, tag } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tags/${tag}?lang=${lang}`,
    { cache: 'force-cache' }
  );

  if (!res.ok) return notFound();

  const { tag: tagData } = await res.json();
  if (!tagData) return notFound();

  return <TagPosts tag={tagData} />;
};

export default TagPage;
