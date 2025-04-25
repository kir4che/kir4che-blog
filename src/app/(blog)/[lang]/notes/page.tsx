import { useTranslations } from 'next-intl';

const NotesPage = () => {
  const t = useTranslations('NotesPage');

  return (
    <div className='space-y-4'>
      <h1>{t('title')}</h1>
      <p className='text-gray-500'>{t('description')}</p>
    </div>
  );
};

export default NotesPage;
