// @ts-check
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import ecConfig from './ec.config.mjs';

import rehypeSlug from 'rehype-slug';
import rehypeUnwrapImages from 'rehype-unwrap-images';
import remarkCustomHeaderId from 'remark-custom-header-id';
import remarkGfm from 'remark-gfm';
import remarkImages from 'remark-images';
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
  output: 'static',
  adapter: process.env.NODE_ENV === 'production' ? cloudflare() : undefined,
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    // @ts-expect-error
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
    server: {
      watch: {
        // 防止後台自動儲存寫入內容檔時觸發 HMR 整頁重整
        ignored: ['**/src/content/blog/**'],
      },
    },
    ssr: {
      external: ['node:crypto'],
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
  i18n: {
    defaultLocale: 'tw',
    locales: ['tw', 'en'],
    routing: 'manual',
  },
  integrations: [react(), expressiveCode(ecConfig), mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkGfm, remarkIns, remarkMark, remarkCustomHeaderId, remarkImages],
    rehypePlugins: [rehypeUnwrapImages, rehypeSlug],
  },
});
