// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, 'src');

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://kir4che.com',
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
  },
  i18n: {
    defaultLocale: 'tw',
    locales: ['tw', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [react(), expressiveCode(ecConfig), mdx()],
  markdown: {
    remarkPlugins: [remarkGfm, remarkIns, remarkMark, remarkCustomHeaderId, remarkImages],
    rehypePlugins: [rehypeUnwrapImages, rehypeSlug],
  },
});
