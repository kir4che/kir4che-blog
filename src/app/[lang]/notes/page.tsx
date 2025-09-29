import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

const NotesPage = async () => {
  const t = await getTranslations('NotesPage');

  return (
    <div className='space-y-4'>
      <h1>{t('title')}</h1>
      <p className='text-gray-500'>{t('description')}</p>
    </div>
  );
};

export default NotesPage;
