import type { CategoryMap, TagMap } from '@/types';

export const categoryMap: CategoryMap = {
  backend: {
    name: {
      tw: '後端',
      en: 'Backend',
    },
    slug: 'backend',
    color: {
      light: '#132951',
      dark: '#5C7CCC',
    },
    subcategories: {
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
    },
  },
  frontend: {
    name: {
      tw: '前端',
      en: 'Frontend',
    },
    slug: 'frontend',
    color: {
      light: '#42B5F9',
      dark: '#6AC5FB',
    },
    subcategories: {
      css: {
        name: {
          tw: 'CSS',
          en: 'CSS',
        },
        slug: 'css',
        color: {
          light: '#264de4',
          dark: '#3572b5',
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
    subcategories: {
      trip: {
        name: {
          tw: '旅遊',
          en: 'Trip',
        },
        slug: 'trip',
        color: {
          light: '#32cd32',
          dark: '#6cd867',
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
  tools: {
    name: {
      tw: '工具',
      en: 'Tool',
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
          dark: '#fc5d49',
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
          dark: '#f76834',
        },
      },
    },
  },
};

export const tagMap: TagMap = {
  bundler: {
    name: {
      tw: '打包工具',
      en: 'Bundler',
    },
    slug: 'bundler',
  },
  css: {
    name: {
      tw: 'CSS',
      en: 'CSS',
    },
    slug: 'css',
  },
  deployment: {
    name: {
      tw: '部署',
      en: 'Deployment',
    },
    slug: 'deployment',
  },
  express: {
    name: {
      tw: 'Express',
      en: 'Express',
    },
    slug: 'express',
  },
  git: {
    name: {
      tw: 'Git',
      en: 'Git',
    },
    slug: 'git',
  },
  gitlab: {
    name: {
      tw: 'Gitlab',
      en: 'Gitlab',
    },
    slug: 'gitlab',
  },
  japan: {
    name: {
      tw: '日本',
      en: 'Japan',
    },
    slug: 'japan',
  },
  korea: {
    name: {
      tw: '韓國',
      en: 'Korea',
    },
    slug: 'korea',
  },
  nodejs: {
    name: {
      tw: 'NodeJS',
      en: 'NodeJS',
    },
    slug: 'nodejs',
  },
  pokemon: {
    name: {
      tw: 'Pokemon',
      en: 'Pokemon',
    },
    slug: 'pokemon',
  },
  pokmon: {
    name: {
      tw: '寶可夢',
      en: 'Pokemon',
    },
    slug: 'pokmon',
  },
  t1: {
    name: {
      tw: 'T1',
      en: 'T1',
    },
    slug: 't1',
  },
  trip: {
    name: {
      tw: '旅遊',
      en: 'Trip',
    },
    slug: 'trip',
  },
  vercel: {
    name: {
      tw: 'Vercel',
      en: 'Vercel',
    },
    slug: 'vercel',
  },
  vite: {
    name: {
      tw: 'Vite',
      en: 'Vite',
    },
    slug: 'vite',
  },
  webpack: {
    name: {
      tw: 'Webpack',
      en: 'Webpack',
    },
    slug: 'webpack',
  },
};
