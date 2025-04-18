import Link from 'next/link';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

import { cn } from '@/lib/style';

interface ExternalLinkProps {
  href: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

const ExternalLink = ({
  href,
  title,
  children,
  className,
  showIcon = false,
}: ExternalLinkProps) => (
  <Link
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className={cn(
      'group inline-flex items-center text-blue-600 hover:underline hover:underline-offset-2 dark:text-blue-300',
      className
    )}
    aria-label={title}
  >
    {children ?? title}
    {showIcon && <ExternalLinkIcon className='ml-1 inline-block h-4 w-4' />}
  </Link>
);

export default ExternalLink;
