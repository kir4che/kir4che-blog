import React from 'react';
import { PhotoView } from 'react-photo-view';

import type { MediaItem } from '@/types';
import { cn } from '@/lib/style';

import CustomImage from '@/components/mdx/Image';
import CustomVideo from '@/components/mdx/Video';

interface GalleryItemProps {
  item: MediaItem;
  index: number;
  singleColumn: boolean;
  resolvedMinWidth?: string;
  resolvedHeight?: string;
  resolvedMaxHeight?: string;
}

const GalleryItem: React.FC<GalleryItemProps> = ({
  item,
  index,
  singleColumn,
  resolvedMinWidth,
  resolvedHeight,
  resolvedMaxHeight,
}) => {
  const spanValue = Number(item.colSpan);
  const span =
    singleColumn || !Number.isFinite(spanValue) || spanValue <= 0
      ? 1
      : spanValue;

  const itemStyle: React.CSSProperties & Record<string, any> = {
    '--item-min-width': singleColumn ? '100%' : (resolvedMinWidth ?? '0px'),
    '--gallery-max-height': resolvedMaxHeight,
    '--gallery-max-height-sm': resolvedHeight ?? resolvedMaxHeight,
  };

  if (singleColumn) {
    itemStyle.flex = '0 0 auto';
    itemStyle.width = '100%';
  } else {
    itemStyle.flex = `${Math.max(0.01, span)} 1 calc(var(--item-min-width) * ${span})`;
    if (span > 1) itemStyle.minWidth = `calc(var(--item-min-width) * ${span})`;
  }

  return (
    <div
      key={index}
      className={cn(
        'transition-all duration-300',
        'max-h-(--gallery-max-height) sm:max-h-(--gallery-max-height-sm)',
        'h-(--gallery-height) sm:h-(--gallery-height-sm)',
        'min-w-(--item-min-width)]',
        singleColumn ? 'w-full flex-none' : 'lg:min-w-0'
      )}
      style={
        {
          '--item-min-width': singleColumn
            ? '100%'
            : (resolvedMinWidth ?? '0px'),
          '--gallery-max-height': resolvedMaxHeight ?? undefined,
          '--gallery-max-height-sm':
            resolvedHeight ?? resolvedMaxHeight ?? undefined,
          // 新增：把「實際高度」也丟進 CSS variables
          '--gallery-height': resolvedHeight ?? undefined,
          '--gallery-height-sm': resolvedHeight ?? undefined,
          ...(singleColumn
            ? { flex: '0 0 auto', width: '100%' }
            : {
                flex: `${Math.max(0.01, span)} 1 calc(var(--item-min-width) * ${span})`,
                ...(span > 1
                  ? { minWidth: `calc(var(--item-min-width) * ${span})` }
                  : {}),
              }),
        } as React.CSSProperties & Record<string, any>
      }
    >
      {item.type === 'video' ? (
        <CustomVideo
          {...item}
          width='100%'
          height={
            singleColumn ? (item.height ?? resolvedHeight ?? '100%') : '100%'
          }
          className={cn(
            'size-full overflow-hidden',
            !item.className && !resolvedHeight && 'aspect-3/2',
            item.className
          )}
        />
      ) : (
        <PhotoView src={item.src}>
          <CustomImage
            {...item}
            width='100%'
            height={
              singleColumn ? (item.height ?? resolvedHeight ?? '100%') : '100%'
            }
            noProvider
            className={cn(
              'size-full overflow-hidden',
              !item.className && !resolvedHeight && 'aspect-3/2',
              item.className
            )}
          />
        </PhotoView>
      )}
    </div>
  );
};

export default GalleryItem;
