import React from 'react';

const Details: React.FC<React.HTMLAttributes<HTMLDetailsElement>> = ({
  children,
  ...props
}) => {
  return (
    <details
      {...props}
      className='my-4 rounded-lg border border-pink-300 bg-pink-50 p-4 dark:border-pink-600/40 dark:bg-pink-800/10'
    >
      {children}
    </details>
  );
};

export const Summary: React.FC<React.HTMLAttributes<HTMLElement>> = ({
  children,
  ...props
}) => {
  return (
    <summary
      {...props}
      className='mb-2 cursor-pointer font-semibold text-pink-700 dark:text-pink-300'
    >
      {children}
    </summary>
  );
};

export default Details;
