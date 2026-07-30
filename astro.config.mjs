import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeTableWrap from './src/lib/rehype-table-wrap.mjs';

export default defineConfig({
  site: 'https://howtostartavegetablegarden.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ changefreq: 'monthly', priority: 0.7 })],
  markdown: { rehypePlugins: [rehypeTableWrap] },
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
});
