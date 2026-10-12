import products from '../data/products.json';
import industries from '../data/industries.json';
import articles from '../data/articles.json';

export type SitemapGroup = 'pages' | 'products' | 'industries' | null;

export interface PageEntry {
  path: string;
  label: string;
  group: string;
  sitemap: SitemapGroup;
}

/** Single registry of every page. Drives the sitemaps, llms.txt and /prototype-map/. */
export const pages: PageEntry[] = [
  { path: '/', label: 'Home', group: 'Core', sitemap: 'pages' },
  { path: '/about/', label: 'About', group: 'Core', sitemap: 'pages' },
  { path: '/contact/', label: 'Contact', group: 'Core', sitemap: 'pages' },
  { path: '/products/', label: 'Products overview', group: 'Products', sitemap: 'products' },
  ...products.map((p) => ({ path: `/products/${p.slug}/`, label: p.name, group: 'Products', sitemap: 'products' as const })),
  { path: '/industries/', label: 'Industries overview', group: 'Industries', sitemap: 'industries' },
  ...industries.map((i) => ({ path: `/industries/${i.slug}/`, label: i.name, group: 'Industries', sitemap: 'industries' as const })),
  { path: '/quality/', label: 'Quality', group: 'Trust', sitemap: 'pages' },
  { path: '/faq/', label: 'FAQ', group: 'Trust', sitemap: 'pages' },
  { path: '/resources/', label: 'Resources index', group: 'Resources', sitemap: 'pages' },
  ...articles.map((a) => ({ path: `/resources/${a.slug}/`, label: a.headline, group: 'Resources', sitemap: 'pages' as const })),
  { path: '/request-a-quote/', label: 'Request a Quote', group: 'Conversion', sitemap: 'pages' },
  { path: '/sell-your-scrap/', label: 'Sell Your Scrap', group: 'Conversion', sitemap: 'pages' },
  { path: '/thank-you/', label: 'Thank you (noindex)', group: 'Conversion', sitemap: null },
  { path: '/privacy/', label: 'Privacy', group: 'Utility', sitemap: 'pages' },
  { path: '/prototype-map/', label: 'Prototype map (noindex)', group: 'Utility', sitemap: null },
  { path: '/404.html', label: '404 Not found', group: 'Utility', sitemap: null },
];
