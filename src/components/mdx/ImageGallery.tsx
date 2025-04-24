import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import { cn } from '@/lib/style';

import CustomImage from '@/components/mdx/Image';
import CustomVideo from '@/components/mdx/Video';

type MediaType = 'image' | 'video';
type Alignment = 'left' | 'center' | 'right';
type ObjectPosition = 'top' | 'center' | 'bottom';

interface MediaItem {
  type?: MediaType;
  src: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  align?: Alignment;
  colSpan?: number;
  className?: string;

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
  height?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  minHeight?: string;
}

const getAlignment = (align: GalleryProps['align'] = 'center') => {
  const safeAlign = align ?? 'center';

  return {
    container: {
      left: 'mr-auto justify-start',
      center: 'mx-auto justify-center',
      right: 'ml-auto justify-end',
    }[safeAlign],
    column: {
      left: 'ml-auto items-start',
      center: 'mx-auto items-center',
      right: 'mr-auto items-end',
    }[safeAlign],
  };
};

const ImageGallery: React.FC<GalleryProps> = ({
  images,
  title,
  width,
  height,
  align = 'center',
  className,
  minHeight = '200px',
}) => {
  const { container, column } = getAlignment(align);
  const totalSpan = images.reduce((sum, item) => sum + (item.colSpan || 1), 0);
  const baseMinWidth = images.length <= 2 ? 180 : 140;

  const renderMediaItem = (item: MediaItem, index: number) => {
    const span = item.colSpan || 1;
    const mediaClassName = cn(
      'h-full w-full overflow-hidden',
      !item.className && !height && `aspect-[3/2]`,
      item.className
    );

    return (
      <div
        key={index}
        className={cn(
          'transition-all duration-300',
          '[max-height:var(--gallery-max-height)]',
          'min-w-[calc(var(--span)*var(--one-img-width))]',
          'lg:min-w-[calc(var(--span)*var(--one-img-width-lg))]'
        )}
        style={
          {
            flex: `${span} ${span} 0`,
            minWidth: baseMinWidth,
            minHeight: !height ? minHeight : undefined,
            '--span': span.toString(),
            '--gallery-max-height': height ? `min(${height}, 400px)` : '400px',
          } as React.CSSProperties
        }
      >
        {item.type === 'video' ? (
          <CustomVideo
            {...item}
            width={item.width || '100%'}
            height={item.height || '100%'}
            className={mediaClassName}
          />
        ) : (
          <PhotoView src={item.src}>
            <CustomImage
              {...item}
              width={item.width || '100%'}
              height={item.height || '100%'}
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
          'my-3 flex w-full flex-col gap-y-3 lg:my-4 xl:max-w-11/12',
          width && '2xl:[max-width:var(--gallery-width)]',
          column,
          className
        )}
        style={
          {
            '--gallery-width': width || '100%',
          } as React.CSSProperties
        }
      >
        <div
          className={cn('flex flex-wrap gap-3 lg:gap-4', container)}
          style={
            {
              '--gallery-height': height || 'auto',
              '--one-img-width': `min(${baseMinWidth}px, calc((100% - ${(totalSpan - 1) * 12}px) / ${totalSpan}))`,
              '--one-img-width-lg': `min(${baseMinWidth}px, calc((100% - ${(totalSpan - 1) * 16}px) / ${totalSpan}))`,
            } as React.CSSProperties
          }
        >
          {images.map(renderMediaItem)}
        </div>
        {title && (
          <p className='text-center text-xs text-pink-700/80 dark:text-pink-200'>
            {title}
          </p>
        )}
      </div>
    </PhotoProvider>
  );
};

export default ImageGallery;
