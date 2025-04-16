import Image from 'next/image';
import { useTranslations } from 'next-intl';

import Title from '@/components/features/portfolio/Title';
import Paragraphs from '@/components/ui/Paragraphs';

const About: React.FC = () => {
  const t = useTranslations('PortfolioPage.about');
  const hobbies = t.raw('hobby.content') as Record<string, string>;

  return (
    <section
      id='about'
      className='relative mx-auto max-w-screen-md px-8 pt-16 pb-12 lg:px-0'
    >
      <Title className='md:mx-0' text={t('title')} />
      <div className='flex flex-col justify-between gap-8 md:flex-row'>
        <div className='order-2 grow md:order-none'>
          <Paragraphs text={t('description')} />
          <div className='mt-6 space-y-3 md:mt-12'>
            <p className='text-xs text-pink-700'>{t('hobby.title')}</p>
            <ul className='flex flex-wrap items-center gap-2'>
              {Object.values(hobbies).map((skill: string, index: number) => (
                <li
                  key={index}
                  className='rounded-full bg-pink-200/80 px-3 py-1 text-xs'
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='order-1 mx-auto md:order-none'>
          <Image
            src='/images/portfolio/molly.jpg'
            alt='Portrait of Molly'
            width={500}
            height={500}
            className='w-80 transform rounded-md transition duration-300 hover:scale-105 hover:rotate-3 md:w-full'
          />
        </div>
        <p className='absolute bottom-32 -left-2 -rotate-6 text-9xl font-bold tracking-wider text-pink-400 opacity-20 md:top-52 md:-left-4 lg:-left-24'>
          {t('mbti')}
        </p>
      </div>
    </section>
  );
};

export default About;
