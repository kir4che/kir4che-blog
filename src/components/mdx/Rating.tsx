import { cn } from '@/utils/cn';

interface RatingProps {
  type?: 'star' | 'heart';
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export const Rating = ({ type = 'star', rating, size = 'sm' }: RatingProps) => {
  const maskShape = type === 'star' ? 'mask-star-2' : 'mask-heart';
  const filledColor = type === 'star' ? 'bg-yellow-400' : 'bg-red-400';
  const sizeClass = { sm: 'rating-sm', md: 'rating-md', lg: 'rating-lg' }[size];

  const steps = Array.from({ length: 10 }, (_, index) => {
    const value = (index + 1) * 0.5;
    const isHalf = index % 2 === 0;
    const isFilled = value <= rating;
    return { value, isHalf, isFilled };
  });

  return (
    <div
      className={cn('rating rating-half mt-1 mb-2', sizeClass)}
      role="img"
      aria-label={`rating: ${rating}/5`}
    >
      {steps.map(({ value, isHalf, isFilled }) => (
        <div
          key={value}
          className={cn('mask', maskShape, {
            'mask-half-1': isHalf,
            'mask-half-2 mr-1': !isHalf,
            [filledColor]: isFilled,
            'bg-gray-500 dark:bg-gray-300': !isFilled,
          })}
          aria-current={rating === value}
        />
      ))}
    </div>
  );
};
