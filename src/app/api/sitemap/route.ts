// src/app/api/sitemap/route.ts
import sitemap from '@/app/sitemap';
import type { SitemapFile } from '@/app/sitemap';

export const GET = async () => {
  const sitemapData = (await sitemap()) as SitemapFile[];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n${generateXML(sitemapData)}`,
    {
      headers: {
        'Content-Type': 'application/xml',
      },
    }
  );
};

const generateXML = (sitemapData: SitemapFile[]): string => {
  return `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemapData
        .map(
          (entry) => `
        <url>
          <loc>${entry.url}</loc>
          <lastmod>${entry.lastModified.toISOString()}</lastmod>
          <changefreq>${entry.changeFrequency}</changefreq>
          <priority>${entry.priority}</priority>
        </url>`
        )
        .join('')}
    </urlset>
  `;
};
