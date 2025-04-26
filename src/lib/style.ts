import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';

import type { CategoryColorScheme } from '@/types';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const getCategoryStyle = (
  color: CategoryColorScheme
): React.CSSProperties => {
  return {
    '--category-color': color.light,
    '--category-color-dark': color.dark,
  } as React.CSSProperties;
};
