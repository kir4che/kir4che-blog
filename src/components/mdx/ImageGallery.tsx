import React, { lazy, useEffect, useState } from 'react';

import { cn } from '@/lib/style';
import { toCssLength, toPixelNumber } from '@/utils/cssLength';

import CustomImage from '@/components/mdx/Image';
import CustomVideo from '@/components/mdx/Video';

const PhotoProvider = lazy(() =>
  import('react-photo-view').then((module) => ({
    default: module.PhotoProvider,
  }))
);
const PhotoView = lazy(() =>
  import('react-photo-view').then((module) => ({ default: module.PhotoView }))
);

import 'react-photo-view/dist/react-photo-view.css';

type MediaType = 'image' | 'video';
type Alignment = 'left' | 'center' | 'right';
type ObjectPosition = 'top' | 'center' | 'bottom';

interface MediaItem {
  type?: MediaType;
  src: string;
  title?: string;
  colSpan?: number;
  className?: string;

  width?: string | number;
  height?: string | number;
  originalWidth?: number;
  originalHeight?: number;

  alt?: string;
  objPos?: ObjectPosition;
  blurDataURL?: string;

  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
}

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
  minWidth = '160px',
  height = '250px',
  maxHeight = '400px',
  align = 'center',
  className,
}) => {
  const { container, column, stack } = getAlignment(align);
  const resolvedMinWidth = toCssLength(minWidth);
  const resolvedHeight = toCssLength(height);
  const resolvedMaxHeight = toCssLength(maxHeight) ?? resolvedHeight ?? 'none';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const query = window.matchMedia('(max-width: 480px)');
    const update = () => setIsMobile(query.matches);

    update();

    const interval = window.setInterval(() => update(), 250);
    return () => window.clearInterval(interval);
  }, []);

  const galleryMinWidthPx = toPixelNumber(resolvedMinWidth ?? null);
  const shouldWrap =
    galleryMinWidthPx !== null &&
    images.length > 0 &&
    images.every((item) => {
      const displayWidth = getItemDisplayWidth(item);
      return displayWidth !== null && displayWidth < galleryMinWidthPx;
    });

  const singleColumn = shouldWrap || isMobile;

  const renderMediaItem = (item: MediaItem, index: number) => {
    const spanValue = Number(item.colSpan);
    const span = singleColumn
      ? 1
      : Number.isFinite(spanValue) && spanValue > 0
        ? spanValue
        : 1;
    const baseMinWidth = singleColumn ? '100%' : (resolvedMinWidth ?? '0px');
    const flexBasis = singleColumn
      ? 'auto'
      : `calc(var(--item-min-width) * ${span})`;
    const flexGrow = singleColumn ? 0 : Math.max(0.01, span);
    const minWidthOverride = singleColumn
      ? '100%'
      : span === 1
        ? undefined
        : flexBasis;
    const mediaHeight = singleColumn ? (item.height ?? height) : '100%';
    const mediaClassName = cn(
      'w-full overflow-hidden',
      !item.className && !height && 'aspect-[3/2]',
      !singleColumn && 'h-full',
      item.className
    );

    const style = {
      '--item-min-width': baseMinWidth,
      '--gallery-max-height': resolvedMaxHeight,
      '--gallery-max-height-sm': resolvedHeight ?? resolvedMaxHeight,
      flex: singleColumn ? '0 0 auto' : `${flexGrow} 1 ${flexBasis}`,
      minWidth: minWidthOverride,
      width: singleColumn ? '100%' : undefined,
    } as React.CSSProperties;

    return (
      <div
        key={index}
        className={cn(
          'transition-all duration-300',
          '[max-height:var(--gallery-max-height)] sm:[max-height:var(--gallery-max-height-sm)]',
          'min-w-[var(--item-min-width)]',
          singleColumn ? 'w-full flex-none' : 'lg:min-w-0'
        )}
        style={style}
      >
        {item.type === 'video' ? (
          <CustomVideo
            {...item}
            width='100%'
            height={mediaHeight}
            className={mediaClassName}
          />
        ) : (
          <PhotoView src={item.src}>
            <CustomImage
              {...item}
              width='100%'
              height={mediaHeight}
              noProvider
              className={mediaClassName}
            />
          </PhotoView>
        )}
      </div>
    );
  };

  return (
    <PhotoProvider maskOpacity={0.8} speed={() => 500}>
      <div
        className={cn(
          'my-3 gap-y-3 lg:my-4',
          'xl:[max-width:var(--gallery-max-width)]',
          column,
          className
        )}
        style={
          {
            '--gallery-max-width': width || '85%',
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            'flex gap-3 lg:gap-4',
            singleColumn ? 'flex-col' : 'flex-wrap',
            singleColumn ? stack : container
          )}
        >
          {images.map(renderMediaItem)}
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
