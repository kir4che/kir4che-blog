import { useRef, useEffect } from 'react';
import { cn } from '@/lib/style';

interface CustomVideoProps {
  src: string;
  title?: string;
  height?: string | number;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  poster?: string;
  [key: string]: any;
}

const CustomVideo: React.FC<CustomVideoProps> = ({
  src,
  title,
  height,
  width,
  align = 'center',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = true,
  className,
  poster,
  ...props
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !autoPlay) return;

    const playVideo = async () => await videoElement.play();
    playVideo();

    const handleVisibilityChange = () => {
      if (document.hidden) videoElement.pause();
      else if (autoPlay) videoElement.play().catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoPlay]);

  const alignment = {
    left: 'mr-auto items-start',
    center: 'mx-auto items-center',
    right: 'ml-auto items-end',
  }[align];

  const shouldShowControls = props.hasOwnProperty('controls')
    ? controls
    : !loop;

  return (
    <figure
      className={cn('flex flex-col space-y-2 rounded-md', alignment, className)}
      style={
        {
          height: height || 'auto',
          width: width || '100%',
        } as React.CSSProperties
      }
    >
      <div className='relative h-full w-full overflow-hidden'>
        <video
          ref={videoRef}
          src={src}
          controls={shouldShowControls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload='auto'
          poster={poster}
          className='h-full w-full object-cover transition-opacity duration-300'
          {...props}
        />
      </div>
      {title && (
        <figcaption className='mt-1 text-center text-xs text-pink-700/80 dark:text-pink-200'>
          {title}
        </figcaption>
      )}
    </figure>
  );
};

export default CustomVideo;
