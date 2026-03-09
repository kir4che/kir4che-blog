import type { MarkdownHeading } from 'astro';
import type { CollectionEntry } from 'astro:content';

import type { Language } from './i18n';

export interface PostMeta {
  slug: string;
  lang: Language;
  title: string;
  description?: string;
  date: string;
  postId?: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  draft: boolean;
  passwordHash?: string;
  coverImage?: string;
  wordCount?: number;
  updatedAt?: string;
  showUpdatedAt?: boolean;
}

// 文章純內容
export interface PostContent {
  content: string;
  headings?: MarkdownHeading[];
}

// Astro render 結果
export interface PostRenderResult {
  rendered: Awaited<ReturnType<CollectionEntry<'blog'>['render']>>;
}

// 完整文章（文章頁使用）
export interface Post extends PostMeta, PostContent, Partial<PostRenderResult> {}

// 分頁資料
export interface PaginationData<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  start: number;
  end: number;
}
