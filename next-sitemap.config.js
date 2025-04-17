/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://kir4che.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [],

  // hreflang 設定
  alternateRefs: [
    {
      href: 'https://kir4che.com/tw',
      hreflang: 'zh-TW',
    },
    {
      href: 'https://kir4che.com/en',
      hreflang: 'en',
    },
  ],
};
