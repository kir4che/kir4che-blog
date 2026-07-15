import { isAuthenticated } from '@/lib/auth';
import { defineMiddleware } from 'astro:middleware';
import TurndownService from 'turndown';

const turndown = new TurndownService();
const linkHeader =
  '</sitemap-index.xml>; rel="sitemap", </docs>; rel="service-doc", </rss.xml>; rel="alternate"; type="application/rss+xml"';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, request } = context;

  if (
    url.pathname.startsWith('/admin') &&
    !url.pathname.startsWith('/admin/login') &&
    !(await isAuthenticated(cookies))
  )
    return redirect('/admin/login');

  if (url.pathname.startsWith('/api/admin') && !(await isAuthenticated(cookies)))
    return new Response('Unauthorized', { status: 401 });

  // 只在非 API 路徑 + Accept header 包含 text/markdown 時，將 HTML 轉換為 Markdown。
  const isPageRequest = !url.pathname.startsWith('/api') && !url.pathname.startsWith('/admin');

  if (isPageRequest) {
    let accept = '';
    try {
      accept = request.headers.get('accept') || '';
    } catch {
      // headers 在 prerendering 時不可用
    }

    if (accept.includes('text/markdown')) {
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
  }

  const response = await next();

  if (!url.pathname.startsWith('/api')) response.headers.set('Link', linkHeader);

  return response;
});

const extractMain = (html: string): string => {
  const match = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return match ? match[1] : html;
};
