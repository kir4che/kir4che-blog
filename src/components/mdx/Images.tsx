'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/style';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

interface ImageItem {
  src: string;
  alt?: string;
  title?: string;
  width?: number | string; // 支援百分比或 px
}

interface ImagesProps {
  images: ImageItem[];
  height?: number | string;
  className?: string;
}

const Images: React.FC<ImagesProps> = ({
  images,
  height = 'auto',
  className,
}) => {
  return (
    <PhotoProvider>
      <div className={cn('my-6 flex flex-wrap gap-4', className)}>
        {images.map((img, idx) => {
          const flexBasis = img.width
            ? typeof img.width === 'number'
              ? `${img.width}px`
              : img.width
            : `${100 / images.length}%`;

          return (
            <figure
              key={idx}
              style={{ flexBasis, height }}
              className='relative flex flex-col items-center justify-center overflow-hidden rounded-md'
            >
              <PhotoView src={img.src}>
                <Image
                  src={img.src}
                  alt={img.alt || ''}
                  width={800}
                  height={600}
                  className='h-full w-full cursor-zoom-in object-cover object-center'
                />
              </PhotoView>
              {img.title && (
                <figcaption className='mt-2 text-center text-xs text-pink-600 dark:text-pink-200'>
                  {img.title}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </PhotoProvider>
  );
};

export default Images;
