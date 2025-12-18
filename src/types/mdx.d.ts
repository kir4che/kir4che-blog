import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { MDXComponents } from 'mdx/types';

type MediaType = 'image' | 'video';
type ObjectPosition = 'top' | 'center' | 'bottom';

export interface ImageMeta {
  src: string;
  blurDataURL: string;
  originalWidth?: number;
  originalHeight?: number;
}

export interface MdxContent {
  content: MDXRemoteSerializeResult;
  imageMetas: Record<string, ImageMeta>;
  extraComponents?: MDXComponents;
}

export type MDXAction = {
  before: string;
  after?: string;
};

export interface MediaItem {
  type?: MediaType;
  src: string;
  title?: string;
  colSpan?: number;
  className?: string;

  width?: string | number;
  height?: string | number;
  originalWidth?: number;
  originalHeight?: number;

  alt?: string;
  objPos?: ObjectPosition;
  blurDataURL?: string;

  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
}
