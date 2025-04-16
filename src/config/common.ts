const common = {
  siteInfo: {
    blog: {
      title: 'kir4che blog',
      description: "kir4che's blog",
    },
    protfolio: {
      title: 'Molly Su | Front-End Developer',
      description: "Molly Su's portfolio",
    },
  },
  languages: {
    langs: ['tw', 'en'] as const,
    defaultLocale: 'tw' as const,
  },
  i18n: {
    defaultNS: 'common' as const,
    namespaces: ['common', 'about'] as const,
  },
  paths: {
    languagePaths: {
      tw: '/tw',
      en: '/en',
    },
  },
} as const;

export default common;
