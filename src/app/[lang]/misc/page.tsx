import { useTranslations } from 'next-intl';

const MiscPage = () => {
  const t = useTranslations('MiscPage');

  return (
    <div className='space-y-4'>
      <h1>{t('title')}</h1>
      <p className='text-gray-500'>{t('description')}</p>
    </div>
  );
};

export default MiscPage;
