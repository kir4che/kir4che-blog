'use client';

import React, { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Languages, ChevronDown } from 'lucide-react';

import type { Language } from '@/types/language';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/style';

interface LangMenuProps {
  showIcon?: boolean;
  className?: string;
}

const LangMenu: React.FC<LangMenuProps> = ({
  showIcon = true,
  className = 'dropdown-bottom dropdown-end',
}) => {
  const locale = useLocale() as Language;
  const t = useTranslations('settings');

  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (nextLocale: Language) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className={cn('dropdown text-sm', className)}>
      <div
        tabIndex={0}
        role='button'
        className='flex items-center gap-x-1.5 hover:bg-inherit'
      >
        {showIcon && <Languages className='h-4 w-4' aria-hidden='true' />}
        <span>{t(`language.${locale}`)}</span>
        <ChevronDown className='h-4 w-4' aria-hidden='true' />
      </div>
      <ul
        tabIndex={0}
        className={cn(
          'dropdown-content bg-bg-secondary z-10 w-32 rounded-md shadow-md',
          className.includes('dropdown-bottom') ? 'mt-2' : 'mb-2'
        )}
      >
        {routing.locales.map((cur) => (
          <li key={cur}>
            <button
              type='button'
              onClick={() => changeLanguage(cur)}
              className='w-full px-3 py-2 text-left hover:bg-pink-100 dark:hover:bg-pink-900/20'
              disabled={isPending}
            >
              {t(`language.${cur}`)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LangMenu;
