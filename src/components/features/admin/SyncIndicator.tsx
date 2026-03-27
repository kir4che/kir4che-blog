import { useEffect, useState } from 'react';

import { cn } from '@/utils/cn';

export type PreviewSyncState = 'idle' | 'typing' | 'ssr-pending' | 'synced';

interface SyncIndicatorProps {
  state: PreviewSyncState;
}

const LABELS: Record<PreviewSyncState, string> = {
  idle: '',
  typing: '編輯中',
  'ssr-pending': '同步中',
  synced: '已同步',
};

const SyncIndicator = ({ state }: SyncIndicatorProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state === 'idle') {
      setVisible(false);
      return;
    }
    setVisible(true);
    if (state === 'synced') {
      const t = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!visible) return null;

  return (
    <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 text-xs text-white/80 backdrop-blur-sm">
      <span
        className={cn(
          'size-1.5 rounded-full',
          state === 'typing' && 'animate-pulse bg-gray-400',
          state === 'ssr-pending' && 'animate-pulse bg-blue-400',
          state === 'synced' && 'bg-green-400'
        )}
      />
      {LABELS[state]}
    </div>
  );
};

export default SyncIndicator;
