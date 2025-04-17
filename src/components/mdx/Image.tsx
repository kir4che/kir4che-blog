'use client';

import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import { cn } from '@/lib/style';

interface CustomImageProps {
  src: string;
  alt?: string;
  title?: string;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  height?: number | string;
}

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt = '',
  title,
  align = 'left',
  width = '100%',
  height = 'auto',
}) => {
  const isWidthNumber = typeof width === 'number';
  const isHeightNumber = typeof height === 'number';

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  return (
    <PhotoProvider>
      <figure
        className={cn('my-6 overflow-hidden rounded-md', alignmentClass)}
        style={{ width, height }}
      >
        <PhotoView src={src}>
          <Image
            src={src}
            alt={alt}
            layout='responsive'
            width={isWidthNumber ? width : 800}
            height={isHeightNumber ? height : 533}
            sizes='(min-width: 768px) 600px, 100vw'
            className='max-h-[600px] cursor-zoom-in object-cover object-center'
          />
        </PhotoView>
        {title && (
          <figcaption className='mt-2 text-center text-xs text-pink-600 dark:text-pink-200'>
            {title}
          </figcaption>
        )}
      </figure>
    </PhotoProvider>
  );
};

export default CustomImage;
