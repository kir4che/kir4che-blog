import React from 'react';
import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import { cn } from '@/lib/style';

interface CustomImageProps {
  src: string;
  alt?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  align?: 'left' | 'center' | 'right';
  objPos?: 'top' | 'bottom' | 'center';
  blurDataURL?: string;
  noProvider?: boolean;
  priority?: boolean;
  className?: string;
  [key: string]: any;
}

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt = '',
  title,
  width,
  height,
  align = 'center',
  objPos = 'center',
  blurDataURL,
  noProvider = false,
  priority = false,
  className,
  ...props
}) => {
  const alignment = {
    left: 'mr-auto items-start',
    center: 'mx-auto items-center',
    right: 'ml-auto items-end',
  }[align];

  const objectPosition = {
    top: 'object-top',
    center: 'object-center',
    bottom: 'object-bottom',
  }[objPos];

  const useFill = !width && !height;

  const imageContent = (
    <div
      className={cn(
        'relative h-full w-full overflow-hidden rounded-md',
        useFill && 'aspect-[3/2]',
        className
      )}
    >
      {useFill ? (
        <Image
          src={src}
          alt={alt}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          fill
          priority={priority}
          className={cn(
            'object-cover transition-transform duration-300 hover:scale-105',
            objectPosition
          )}
          {...props}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          width={800}
          height={600}
          priority={priority}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300 hover:scale-105',
            objectPosition
          )}
          {...props}
        />
      )}
    </div>
  );

  const content = (
    <figure
      className={cn(
        'xs:[max-height:var(--img-max-height)] flex max-h-80 w-full flex-col space-y-2',
        width ? 'sm:[max-width:var(--img-width)]' : 'md:max-w-5/6',
        alignment,
        className
      )}
      style={
        {
          height: height || (useFill ? '100%' : undefined),
          '--img-width': width || (useFill ? '100%' : undefined),
          '--img-max-height': height || '360px',
        } as React.CSSProperties
      }
    >
      {noProvider ? (
        imageContent
      ) : (
        <PhotoView src={src}>{imageContent}</PhotoView>
      )}
      {title && (
        <figcaption className='text-center text-xs text-pink-700/80 dark:text-pink-200'>
          {title}
        </figcaption>
      )}
    </figure>
  );

  return noProvider ? (
    content
  ) : (
    <PhotoProvider maskOpacity={0.8} speed={() => 500}>
      {content}
    </PhotoProvider>
  );
};

export default CustomImage;
