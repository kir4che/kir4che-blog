import React from 'react';
import { cn } from '@/lib/style';

interface HighlightProps {
  children: React.ReactNode;
  color?: 'yellow' | 'green' | 'blue' | 'pink' | 'custom';
  className?: string;
}

const colorMap: Record<string, string> = {
  yellow:
    '[background:linear-gradient(100deg,_#ffda8b00_1%,_#ffda8b_2.5%,_#ffda8b80_5.7%,_#ffda8b1a_93%,_#ffda8bb4_95%,_#ffda8b00_98%),linear-gradient(182deg,_#ffda8b00,_#ffda8b4d_8%,_#ffda8b00_15%)]',
  green:
    '[background:linear-gradient(100deg,_#b8ffaf00_1%,_#b8ffaf_2.5%,_#b8ffaf80_5.7%,_#b8ffaf1a_93%,_#b8ffafb4_95%,_#b8ffaf00_98%),linear-gradient(182deg,_#b8ffaf00,_#b8ffaf4d_8%,_#b8ffaf00_15%)]',
  pink: '[background:linear-gradient(100deg,_#ffb2c500_1%,_#ffb2c5_2.5%,_#ffb2c580_5.7%,_#ffb2c51a_93%,_#ffb2c5b4_95%,_#ffb2c500_98%),linear-gradient(182deg,_#ffb2c500,_#ffb2c54d_8%,_#ffb2c500_15%)]',
  blue: '[background:linear-gradient(100deg,_#afd7ff00_1%,_#afd7ff_2.5%,_#afd7ff80_5.7%,_#afd7ff1a_93%,_#afd7ffb4_95%,_#afd7ff00_98%),linear-gradient(182deg,_#afd7ff00,_#afd7ff4d_8%,_#afd7ff00_15%)]',
};

const Highlight = ({
  color = 'pink',
  children,
  className = '',
}: HighlightProps) => (
  <mark className={cn('text-text-primary px-0.5', colorMap[color], className)}>
    {children}
  </mark>
);

export default Highlight;
