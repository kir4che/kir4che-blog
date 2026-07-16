import { useState } from 'react';

import { cn } from '@/utils/cn';

import { playWoodenFishSound } from './woodenFishAudio';
import { INITIAL_MERIT_STATE, addMerit, removeMerit } from './woodenFishState';

interface WoodenFishProps {
  soundSrc?: string;
}

const MALLET_GEOMETRY = {
  fishTopY: 38,
  grip: { x: 140, y: 0 },
  shaftStart: { x: 112, y: 18 },
  head: { x: 104, y: 24, radius: 9 },
} as const;

const LANE_CLASSES = ['-ml-8', '-ml-2', 'ml-4'] as const;

const WoodenFish = ({ soundSrc }: WoodenFishProps) => {
  const [meritState, setMeritState] = useState(INITIAL_MERIT_STATE);
  const [strikeId, setStrikeId] = useState(0);

  const strike = () => {
    setMeritState(addMerit);
    setStrikeId((current) => current + 1);

    if (soundSrc) playWoodenFishSound(soundSrc);
  };

  return (
    <button
      type="button"
      onClick={strike}
      aria-label="敲一下木魚，功德加一。"
      className="relative ml-auto h-25 w-40 max-w-full overflow-hidden select-none *:focus:outline-none"
    >
      <svg
        key={strikeId}
        aria-hidden="true"
        viewBox="0 0 180 120"
        className={cn(
          'w-30 overflow-visible fill-none stroke-pink-600 stroke-4 [stroke-linecap:round] [stroke-linejoin:round] dark:stroke-pink-500'
        )}
      >
        <g
          className={cn(
            strikeId > 0 &&
              'origin-bottom animate-[wooden-fish-hit_180ms_ease-out] motion-reduce:animate-none'
          )}
        >
          <path d="M34 85C39 53 58 38 88 38c29 0 49 15 58 43-9 20-31 31-59 31S43 102 34 85Z" />
          <path d="M57 83c18-10 42-11 68-4" />
        </g>
        <g
          className={cn(
            'origin-[140px_0] transform-view',
            strikeId > 0 &&
              'animate-[wooden-fish-mallet-strike_180ms_ease-out] motion-reduce:animate-none'
          )}
        >
          <line
            x1={MALLET_GEOMETRY.grip.x}
            y1={MALLET_GEOMETRY.grip.y}
            x2={MALLET_GEOMETRY.shaftStart.x}
            y2={MALLET_GEOMETRY.shaftStart.y}
          />
          <circle
            cx={MALLET_GEOMETRY.head.x}
            cy={MALLET_GEOMETRY.head.y}
            r={MALLET_GEOMETRY.head.radius}
          />
        </g>
        <g
          className={cn(
            'opacity-0',
            strikeId > 0 &&
              'animate-[wooden-fish-impact-flash_180ms_ease-out] motion-reduce:animate-none'
          )}
        >
          <path d="m112 46-7 6M120 47l1 10M128 44l8 5" />
        </g>
      </svg>
      {meritState.merits.map((merit) => (
        <span
          key={merit.id}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute top-12 left-10 text-sm font-bold motion-reduce:animate-[wooden-fish-merit-fade_120ms_ease-out_forwards]',
            'animate-[wooden-fish-merit-rise_700ms_ease-out_forwards]',
            LANE_CLASSES[merit.lane]
          )}
          onAnimationEnd={() => setMeritState((current) => removeMerit(current, merit.id))}
        >
          功德 +1
        </span>
      ))}
    </button>
  );
};

export default WoodenFish;
