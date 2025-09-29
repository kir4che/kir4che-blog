import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { MDXComponents } from 'mdx/types';
import type { LANGUAGES } from '@/config';

export type Language = (typeof LANGUAGES)[number]; // 'tw' | 'en'

export type LocalizedCategoryName = {
  [key in Language]: string;
};

/* ----- 文章 ----- */

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  categories: string[];
  tags: string[];
  wordCount: number;
  lang: Language;
  password?: string;
  hasPassword: boolean;
  draft?: boolean;
  featured?: boolean;
  coverImage?: string;
  updatedAt?: string;
}

export interface Post extends PostMeta {
  content: string;
  mdxSource: MDXRemoteSerializeResult;
}

export interface PostInfo {
  slug: string;
  title: string;
  description?: string;
  date: string;
  tags: string[];
  categories: string[];
  wordCount: number;
  lang: Language;
  featured: boolean;
  coverImage?: string;
  hasPassword: boolean;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage?: number;
  nextPage?: number | null;
  prevPage?: number | null;
}

/* ----- 分類 ----- */

export type CategoryColorScheme = {
  light: string;
  dark: string;
};

export interface CategoryInfo {
  name: LocalizedCategoryName;
  slug: string;
  color: CategoryColorScheme;
  parentSlug?: string;
  postCount?: number;
}

export interface Category extends CategoryInfo {
  subcategories?: {
    [key: string]: CategoryInfo;
  };
}

export interface CategoryMap {
  [key: string]: Category;
}

export interface CategoryResponse {
  category: Category;
  posts: PostMeta[];
}

/* ----- 標籤 ----- */

export type LocalizedTagName = LocalizedCategoryName;

export interface TagDefinition {
  name: LocalizedTagName;
  slug: string;
}

export type TagMap = Record<string, TagDefinition>;

export interface Tag {
  name: string;
  slug: string;
  postCount?: number;
}

/* ----- MDX 編輯器 ----- */

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

type MediaType = 'image' | 'video';
type ObjectPosition = 'top' | 'center' | 'bottom';

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
