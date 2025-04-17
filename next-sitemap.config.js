/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_API_URL || 'https://kir4che.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,

  // hreflang 設定
  alternateRefs: [
    {
      href: `${process.env.NEXT_PUBLIC_API_URL || 'https://kir4che.com'}/tw`,
      hreflang: 'zh',
    },
    {
      href: `${process.env.NEXT_PUBLIC_API_URL || 'https://kir4che.com'}/en`,
      hreflang: 'en',
    },
  ],

  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
