import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { withLocalePrefix } from '@/lib/paths';
import type { Language } from '@/types';

interface LocalizedLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'lang'
> {
  href: string;
  lang?: Language;
  children?: ReactNode;
}

const LocalizedLink = ({ href, lang, children, ...rest }: LocalizedLinkProps) => {
  const resolvedHref = lang && !href.startsWith('#') ? withLocalePrefix(href, lang) : href;
  return (
    <a href={resolvedHref} {...rest}>
      {children}
    </a>
  );
};

export default LocalizedLink;
