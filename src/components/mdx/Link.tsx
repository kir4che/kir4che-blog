import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { withLocalePrefix } from '@/lib/paths';
import { cn } from '@/utils/cn';

import type { Language } from '@/types';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'lang'> {
  href?: string;
  lang?: Language;
  children?: ReactNode;
}

export const Link = ({ href = '', lang, children, className, ...rest }: LinkProps) => {
  const isInternal = href.startsWith('#') || href.startsWith('/');

  if (isInternal) {
    const resolvedHref = lang && !href.startsWith('#') ? withLocalePrefix(href, lang) : href;
    return (
      <a
        href={resolvedHref}
        className={cn(
          'group link link-hover text-pink-700 hover:text-pink-800 hover:underline-offset-4 dark:text-pink-400 dark:hover:text-pink-300',
          className
        )}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
        className
      )}
      {...rest}
    >
      {children}
      <ExternalLinkIcon
        size={16}
        className="opacity-70 transition-transform group-hover:-translate-y-0.5"
        aria-hidden="true"
      />
    </a>
  );
};
