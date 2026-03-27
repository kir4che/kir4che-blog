import type { CSSProperties } from 'react';

import type { MediaItem } from '@/types';
import { cn } from '@/utils/cn';
import { toCssLength, toPixelNumber } from '@/utils/cssLength';

import { ImagesItem } from './ImagesItem';

interface ImagesProps {
  images?: MediaItem[];
  title?: string;
  width?: string | number;
  minWidth?: string | number;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  align?: 'left' | 'center' | 'right';
}

type Alignment = 'left' | 'center' | 'right';

const ALIGNMENT_CLASSES: Record<Alignment, { container: string; column: string; stack: string }> = {
  left: {
    container: 'ml-auto justify-end',
    column: 'mr-auto items-end',
    stack: 'ml-auto items-end',
  },
  center: {
    container: 'mx-auto justify-start',
    column: 'mx-auto items-center',
    stack: 'mx-auto items-center',
  },
  right: {
    container: 'mr-auto justify-start',
    column: 'ml-auto items-start',
    stack: 'mr-auto items-start',
  },
};

const getItemWidth = (item: MediaItem): number | null => {
  const explicitWidth = toPixelNumber(item.width);
  if (explicitWidth !== null) return explicitWidth;
  return null;
};

export const Images = ({
  images = [],
  title,
  width = '85%',
  minWidth = '150px',
  height,
  minHeight,
  maxHeight,
  align = 'center',
}: ImagesProps) => {
  const normalizedHeight =
    typeof height === 'string' && height.trim().toLowerCase() === 'auto' ? undefined : height;

  const resMinWidth = toCssLength(minWidth);
  const resHeight = normalizedHeight ? toCssLength(normalizedHeight) : undefined;
  const resMinHeight = minHeight ? toCssLength(minHeight) : undefined;
  const resMaxHeight = maxHeight ? toCssLength(maxHeight) : undefined;
  const defaultMinHeight = '200px';
  const defaultMaxHeight = '400px';
  const effectiveMinHeight = resMinHeight ?? defaultMinHeight;
  const effectiveMaxHeight = resMaxHeight ?? defaultMaxHeight;

  const heightPx = toPixelNumber(resHeight);
  const maxHeightPx = toPixelNumber(effectiveMaxHeight);

  const finalMaxHeight =
    resHeight || effectiveMaxHeight
      ? heightPx !== null && maxHeightPx !== null
        ? heightPx >= maxHeightPx
          ? resHeight
          : effectiveMaxHeight
        : (resHeight ?? effectiveMaxHeight)
      : undefined;

  const galleryMinWidthPx = toPixelNumber(resMinWidth);

  const singleColumn =
    galleryMinWidthPx !== null &&
    images.length > 0 &&
    images.every((item) => {
      const w = getItemWidth(item);
      return w !== null && w < galleryMinWidthPx;
    });

  const { container, column, stack } = ALIGNMENT_CLASSES[align];

  const imageSlides = images
    .filter((item) => item.type !== 'video')
    .map((item) => ({ src: item.src, alt: 'alt' in item ? item.alt : undefined }));
  const slidesJson = JSON.stringify(imageSlides);

  const slideIndexMap = images.reduce<number[]>((acc, item, i) => {
    acc[i] = item.type !== 'video' ? imageSlides.findIndex((s) => s.src === item.src) : -1;
    return acc;
  }, []);

  const containerStyle: CSSProperties = {
    ['--gallery-max-width' as string]: width,
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div
      className={cn(
        'my-6 w-full max-w-full min-w-0 space-y-2 overflow-hidden md:max-w-(--gallery-max-width) lg:my-8',
        column
      )}
      style={containerStyle}
    >
      <div
        className={cn('flex w-full max-w-full gap-2 md:gap-3 lg:gap-4', {
          'flex-col': singleColumn,
          'flex-row flex-wrap': !singleColumn,
          [singleColumn ? stack : container]: true,
        })}
      >
        {images.map((item, i) => (
          <ImagesItem
            key={i}
            item={item}
            singleColumn={singleColumn}
            resolvedMinWidth={resMinWidth}
            resolvedHeight={resHeight}
            resolvedMinHeight={effectiveMinHeight}
            resolvedMaxHeight={finalMaxHeight}
            lightboxSlides={item.type !== 'video' && slideIndexMap[i] >= 0 ? slidesJson : undefined}
            lightboxIndex={slideIndexMap[i] >= 0 ? slideIndexMap[i] : 0}
          />
        ))}
      </div>
      {title && (
        <figcaption className="line-clamp-1 text-center text-xs text-pink-700 dark:text-pink-200">
          {title}
        </figcaption>
      )}
    </div>
  );
};
