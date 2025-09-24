import React from 'react';
import { Triangle } from 'lucide-react';

import { cn } from '@/lib/style';

interface AccordionProps {
  variant?: 'default' | 'primary' | 'secondary';
  title: string;
  children: React.ReactNode;
  className?: string;
}

const accordionStyles = {
  container: {
    base: 'group collapse rounded-none',
    variants: {
      default: 'bg-black/0',
      primary: 'border border-pink-300 bg-black/0 dark:border-pink-400/50',
      secondary: 'text-text-secondary',
    },
  },
  title: {
    base: 'collapse-title font-semibold',
    variants: {
      default:
        'border-b border-b-text-primary/20 px-0 text-text-primary dark:border-b-text-gray',
      primary:
        'border-b border-pink-300 px-3 text-pink-700 dark:border-pink-400/50 dark:text-pink-200',
      secondary:
        'rounded-md border border-pink-300 bg-pink-50 py-2.5 text-sm text-pink-700 peer-checked:rounded-b-none peer-checked:border-b-0 dark:border-pink-400/50 dark:bg-pink-900/10 dark:text-pink-100',
    },
  },
  content: {
    base: 'collapse-content',
    variants: {
      default: 'px-0',
      primary: 'px-3',
      secondary:
        'rounded-b-md border-x border-b border-pink-300 bg-pink-50 pt-1 pb-3 text-pink-700 dark:border-pink-400/50 dark:bg-pink-900/10 dark:text-pink-100',
    },
  },
};

const Accordion: React.FC<AccordionProps> = ({
  variant = 'default',
  title,
  children,
  className,
}) => (
  <div
    className={cn(
      accordionStyles.container.base,
      accordionStyles.container.variants[variant],
      className
    )}
  >
    <input type='checkbox' className='peer' />
    <div
      className={cn(
        accordionStyles.title.base,
        accordionStyles.title.variants[variant]
      )}
    >
      <Triangle
        size={10}
        fill='currentColor'
        className='mr-2 mb-1 inline-block rotate-90 transition-transform group-has-[:checked]:rotate-180'
      />
      {title}
    </div>
    <div
      className={cn(
        accordionStyles.content.base,
        accordionStyles.content.variants[variant]
      )}
    >
      {children}
    </div>
  </div>
);

export default Accordion;
