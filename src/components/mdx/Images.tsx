import React from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';

import 'react-photo-view/dist/react-photo-view.css';

import { cn } from '@/lib/style';

import CustomImage from '@/components/mdx/Image';

interface ImageItem {
  src: string;
  alt?: string;
  title?: string;
  width?: number | string; // 支援百分比或 px
  height?: number | string;
  blurDataURL?: string;
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
}) => (
  <PhotoProvider>
    <div className={cn('my-6 flex flex-wrap gap-4', className)}>
      {images.map((img, index) => {
        const flexBasis =
          img.width && typeof img.width === 'number'
            ? `${Math.min(img.width, 100)}%`
            : img.width
              ? img.width
              : `${100 / images.length}%`;

        return (
          <figure
            key={index}
            style={{ flexBasis, height }}
            className='relative flex flex-col items-center justify-center overflow-hidden rounded-md'
          >
            <PhotoView src={img.src}>
              <CustomImage
                src={img.src}
                alt={img.alt || ''}
                title={img.title}
                width={img.width || '100%'}
                height={height}
                blurDataURL={img.blurDataURL}
              />
            </PhotoView>
          </figure>
        );
      })}
    </div>
  </PhotoProvider>
);

export default Images;
