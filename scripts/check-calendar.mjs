// Tool-vs-static cross-check: the calendar island and the 8 zone pages must agree
// for every zone-month (96 comparisons). Both call the same functions in
// calendar.ts, so any disagreement is a rendering bug — the kind that once hid
// re-sow-only months on the zone pages.
//
// Also checks, per zone: the chart image's bars against the static month tables
// (both directions), a pixel sample of every bar in the PNG, all 12 month
// anchors, and that the city table's ?zone=&last=&first= links fill in the tool.
//
// Run: node scripts/check-calendar.mjs [baseUrl]
//   default baseUrl http://localhost:4321 (start it with `npm run preview`)
//   CHROME_PATH overrides the browser; defaults to the Playwright cache.
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:4321').replace(/\/$/, '');
const ZONES = [3, 4, 5, 6, 7, 8, 9, 10];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = join(homedir(), '.cache', 'ms-playwright');
  const dirs = existsSync(cache)
    ? readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()
    : [];
  for (const d of dirs) {
    const p = join(cache, d, 'chrome-linux64', 'chrome');
    if (existsSync(p)) return p;
  }
  throw new Error('No Chromium found. Set CHROME_PATH.');
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const key = (r) => `${r.crop} | ${r.action} | ${r.window}`;

const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage();
// Keep third-party scripts (ads, analytics) out of the comparison run.
await page.route(/googlesyndication|doubleclick|plausible\.io|fundingchoices/, (r) => r.abort());

// Display helpers only — mirrors formatDay/monthOf in calendar.ts so the chart
// model's day numbers can be compared with the text on the page.
const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const wrap = (d) => ((Math.round(d) - 1) % 365 + 365) % 365 + 1;
const monthOf = (d) => { const w = wrap(d); for (let m = 11; m >= 0; m--) if (w > CUM[m]) return m; return 0; };
const formatDay = (d) => { const w = wrap(d); const m = monthOf(w); return `${MONTHS[m]} ${w - CUM[m]}`; };
const monthsSpanned = (a, b) => { const out = []; let m = monthOf(a); const end = monthOf(b); for (let i = 0; i < 12; i++) { out.push(m); if (m === end) break; m = (m + 1) % 12; } return out; };
const LABEL = { indoors: 'Start indoors', direct: 'Direct sow outdoors', transplant: 'Transplant outdoors', fall: 'Direct sow for a fall crop' };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const fail = (msg) => { failures++; console.log(`FAIL ${msg}`); };
let chartBars = 0;
let pixelSamples = 0;

let failures = 0;
let compared = 0;
let rowsCompared = 0;

