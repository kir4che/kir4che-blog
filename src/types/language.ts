import common from '@/config/common';

export const LANGUAGES = common.languages.langs; // ['tw', 'en']
export type Language = (typeof LANGUAGES)[number]; // 'tw' | 'en'

export interface AvailableLang {
  code: Language;
  label: string;
  exists: boolean;
}
