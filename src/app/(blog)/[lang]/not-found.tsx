import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const t = useTranslations('NotFoundPage');

  return (
    <main className='flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center text-center'>
      <div className='animate-[fadeInUp_0.5s_ease-out]'>
        <h1 className='mb-4 text-8xl text-pink-400'>404</h1>
        <h2 className='text-text-gray dark:text-text-gray-light mb-4'>
          {t('title')}
        </h2>
        <p className='text-text-gray-light dark:text-text-gray mb-8 leading-7'>
          {t('description')}
        </p>
        <Link
          href='/'
          className='inline-flex items-center gap-x-1 rounded-lg bg-pink-600 px-6 py-3 text-white transition-all hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:outline-none'
          tabIndex={0}
          aria-label={t('backHome')}
        >
          <ArrowLeft className='h-5 w-5' />
          {t('backHome')}
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
