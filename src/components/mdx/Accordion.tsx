import type { ReactNode } from 'react';

import { Triangle } from 'lucide-react';

import { cn } from '@/utils/cn';

interface AccordionProps {
  variant?: 'default' | 'basic' | 'pink';
  title: string;
  children?: ReactNode;
}

export const Accordion = ({ variant = 'default', title, children }: AccordionProps) => {
  return (
    <div
      className={cn('group collapse rounded-none', {
        'border border-pink-300 dark:border-pink-400/50': variant === 'default',
      })}
    >
      <input type="checkbox" className="peer" />
      <div
        className={cn(
          'collapse-title flex items-center text-base/4 font-semibold',
          variant === 'default' &&
            'border-pink-300 px-3 text-pink-700 peer-checked:border-b dark:border-pink-400/50 dark:text-pink-200',
          variant === 'basic' && 'text-foreground-primary px-0',
          variant === 'pink' &&
            'rounded-full border border-pink-300 bg-pink-50 py-2.5 text-sm text-pink-700 ' +
              'peer-checked:rounded-t-xl peer-checked:rounded-b-none peer-checked:border-b-0 ' +
              'dark:border-pink-400/50 dark:bg-pink-900/10 dark:text-pink-100'
        )}
      >
        <Triangle
          size={10}
          fill="currentColor"
          className="mr-2 rotate-90 transition-transform group-has-checked:rotate-180"
        />
        {title}
      </div>
      <div
        className={cn(
          'collapse-content overflow-hidden p-0',
          variant === 'default' && 'peer-checked:p-3',
          variant === 'pink' &&
            'peer-checked:rounded-b-xl peer-checked:border-x peer-checked:border-b peer-checked:border-pink-300 peer-checked:bg-pink-50 peer-checked:p-3 peer-checked:text-pink-700 dark:peer-checked:border-pink-400/50 dark:peer-checked:bg-pink-900/10 dark:peer-checked:text-pink-100'
        )}
      >
        {children}
      </div>
    </div>
  );
};
