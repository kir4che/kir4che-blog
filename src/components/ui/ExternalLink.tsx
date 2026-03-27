import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  noline?: boolean;
  showIcon?: boolean;
  children?: ReactNode;
}

const ExternalLink = ({
  href,
  className,
  noline = false,
  showIcon = false,
  'aria-label': ariaLabel,
  children,
  ...rest
}: ExternalLinkProps) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      'group text-primary inline-flex items-center gap-1',
      !noline && 'link link-hover hover:underline-offset-4',
      className
    )}
    aria-label={!children ? ariaLabel : undefined}
    {...rest}
  >
    {children}
    {showIcon && (
      <ExternalLinkIcon
        size={16}
        className="opacity-70 transition-transform group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    )}
  </a>
);

export default ExternalLink;
