import { notFound } from 'next/navigation';

import type { Language } from '@/types';

import LeftSidebar from '@/components/layouts/LeftSidebar';
import RightSidebar from '@/components/layouts/RightSidebar';

interface SidebarProps {
  lang: Language;
  children: React.ReactNode;
}

const Sidebar = async ({ lang, children }: SidebarProps) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/taxonomy?limit=30&lang=${lang}`,
    {
      cache: 'force-cache',
    }
  );

  if (!res.ok) return notFound();

  const { categories, tags } = await res.json();
  if (!Array.isArray(categories) || !Array.isArray(tags)) return notFound();

  return (
    <div className='mx-auto flex max-w-screen-2xl flex-col px-4 md:flex-row md:px-2'>
      <LeftSidebar />
      <div className='flex flex-1 gap-x-8 overflow-hidden md:pt-8'>
        {children}
        <RightSidebar categories={categories} tags={tags} />
      </div>
    </div>
  );
};

export default Sidebar;
