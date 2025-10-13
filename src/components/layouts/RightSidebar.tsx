import type { Category, Tag, PostInfo } from '@/types';

import SearchBar from '@/components/features/sidebar/SearchBar';
import PopularPosts from '@/components/features/sidebar/PopularPosts';
import CategoryList from '@/components/features/sidebar/CategoryList';
import TagCloud from '@/components/features/sidebar/TagCloud';
import MyWebsites from '@/components/features/sidebar/MyWebsites';
import DonateBtns from '@/components/features/sidebar/DonateBtns';

interface RightSidebarProps {
  categories: Category[];
  tags: Pick<Tag, 'name' | 'slug'>[];
  popularPosts: Array<Pick<PostInfo, 'slug' | 'title' | 'date'>>;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  categories,
  tags,
  popularPosts,
}) => (
  <aside className='hidden w-full max-w-64 space-y-8 px-2 pb-4 lg:block'>
    <SearchBar />
    {popularPosts.length > 0 && <PopularPosts posts={popularPosts} />}
    {categories.length > 0 && <CategoryList categories={categories} />}
    {tags.length > 0 && <TagCloud tags={tags} />}
    <MyWebsites />
    <DonateBtns />
  </aside>
);

export default RightSidebar;
