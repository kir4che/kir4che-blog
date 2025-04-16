'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useMessages, useTranslations } from 'next-intl';

import Title from '@/components/features/portfolio/Title';
import Paragraphs from '@/components/ui/Paragraphs';

const categories = ['frontend', 'backend', 'languages', 'others'] as const;
type Category = (typeof categories)[number];

type SkillItem = {
  name: string;
  level?: string;
};

type SkillCategory = Record<string, SkillItem>;

type SkillMessages = {
  PortfolioPage: {
    skill: Record<Category, SkillCategory>;
  };
};

const SkillIcon = ({ src, alt }: { src: string; alt: string }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={50}
      height={50}
      className='xs:h-12 xs:w-12 h-9 w-9'
      onError={() => setImgSrc('/icons/no-image.svg')}
      tabIndex={0}
      aria-describedby={`${alt}-tooltip`}
    />
  );
};

const SkillList: React.FC = () => {
  const t = useTranslations('PortfolioPage.skill');
  const messages = useMessages() as SkillMessages;
  const skillData = messages.PortfolioPage.skill;

  return (
    <div id='skill' className='mx-auto pt-6'>
      <Title text={t('title')} />
      <p className='mb-2 text-center'>{t('subtitle')}</p>
      <p className='text-text-gray-light mb-5 text-center text-xs'>
        {t('tip')}
      </p>
      <div className='rounded-lg bg-pink-200 py-5'>
        <div className='xs:rounded-xl xs:space-y-5 mx-auto max-w-screen-md space-y-4 bg-white py-6'>
          {categories.map((cat) => (
            <ul
              key={cat}
              className='xs:gap-x-0 flex flex-wrap items-center justify-center gap-x-6 gap-y-4'
            >
              {Object.entries(skillData[cat]).map(([key, skill]) => (
                <li
                  key={key}
                  className='xs:w-24 flex w-fit flex-col items-center gap-1.5'
                >
                  <div className={skill.level ? 'dropdown dropdown-hover' : ''}>
                    <SkillIcon
                      src={`/images/portfolio/icons/${key}.svg`}
                      alt={skill.name}
                    />
                    {skill.level && (
                      <div
                        className='dropdown-content menu bg-text-primary/85 z-10 rounded-md'
                        role='tooltip'
                        id={`${key}-tooltip`}
                      >
                        <Paragraphs
                          text={skill.level}
                          className='text-text-secondary text-sm text-nowrap'
                        />
                      </div>
                    )}
                  </div>
                  <span className='xs:block hidden text-center text-sm'>
                    {skill.name}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillList;
