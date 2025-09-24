import { Lock } from 'lucide-react';

const LockOverlay: React.FC<{ hasPassword: boolean }> = ({ hasPassword }) =>
  hasPassword ? (
    <div className='flex-center pointer-events-none absolute inset-0 z-10 bg-pink-500/15'>
      <Lock className='text-pink-500 dark:text-pink-300' size={32} />
    </div>
  ) : null;

export default LockOverlay;
