import type { Language } from '@/types';

export type PostListItem = {
  slug: string;
  title: string;
  date: string;
  featured: boolean;
  hasPassword: boolean;
  draft?: boolean;
  coverImage?: string;
};

export type CategoryNode = {
  slug: string;
  name: { tw: string; en: string };
  color: { light: string; dark: string };
  subcategories?: CategoryNode[];
};

export type TagNode = { slug: string; name: { tw: string; en: string } };

export type FlatCategory = {
  slug: string;
  name: string;
  isParent: boolean;
  color: string;
  parentSlug?: string;
};

export type LoadedPost = {
  slug: string;
  lang: Language;
  title: string;
  description: string;
  date: string;
  categories: string[];
  tags: string[];
  draft: boolean;
  featured: boolean;
  password: string;
  coverImage: string;
  updatedAt?: string;
  content: string;
};

export type EditorFormState = {
  title: string;
  slug: string;
  description: string;
  content: string;
  tags: string[];
  categories: string[];
  password: string;
  coverFile: File | null;
  coverImagePath: string;
  draft: boolean;
  featured: boolean;
  date: string;
};

export type TaxonomyState = {
  categories: CategoryNode[];
  tags: TagNode[];
};
