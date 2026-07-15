import type { Language } from './i18n';

export interface TaxonomyItem {
  slug: string;
  label: string;
}

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
export interface Category extends TaxonomyBase {
  color: CategoryColorScheme;
  subcategories?: Record<string, CategoryInfo>;
}

export interface SidebarCategory {
  slug: string;
  name: string;
  color: CategoryColorScheme;
  postCount: number;
}

export interface TagDefinition {
  name: Partial<Record<Language, string>>;
  slug: string;
}

export interface TagBadgeInfo {
  slug: string;
  name: string;
}
export interface SidebarTag {
  slug: string;
  name: string;
  postCount: number;
}
