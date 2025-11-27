'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';

import { CONFIG } from '@/config';
import youtubes from '@/config/youtubes';

import DecorativeImage from '@/components/ui/DecorativeImage';
import ExternalLink from '@/components/ui/ExternalLink';

const ANIMATIONS = {
  videoCard: {
    hover: { y: -6, rotate: -1 },
    transition: { type: 'spring' as const, stiffness: 260, damping: 18 },
  },
  videoThumbnail: {
    hover: { scale: 1.02 },
    transition: { type: 'spring' as const, stiffness: 280, damping: 20 },
  },
  floatingArrow: {
    animate: { y: [0, -6, 6, 0], rotate: [0, 2, -2, 0] },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

const AboutPageClient = () => {
  const t = useTranslations('AboutPage');

  return (
    <div className='bg-bg-secondary relative z-0 flex-col justify-between space-y-8 rounded-b-xl px-8 py-6 shadow'>
      <section>
        <h2 className='text-text-primary mb-4'>{t('title')}</h2>
        <h3 className='heading mb-4 -ml-8'>{t('intro')}</h3>
        <ul className='list-inside list-disc leading-7'>
          <li>{t('personalInfo.job')}</li>
          <li>{t('personalInfo.mbti')}</li>
          <li>{t('personalInfo.hobby')}</li>
          <li>{t('personalInfo.hobby2')}</li>
        </ul>
        <div className='mt-6'>
          <p>{t('vlogIntro')}</p>
          <ExternalLink
            href={CONFIG.siteInfo.socialLinks.youtube}
            className='leading-8 hover:no-underline'
          >
            &gt;&gt;&gt;{' '}
            <span className='px-2 group-hover:font-medium'>YT</span>{' '}
            &lt;&lt;&lt;
          </ExternalLink>
          <div
            className='my-2 flex flex-wrap gap-x-4 gap-y-2'
            role='region'
            aria-label={`${CONFIG.siteInfo.name}'s youtube videos`}
          >
            {Object.entries(youtubes).map(([key, video]) => (
              <motion.div
                key={key}
                className='max-w-60'
                whileHover={ANIMATIONS.videoCard.hover}
                transition={ANIMATIONS.videoCard.transition}
              >
                <motion.div
                  className='mb-2 aspect-video'
                  whileHover={ANIMATIONS.videoThumbnail.hover}
                  transition={ANIMATIONS.videoThumbnail.transition}
                >
                  <iframe
                    width='400'
                    height='200'
                    src={video.url}
                    title={video.title}
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                    className='size-full rounded'
                    loading='lazy'
                  />
                </motion.div>
                <h4 className='text-text-primary dark:text-text-gray-light line-clamp-1 w-full truncate text-sm font-medium'>
                  {video.title}
                </h4>
                <time className='text-text-gray-light text-xs'>
                  {video.date}
                </time>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className='relative space-y-2 xl:mb-36'>
        <h3 className='heading -ml-8'>{t('title_2')}</h3>
        <ExternalLink
          href={`mailto:${CONFIG.siteInfo.email}`}
          className='wrap-break-words relative text-xl/7 font-medium text-pink-600 hover:no-underline dark:text-pink-300'
        >
          {CONFIG.siteInfo.email}
          <span className='absolute top-full left-0 h-[3px] w-full origin-left scale-x-0 bg-pink-200 transition-transform duration-300 ease-in-out group-hover:scale-x-100' />
        </ExternalLink>
        <motion.div className='absolute bottom-3 left-44'>
          <motion.div
            animate={ANIMATIONS.floatingArrow.animate}
            transition={ANIMATIONS.floatingArrow.transition}
          >
            <DecorativeImage
              src='/images/arrows-illustration.webp'
              desktopOnly={false}
              className='xxs:block hidden max-h-24 max-w-24 rotate-6'
            />
          </motion.div>
        </motion.div>
      </section>
      <DecorativeImage
        src='/images/butterfly-illustration.webp'
        desktopOnly={false}
        className='absolute top-8 right-0 max-h-40 max-w-40 xl:right-8'
      />
      <DecorativeImage
        src='/images/butterfly-illustration-2.webp'
        className='absolute right-2 bottom-[420px] max-h-32 max-w-32 lg:right-60 2xl:right-72'
      />
      <DecorativeImage
        src='/images/about-illustration.webp'
        className='absolute -right-8 -bottom-8 max-h-80 max-w-80 md:-right-4'
        desktopOnly={false}
      />
    </div>
  );
};

export default AboutPageClient;
