import React from 'react';

import { cn } from '@/lib/style';

interface ParagraphsProps {
  text: string;
  className?: string;
}

const Paragraphs: React.FC<ParagraphsProps> = ({ text, className }) =>
  text.split('\n').map((line, index) => (
    <p key={index} className={cn('text-base/8', className)}>
      {line}
    </p>
  ));

export default Paragraphs;
