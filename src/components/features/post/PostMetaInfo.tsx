import React from 'react';
import { format } from 'date-fns';
import { CalendarDays, Pencil } from 'lucide-react';

import { cn } from '@/lib/style';

interface PostMetaInfoProps {
  t: (key: string) => string;
  date: string;
  wordCount: number;
  className?: string;
}

const PostMetaInfo: React.FC<PostMetaInfoProps> = ({
  t,
  date,
  wordCount,
  className,
}) => (
  <div
    className={cn(
      'text-text-gray flex flex-wrap items-center gap-x-3 text-xs dark:text-white/90',
      className
    )}
  >
    {date && !isNaN(new Date(date).getTime()) ? (
      <time dateTime={date} className='flex items-center gap-x-1'>
        <CalendarDays className='h-3.5 w-3.5' aria-hidden='true' />
        <span>{format(new Date(date), 'yyyy.MM.dd')}</span>
      </time>
    ) : null}
    <p className='flex items-center gap-x-1'>
      <Pencil className='h-3.5 w-3.5' aria-hidden='true' />
      <span>
        {wordCount} {t('unit.words')}
      </span>
    </p>
  </div>
);

export default PostMetaInfo;
