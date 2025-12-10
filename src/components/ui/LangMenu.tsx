'use client';

import { useCallback, useId, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Languages, ChevronDown } from 'lucide-react';

import type { Language } from '@/types';
import { useRouter, usePathname } from '@/i18n/navigation';
import routing from '@/i18n/routing';
import { cn } from '@/lib/style';
import { getLocalizedPostPath } from '@/lib/paths';
import { useDropdown } from '@/hooks/useDropdown';

type DropdownControls = ReturnType<typeof useDropdown>;
type DropdownProp = { dropdown: DropdownControls };

interface GlobalLangMenuProps {
  variant?: 'global';
  showIcon?: boolean;
  className?: string;
}

interface PostLangMenuProps {
  variant: 'post';
  curLang: Language;
  langs: Language[];
  slug: string;
  date?: string;
  metadata?: Partial<Record<Language, { date?: string }>>;
  className?: string;
}

type LangMenuProps = GlobalLangMenuProps | PostLangMenuProps;

const GlobalLangMenu = ({
  showIcon = true,
  className = 'dropdown-bottom dropdown-end',
  dropdown,
}: GlobalLangMenuProps & DropdownProp) => {
  const locale = useLocale() as Language;
  const t = useTranslations('settings');
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { ref, isOpen, toggle, close } = dropdown;

  const changeLanguage = useCallback(
    (nextLocale: Language) => {
      if (nextLocale === locale) {
        close();
        return;
      }

      startTransition(() => {
        router.replace(pathname, { locale: nextLocale });
      });

      close();
    },
    [close, locale, pathname, router]
  );

  return (
    <div ref={ref} className={cn('dropdown text-sm', className)}>
      <button
        type='button'
        className='flex cursor-pointer items-center gap-x-1.5 hover:bg-inherit'
        onClick={toggle}
        aria-haspopup='menu'
        aria-expanded={isOpen}
      >
        {showIcon && <Languages className='size-4' aria-hidden='true' />}
        <span>{t(`language.${locale}`)}</span>
        <ChevronDown className='size-4' aria-hidden='true' />
      </button>
      <ul
        role='menu'
        className={cn(
          'dropdown-content bg-bg-secondary z-10 w-32 rounded-md shadow-md',
          className.includes('dropdown-bottom') ? 'mt-2' : 'mb-2',
          isOpen ? 'block' : 'hidden'
        )}
      >
        {routing.locales.map((cur) => (
          <li key={cur}>
            <button
              type='button'
              onClick={() => changeLanguage(cur as Language)}
              className={cn(
                'w-full px-3 py-2 text-left hover:bg-pink-100 dark:hover:bg-pink-900/20',
                cur === locale &&
                  'font-semibold text-pink-700 dark:text-pink-200'
              )}
              disabled={isPending}
              role='menuitemradio'
              aria-checked={cur === locale}
            >
              {t(`language.${cur}`)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PostLangMenu = ({
  curLang,
  langs,
  slug,
  date,
  metadata = {},
  className,
  dropdown,
}: PostLangMenuProps & DropdownProp) => {
  const t = useTranslations('settings');
  const menuId = useId();
  const { ref, isOpen, toggle, close } = dropdown;

  const getHref = useCallback(
    (lang: Language) =>
      getLocalizedPostPath({
        lang,
        date: metadata[lang]?.date ?? date,
        slug,
      }),
    [date, metadata, slug]
  );

  return (
    <div
      className={cn('lang-menu relative text-xs sm:text-sm', className)}
      role='navigation'
      aria-label={t('language.title')}
      ref={ref}
    >
      <button
        type='button'
        className='flex items-center gap-x-1 text-pink-700 hover:opacity-85 dark:text-pink-300'
        aria-label={`${t('language.current')}：${t(`language.${curLang}`)}`}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={toggle}
      >
        <Languages className='size-3.5' aria-hidden='true' />
        <span>{t(`language.short.${curLang}`)}</span>
      </button>
      <ul
        id={menuId}
        role='menu'
        className={cn(
          'dark:bg-text-gray-dark absolute right-0 z-50 mt-2 min-w-24 origin-top-right transform rounded bg-white shadow-md duration-200',
          isOpen
            ? 'scale-100 opacity-100'
            : 'pointer-events-none invisible scale-95 opacity-0'
        )}
      >
        {langs.map((lang) => (
          <li key={lang}>
            <Link
              href={getHref(lang)}
              className='text-text-primary block w-full rounded px-4 py-2 hover:bg-pink-50 hover:font-medium hover:text-pink-600 dark:hover:bg-pink-900/5'
              onClick={close}
              role='menuitem'
              tabIndex={isOpen ? 0 : -1}
              aria-label={t(`language.${lang}`)}
            >
              {t(`language.short.${lang}`)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LangMenu = (props: LangMenuProps) => {
  const dropdown = useDropdown();

  if (props.variant === 'post')
    return <PostLangMenu {...props} dropdown={dropdown} />;

  return <GlobalLangMenu {...props} dropdown={dropdown} />;
};

export default LangMenu;
