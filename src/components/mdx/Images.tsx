import type { CSSProperties } from 'react';

import type { MediaItem } from '@/types';
import { cn } from '@/utils/cn';

import { GalleryItem } from './GalleryItem';

type ParsedCssLength = {
  raw: string;
  unit: string | null;
  value: number | null;
};

const FUNCTION_RE = /^(calc|min|max|clamp|var|env|fit-content)\(/i;
const UNIT_RE =
  /(px|em|rem|%|vh|vw|vmin|vmax|vi|vb|svh|lvh|dvh|svw|lvw|dvw|ch|ex|cap|ic|lh|rlh|q|cm|mm|in|pt|pc)$/i;
const NUMBER_RE = /^[+-]?(?:\d+|\d*\.\d+)$/;

const parseCssLength = (input?: string | number | null): ParsedCssLength | null => {
  if (input == null) return null;
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return null;
    return { raw: input === 0 ? '0' : `${input}px`, unit: 'px', value: input };
  }
  const value = input.trim();
  if (!value) return null;
  if (FUNCTION_RE.test(value)) return { raw: value, unit: null, value: null };
  if (UNIT_RE.test(value)) {
    const unit = value.match(UNIT_RE)![0].toLowerCase();
    const numeric = parseFloat(value);
    if (!Number.isFinite(numeric)) return null;
    return { raw: value, unit, value: numeric };
  }
  if (NUMBER_RE.test(value)) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return { raw: n === 0 ? '0' : `${value}px`, unit: 'px', value: n };
  }
  return null;
};

const toCssLength = (value?: string | number | null, fallback?: string): string | undefined =>
  parseCssLength(value)?.raw ?? fallback;

const toPixelNumber = (
  value?: string | number | null,
  fallback: number | null = null
): number | null => {
  const res = parseCssLength(value);
  return res?.unit === 'px' ? res.value : fallback;
};

interface ImagesProps {
  images?: MediaItem[];
  title?: string;
  width?: string | number;
  minWidth?: string | number;
  height?: string | number;
  minHeight?: string | number;
  maxHeight?: string | number;
  align?: 'left' | 'center' | 'right';
  spoiler?: boolean;
  spoilerText?: string;
  spoilerBtnText?: string;
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

const styleVal = (v: string | number | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

export const Images = ({
  images = [],
  title,
  width = '85%',
  minWidth = '150px',
  height,
  minHeight,
  maxHeight,
  align = 'center',
  spoiler = false,
  spoilerText,
  spoilerBtnText,
}: ImagesProps) => {
  const resolvedHeight =
    height !== undefined
      ? typeof height === 'string' && height.trim().toLowerCase() === 'auto'
        ? undefined
        : styleVal(height)
      : undefined;

  const resMinWidth = toCssLength(minWidth);
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

  let imageSlideIndex = -1;
  const slideIndexMap = images.map((item) => {
    if (item.type === 'video') return -1;
    imageSlideIndex += 1;
    return imageSlideIndex;
  });

  const containerStyle: CSSProperties = {
    ['--gallery-max-width' as string]: width,
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div
      className={cn(
        'images w-full max-w-full min-w-0 space-y-2 overflow-hidden md:max-w-(--gallery-max-width)',
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
          <GalleryItem
            key={i}
            item={item}
            singleColumn={singleColumn}
            resolvedMinWidth={resMinWidth}
            resolvedHeight={resolvedHeight}
            resolvedMinHeight={styleVal(minHeight) || '200px'}
            resolvedMaxHeight={styleVal(maxHeight) ?? resolvedHeight ?? undefined}
            lightboxSlides={item.type !== 'video' && slideIndexMap[i] >= 0 ? slidesJson : undefined}
            lightboxIndex={slideIndexMap[i] >= 0 ? slideIndexMap[i] : 0}
            spoiler={item.spoiler ?? spoiler}
            spoilerText={item.spoilerText ?? spoilerText}
            spoilerBtnText={item.spoilerBtnText ?? spoilerBtnText}
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
