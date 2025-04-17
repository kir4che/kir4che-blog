import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { EMAIL } from '@/config/constants';

import ExternalLink from '@/components/ui/ExternalLink';

const Banner: React.FC = () => {
  const t = useTranslations('PortfolioPage.banner');

  return (
    <section className='flex items-center justify-center gap-12 bg-pink-100/50 px-8 py-16 sm:px-16 md:ml-12 md:gap-12 md:rounded-s-full md:py-20 lg:ml-20 lg:gap-20 lg:px-0'>
      <Image
        src='/images/portfolio/banner.webp'
        alt='Illustration of portfolio banner'
        width={400}
        height={400}
        className='hidden w-64 md:block lg:w-72'
      />
      <div className='flex flex-col items-center text-center md:items-start md:text-left'>
        <span className='mb-2.5 inline-block w-fit rounded-full rounded-bl-none bg-pink-500 px-3 py-1 text-sm text-white'>
          {t('heading')}
        </span>
        <h1 className='font-rubikDoodleShadow mb-6 text-6xl font-bold'>
          {t('name')}
        </h1>
        <p className='text-text-gray-dark mb-10 text-sm/8'>
          {t('description')}
        </p>
        <div className='w-fit'>
          <ExternalLink
            href={`mailto:${EMAIL}`}
            className='text-text-primary relative z-10 text-xl font-semibold hover:no-underline'
          >
            {EMAIL}
          </ExternalLink>
          <hr className='relative bottom-2 w-full border-4 border-pink-300' />
        </div>
      </div>
    </section>
  );
};

export default Banner;
