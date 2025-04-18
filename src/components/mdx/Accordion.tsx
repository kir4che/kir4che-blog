import React from 'react';

import { cn } from '@/lib/style';

interface AccordionProps {
  variant: 'default' | 'primary' | 'secondary';
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  variant = 'default',
  title,
  children,
  className,
}) => (
  <div
    className={cn(
      'collapse-arrow collapse rounded-none',
      variant === 'default' && 'bg-black/0',
      variant === 'primary' &&
        'bg-/0 border border-pink-300 dark:border-pink-400/50',
      variant === 'secondary' && 'text-text-secondary',
      className
    )}
  >
    <input type='checkbox' />
    <div
      className={cn(
        'collapse-title font-semibold',
        variant === 'default' &&
          'border-b-text-primary/20 dark:border-b-text-gray text-text-primary border-b px-0',
        variant === 'primary' &&
          'border-b border-pink-300 px-3 text-pink-700 dark:border-pink-400/50 dark:text-pink-200',
        variant === 'secondary' && 'rounded-xl bg-pink-500 dark:bg-pink-500',
        className
      )}
    >
      {title}
    </div>
    <div
      className={cn(
        'collapse-content',
        variant === 'default' && 'px-0',
        variant === 'primary' && 'px-3',
        variant === 'secondary' &&
          'bg-bg-primary mt-2 rounded-xl border-2 border-pink-400 dark:border-pink-500',
        className
      )}
    >
      {children}
    </div>
  </div>
);

export default Accordion;
