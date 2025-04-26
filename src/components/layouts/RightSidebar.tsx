import React from 'react';

import type { Category } from '@/types/category';
import type { Tag } from '@/types/tag';

import SearchBar from '@/components/features/sidebar/SearchBar';
import PopularPosts from '@/components/features/sidebar/PopularPosts';
import CategoryList from '@/components/features/sidebar/CategoryList';
import TagCloud from '@/components/features/sidebar/TagCloud';
import DonateBtns from '@/components/features/sidebar/DonateBtns';

interface RightSidebarProps {
  categories: Category[];
  tags: Pick<Tag, 'name' | 'slug'>[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ categories, tags }) => (
  <aside className='hidden w-full max-w-64 space-y-8 px-2 lg:block'>
    <SearchBar />
    <PopularPosts />
    {categories.length > 0 && <CategoryList categories={categories} />}
    {tags.length > 0 && <TagCloud tags={tags} />}
    <DonateBtns />
  </aside>
);

export default RightSidebar;
