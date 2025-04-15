import React from 'react';

interface CorrectionProps {
  wrong: string;
  correct: string;
}

const Correction = ({ wrong, correct }: CorrectionProps) => {
  return (
    <span className='space-x-1'>
      <del className='hover:h-unset transition-[width, padding] relative -mb-1 inline-block h-5 w-1.5 overflow-hidden rounded bg-red-400/20 text-transparent duration-500 hover:inline hover:w-auto hover:px-1 hover:text-red-400 dark:hover:text-red-300'>
        {wrong}
      </del>
      <ins className='text-text-primary rounded bg-green-300/40 px-1.5 no-underline dark:bg-green-800/80'>
        {correct}
      </ins>
    </span>
  );
};

export default Correction;
