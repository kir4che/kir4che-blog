// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import ecConfig from './ec.config.mjs';

import rehypeExternalLinks from 'rehype-external-links';
import rehypeSlug from 'rehype-slug';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkGfm from 'remark-gfm';
import remarkCustomHeaderId from 'remark-custom-header-id';
import remarkIns from 'remark-ins';
import { remarkMark } from 'remark-mark-highlight';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode, process.cwd(), '');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, 'src');

export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'https://kir4che.com',
  adapter: vercel(),
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
    server: {
      port: process.env.ADMIN_DEV ? 4322 : 4321,
      watch: {
        ...(process.env.ADMIN_DEV ? { ignored: ['**/src/content/blog/**'] } : {}),
      },
    },
    ssr: {
      external: ['node:crypto', 'node:fs', 'node:fs/promises', 'node:path', 'fs', 'path'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        'react-dom/client',
        'leaflet',
      ],
      exclude: [],
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  i18n: {
    defaultLocale: 'tw',
    locales: ['tw', 'en'],
    routing: 'manual',
  },
  integrations: [react(), expressiveCode(ecConfig), mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkGfm, remarkIns, remarkMark, remarkCustomHeaderId],
    rehypePlugins: [
      rehypeUnwrapImages,
      rehypeSlug,
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.kir4che.com' }],
  },
});
