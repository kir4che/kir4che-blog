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
  priority?: boolean;
  blurDataURL?: string;
}

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  alt = '',
  title,
  align = 'left',
  width = '100%',
  height = 'auto',
  priority = false,
  blurDataURL,
}) => {
  const isWidthNumber = typeof width === 'number';
  const isHeightNumber = typeof height === 'number';

  const alignmentStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <PhotoProvider>
      <figure
        className={cn('my-6 flex overflow-hidden rounded-md', alignmentStyles)}
        style={{ width, height }}
      >
        <PhotoView src={src}>
          <Image
            src={src}
            alt={alt}
            layout={width && height ? 'intrinsic' : 'responsive'}
            width={isWidthNumber ? width : 800}
            height={isHeightNumber ? height : 533}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            className='max-h-[600px] cursor-zoom-in object-cover object-center'
            priority={priority}
            placeholder={blurDataURL ? 'blur' : 'empty'}
            loading='lazy'
            blurDataURL={blurDataURL}
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
