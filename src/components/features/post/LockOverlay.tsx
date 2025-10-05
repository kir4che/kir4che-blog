import { Lock } from 'lucide-react';

const LockOverlay: React.FC<{ hasPassword: boolean }> = ({ hasPassword }) =>
  hasPassword ? (
    <div className='flex-center pointer-events-none absolute inset-0 z-10 rounded-lg bg-pink-500/20'>
      <Lock className='text-pink-600 dark:text-pink-200' size={32} />
    </div>
  ) : null;

export default LockOverlay;
