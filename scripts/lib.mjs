import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export const DIST = new URL('../dist/', import.meta.url).pathname;

export function htmlFiles(dir = DIST) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out.sort();
}

/** dist/products/pbt-black/index.html -> /products/pbt-black/ */
export function urlPath(file) {
  const rel = '/' + relative(DIST, file).split(sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
}

export const read = (file) => readFileSync(file, 'utf8');

/** Base path the site was built with (BASE_PATH env), without trailing slash. */
export const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
