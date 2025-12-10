import type { Language } from '@/types';

import { getSidebarData } from '@/lib/siteData';

import LeftSidebar from '@/components/layouts/LeftSidebar';
import RightSidebar from '@/components/layouts/RightSidebar';

interface PageShellProps {
  lang: Language;
  children: React.ReactNode;
}

const PageShell = ({ lang, children }: PageShellProps) => {
  const { categories, tags, popularPosts } = getSidebarData(lang);
  const simplifiedTags = tags.map(({ name, slug }) => ({ name, slug }));

  return (
    <div className='mx-auto flex min-h-screen max-w-screen-2xl flex-col px-4 md:flex-row md:px-2'>
      <LeftSidebar />
      <div className='flex flex-1 items-stretch gap-x-8 overflow-hidden md:pt-8'>
        {children}
        <RightSidebar
          categories={categories}
          tags={simplifiedTags}
          popularPosts={popularPosts}
        />
      </div>
    </div>
  );
};

export default PageShell;
