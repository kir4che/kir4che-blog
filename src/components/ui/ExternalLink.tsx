import Link from 'next/link';

import { cn } from '@/lib/style';

interface ExternalLinkProps {
  href: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const ExternalLink = ({
  href,
  title,
  children,
  className,
}: ExternalLinkProps) => (
  <Link
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className={cn(
      'group inline-block w-full max-w-full text-blue-600 hover:underline hover:underline-offset-2 dark:text-blue-300',
      className
    )}
    aria-label={title}
  >
    {children ?? title}
  </Link>
);

export default ExternalLink;
