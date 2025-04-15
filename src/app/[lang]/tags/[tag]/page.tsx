import React from 'react';
import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';

import TagPosts from '@/components/features/tag/TagPosts';

type Params = Promise<{
  lang: Language;
  tag: string;
}>;

const TagPage = async ({ params }: { params: Params }) => {
  const { lang, tag } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tags/${tag}`,
    {
      headers: { 'Accept-Language': lang },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return notFound();

  const { tag: tagData } = await res.json();
  if (!tagData) return notFound();

  return <TagPosts tag={tagData} />;
};

export default TagPage;
