// Pings IndexNow (Bing, Yandex, Seznam, Naver) with the site's URLs.
// Usage:
//   node scripts/indexnow.mjs                 # all URLs from the built sitemap
//   node scripts/indexnow.mjs / /about/       # only these paths
//
// IndexNow requires a key file served at https://<domain>/<key>.txt containing the key.
// This script writes public/<key>.txt for you; commit and deploy it before pinging.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'howtostartavegetablegarden.com';

// Any 8-128 char hex string works; it just has to match the served key file.
const KEY = 'a7f3c1e9b4d24f8ea1c6b7d905e3f284';
const keyFile = join(root, 'public', `${KEY}.txt`);
if (!existsSync(keyFile)) {
  writeFileSync(keyFile, KEY);
  console.log(`wrote public/${KEY}.txt — deploy it before this ping will be accepted`);
}

const args = process.argv.slice(2);
let urls;

if (args.length > 0) {
  urls = args.map((p) => `https://${HOST}${p.startsWith('/') ? p : `/${p}`}`);
} else {
  const sitemap = join(root, 'dist', 'sitemap-0.xml');
  if (!existsSync(sitemap)) {
    console.error('dist/sitemap-0.xml not found — run `npm run build` first.');
    process.exit(1);
  }
  urls = [...readFileSync(sitemap, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

console.log(`submitting ${urls.length} url(s)`);

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});

// 200 = accepted, 202 = accepted but key not yet validated.
console.log(`IndexNow responded ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) console.log(await res.text());
