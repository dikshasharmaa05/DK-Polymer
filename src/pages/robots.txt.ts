import site from '../data/site.json';
import { productionRobots, prototypeRobots } from '../lib/seo-files';

// While PROTOTYPE is true, block all crawlers. Production rules live in /robots.production.txt.
export const GET = () => new Response(site.PROTOTYPE ? prototypeRobots() : productionRobots(), {
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
});
