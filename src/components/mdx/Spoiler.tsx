import type { ReactNode } from 'react';

export const Spoiler = ({ children }: { children?: ReactNode }) => (
  <span className="rounded px-0.5 filter-[blur(4px)] transition-[filter] duration-300 select-all hover:filter-[blur(0)]">
    {children}
  </span>
);
