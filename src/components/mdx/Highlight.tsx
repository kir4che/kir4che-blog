import type { ReactNode } from 'react';

const getHighlightStyle = (colorVar: string) => ({
  background: `
    linear-gradient(100deg, rgba(var(${colorVar}), 0) 1%, rgba(var(${colorVar}), 1) 2.5%, rgba(var(${colorVar}), 0.5) 5.7%, rgba(var(${colorVar}), 0.1) 93%, rgba(var(${colorVar}), 0.7) 95%, rgba(var(${colorVar}), 0) 98%), 
    linear-gradient(182deg, rgba(var(${colorVar}), 0), rgba(var(${colorVar}), 0.3) 8%, rgba(var(${colorVar}), 0) 15%)
  `,
});

const HIGHLIGHT_STYLES: Record<string, { background: string }> = {
  yellow: getHighlightStyle('--hl-yellow'),
  green: getHighlightStyle('--hl-green'),
  pink: getHighlightStyle('--hl-pink'),
  blue: getHighlightStyle('--hl-blue'),
  custom: { background: '' },
};

export const Highlight = ({
  color = 'pink',
  children,
}: {
  color?: string;
  children?: ReactNode;
}) => (
  <mark className="text-foreground-primary px-0.5" style={HIGHLIGHT_STYLES[color] ?? {}}>
    {children}
  </mark>
);
