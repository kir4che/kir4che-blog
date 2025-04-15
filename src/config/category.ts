import type { CategoryMap } from '@/types/category';

export const categoryMap: CategoryMap = {
  frontend: {
    name: {
      tw: '前端',
      en: 'FE',
    },
    slug: 'frontend',
    color: {
      light: '#42B5F9',
      dark: '#6AC5FB',
    },
    subcategories: {
      react: {
        name: {
          tw: 'React',
          en: 'React',
        },
        slug: 'react',
        color: {
          light: '#61DAFB',
          dark: '#61DAFB',
        },
      },
      javascript: {
        name: {
          tw: 'JavaScript',
          en: 'JavaScript',
        },
        slug: 'javascript',
        color: {
          light: '#F0DB4F',
          dark: '#F4E47A',
        },
      },
    },
  },
  backend: {
    name: {
      tw: '後端',
      en: 'BE',
    },
    slug: 'backend',
    color: {
      light: '#132951',
      dark: '#5C7CCC',
    },
    subcategories: {
      nodejs: {
        name: {
          tw: 'NodeJS',
          en: 'NodeJS',
        },
        slug: 'nodejs',
        color: {
          light: '#78b42d',
          dark: '#78b42d',
        },
      },
      java: {
        name: {
          tw: 'Java',
          en: 'Java',
        },
        slug: 'java',
        color: {
          light: '#F89820',
          dark: '#F89820',
        },
      },
    },
  },
  life: {
    name: {
      tw: '生活',
      en: 'Life',
    },
    slug: 'life',
    color: {
      light: '#F77E9D',
      dark: '#FB9CB4',
    },
  },
  language: {
    name: {
      tw: '語言',
      en: 'Language',
    },
    slug: 'language',
    color: {
      light: '#8772AD',
      dark: '#B1A0CE',
    },
  },
  tools: {
    name: {
      tw: '工具',
      en: 'Tools',
    },
    slug: 'tools',
    color: {
      light: '#666666',
      dark: '#CCCCCC',
    },
    subcategories: {
      git: {
        name: {
          tw: 'Git',
          en: 'Git',
        },
        slug: 'git',
        color: {
          light: '#E53621',
          dark: '#E95B4A',
        },
      },
      gitlab: {
        name: {
          tw: 'Gitlab',
          en: 'Gitlab',
        },
        slug: 'gitlab',
        color: {
          light: '#F45419',
          dark: '#F77F52',
        },
      },
    },
  },
  resource: {
    name: {
      tw: '資源',
      en: 'Resource',
    },
    slug: 'resource',
    color: {
      light: '#2b66af',
      dark: '#538DD5',
    },
  },
};
