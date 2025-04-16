import React from 'react';

import { cn } from '@/lib/style';

interface TitleProps {
  text: string;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ text, className }) => (
  <h2
    className={cn(
      'mx-auto mb-4 w-fit border-b-4 border-pink-500 pb-1 tracking-wider',
      className
    )}
  >
    {text}
  </h2>
);

export default Title;
