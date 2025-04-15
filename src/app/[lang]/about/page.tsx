import React from 'react';
import Image from 'next/image';

import { SOCIAL_LINKS } from '@/config/constants';
import { getTranslations } from 'next-intl/server';

import YouTubeVideoList from '@/components/features/YouTubeVideoList';
import DecorativeImage from '@/components/ui/DecorativeImage';
import ExternalLink from '@/components/ui/ExternalLink';

const AboutPage = async () => {
  const t = await getTranslations('AboutPage');

  return (
    <>
      <Image
        src='/images/about-cover.png'
        alt={t('coverImageAlt')}
        layout='responsive'
        width={1200}
        height={400}
        className='max-h-72 rounded-t-xl object-cover object-top shadow-lg'
      />
      <div className='bg-bg-secondary relative z-0 space-y-8 rounded-b-xl px-8 py-6 shadow'>
        <section>
          <h2 className='text-primary mb-4'>{t('title')}</h2>
          <h3 className='heading mb-4 -ml-8'>{t('intro')}</h3>
          <ul className='list-inside list-disc leading-7'>
            <li>{t('personalInfo.job')}</li>
            <li>{t('personalInfo.education')}</li>
            <li>{t('personalInfo.personality')}</li>
            <li>{t('personalInfo.hobbies')}</li>
          </ul>
          <br />
          <p>{t('vlogIntro')}</p>
          <ExternalLink
            href={SOCIAL_LINKS.youtube}
            className='leading-7 hover:no-underline'
          >
            &gt;&gt;&gt; <span className='group-hover:font-medium'>YT</span>{' '}
            &lt;&lt;&lt;
          </ExternalLink>
          <YouTubeVideoList count={3} className='py-3' />
          <p>{t('streamingIntro')}</p>
          <ExternalLink
            href={SOCIAL_LINKS.twitch}
            className='leading-7 hover:no-underline'
          >
            &gt;&gt;&gt; <span className='group-hover:font-medium'>Twitch</span>{' '}
            &lt;&lt;&lt;
          </ExternalLink>
        </section>
        <section className='relative space-y-2'>
          <h3 className='heading -ml-8'>{t('title_2')}</h3>
          <ExternalLink
            href='mailto:mollydcxxiii@gmail.com'
            className='relative text-xl/7 font-medium break-words text-pink-600 hover:no-underline dark:text-pink-300'
          >
            mollydcxxiii@gmail.com
            <span className='absolute top-full left-0 h-[3px] w-full origin-left scale-x-0 bg-pink-200 transition-transform duration-300 ease-in-out group-hover:scale-x-100'></span>
          </ExternalLink>
          <DecorativeImage
            src='/images/arrows-illustration.png'
            desktopOnly={false}
            className='xxs:block absolute bottom-3 left-44 hidden max-h-24 max-w-24 rotate-6'
          />
        </section>
        <DecorativeImage
          src='/images/butterfly-illustration.png'
          desktopOnly={false}
          className='absolute top-8 right-0 max-h-40 max-w-40 xl:right-8'
        />
        <DecorativeImage
          src='/images/butterfly-illustration-2.png'
          className='absolute right-2 bottom-80 max-h-32 max-w-32 lg:right-60 2xl:right-72'
        />
        <DecorativeImage
          src='/images/about-illustration.png'
          className='absolute -right-4 -bottom-8 max-h-80 max-w-80'
        />
      </div>
    </>
  );
};

export default AboutPage;
