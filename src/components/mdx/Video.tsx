import type { CSSProperties } from 'react';

import { FigureShell } from './FigureShell';
import { MediaSpoiler } from './MediaSpoiler';

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
  preload?: React.VideoHTMLAttributes<HTMLVideoElement>['preload'];
  poster?: string;
  style?: CSSProperties;
  className?: string;
  spoiler?: boolean;
  spoilerText?: string;
  spoilerBtnText?: string;
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
  preload,
  poster,
  style,
  className,
  spoiler = false,
  spoilerText = '內含劇透',
  spoilerBtnText = '點擊查看',
  ...rest
}: VideoProps) => {
  const shouldAutoPlay = spoiler ? false : autoPlay;
  const effectivePreload = preload ?? (shouldAutoPlay ? 'auto' : 'metadata');

  const video = (
    <div className="relative size-full overflow-hidden">
      <video
        src={src}
        controls={controls !== undefined ? controls : !loop}
        autoPlay={shouldAutoPlay}
        loop={loop}
        muted={muted}
        playsInline
        preload={effectivePreload}
        poster={poster}
        className="size-full object-cover transition-opacity duration-300"
        data-auto-play={shouldAutoPlay ? 'true' : undefined}
        {...(rest as React.VideoHTMLAttributes<HTMLVideoElement>)}
      />
    </div>
  );

  return (
    <FigureShell
      align={align}
      title={title}
      style={{ height: height || 'auto', width: width || '100%', ...style } as CSSProperties}
      className={className}
    >
      <MediaSpoiler
        enabled={spoiler}
        text={spoilerText}
        btnText={spoilerBtnText}
        className="size-full"
      >
        {video}
      </MediaSpoiler>
    </FigureShell>
  );
};
