import type { AnchorHTMLAttributes, ReactNode } from 'react';

import ExternalLink from '@/components/ui/ExternalLink';
import LocalizedLink from '@/components/ui/LocalizedLink';

import type { Language } from '@/types';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'lang'> {
  href?: string;
  lang?: Language;
  children?: ReactNode;
}

export const Link = ({ href = '', lang, children, ...rest }: LinkProps) => {
  const isInternal = href.startsWith('#') || href.startsWith('/');

  if (isInternal)
    return (
      <LocalizedLink
        href={href}
        lang={lang}
        className="group link link-hover text-pink-700 hover:text-pink-800 hover:underline-offset-4 dark:text-pink-400 dark:hover:text-pink-300"
        {...rest}
      >
        {children}
      </LocalizedLink>
    );

  return (
    <ExternalLink
      href={href}
      showIcon
      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      {...rest}
    >
      {children}
    </ExternalLink>
  );
};
