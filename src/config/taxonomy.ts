import type { Category, CategoryColorScheme, TagDefinition } from '@/types';

const mono = (c: string): CategoryColorScheme => ({ light: c, dark: c });
const dual = (l: string, d: string): CategoryColorScheme => ({ light: l, dark: d });

const cat = (slug: string, tw: string, en: string, color: CategoryColorScheme): Category => ({
  name: { tw, en },
  slug,
  color,
});

const tag = (slug: string, tw: string, en: string): TagDefinition => ({
  name: { tw, en },
  slug,
});

export const categoryMap: Record<string, Category> = {
  frontend: {
    ...cat('frontend', '前端', 'Frontend', dual('#3B82F6', '#60A5FA')),
    subcategories: {
      css: { name: { tw: 'CSS', en: 'CSS' }, slug: 'css', color: dual('#264de4', '#6B8FE8') },
      javascript: {
        name: { tw: 'JavaScript', en: 'JavaScript' },
        slug: 'javascript',
        color: dual('#E5B20D', '#F4E47A'),
      },
      astro: {
        name: { tw: 'Astro', en: 'Astro' },
        slug: 'astro',
        color: dual('#BC52EE', '#D16DF5'),
      },
      bundler: {
        name: { tw: '打包工具', en: 'Bundler' },
        slug: 'bundler',
        color: dual('#CB3837', '#DB5656'),
      },
      'web-security': {
        name: { tw: '網頁安全', en: 'Web Security' },
        slug: 'web-security',
        color: dual('#059669', '#34D399'),
      },
    },
  },
  tools: {
    ...cat('tools', '工具', 'Tools', dual('#6B7280', '#9CA3AF')),
    subcategories: {
      git: { name: { tw: 'Git', en: 'Git' }, slug: 'git', color: dual('#F05032', '#F27D5E') },
    },
  },
  'side-project': cat('side-project', 'Side Project', 'Side Project', dual('#DC2626', '#F87171')),
  life: {
    ...cat('life', '生活', 'Life', dual('#F77E9D', '#FB9CB4')),
    subcategories: {
      trip: { name: { tw: '旅遊', en: 'Trip' }, slug: 'trip', color: dual('#32cd32', '#6cd867') },
    },
  },
  'language-learning': cat(
    'language-learning',
    '語言學習',
    'Language Learning',
    dual('#8772AD', '#B1A0CE')
  ),
  uncategorized: cat('uncategorized', '未分類', 'Uncategorized', dual('#9CA3AF', '#D1D5DB')),
};

export const tagMap: Record<string, TagDefinition> = {
  astro: tag('astro', 'Astro', 'Astro'),
  'astral-vows': tag('astral-vows', 'Astral Vows', 'Astral Vows'),
  bundler: tag('bundler', '打包工具', 'Bundler'),
  css: tag('css', 'CSS', 'CSS'),
  deployment: tag('deployment', '部署', 'Deployment'),
  express: tag('express', 'Express', 'Express'),
  gamedev: tag('gamedev', '遊戲開發', 'Game Dev'),
  git: tag('git', 'Git', 'Git'),
  gitlab: tag('gitlab', 'Gitlab', 'Gitlab'),
  ink: tag('ink', 'Ink', 'Ink'),
  javascript: tag('javascript', 'JavaScript', 'JavaScript'),
  japan: tag('japan', '日本', 'Japan'),
  korea: tag('korea', '韓國', 'Korea'),
  nodejs: tag('nodejs', 'NodeJS', 'NodeJS'),
  musings: tag('musings', '隨筆', 'Musings'),
  'next-js': tag('next-js', 'Next.js', 'Next.js'),
  notes: tag('notes', '筆記', 'Notes'),
  pokemon: tag('pokemon', 'Pokemon', 'Pokemon'),
  pokmon: tag('pokmon', '寶可夢', 'Pokemon'),
  react: tag('react', 'React', 'React'),
  security: tag('security', '資訊安全', 'Security'),
  seo: tag('seo', 'SEO', 'SEO'),
  t1: tag('t1', 'T1', 'T1'),
  tool: tag('tool', '工具', 'Tools'),
  trip: tag('trip', '旅遊', 'Trip'),
  typescript: tag('typescript', 'TypeScript', 'TypeScript'),
  vercel: tag('vercel', 'Vercel', 'Vercel'),
  vite: tag('vite', 'Vite', 'Vite'),
  'web-storage': tag('web-storage', 'Web Storage', 'Web Storage'),
  webpack: tag('webpack', 'Webpack', 'Webpack'),
};
