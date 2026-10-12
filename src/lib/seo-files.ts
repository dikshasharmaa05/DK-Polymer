import site from '../data/site.json';
import products from '../data/products.json';
import industries from '../data/industries.json';
import { pages, type SitemapGroup } from './pages';
import { abs } from './url';

export const SITEMAPS = ['pages', 'products', 'industries'] as const;

export function productionRobots(): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${abs('/sitemap-index.xml')}`,
    '',
  ].join('\n');
}

export function prototypeRobots(): string {
  return [
    `# PROTOTYPE ${site.version}: indexing blocked while site.json "PROTOTYPE" is true.`,
    '# The production version is published at /robots.production.txt for review.',
    'User-agent: *',
    'Disallow: /',
    '',
  ].join('\n');
}

export function sitemapXml(group: Exclude<SitemapGroup, null>): string {
  const urls = pages
    .filter((p) => p.sitemap === group)
    .map((p) => `  <url>\n    <loc>${abs(p.path)}</loc>\n    <lastmod>${site.lastUpdated}</lastmod>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function sitemapIndexXml(): string {
  const items = SITEMAPS
    .map((g) => `  <sitemap>\n    <loc>${abs(`/sitemap-${g}.xml`)}</loc>\n    <lastmod>${site.lastUpdated}</lastmod>\n  </sitemap>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

export function llmsTxt(): string {
  const n = site.nap;
  return `# ${site.name}

> ${site.description}

${site.keyFacts.map((f) => `- ${f}`).join('\n')}

Address: ${n.name}, ${n.streetAddress}, ${n.locality} ${n.postalCode}, ${n.country}
Last updated: ${site.lastUpdated}
Note: values marked [PLACEHOLDER] are not yet confirmed by the business.

## Products (recycled PBT granules)

${products.map((p) => `- [${p.name}](${abs(`/products/${p.slug}/`)}): specification table, applications, MOQ and quote request`).join('\n')}

## Industries

${industries.map((i) => `- [${i.name}](${abs(`/industries/${i.slug}/`)})`).join('\n')}

## Key pages

- [Quality and batch traceability](${abs('/quality/')})
- [Sell your PBT scrap (for injection molders)](${abs('/sell-your-scrap/')})
- [About DK Polymer](${abs('/about/')})
- [FAQ](${abs('/faq/')})
- [What is recycled PBT?](${abs('/resources/what-is-recycled-pbt/')})
- [Request a quote](${abs('/request-a-quote/')})
- [Contact](${abs('/contact/')})
`;
}
