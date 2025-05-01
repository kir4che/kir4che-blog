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
        'inline-block text-sm hover:text-pink-600 dark:hover:text-pink-200',
        isActive && 'font-medium text-pink-700 dark:text-pink-300'
      )}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    />
  );
};

export default NavigationLink;
