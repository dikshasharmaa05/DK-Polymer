// Checks every internal href/src in dist/ resolves to a built file, and every #fragment to an id.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DIST, BASE, htmlFiles, urlPath, read } from './lib.mjs';

const files = htmlFiles();
const idsCache = new Map();
const ids = (file) => {
  if (!idsCache.has(file)) idsCache.set(file, new Set([...read(file).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  return idsCache.get(file);
};

function resolve(path) {
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length) || '/';
  const p = join(DIST, decodeURIComponent(path));
  if (existsSync(p) && statSync(p).isFile()) return p;
  if (existsSync(join(p, 'index.html'))) return join(p, 'index.html');
  return null;
}

const errors = [];
let checked = 0;
for (const file of files) {
  const page = urlPath(file);
  const html = read(file);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const raw = m[1].replace(/&amp;|&#38;/g, '&');
    if (!raw) { errors.push(`${page}: empty link`); continue; }
    if (/^(https?:|mailto:|tel:|data:)/.test(raw)) continue;
    checked++;
    const [beforeHash, hash] = raw.split('#');
    const pathPart = beforeHash.split('?')[0];
    const target = pathPart === '' ? file : resolve(pathPart.startsWith('/') ? pathPart : new URL(pathPart, 'http://x' + page).pathname);
    if (!target) { errors.push(`${page}: broken link -> ${raw}`); continue; }
    if (hash && target.endsWith('.html') && !ids(target).has(hash)) errors.push(`${page}: missing anchor -> ${raw}`);
  }
}

// Sitemaps: every <loc> must point at a built page; robots files must exist.
for (const f of ['robots.txt', 'robots.production.txt', 'llms.txt', 'sitemap-index.xml']) {
  if (!existsSync(join(DIST, f))) errors.push(`missing /${f}`);
}
let locs = 0;
for (const sm of ['sitemap-index.xml', 'sitemap-pages.xml', 'sitemap-products.xml', 'sitemap-industries.xml']) {
  const p = join(DIST, sm);
  if (!existsSync(p)) { errors.push(`missing /${sm}`); continue; }
  for (const m of read(p).matchAll(/<loc>([^<]+)<\/loc>/g)) {
    locs++;
    if (!resolve(new URL(m[1]).pathname)) errors.push(`${sm}: <loc> not built -> ${m[1]}`);
  }
}

if (errors.length) {
  console.error(`Link check FAILED (${errors.length}):\n` + errors.map((e) => '  ' + e).join('\n'));
  process.exit(1);
}
console.log(`Link check passed: ${checked} internal links across ${files.length} pages, all resolve. ${locs} sitemap URLs resolve.`);
