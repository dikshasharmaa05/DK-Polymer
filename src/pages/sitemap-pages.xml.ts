import { sitemapXml } from '../lib/seo-files';

export const GET = () => new Response(sitemapXml('pages'), { headers: { 'Content-Type': 'application/xml' } });
