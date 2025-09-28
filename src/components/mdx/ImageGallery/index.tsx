import React, { lazy, useMemo } from 'react';

import type { MediaItem } from '@/types';
import { cn } from '@/lib/style';
import { toCssLength, toPixelNumber } from '@/utils/cssLength';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import GalleryItem from './GalleryItem';

const PhotoProvider = lazy(() =>
  import('react-photo-view').then((module) => ({
    default: module.PhotoProvider,
  }))
);

import 'react-photo-view/dist/react-photo-view.css';

interface GalleryProps {
  images: MediaItem[];
  title?: string;
  width?: string | number;
  minWidth?: string | number;
  height?: string | number;
  maxHeight?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

type Alignment = 'left' | 'center' | 'right';

const ALIGNMENT_CLASSES: Record<
  Alignment,
  {
    container: string;
    column: string;
    stack: string;
  }
> = {
  left: {
    container: 'mr-auto justify-start',
    column: 'ml-auto items-start',
    stack: 'mr-auto items-start',
  },
  center: {
    container: 'mx-auto justify-start',
    column: 'mx-auto items-center',
    stack: 'mx-auto items-center',
  },
  right: {
    container: 'ml-auto justify-end',
    column: 'mr-auto items-end',
    stack: 'ml-auto items-end',
  },
};

const getAlignment = (align: GalleryProps['align'] = 'center') =>
  ALIGNMENT_CLASSES[align ?? 'center'];

const getItemDisplayWidth = (item: MediaItem) => {
  const explicitWidth = toPixelNumber(item.width ?? null);
  if (explicitWidth !== null) return explicitWidth;

  if (
    typeof item.originalWidth === 'number' &&
    Number.isFinite(item.originalWidth)
  )
    return item.originalWidth;

  return null;
};

const ImageGallery: React.FC<GalleryProps> = ({
  images,
  title,
  width,
  minWidth = '120px',
  height = '250px',
  maxHeight = '400px',
  align = 'center',
  className,
}) => {
  const isMobile = useMediaQuery('(max-width: 480px)');

  const {
    resolvedMinWidth,
    resolvedHeight,
    resolvedMaxHeight,
    galleryMinWidthPx,
  } = useMemo(() => {
    const resMinWidth = toCssLength(minWidth) ?? undefined;
    const resHeight = toCssLength(height) ?? undefined;
    const resMaxHeightInput = toCssLength(maxHeight) ?? undefined;

    const heightPx = toPixelNumber(resHeight ?? null);
    const maxHeightPx = toPixelNumber(resMaxHeightInput ?? null);

    const finalMaxHeight: string | undefined =
      heightPx !== null && maxHeightPx !== null
        ? heightPx >= maxHeightPx
          ? resHeight
          : resMaxHeightInput
        : heightPx !== null
          ? resHeight
          : maxHeightPx !== null
            ? resMaxHeightInput
            : undefined;

    const minWidthPx = toPixelNumber(resMinWidth ?? null);

    return {
      resolvedMinWidth: resMinWidth,
      resolvedHeight: resHeight,
      resolvedMaxHeight: finalMaxHeight,
      galleryMinWidthPx: minWidthPx,
    };
  }, [minWidth, height, maxHeight]);

  const { container, column, stack } = getAlignment(align);

  const isEveryItemNarrow =
    galleryMinWidthPx !== null &&
    images.length > 0 &&
    images.every((item) => {
      const displayWidth = getItemDisplayWidth(item);
      return displayWidth !== null && displayWidth < galleryMinWidthPx;
    });

  const singleColumn = isMobile || isEveryItemNarrow;

  return (
    <PhotoProvider maskOpacity={0.8} speed={() => 500}>
      <div
        className={cn(
          'my-3 gap-y-3 lg:my-4',
          'xl:[max-width:var(--gallery-max-width)]',
          column,
          className
        )}
        style={{ '--gallery-max-width': width || '85%' } as React.CSSProperties}
      >
        <div
          className={cn(
            'flex gap-3 lg:gap-4',
            singleColumn ? 'flex-col' : 'flex-wrap',
            singleColumn ? stack : container
          )}
        >
          {images.map((item, index) => (
            <GalleryItem
              key={index}
              item={item}
              index={index}
              singleColumn={singleColumn}
              resolvedMinWidth={resolvedMinWidth}
              resolvedHeight={resolvedHeight}
              resolvedMaxHeight={resolvedMaxHeight}
            />
          ))}
        </div>
        {title && (
          <p className='mt-2 text-center text-xs text-pink-700/80 dark:text-pink-200'>
            {title}
          </p>
        )}
      </div>
    </PhotoProvider>
  );
};

export default ImageGallery;
