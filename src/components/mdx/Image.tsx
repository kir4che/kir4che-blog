import type { CSSProperties } from 'react';

import { cn } from '@/utils/cn';
import { FigureShell } from './FigureShell';
import { MediaSpoiler } from './MediaSpoiler';

interface ImageProps {
  src: string;
  alt?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  align?: 'left' | 'center' | 'right';
  objPos?: 'top' | 'center' | 'bottom';
  className?: string;
  imgClass?: string;
  imgWrapClass?: string;
  noLightbox?: boolean;
  lightboxSlides?: string;
  lightboxIndex?: number;
  spoiler?: boolean;
  spoilerText?: string;
  spoilerBtnText?: string;
  [key: string]: unknown;
}

export const Image = ({
  src,
  alt = '',
  title,
  width,
  height,
  align = 'center',
  objPos = 'center',
  className,
  imgClass,
  imgWrapClass,
  noLightbox = false,
  lightboxSlides,
  lightboxIndex = 0,
  spoiler = false,
  spoilerText,
  spoilerBtnText,
  ...rest
}: ImageProps) => {
  const normalizedHeight =
    typeof height === 'string' && height.trim().toLowerCase() === 'auto' ? undefined : height;

  const objectPosition = { top: 'object-top', center: 'object-center', bottom: 'object-bottom' }[
    objPos
  ];

  const renderWidth = typeof width === 'number' ? width : undefined;
  const renderHeight = typeof normalizedHeight === 'number' ? normalizedHeight : undefined;

  const cssWidth = typeof width === 'number' ? `${width}px` : width;

  const figureStyle: CSSProperties = {
    ['--img-width' as string]: cssWidth || '100%',
    ['--img-max-height' as string]: normalizedHeight
      ? `max(${typeof normalizedHeight === 'number' ? `${normalizedHeight}px` : normalizedHeight}, 400px)`
      : '400px',
  };

  const hasCustomWidth = width !== undefined;

  const imageWrapStyle: CSSProperties = {
    height: normalizedHeight
      ? typeof normalizedHeight === 'number'
        ? `${normalizedHeight}px`
        : normalizedHeight
      : undefined,
  };

  const slides = lightboxSlides ?? JSON.stringify([{ src, alt }]);

  return (
    <FigureShell
      align={align}
      title={title}
      className={cn(
        'relative w-full',
        hasCustomWidth ? 'sm:max-w-(--img-width)' : 'md:max-w-5/6',
        className
      )}
      style={figureStyle}
    >
      <MediaSpoiler
        enabled={spoiler}
        text={spoilerText}
        btnText={spoilerBtnText}
        className="w-full"
      >
        <div
          className={cn(
            'xs:max-h-(--img-max-height) relative max-h-80 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800',
            !noLightbox && 'cursor-zoom-in',
            imgWrapClass
          )}
          style={imageWrapStyle}
          {...(!noLightbox && {
            'data-lightbox-slides': slides,
            'data-lightbox-index': lightboxIndex,
          })}
        >
          <img
            src={src}
            alt={alt}
            width={renderWidth}
            height={renderHeight}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = '/images/cover-fallback_lg.webp';
            }}
            className={cn(
              'size-full object-cover transition-transform duration-500 ease-out hover:scale-105',
              objectPosition,
              imgClass
            )}
            {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)}
          />
        </div>
      </MediaSpoiler>
    </FigureShell>
  );
};
