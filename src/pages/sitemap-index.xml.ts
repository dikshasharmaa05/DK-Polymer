import { sitemapIndexXml } from '../lib/seo-files';

export const GET = () => new Response(sitemapIndexXml(), { headers: { 'Content-Type': 'application/xml' } });
