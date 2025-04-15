'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/style';

interface ErrorRetryProps {
  message: string;
  retryLabel?: string;
  onRetry: () => void;
  className?: string;
}

const ErrorRetry = ({
  message,
  retryLabel = 'Retry',
  onRetry,
  className,
}: ErrorRetryProps) => (
  <div
    role='alert'
    className={cn(
      'flex flex-col items-center justify-center gap-y-3 rounded-2xl border border-red-200/60 bg-red-50/90 p-6 text-center dark:border-red-500/20 dark:bg-red-950/30',
      className
    )}
  >
    <AlertTriangle
      className='h-12 w-12 text-red-500 dark:text-red-700'
      aria-hidden='true'
    />
    <p className='text-base font-medium text-red-700 dark:text-red-300'>
      {message}
    </p>
    <button
      onClick={onRetry}
      className='rounded-full bg-red-500 px-8 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:scale-[1.02] hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800'
      aria-label={retryLabel}
    >
      {retryLabel}
    </button>
  </div>
);

export default ErrorRetry;
