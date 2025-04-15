import { ComponentProps } from 'react';
import { useSelectedLayoutSegment } from 'next/navigation';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/style';

const NavigationLink = ({ href, ...rest }: ComponentProps<typeof Link>) => {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `/${selectedLayoutSegment}` : '/';
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'inline-block text-sm hover:text-pink-700 hover:underline hover:underline-offset-4 dark:hover:text-white',
        isActive && 'text-primary font-medium text-pink-700 dark:text-white'
      )}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    />
  );
};

export default NavigationLink;
