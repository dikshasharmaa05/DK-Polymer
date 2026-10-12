import { sitemapXml } from '../lib/seo-files';

export const GET = () => new Response(sitemapXml('industries'), { headers: { 'Content-Type': 'application/xml' } });
