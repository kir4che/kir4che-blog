import type { MarkdownHeading } from 'astro';
import type { render } from 'astro:content';

import type { Language } from './i18n';

export interface PostMeta {
  slug: string;
  lang: Language;
  title: string;
  description?: string;
  date: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  draft: boolean;
  protected?: boolean;
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
  rendered: Awaited<ReturnType<typeof render>>;
}

// 完整文章（文章頁使用）
export interface Post extends PostMeta, PostContent, Partial<PostRenderResult> {}

// 分頁資料
export interface PaginationData<T> {
  items: T[];
  currPage: number;
  totalPages: number;
  totalItems: number;
  start: number;
  end: number;
}

export interface AdminPost {
  id: string;
  lang: Language;
  slug: string;
  meta: PostMeta;
  content: string;
  fullPath: string;
}
