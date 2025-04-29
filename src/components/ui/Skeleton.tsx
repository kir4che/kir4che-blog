import { cn } from '@/lib/style';

interface SkeletonProps {
  count?: number;
  className?: string;
  variant?: 'title' | 'text' | 'image' | 'video' | 'post';
}

const Skeleton = ({
  count = 1,
  className,
  variant = 'text',
}: SkeletonProps) => {
  const getSkeletonStyle = (variant: SkeletonProps['variant']) => {
    switch (variant) {
      case 'title':
        return 'h-7 w-3/4';
      case 'text':
        return 'h-4 w-full';
      case 'image':
        return 'h-48 w-full';
      case 'video':
        return 'w-60 h-36';
      case 'post':
        return 'h-28 w-full';
      default:
        return 'h-4 w-full';
    }
  };

  return (
    <div className='animate-skeletonFadeIn space-y-4'>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'dark:bg-text-gray-dark animate-pulse rounded-md bg-pink-100',
            getSkeletonStyle(variant),
            className
          )}
        />
      ))}
    </div>
  );
};

export default Skeleton;
