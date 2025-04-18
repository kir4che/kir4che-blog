'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

import type { Language } from '@/types/language';
import type { Category } from '@/types/category';
import type { Tag } from '@/types/tag';
import { useAlert } from '@/contexts/AlertContext';

import SearchBar from '@/components/features/sidebar/SearchBar';
import PopularPosts from '@/components/features/sidebar/PopularPosts';
import CategoryList from '@/components/features/sidebar/CategoryList';
import TagCloud from '@/components/features/sidebar/TagCloud';
import LatestYouTubeVideos from '@/components/features/sidebar/LatestYouTubeVideos';
import DonateBtns from '@/components/features/sidebar/DonateBtns';

interface TaxonomyData {
  categories: Category[];
  tags: Pick<Tag, 'name' | 'slug'>[];
}

const RightSidebar: React.FC = () => {
  const lang = useLocale() as Language;
  const { showError } = useAlert();

  const [taxonomyData, setTaxonomyData] = useState<TaxonomyData>({
    categories: [],
    tags: [],
  });

  useEffect(() => {
    const fetchTaxonomy = () => {
      fetch(`/api/taxonomy?limit=30`, {
        headers: {
          'Accept-Language': lang,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Fetch failed.');
          return res.json();
        })
        .then((data) => setTaxonomyData(data))
        .catch((err) =>
          showError(
            'Failed to fetch taxonomy: ' +
              (err instanceof Error ? err.message : err)
          )
        );
    };

    fetchTaxonomy();
  }, [lang, showError]);

  const { categories, tags } = taxonomyData;

  return (
    <aside className='hidden w-full max-w-64 space-y-6 px-2 lg:block'>
      <SearchBar />
      <PopularPosts />
      {categories.length > 0 && <CategoryList categories={categories} />}
      {tags.length > 0 && <TagCloud tags={tags} />}
      <LatestYouTubeVideos />
      <DonateBtns />
    </aside>
  );
};

export default RightSidebar;
