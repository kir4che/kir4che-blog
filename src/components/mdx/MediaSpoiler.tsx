import { useId, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface MediaSpoilerProps {
  enabled?: boolean;
  text?: string;
  btnText?: string;
  className?: string;
  children: ReactNode;
}

export const MediaSpoiler = ({
  enabled = false,
  text = '內含劇透',
  btnText = '點擊查看',
  className,
  children,
}: MediaSpoilerProps) => {
  const spoilerId = useId();

  if (!enabled) return <>{children}</>;

  return (
    <div className={cn('relative size-full', className)}>
      <input id={spoilerId} type="checkbox" className="peer sr-only" aria-label={btnText} />
      <div className="size-full filter-[blur(8px)] transition-[filter] duration-300 peer-checked:filter-[blur(0)]">
        {children}
      </div>
      <label
        htmlFor={spoilerId}
        className="flex-center absolute inset-0 z-10 cursor-pointer flex-col gap-2 bg-black/35 px-4 text-center transition-opacity duration-300 peer-checked:pointer-events-none peer-checked:opacity-0"
      >
        <span className="text-sm font-medium text-white">{text}</span>
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-950 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-950/90 dark:text-white dark:hover:bg-gray-950">
          {btnText}
        </span>
      </label>
    </div>
  );
};
