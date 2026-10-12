const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix an internal path with the configured base path. External URLs pass through. */
export function href(path: string): string {
  return path.startsWith('/') ? base + path : path;
}

/** Absolute URL for canonical tags, sitemaps and JSON-LD. */
export function abs(path: string): string {
  return new URL(href(path), import.meta.env.SITE).href;
}

export function waLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
