export type MediaType = 'image' | 'video';

export type ObjectPosition = 'top' | 'center' | 'bottom';

export type MediaItem =
  | {
      type?: 'image';
      src: string;
      alt?: string;
      title?: string;
      colSpan?: number;
      className?: string;
      width?: string | number;
      height?: string | number;
      objPos?: ObjectPosition;
      spoiler?: boolean;
      spoilerText?: string;
      spoilerBtnText?: string;
    }
  | {
      type: 'video';
      src: string;
      title?: string;
      colSpan?: number;
      className?: string;
      width?: string | number;
      height?: string | number;
      poster?: string;
      controls?: boolean;
      loop?: boolean;
      muted?: boolean;
      spoiler?: boolean;
      spoilerText?: string;
      spoilerBtnText?: string;
    };
