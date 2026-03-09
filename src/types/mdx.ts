import type { ComponentType } from 'react';

export type MDXComponent<Props = any> = ComponentType<Props>;

export type MDXComponents = Record<string, MDXComponent>;

export type MediaType = 'image' | 'video';

export type ObjectPosition = 'top' | 'center' | 'bottom';

export interface ImageMeta {
  src: string;
  blurDataURL: string;
  originalWidth?: number;
  originalHeight?: number;
}

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
      originalWidth?: number;
      originalHeight?: number;
      blurDataURL?: string;
      objPos?: ObjectPosition;
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
      autoPlay?: boolean;
      loop?: boolean;
      muted?: boolean;
    };
