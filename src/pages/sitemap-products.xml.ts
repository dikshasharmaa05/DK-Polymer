import { sitemapXml } from '../lib/seo-files';

export const GET = () => new Response(sitemapXml('products'), { headers: { 'Content-Type': 'application/xml' } });
