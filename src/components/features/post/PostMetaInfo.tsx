import React from 'react';
import { useFormatter } from 'next-intl';
import { CalendarDays, Pencil } from 'lucide-react';

import { cn } from '@/lib/style';

interface PostMetaInfoProps {
  t: (key: string) => string;
  date: string;
  wordCount: number | undefined;
  className?: string;
}

const PostMetaInfo: React.FC<PostMetaInfoProps> = ({
  t,
  date,
  wordCount,
  className,
}) => {
  const formatter = useFormatter();

  return (
    <div
      className={cn(
        'text-text-gray flex flex-wrap items-center gap-x-3 text-xs dark:text-white/90',
        className
      )}
    >
      {date && !isNaN(new Date(date).getTime()) ? (
        <time dateTime={date} className='flex items-center gap-x-1'>
          <CalendarDays className='h-3.5 w-3.5' aria-hidden='true' />
          <span>
            {formatter
              .dateTime(new Date(date), {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\//g, '.')}
          </span>
        </time>
      ) : null}
      {wordCount && wordCount > 0 && (
        <p className='flex items-center gap-x-1'>
          <Pencil className='h-3.5 w-3.5' aria-hidden='true' />
          <span>
            {wordCount.toLocaleString()} {t('unit.words')}
          </span>
        </p>
      )}
    </div>
  );
};

export default PostMetaInfo;
