'use client';

import { useTranslations } from 'next-intl';
import { Hash } from 'lucide-react';

import type { Tag } from '@/types';
import { Link } from '@/i18n/navigation';

interface TagCloudProps {
  tags: Pick<Tag, 'name' | 'slug'>[];
}

const TagCloud = ({ tags }: TagCloudProps) => {
  const t = useTranslations('sidebar');

  return (
    <>
      <h3 className='mb-2 flex items-center gap-x-2 uppercase'>
        <Hash
          className='h-4 w-4 text-pink-700 dark:text-pink-500'
          aria-hidden='true'
        />
        {t('tags')}
      </h3>
      <div className='flex flex-wrap gap-2'>
        {tags.map(({ name, slug }) => (
          <Link
            key={slug}
            href={`/tags/${slug}`}
            className='group transition-color relative overflow-hidden rounded bg-pink-500/80 px-1.5 py-0.5 text-sm font-medium text-white duration-300 dark:bg-pink-800/35 dark:text-pink-50'
          >
            <span className='relative z-10'># {name}</span>
            <span className='absolute top-0 left-[-75%] h-full w-1/2 skew-x-[-20deg] transform bg-white/10 transition-all duration-700 group-hover:left-[125%]' />
          </Link>
        ))}
      </div>
    </>
  );
};

export default TagCloud;
