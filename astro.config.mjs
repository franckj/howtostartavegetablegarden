import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeTableWrap from './src/lib/rehype-table-wrap.mjs';

export default defineConfig({
  site: 'https://howtostartavegetablegarden.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      changefreq: 'monthly',
      priority: 0.7,
      // Image sitemap entries for the zone chart PNGs (Google Images).
      serialize(item) {
        const m = item.url.match(/\/planting-calendar\/zone-(\d+)\/$/);
        if (m) item.img = [{ url: `https://howtostartavegetablegarden.com/img/planting-calendar/zone-${m[1]}.png` }];
        return item;
      },
    }),
  ],
  markdown: { rehypePlugins: [rehypeTableWrap] },
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
});
