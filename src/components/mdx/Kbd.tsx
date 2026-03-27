import type { ReactNode } from 'react';

export const Kbd = ({ children }: { children?: ReactNode }) => (
  <kbd className="relative inline-block rounded border border-t-pink-200 border-r-pink-400 border-b-pink-400 border-l-pink-300 bg-linear-to-b from-pink-50 to-pink-100 px-1.5 py-0.5 font-mono text-xs leading-none text-pink-700 shadow-[0_4px_0_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] transition-all duration-75 hover:shadow-[0_5px_0_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] active:translate-y-1 active:shadow-[0_1px_0_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-t-pink-500 dark:border-r-pink-700 dark:border-b-pink-700 dark:border-l-pink-600 dark:bg-linear-to-b dark:from-pink-800/50 dark:to-pink-800/30 dark:text-pink-200 dark:shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] dark:hover:shadow-[0_5px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] dark:active:shadow-[0_1px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
    {children}
  </kbd>
);
