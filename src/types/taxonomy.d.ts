import type { Language } from './language';
import type { PostMeta } from './post';

export type LocalizedCategoryName = {
  [key in Language]: string;
};

export type LocalizedTagName = LocalizedCategoryName;

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
