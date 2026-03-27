import type { CSSProperties } from 'react';

import { FigureShell } from './FigureShell';

interface VideoProps {
  src: string;
  title?: string;
  height?: string | number;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  controls?: boolean | undefined;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  style?: CSSProperties;
  className?: string;
  [key: string]: unknown;
}

export const Video = ({
  src,
  title,
  height,
  width,
  align = 'center',
  controls,
  autoPlay = false,
  loop = false,
  muted = true,
  poster,
  style,
  className,
  ...rest
}: VideoProps) => {
  const shouldShowControls = controls !== undefined ? controls : !loop;

  return (
    <FigureShell
      align={align}
      title={title}
      style={{ height: height || 'auto', width: width || '100%', ...style } as CSSProperties}
      className={className}
    >
      <div className="relative size-full overflow-hidden">
        <video
          src={src}
          controls={shouldShowControls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="auto"
          poster={poster}
          className="size-full object-cover transition-opacity duration-300"
          data-auto-play={autoPlay ? 'true' : undefined}
          {...(rest as React.VideoHTMLAttributes<HTMLVideoElement>)}
        />
      </div>
    </FigureShell>
  );
};
