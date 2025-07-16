'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import Navbar from '@/components/layouts/Navbar';

interface HeaderProps {
  lang: string;
}

const Header: React.FC<HeaderProps> = ({ lang }) => {
  const t = useTranslations('PostsPage');
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
          className='flex items-center gap-1 bg-pink-600 px-2 py-1 text-xs font-medium text-white hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800'
        >
          {t('addNewPost')} <Plus size={14} className='inline' />
        </button>
      )}
      <Navbar />
    </header>
  );
};

export default Header;
