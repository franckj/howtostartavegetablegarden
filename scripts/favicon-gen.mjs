// Generates the raster favicons Google Search and mobile browsers actually use.
// SVG alone is not enough: Google frequently falls back to a generic globe icon
// when only an SVG favicon is declared, and it looks for /favicon.ico by name.
//
// Outputs: favicon.ico (16/32/48), favicon-96.png, apple-touch-icon.png (180).
// Run: node scripts/favicon-gen.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (f) => join(root, 'public', f);

// Same mark as public/favicon.svg. Google requires a square icon; the padding is
// baked in here rather than relying on the browser to letterbox it.
const mark = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#234e2f"/>
  <path d="M16 27c0-7 0-11 0-11" stroke="#c98f5a" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M16 17c-5.6 0-8.8-3.2-8.8-8.3C12.8 8.7 16 11.9 16 17Z" fill="#6fbf7f"/>
  <path d="M16 17c5.6 0 8.8-3.2 8.8-8.3C19.2 8.7 16 11.9 16 17Z" fill="#a8dcb3"/>
</svg>`;

const png = (size) => sharp(Buffer.from(mark(size))).png().toBuffer();

/**
 * Minimal ICO writer. Vista and later accept PNG payloads inside an ICO
 * container, which avoids needing a BMP encoder.
 */
function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;

  images.forEach(({ size, data }, i) => {
    const p = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, p + 0); // width (0 means 256)
    dir.writeUInt8(size >= 256 ? 0 : size, p + 1); // height
    dir.writeUInt8(0, p + 2); // palette count
    dir.writeUInt8(0, p + 3); // reserved
    dir.writeUInt16LE(1, p + 4); // colour planes
    dir.writeUInt16LE(32, p + 6); // bits per pixel
    dir.writeUInt32LE(data.length, p + 8);
    dir.writeUInt32LE(offset, p + 12);
    offset += data.length;
  });

  return Buffer.concat([header, dir, ...images.map((i) => i.data)]);
}

const sizes = [16, 32, 48];
const icoImages = [];
for (const size of sizes) icoImages.push({ size, data: await png(size) });

writeFileSync(out('favicon.ico'), buildIco(icoImages));
writeFileSync(out('favicon-96.png'), await png(96));
writeFileSync(out('apple-touch-icon.png'), await png(180));

console.log('wrote public/favicon.ico (16/32/48), favicon-96.png, apple-touch-icon.png');
