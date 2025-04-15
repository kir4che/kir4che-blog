import type { Language } from '@/types/language';
import type { PostMeta } from '@/types/post';

export type LocalizedCategoryName = {
  [key in Language]: string;
};

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
