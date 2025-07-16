'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import Navbar from '@/components/layouts/Navbar';

interface HeaderProps {
  lang: string;
}

const Header: React.FC<HeaderProps> = ({ lang }) => {
  const router = useRouter();

  const handleNewPost = () => {
    router.push(`/${lang}/posts/editor`);
  };

  return (
    <header className='mb-3 flex items-center justify-between'>
      {process.env.NEXT_PUBLIC_NODE_ENV === 'development' && (
        <button
          type='button'
          onClick={handleNewPost}
          className='flex items-center gap-1 bg-pink-600 px-2 py-1 text-xs font-medium text-white hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600'
        >
          新增文章 <Plus size={14} className='inline' />
        </button>
      )}
      <Navbar />
    </header>
  );
};

export default Header;
