import { useRef, useState } from 'react';
import Link from 'next/link';
import { Languages } from 'lucide-react';

import type { Language } from '@/types';
import { cn } from '@/lib/style';

interface LangMenuProps {
  t: (key: string) => string;
  curLang: Language;
  langs: Language[];
  slug: string;
  className?: string;
}

const LangMenu = ({ t, curLang, langs, slug, className }: LangMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showMenu, setShowMenu] = useState(false);

  const clearTimeoutSafely = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 滑鼠移到上方時顯示 Menu
  const handleMouseEnter = () => {
    clearTimeoutSafely();
    setShowMenu(true);
  };

  // 滑鼠移出範圍時延遲關閉 Menu
  const handleMouseLeave = (e: React.MouseEvent) => {
    const menuElement = menuRef.current;
    const relatedTarget = e.relatedTarget as HTMLElement;

    if (menuElement && !menuElement.contains(relatedTarget)) {
      clearTimeoutSafely();
      timeoutRef.current = setTimeout(() => setShowMenu(false), 150);
    }
  };

  return (
    <div
      className={cn('lang-menu relative text-xs sm:text-sm', className)}
      role='navigation'
      aria-label={t('language.title')}
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className='flex items-center gap-x-1 text-pink-700 hover:opacity-85 dark:text-pink-300'
        aria-label={`${t('language.current')}：${t(`language.${curLang}`)}`}
        aria-expanded={showMenu}
        aria-controls='lang-menu'
      >
        <Languages className='h-3.5 w-3.5' aria-hidden='true' />
        <span>{t(`language.short.${curLang}`)}</span>
      </button>
      <div
        id='lang-menu'
        role='menu'
        className={cn(
          'dark:bg-text-gray-dark absolute right-0 z-50 mt-2 min-w-24 origin-top-right transform rounded bg-white shadow-md duration-200',
          showMenu
            ? 'scale-100 opacity-100'
            : 'pointer-events-none invisible scale-95 opacity-0'
        )}
      >
        {langs.map((lang) => (
          <Link
            key={lang}
            href={`/${lang}/posts/${slug}`}
            className='text-text-primary block w-full rounded px-4 py-2 hover:bg-pink-50 hover:font-medium hover:text-pink-600 dark:hover:bg-pink-900/5'
            onClick={() => {
              clearTimeoutSafely();
              setShowMenu(false);
            }}
            role='menuitem'
            tabIndex={showMenu ? 0 : -1}
            aria-label={t(`language.${lang}`)}
          >
            {t(`language.short.${lang}`)}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LangMenu;
