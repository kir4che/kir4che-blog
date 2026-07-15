export const prerender = false;

import { evaluate } from '@mdx-js/mdx';
import type { APIContext } from 'astro';
import { renderToStaticMarkup } from 'react-dom/server';
import * as runtime from 'react/jsx-runtime';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import remarkIns from 'remark-ins';
import { remarkMark } from 'remark-mark-highlight';

import {
  Accordion,
  Alert,
  Badge,
  Card,
  Correction,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Highlight,
  Image,
  Images,
  ImagesItem,
  FigureShell,
  Kbd,
  Link,
  Rating,
  SmallText,
  Spoiler,
  Table,
  Video,
} from '@/components/mdx';
import { isAuthenticated } from '@/lib/auth';

const MDX_PREVIEW_COMPONENTS = {
  Accordion,
  Alert,
  Badge,
  Card,
  Correction,
  FigureShell,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  a: Link,
  Highlight,
  Image,
  Images,
  ImagesItem,
  Kbd,
  Link,
  Rating,
  SmallText,
  Spoiler,
  Table,
  Video,
};

export const POST = async ({ request, cookies }: APIContext) => {
  if (!isAuthenticated(cookies)) return new Response('Unauthorized', { status: 401 });

  let content: string;
  try {
    const body = (await request.json()) as { content?: unknown };
    if (typeof body.content !== 'string') throw new Error('Invalid');
    content = body.content;
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // 防止過大的請求造成伺服器過載
  if (content.length > 100_000) return new Response('Payload Too Large', { status: 413 });

  try {
    // 將 MDX 內容轉換成 React 元件
    const { default: MDXContent } = await evaluate(content, {
      ...(runtime as Parameters<typeof evaluate>[1]),
      remarkPlugins: [remarkGfm, remarkIns, remarkMark],
      rehypePlugins: [rehypeSlug],
    });

    // 將 React 元件渲染成靜態 HTML 字串
    const html = renderToStaticMarkup(MDXContent({ components: MDX_PREVIEW_COMPONENTS }));

    return new Response(
      JSON.stringify({ html: `<section class="mdx-content">${html}</section>` }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
