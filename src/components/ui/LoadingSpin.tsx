import { cn } from '@/lib/style';

interface LoadingSpinProps {
  text?: string;
  className?: string;
}

const LoadingSpin: React.FC<LoadingSpinProps> = ({ text, className }) => (
  <div
    className={cn(
      'flex items-center gap-x-3 gap-y-2 text-center text-sm',
      className
    )}
  >
    <div className='inline-block size-8 animate-spin rounded-full border-4 border-pink-800 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]' />
    {text && <p className='text-muted-foreground'>{text}</p>}
  </div>
);

export default LoadingSpin;
