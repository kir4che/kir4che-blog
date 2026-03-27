import { AlertCircle, Pencil, Lightbulb, AlertTriangle } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { cn } from '@/utils/cn';

type AlertType = 'tip' | 'note' | 'warning';

interface AlertProps extends PropsWithChildren {
  type?: AlertType;
  title?: string;
}

const alertConfig = {
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-l-4 border-green-400 dark:border-green-500',
    textColor: 'text-green-900 dark:text-green-200',
    titleColor: 'text-green-900 dark:text-green-100',
    defaultTitle: 'Tip',
  },
  note: {
    icon: Pencil,
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-l-4 border-cyan-400 dark:border-cyan-500',
    textColor: 'text-cyan-900 dark:text-cyan-200',
    titleColor: 'text-cyan-900 dark:text-cyan-100',
    defaultTitle: 'Note',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-l-4 border-amber-400 dark:border-amber-500',
    textColor: 'text-amber-900 dark:text-amber-200',
    titleColor: 'text-amber-900 dark:text-amber-100',
    defaultTitle: 'Warning',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-l-4 border-red-400 dark:border-red-500',
    textColor: 'text-red-900 dark:text-red-200',
    titleColor: 'text-red-900 dark:text-red-100',
    defaultTitle: 'Error',
  },
} as const;

export const Alert = ({ type = 'note', title, children }: AlertProps) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn('my-4 rounded-md p-4 pt-3 text-sm', config.bgColor, config.borderColor)}>
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon size={14} aria-hidden="true" />
        <h4 className={cn('text-[13px] font-semibold', config.titleColor)}>
          {title || config.defaultTitle}
        </h4>
      </div>
      <p className={cn(config.textColor)}>{children}</p>
    </div>
  );
};
