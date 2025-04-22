import { cn } from '@/lib/style';

interface StarRatingProps {
  type: 'star' | 'heart';
  rating: number; // 0.5 ~ 5.0
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Rating = ({
  type = 'star',
  rating,
  size = 'sm',
  className,
}: StarRatingProps) => {
  const maskType = {
    star: 'mask-star-2 bg-yellow-400',
    heart: 'mask-heart bg-red-400',
  }[type];

  const sizeClass = {
    sm: 'rating-sm',
    md: 'rating-md',
    lg: 'rating-lg',
  }[size];

  return (
    <div className={cn('rating rating-half', sizeClass)}>
      {Array.from({ length: 10 }, (_, index) => {
        const value = (index + 1) * 0.5;
        const isHalf = index % 2 === 0;

        return (
          <div
            key={value}
            className={cn(
              'mask',
              maskType,
              isHalf ? 'mask-half-1' : 'mask-half-2',
              className
            )}
            aria-current={rating === value}
          />
        );
      })}
    </div>
  );
};

export default Rating;
