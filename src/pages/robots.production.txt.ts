import { productionRobots } from '../lib/seo-files';

export const GET = () => new Response(productionRobots(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
