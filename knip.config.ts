/** @type {import('knip').KnipConfig} */
const config = {
  entry: [
    'astro.config.*',
    'src/pages/**/*.{astro,ts,tsx,md,mdx}',
    'src/components/**/*.{astro,ts,tsx}',
    'src/lib/**/*.ts',
    'src/utils/**/*.ts',
  ],
  project: ['tsconfig.json'],
  astro: true,
};

export default config;
