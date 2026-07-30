// Generates public/og-image.png (1200x630) from the site's design tokens.
// Requires `sharp` (already present via Astro). Run: node scripts/og-gen.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const W = 1200;
const H = 630;
const CREAM = '#fbf9f4';
const INK = '#1f2a20';
const LEAF = '#2f6b3f';
const LEAF_2 = '#3f8a52';
const SOIL = '#7a5330';
const MUTED = '#5f6b5e';

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="soilband" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SOIL}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${SOIL}" stop-opacity="0.22"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect x="0" y="${H - 96}" width="${W}" height="96" fill="url(#soilband)"/>
  <rect x="0" y="0" width="14" height="${H}" fill="${LEAF}"/>

  <!-- sprout mark -->
  <g transform="translate(84, 96) scale(2.6)">
    <path d="M12 21c0-5 0-8 0-8" stroke="${SOIL}" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M12 13c-4.2 0-6.6-2.4-6.6-6.2C9.6 6.8 12 9.2 12 13Z" fill="${LEAF}"/>
    <path d="M12 13c4.2 0 6.6-2.4 6.6-6.2C14.4 6.8 12 9.2 12 13Z" fill="${LEAF_2}"/>
  </g>

  <text x="84" y="248" font-family="Helvetica, Arial, sans-serif" font-size="26"
        font-weight="700" fill="${LEAF}" letter-spacing="4">THE BEGINNER'S GUIDE</text>

  <text x="80" y="342" font-family="Helvetica, Arial, sans-serif" font-size="72"
        font-weight="700" fill="${INK}">How to Start a</text>
  <text x="80" y="424" font-family="Helvetica, Arial, sans-serif" font-size="72"
        font-weight="700" fill="${INK}">Vegetable Garden</text>

  <text x="84" y="492" font-family="Helvetica, Arial, sans-serif" font-size="29"
        fill="${MUTED}">9 steps, real numbers, and a planting calendar for your zone</text>

  <text x="84" y="${H - 38}" font-family="Helvetica, Arial, sans-serif" font-size="24"
        font-weight="600" fill="${LEAF}">howtostartavegetablegarden.com</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(join(root, 'public/og-image.png'));
console.log('wrote public/og-image.png');
