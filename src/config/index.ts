export const CONFIG = {
  siteInfo: {
    name: 'kir4che',
    email: 'mollydcxxiii@gmail.com',
    blog: {
      title: 'kir4che blog',
      description: "kir4che's blog",
    },
    socialLinks: {
      youtube: 'https://www.youtube.com/@kir4che',
      github: 'https://github.com/kir4che',
      instagram: 'https://www.instagram.com/kir4che',
    },
  },
  languages: {
    supportedLanguages: ['tw', 'en'] as const,
    defaultLanguage: 'tw' as const,
  },
  i18n: {
    defaultNamespace: 'common' as const,
    namespaces: ['common', 'about'] as const,
  },
  paths: {
    languagePaths: {
      tw: '/tw',
      en: '/en',
    },
  },
};

export const LANGUAGES = CONFIG.languages.supportedLanguages;
export const DEFAULT_LANGUAGE = CONFIG.languages.defaultLanguage;
export const LANGUAGE_TO_LOCALE_MAP = {
  tw: 'zh-TW',
  en: 'en',
} as const;
