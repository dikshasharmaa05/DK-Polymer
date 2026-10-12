// Parses every JSON-LD block in dist/ (fails on invalid JSON) and prints page -> schema types.
import { htmlFiles, urlPath, read } from './lib.mjs';

const rows = [];
let failed = false;
for (const file of htmlFiles()) {
  const page = urlPath(file);
  const html = read(file);
  const types = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(m[1]);
      const nodes = data['@graph'] ?? [data];
      for (const n of nodes) types.push(...[].concat(n['@type']));
      if (nodes.some((n) => n['@type'] === 'Product' && 'offers' in n)) {
        console.error(`${page}: Product has offers, but pricing is undecided`);
        failed = true;
      }
    } catch (e) {
      console.error(`${page}: INVALID JSON-LD: ${e.message}`);
      failed = true;
    }
  }
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '(none)';
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) { console.error(`${page}: expected exactly one <h1>, found ${h1s}`); failed = true; }
  rows.push([page, types.join(', ') || '(none)', robots]);
}

const w = [0, 1, 2].map((i) => Math.max(...rows.map((r) => r[i].length), ['Page', 'Schema types', 'robots'][i].length));
const line = (r) => '| ' + r.map((c, i) => c.padEnd(w[i])).join(' | ') + ' |';
console.log(line(['Page', 'Schema types', 'robots']));
console.log('|' + w.map((n) => '-'.repeat(n + 2)).join('|') + '|');
rows.forEach((r) => console.log(line(r)));
if (failed) process.exit(1);
console.log(`\nJSON-LD valid on all ${rows.length} pages; exactly one <h1> per page.`);
