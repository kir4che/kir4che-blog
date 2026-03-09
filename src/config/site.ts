import type { Language } from '@/types/i18n';

export const LANGUAGE_TO_LOCALE_MAP = {
  tw: 'zh-TW',
  en: 'en-US',
} as const;

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_TO_LOCALE_MAP) as Array<
  keyof typeof LANGUAGE_TO_LOCALE_MAP
>;

export const DEFAULT_LANGUAGE: Language = 'tw';
export const DEFAULT_POSTS_PER_PAGE = 10;

export const CONFIG = {
  siteInfo: {
    name: 'kir4che',
    email: 'mollydcxxiii@gmail.com',
    blog: {
      title: {
        tw: `kir4che's Blog`,
        en: `kir4che's Blog`,
      },
      description: {
        tw: '記錄在學習、前端開發、工作與生活中的所見所想。',
        en: 'A space for sharing thoughts and experiences from learning, front-end development, work, and life.',
      },
      siteName: {
        tw: `kir4che's Blog`,
        en: `kir4che's Blog`,
      },
    },
    socialLinks: {
      youtube: 'https://www.youtube.com/@kir4che',
      github: 'https://github.com/kir4che',
      bluesky: 'https://bsky.app/profile/kir4che.bsky.social',
    },
  },
  languages: {
    supportedLanguages: SUPPORTED_LANGUAGES,
    default: DEFAULT_LANGUAGE,
    languageToLocale: LANGUAGE_TO_LOCALE_MAP,
  },
  paths: {
    languagePaths: {
      tw: '/tw',
      en: '/en',
    },
  },
} as const;
