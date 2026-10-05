import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/utils/cn';

const ALIGNMENT_CLASSES = {
  left: 'mr-auto items-start',
  center: 'mx-auto items-center',
  right: 'ml-auto items-end',
} as const;

interface FigureShellProps {
  align?: 'left' | 'center' | 'right';
  title?: ReactNode;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
}

const renderInlineCode = (title: ReactNode) => {
  if (typeof title !== 'string') return title;
  return title
    .split(/(`[^`]*`)/g)
    .map((part, i) =>
      part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
        <code key={i}>{part.slice(1, -1)}</code>
      ) : (
        part
      )
    );
};

export const FigCaption = ({ title }: { title: ReactNode }) => (
  <figcaption
    className="line-clamp-1 text-center text-xs text-pink-700 dark:text-pink-200"
    title={typeof title === 'string' ? title.replaceAll('`', '') : undefined}
  >
    {renderInlineCode(title)}
  </figcaption>
);

export const FigureShell = ({
  align = 'center',
  title,
  className,
  style,
  children,
  ...rest
}: FigureShellProps) => (
  <figure
    className={cn('flex flex-col gap-y-2.5', ALIGNMENT_CLASSES[align], className)}
    style={style}
    {...(rest as React.HTMLAttributes<HTMLElement>)}
  >
    {children}
    {title && <FigCaption title={title} />}
  </figure>
);
