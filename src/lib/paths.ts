import { CONFIG } from '@/config';
import type { Language } from '@/types';

const NORMALIZED_LANGUAGE_PATHS = Object.fromEntries(
  Object.entries(CONFIG.paths.languagePaths).map(([language, pathValue]) => [
    language,
    pathValue.replace(/\/$/, ''),
  ])
) as Partial<Record<Language, string>>;

const getLanguageBasePath = (lang: Language) =>
  NORMALIZED_LANGUAGE_PATHS[lang] ?? `/${lang}`;

export const getPostDateSegments = (date?: string | null) => {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return {
    year: String(parsed.getUTCFullYear()),
    month: String(parsed.getUTCMonth() + 1).padStart(2, '0'),
  } as const;
};

export const getPostPath = ({
  date,
  slug,
}: {
  date?: string | null;
  slug: string;
}) => {
  const segments = getPostDateSegments(date);
  if (!segments)
    throw new Error(`Post "${slug}" must have a valid date to generate path!`);

  return `/${segments.year}/${segments.month}/${slug}`;
};

export const getLocalizedPostPath = ({
  lang,
  date,
  slug,
}: {
  lang: Language;
  date?: string | null;
  slug: string;
}) => {
  const languagePath = getLanguageBasePath(lang);
  const postPath = getPostPath({ date, slug });

  return `${languagePath}${postPath}`;
};

export const getAbsolutePostUrl = ({
  metadataBase,
  lang,
  date,
  slug,
}: {
  metadataBase: string | URL;
  lang: Language;
  date?: string | null;
  slug: string;
}) =>
  new URL(getLocalizedPostPath({ lang, date, slug }), metadataBase).toString();
