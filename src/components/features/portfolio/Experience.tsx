import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SquareArrowOutUpRight, MapPin } from 'lucide-react';

import Title from '@/components/features/portfolio/Title';
import ExternalLink from '@/components/ui/ExternalLink';

const Experience: React.FC = () => {
  const t = useTranslations('PortfolioPage.experience');

  const contents = {
    '25sprout': t.raw('25sprout.content'),
    mrhost: t.raw('mrhost.content'),
  } as Record<string, any>;

  const skills = {
    '25sprout': t.raw('25sprout.skills'),
    mrhost: t.raw('mrhost.skills'),
  } as Record<string, any>;

  const experiences = ['25sprout', 'mrhost'] as const;

  return (
    <section
      id='experience'
      className='xs:px-8 mx-auto max-w-screen-md px-4 py-4 md:py-12 lg:px-0'
    >
      <Title className='mb-6' text={t('title')} />
      <div className='space-y-3'>
        {experiences.map((key) => (
          <section key={key} className='collapse-arrow collapse rounded-md'>
            <input
              type='radio'
              name='my-accordion-1'
              defaultChecked={key === '25sprout'}
            />
            <div className='collapse-title flex flex-wrap items-center justify-between gap-y-2 rounded-t-md bg-pink-600 font-medium text-white'>
              <span>{t(`${key}.position`)}</span>
              <span className='ml-auto text-xs sm:text-sm'>
                {t(`${key}.date`)}
              </span>
            </div>
            <section className='collapse-content rounded-b-md border-2 border-pink-500 bg-white py-4'>
              <div className='mb-3 flex flex-wrap items-center justify-between gap-y-2'>
                <div className='flex items-center gap-x-2'>
                  <Image
                    src={`/images/portfolio/${key}.png`}
                    alt={key}
                    width={40}
                    height={40}
                    className='h-auto w-10'
                  />
                  <div className='text-text-gray flex w-full items-center gap-x-1'>
                    <MapPin className='h-3.5 w-3.5' />
                    <p className='text-xs text-nowrap'>
                      {t(`${key}.location`)}
                    </p>
                  </div>
                </div>
                <ExternalLink
                  href={t(`${key}.link`)}
                  className='xs:w-fit flex items-center justify-end gap-x-1'
                >
                  <SquareArrowOutUpRight className='h-4 w-4' />
                  <span className='xs:text-sm text-xs'>
                    {t(`${key}.title`)}
                  </span>
                </ExternalLink>
              </div>
              <ul className='list-disc pl-5 leading-[1.85] marker:text-pink-800'>
                {contents[key] && typeof contents[key] === 'object'
                  ? Object.entries(
                      contents[key] as Record<string, unknown>
                    ).map(([index, item]) =>
                      typeof item === 'object' && item !== null ? (
                        <li key={index} className='list-none'>
                          <ul className='pl-4'>
                            {Object.values(
                              item as Record<string, React.ReactNode>
                            ).map((subItem, subIndex) => (
                              <li
                                key={subIndex}
                                className='list-[circle] marker:text-pink-800'
                              >
                                {subItem}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ) : (
                        <li key={index}>{item as React.ReactNode}</li>
                      )
                    )
                  : null}
              </ul>
              <ul className='mt-8 flex flex-wrap items-center gap-2'>
                {skills[key] && typeof skills[key] === 'object'
                  ? Object.values(skills[key] as Record<string, string>).map(
                      (skill, index) => (
                        <li
                          key={index}
                          className='rounded-full bg-pink-200/80 px-3 py-1 text-xs'
                        >
                          {skill}
                        </li>
                      )
                    )
                  : null}
              </ul>
            </section>
          </section>
        ))}
      </div>
    </section>
  );
};

export default Experience;
