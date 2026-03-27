import type { ReactNode } from 'react';

export const SmallText = ({ children }: { children?: ReactNode }) => (
  <p className="text-foreground-primary/70 text-sm leading-6 font-medium">{children}</p>
);
