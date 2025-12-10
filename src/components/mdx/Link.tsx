import Link from 'next/link';
import { Link as LangLink } from '@/i18n/navigation';

import ExternalLink from '@/components/ui/ExternalLink';

type Props = React.ComponentPropsWithoutRef<'a'>;

const CustomLink = ({ href, children, ...rest }: Props) => {
  const isInternalLink = href && href.startsWith('/');
  const isAnchorLink = href && href.startsWith('#');

  if (isInternalLink)
    return (
      <LangLink
        href={href}
        className='hover:text-pink-700 hover:underline hover:underline-offset-2 dark:hover:text-pink-600'
        {...rest}
      >
        {children}
      </LangLink>
    );

  if (isAnchorLink)
    return (
      <Link
        href={href}
        className='hover:text-pink-700 hover:underline hover:underline-offset-2 dark:hover:text-pink-600'
        {...rest}
      >
        {children}
      </Link>
    );

  return (
    <ExternalLink href={href!} showIcon={true} {...rest}>
      {children}
    </ExternalLink>
  );
};

export default CustomLink;
