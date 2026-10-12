import { defineConfig } from 'astro/config';
import site from './src/data/site.json' with { type: 'json' };

// BASE_PATH is only needed when hosting under a sub-path, e.g. GitHub Pages
// project sites (https://user.github.io/DK-Polymer/ -> BASE_PATH=/DK-Polymer).
export default defineConfig({
  site: process.env.SITE_URL || site.siteUrl,
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
