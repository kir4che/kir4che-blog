import { isAuthenticated } from '@/lib/auth';
import { defineMiddleware } from 'astro:middleware';
import TurndownService from 'turndown';

const turndown = new TurndownService();
const linkHeader =
  '</sitemap-index.xml>; rel="sitemap", </docs>; rel="service-doc", </rss.xml>; rel="alternate"; type="application/rss+xml"';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, request } = context;

  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    if (!(await isAuthenticated(cookies))) return redirect('/admin/login');
  }

  if (url.pathname.startsWith('/api/admin')) {
    if (!(await isAuthenticated(cookies))) return new Response('Unauthorized', { status: 401 });
  }

  const accept = request.headers.get('accept') || '';

  const isPageRequest = !url.pathname.startsWith('/api') && !url.pathname.startsWith('/admin');

  if (accept.includes('text/markdown') && isPageRequest) {
    const response = await next();

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const html = await response.text();

      const mainContent = extractMain(html);

      const markdown = turndown.turndown(mainContent);

      return new Response(markdown, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          Link: linkHeader,
          Vary: 'Accept',
        },
      });
    }

    return response;
  }

  const response = await next();

  if (!url.pathname.startsWith('/api')) response.headers.set('Link', linkHeader);

  return response;
});

const extractMain = (html: string): string => {
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return match ? match[1] : html;
};
