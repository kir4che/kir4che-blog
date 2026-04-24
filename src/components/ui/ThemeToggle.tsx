import { cn } from '@/utils/cn';
import { MoonStar, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeToggleProps {
  translations: {
    light: string;
    dark: string;
  };
  iconOnly?: boolean;
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

const ThemeToggle = ({ translations, iconOnly = false }: ThemeToggleProps) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme: next } }));
      return next;
    });
  }, []);

  const isDark = theme === 'dark';
  const nextLabel = isDark ? translations.light : translations.dark;

  if (!mounted)
    return (
      <button
        type="button"
        className="hover:text-foreground-primary flex w-fit items-center gap-x-1.5 bg-transparent text-sm text-gray-700 dark:text-white/80"
        aria-label={translations.dark}
        disabled
      >
        <span className="opacity-0">
          <Sun size={16} aria-hidden="true" />
        </span>
        {!iconOnly && <span className="opacity-0 max-md:hidden">{translations.dark}</span>}
      </button>
    );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="hover:text-foreground-primary flex w-fit items-center gap-x-1.5 bg-transparent text-sm text-gray-700 dark:text-white/80"
      aria-label={nextLabel}
    >
      <span className={cn({ hidden: isDark })}>
        <Sun size={16} aria-hidden="true" />
      </span>
      <span className={cn({ hidden: !isDark })}>
        <MoonStar size={16} aria-hidden="true" />
      </span>
      {!iconOnly && <span className="max-md:hidden">{nextLabel}</span>}
    </button>
  );
};

export default ThemeToggle;
