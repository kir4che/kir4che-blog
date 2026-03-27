import type { CSSProperties } from 'react';

import type { MediaItem } from '@/types';
import { cn } from '@/utils/cn';

import { Image } from './Image';
import { Video } from './Video';

interface ImagesItemProps {
  item: MediaItem;
  singleColumn: boolean;
  resolvedMinWidth?: string;
  resolvedHeight?: string;
  resolvedMinHeight?: string;
  resolvedMaxHeight?: string;
  lightboxSlides?: string;
  lightboxIndex?: number;
}

export const ImagesItem = ({
  item,
  singleColumn,
  resolvedMinWidth,
  resolvedHeight,
  resolvedMinHeight,
  resolvedMaxHeight,
  lightboxSlides,
  lightboxIndex,
}: ImagesItemProps) => {
  const effectiveMinHeight = resolvedMinHeight ?? '200px';
  const effectiveMaxHeight = resolvedMaxHeight ?? '400px';

  const rawSpan = Number(item.colSpan);
  const span = singleColumn || !Number.isFinite(rawSpan) || rawSpan <= 0 ? 1 : rawSpan;
  const hasFixedHeight = resolvedHeight || effectiveMinHeight || effectiveMaxHeight;

  const style: CSSProperties = {
    ['--item-min-width' as string]: singleColumn ? '100%' : (resolvedMinWidth ?? '0px'),
    ['--gallery-min-height' as string]: resolvedHeight ?? effectiveMinHeight,
    ['--gallery-max-height' as string]: effectiveMaxHeight,

    ...(singleColumn
      ? { flex: '0 0 auto', width: '100%' }
      : {
          flex: `1 1 min(100%, calc(var(--item-min-width) * ${span}))`,
          minWidth: `min(100%, calc(var(--item-min-width) * ${span}))`,
          maxWidth: '100%',
        }),
  };

  const galleryImageClass =
    'w-full h-full block object-cover min-h-(--gallery-min-height) max-h-(--gallery-max-height)';

  return (
    <div
      data-images-item
      className={cn('min-w-(--item-min-width) overflow-hidden transition-all duration-300', {
        'min-h-(--gallery-min-height)': hasFixedHeight,
        'max-h-(--gallery-max-height)': hasFixedHeight,
        'w-full flex-none': singleColumn,
        'lg:min-w-0': !singleColumn,
      })}
      style={style}
    >
      {item.type === 'video' ? (
        <Video
          {...item}
          width="100%"
          height="100%"
          data-images-media
          style={{ width: '100%', height: '100%' }}
          className={cn('size-full overflow-hidden', item.className)}
        />
      ) : (
        <Image
          {...item}
          width="100%"
          height="100%"
          imgClass={galleryImageClass}
          imgWrapClass="min-h-(--gallery-min-height) max-h-(--gallery-max-height)"
          data-images-media
          className={cn('size-full overflow-hidden', item.className)}
          lightboxSlides={lightboxSlides}
          lightboxIndex={lightboxIndex}
        />
      )}
    </div>
  );
};
