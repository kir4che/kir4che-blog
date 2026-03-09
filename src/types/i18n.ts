import { LANGUAGE_TO_LOCALE_MAP } from '@/config';

export type Language = keyof typeof LANGUAGE_TO_LOCALE_MAP;

export type Translator = (key: string, values?: Record<string, string | number>) => string;

export type LinkBuilder = (href: string) => string;
