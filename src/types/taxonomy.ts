import type { Language } from './i18n';

export interface TaxonomyBase {
  slug: string;
  name: Partial<Record<Language, string>>;
  postCount?: number;
}

export type CategoryColorScheme = {
  light: string;
  dark: string;
};
export interface CategoryInfo extends TaxonomyBase {
  color: CategoryColorScheme;
  parentSlug?: string;
}
export interface Category {
  name: Partial<Record<Language, string>>;
  slug: string;
  color: CategoryColorScheme;
  postCount?: number;
  subcategories?: Record<string, CategoryInfo>;
}
export interface CategoryBadgeInfo {
  slug: string;
  name: string;
  color: CategoryColorScheme;
}
export interface SidebarCategory {
  slug: string;
  name: string;
  color: CategoryColorScheme;
  postCount: number;
}

export interface TagInfo extends TaxonomyBase {}
export interface TagBadgeInfo {
  slug: string;
  name: string;
}
export interface SidebarTag {
  slug: string;
  name: string;
  postCount: number;
}
