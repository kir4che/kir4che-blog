import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { Language } from '@/types/language';

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
  hasPassword?: boolean;
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
  description: string;
  date: string;
  tags: string[];
  categories: string[];
  wordCount: number;
  lang: Language;
  featured: boolean;
  coverImage: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}
