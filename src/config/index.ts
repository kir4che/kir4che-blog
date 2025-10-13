export const CONFIG = {
  siteInfo: {
    name: 'kir4che',
    email: 'mollydcxxiii@gmail.com',
    blog: {
      title: {
        tw: 'kir4che 部落格',
        en: 'kir4che Blog',
      },
      description: {
        tw: '記錄在學習、前端開發、工作與生活中的所見所想。',
        en: 'A space for sharing thoughts and experiences from learning, front-end development, work, and life.',
      },
      siteName: {
        tw: 'kir4che 部落格',
        en: 'kir4che Blog',
      },
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
