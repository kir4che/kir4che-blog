import { defineMiddleware } from 'astro:middleware';
import TurndownService from 'turndown';

const turndown = new TurndownService();
const linkHeader = '</sitemap-index.xml>; rel="sitemap"';

const readAcceptHeader = (request: Request, isPrerendered: boolean): string => {
  if (isPrerendered) return '';

  try {
    return request.headers.get('accept') || '';
  } catch (err) {
    if (err instanceof TypeError) return '';
    throw err;
  }
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request } = context;

  // 修正 Keystatic OAuth redirect_uri 避免 Proxy 將網址變成 localhost
  // Workaround for https://github.com/Thinkmill/keystatic/issues/1022
  const isOAuthRoute =
    url.pathname.includes('/github/oauth/') || url.pathname.includes('/github/login');

  if (isOAuthRoute) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');

    if (forwardedHost && forwardedProto) {
      const correctUrl = new URL(url);
      correctUrl.protocol = forwardedProto;
      correctUrl.host = forwardedHost;

      const newRequest = new Request(correctUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        // @ts-ignore
        duplex: 'half',
      });

      Object.defineProperty(context, 'url', {
        value: correctUrl,
        writable: false,
      });

      Object.defineProperty(context, 'request', {
        value: newRequest,
        writable: false,
      });
    }
  }

  // 只在非 API 路徑 + Accept header 包含 text/markdown 時，將 HTML 轉換為 Markdown。
  const isPageRequest = !url.pathname.startsWith('/api') && !url.pathname.startsWith('/keystatic');

  if (isPageRequest) {
    const accept = readAcceptHeader(request, context.isPrerendered);

    if (accept.includes('text/markdown')) {
      const res = await next();
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/html')) {
        const html = await res.text();

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

      return res;
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
