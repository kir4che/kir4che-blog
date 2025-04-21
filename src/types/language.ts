import common from '@/config/common';

export const LANGUAGES = common.languages.langs; // ['tw', 'en']
export type Language = (typeof LANGUAGES)[number]; // 'tw' | 'en'

export const LangToLocaleMap = {
  tw: 'zh-TW',
  en: 'en',
} as const;

export interface AvailableLang {
  code: Language;
  label: string;
  exists: boolean;
}
