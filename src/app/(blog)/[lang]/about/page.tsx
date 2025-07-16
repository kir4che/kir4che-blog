import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { CONFIG } from '@/config';
import youtubes from '@/config/youtubes';

import DecorativeImage from '@/components/ui/DecorativeImage';
import ExternalLink from '@/components/ui/ExternalLink';

const AboutPage = () => {
  const t = useTranslations('AboutPage');

  return (
    <>
      <Image
        src='/images/about-cover.webp'
        alt={t('coverImageAlt')}
        layout='responsive'
        width={1200}
        height={400}
        className='max-h-56 rounded-t-xl object-cover object-top shadow-lg'
      />
      <div className='bg-bg-secondary relative z-0 flex min-h-[760px] flex-col justify-between space-y-8 rounded-b-xl px-8 py-6 shadow'>
        <section>
          <h2 className='text-text-primary mb-4'>{t('title')}</h2>
          <h3 className='heading mb-4 -ml-8'>{t('intro')}</h3>
          <ul className='list-inside list-disc leading-7'>
            <li>{t('personalInfo.job')}</li>
            <li>{t('personalInfo.mbti')}</li>
            <li>{t('personalInfo.hobby')}</li>
            <li>{t('personalInfo.hobby2')}</li>
          </ul>
          <br />
          <p>{t('vlogIntro')}</p>
          <ExternalLink
            href={CONFIG.siteInfo.socialLinks.youtube}
            className='leading-8 hover:no-underline'
          >
            &gt;&gt;&gt;{' '}
            <span className='px-2 group-hover:font-medium'>YT</span>
            &lt;&lt;&lt;
          </ExternalLink>
          <div
            className='my-2 flex flex-wrap gap-x-4 gap-y-2'
            role='region'
            aria-label="kir4che's youtube"
          >
            {Object.entries(youtubes).map(([key, video]) => (
              <div key={key} className='max-w-60'>
                <div className='mb-2 aspect-video'>
                  <iframe
                    width='400'
                    height='200'
                    src={video.url}
                    title={video.title}
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                    className='h-full w-full rounded'
                  ></iframe>
                </div>
                <h4 className='text-text-primary dark:text-text-gray-light line-clamp-1 w-full truncate text-sm font-medium'>
                  {video.title}
                </h4>
                <time className='text-text-gray-light text-xs'>
                  {video.date}
                </time>
              </div>
            ))}
          </div>
        </section>
        <section className='relative space-y-2'>
          <h3 className='heading -ml-8'>{t('title_2')}</h3>
          <ExternalLink
            href={`mailto:${CONFIG.siteInfo.email}`}
            className='relative text-xl/7 font-medium break-words text-pink-600 hover:no-underline dark:text-pink-300'
          >
            {CONFIG.siteInfo.email}
            <span className='absolute top-full left-0 h-[3px] w-full origin-left scale-x-0 bg-pink-200 transition-transform duration-300 ease-in-out group-hover:scale-x-100'></span>
          </ExternalLink>
          <DecorativeImage
            src='/images/arrows-illustration.webp'
            desktopOnly={false}
            className='xxs:block absolute bottom-3 left-44 hidden max-h-24 max-w-24 rotate-6'
          />
        </section>
        <DecorativeImage
          src='/images/butterfly-illustration.webp'
          desktopOnly={false}
          className='absolute top-8 right-0 max-h-40 max-w-40 xl:right-8'
        />
        <DecorativeImage
          src='/images/butterfly-illustration-2.webp'
          className='absolute right-2 bottom-92 max-h-32 max-w-32 lg:right-60 2xl:right-72'
        />
        <DecorativeImage
          src='/images/about-illustration.webp'
          className='absolute -right-4 -bottom-8 max-h-80 max-w-80'
        />
      </div>
    </>
  );
};

export default AboutPage;
