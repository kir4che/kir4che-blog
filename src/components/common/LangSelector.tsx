import React, { useTransition } from 'react';
import { Locale, useLocale, useTranslations } from 'next-intl';
import { Languages } from 'lucide-react';

import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LangSelector: React.FC = () => {
  const locale = useLocale() as Locale;
  const t = useTranslations('settings');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  // 當使用者切換不同語言時
  const onSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as Locale;
    startTransition(() => {
      router.replace(
        pathname,
        { locale: nextLocale } // 更新語言
      );
    });
  };

  return (
    <div className='flex items-center md:gap-x-0.5'>
      <Languages className='h-4 w-4 dark:text-white/80' aria-hidden='true' />
      <select
        value={locale}
        onChange={onSelectChange}
        disabled={isPending}
        className='text-text-gray-dark bg-transparent text-sm dark:text-white/80'
        aria-label={`${t('language.current')}: ${t(`language.${locale}`)}`}
        aria-live='polite'
      >
        {routing.locales.map((cur) => (
          <option key={cur} value={cur} aria-label={t(`language.${cur}`)}>
            {t(`language.${cur}`)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LangSelector;