for (const zone of ZONES) {
  await page.goto(`${BASE}/planting-calendar/zone-${zone}/`, { waitUntil: 'domcontentloaded' });
  /** month name -> rows on the static page; months without a section are absent. */
  const staticMonths = await page.evaluate((months) => {
    const out = {};
    for (const name of months) {
      const h = document.querySelector(`h3#${name.toLowerCase()}`);
      if (!h) continue;
      const table = h.nextElementSibling?.querySelector('table');
      if (!table) continue;
      out[name] = [...table.querySelectorAll('tbody tr')].map((tr) => {
        const cells = tr.querySelectorAll('th, td');
        return {
          crop: cells[0].textContent,
          action: cells[1].textContent,
          window: cells[2].textContent,
        };
      });
    }
    return out;
  }, MONTHS);

  // ---- month anchors ----
  const anchors = await page.evaluate((months) => months.filter((n) => !document.getElementById(n.toLowerCase())), MONTHS);
  if (anchors.length) fail(`zone ${zone}: missing month anchors ${anchors.join(', ')}`);

  // ---- chart model vs static month tables ----
  const model = await (await fetch(`${BASE}/img/planting-calendar/zone-${zone}.json`)).json();
  const expected = new Map(); // "Month|crop|action|window" -> count
  const bump = (k) => expected.set(k, (expected.get(k) || 0) + 1);
  for (const row of model.rows) {
    for (const bar of row.bars) {
      chartBars++;
      for (const m of monthsSpanned(bar.startDay, bar.endDay)) {
        if (bar.kind === 'resow') bump(`${MONTHS[m]}|${row.name}|resow`);
        else bump(`${MONTHS[m]}|${row.name}|${LABEL[bar.kind]}|${formatDay(bar.startDay)} - ${formatDay(bar.endDay)}`);
      }
    }
  }
  const actual = new Map();
  for (const [month, rows] of Object.entries(staticMonths)) {
    for (const r of rows) {
      const action = norm(r.action);
      const k = action.startsWith('Re-sow')
        ? `${month}|${norm(r.crop)}|resow`
        : `${month}|${norm(r.crop)}|${action}|${norm(r.window)}`;
      actual.set(k, (actual.get(k) || 0) + 1);
    }
  }
  for (const [k, n] of expected) if (actual.get(k) !== n) fail(`zone ${zone} chart bar not on page: ${k} (chart ${n}, page ${actual.get(k) || 0})`);
  for (const [k, n] of actual) if (!expected.has(k)) fail(`zone ${zone} page row has no chart bar: ${k}`);

  // ---- pixels: every drawn bar is in the PNG, in its colour ----
  const png = Buffer.from(await (await fetch(`${BASE}/img/planting-calendar/zone-${zone}.png`)).arrayBuffer());
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== model.image.width || info.height !== model.image.height) {
    fail(`zone ${zone} PNG is ${info.width}x${info.height}, expected ${model.image.width}x${model.image.height}`);
  }
  if (png.length > 150 * 1024) fail(`zone ${zone} PNG is ${Math.round(png.length / 1024)} KB, over 150 KB`);
  for (const r of model.image.rects) {
    const cx = Math.round(r.x + r.w / 2);
    const cy = Math.round(r.y + r.h / 2);
    const i = (cy * info.width + cx) * info.channels;
    const got = [data[i], data[i + 1], data[i + 2]];
    const want = hex(r.fill);
    pixelSamples++;
    if (got.some((v, j) => Math.abs(v - want[j]) > 12)) {
      fail(`zone ${zone} ${r.slug} ${r.kind} bar at (${cx},${cy}) is rgb(${got}), expected ${r.fill}`);
    }
  }

  // Fresh storage so a saved zone or custom dates cannot leak between zones.
  await page.goto(`${BASE}/planting-calendar/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.selectOption('#cal-zone', String(zone));

  for (let m = 0; m < 12; m++) {
    const name = MONTHS[m];
    await page.selectOption('#cal-month', String(m));
    const toolRows = await page.evaluate(() =>
      [...document.querySelectorAll('#cal-out .cal__list li')].map((li) => ({
        crop: li.querySelector('.cal__crop').textContent,
        action: li.querySelector('.cal__action').textContent,
        window: li.querySelector('.cal__window').textContent,
      }))
    );

    const a = (staticMonths[name] || []).map((r) => key({
      crop: norm(r.crop), action: norm(r.action), window: norm(r.window),
    })).sort();
    const b = toolRows.map((r) => key({
      crop: norm(r.crop), action: norm(r.action), window: norm(r.window),
    })).sort();

    compared++;
    rowsCompared += a.length;
    const same = a.length === b.length && a.every((x, i) => x === b[i]);
    if (!same) {
      failures++;
      console.log(`FAIL zone ${zone} ${name}: static ${a.length} rows, tool ${b.length} rows`);
      for (const x of a) if (!b.includes(x)) console.log(`  static only: ${x}`);
      for (const x of b) if (!a.includes(x)) console.log(`  tool only:   ${x}`);
    }
  }
}

// ---- city table links pre-fill the tool ----
await page.goto(`${BASE}/planting-calendar/zone-8/`, { waitUntil: 'domcontentloaded' });
const useLinks = await page.$$eval('.ft-use', (as) => as.map((a) => a.getAttribute('href')));
if (useLinks.length === 0) fail('zone 8 has no "Use these dates" links');
for (const href of useLinks.slice(0, 2)) {
  const u = new URL(href, BASE);
  await page.goto(`${BASE}/planting-calendar/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(u.href, { waitUntil: 'domcontentloaded' });
  const st = await page.evaluate(() => ({
    zone: document.getElementById('cal-zone').value,
    lf: document.getElementById('cal-lf').value,
    ff: document.getElementById('cal-ff').value,
    open: document.getElementById('cal-override').open,
    meta: document.getElementById('cal-meta').textContent,
  }));
  const ok = st.zone === u.searchParams.get('zone') && st.lf === `2026-${u.searchParams.get('last')}` &&
    st.ff === `2026-${u.searchParams.get('first')}` && st.open && /your/.test(st.meta);
  if (!ok) fail(`tool did not take ${href}: ${JSON.stringify(st)}`);
}
// Malformed params are ignored rather than breaking the tool.
await page.evaluate(() => localStorage.clear());
await page.goto(`${BASE}/planting-calendar/?zone=99&last=13-45&first=xx#calendar-tool`, { waitUntil: 'domcontentloaded' });
const bad = await page.evaluate(() => ({ lf: document.getElementById('cal-lf').value, rows: document.querySelectorAll('#cal-out li, #cal-out .cal__empty').length }));
if (bad.lf === '2026-13-45' || bad.rows === 0) fail(`malformed query broke the tool: ${JSON.stringify(bad)}`);

await browser.close();
console.log(`${compared} zone-months, ${rowsCompared} static rows compared; ${chartBars} chart bars, ${pixelSamples} pixel samples; ${failures} failures (${BASE})`);
// A run that compared nothing proves nothing.
if (rowsCompared === 0) failures++;
process.exit(failures ? 1 : 0);
