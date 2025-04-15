import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { MoonStar, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations();

  useEffect(() => setMounted(true), []);

  const handleThemeToggle = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [theme, setTheme]);

  if (!mounted) return null;

  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      onClick={handleThemeToggle}
      className='text-text-gray-dark hover:text-text-primary flex w-fit items-center gap-x-1.5 text-sm dark:text-white/80'
      aria-label={t(`settings.theme.${nextTheme}`)}
    >
      {theme === 'dark' ? (
        <MoonStar className='h-4 w-4' />
      ) : (
        <Sun className='h-4 w-4' />
      )}
      <span className='hidden md:block'>
        {t(`settings.theme.${nextTheme}`)}
      </span>
    </button>
  );
};

export default ThemeToggle;
