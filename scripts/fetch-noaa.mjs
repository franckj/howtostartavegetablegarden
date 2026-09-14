// Builds src/data/cities.json: frost dates for representative cities, straight
// from source files. No frost number or zone in that file is typed by hand.
//
//   Frost dates  NOAA NCEI 1991-2020 Climate Normals, annual/seasonal product,
//                one CSV per station (32°F last-spring / first-fall freeze at
//                50/30/10% probability, growing-season length at 50%).
//   Zone         2023 USDA Plant Hardiness Zone Map grid (PRISM, Oregon State),
//                sampled at the station's own coordinates.
//
// Input:  scripts/noaa-stations.json   [{ city, state, station, zone }]
// Run:    node scripts/fetch-noaa.mjs            -> writes src/data/cities.json
//         node scripts/fetch-noaa.mjs --probe f  -> prints a table for list f, writes nothing
import { readFileSync, writeFileSync, existsSync, mkdirSync, openSync, readSync, closeSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = join(root, 'node_modules', '.cache', 'noaa');
mkdirSync(cacheDir, { recursive: true });

const NORMALS_URL = (id) =>
  `https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/${id}.csv`;
const GRID_URL = 'https://prism.oregonstate.edu/phzm/data/2023/phzm_us_grid_2023.zip';
const GRID_PAGE = 'https://prism.oregonstate.edu/phzm/';

const probeIdx = process.argv.indexOf('--probe');
const listPath = probeIdx > -1 ? process.argv[probeIdx + 1] : join(root, 'scripts', 'noaa-stations.json');
const stations = JSON.parse(readFileSync(listPath, 'utf8'));

// ---- USDA zone grid -------------------------------------------------------
const gridBil = join(cacheDir, 'phzm_us_grid_2023.bil');
if (!existsSync(gridBil)) {
  const zip = join(cacheDir, 'grid.zip');
  const res = await fetch(GRID_URL);
  if (!res.ok) throw new Error(`zone grid download failed: ${res.status}`);
  writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  execFileSync('unzip', ['-o', '-q', zip, '-d', cacheDir]);
}
const hdr = Object.fromEntries(
  readFileSync(gridBil.replace(/\.bil$/, '.hdr'), 'utf8')
    .trim().split('\n').map((l) => l.trim().split(/\s+/))
);
const G = {
  rows: +hdr.NROWS, cols: +hdr.NCOLS, ulx: +hdr.ULXMAP, uly: +hdr.ULYMAP,
  dx: +hdr.XDIM, dy: +hdr.YDIM, nodata: +hdr.NODATA,
};
if (hdr.NBITS !== '32' || hdr.PIXELTYPE !== 'FLOAT' || hdr.BYTEORDER !== 'I') {
  throw new Error('unexpected zone grid format');
}

/** Average annual extreme minimum temperature (°F) at a point. ULXMAP/ULYMAP are pixel centres. */
function minTempAt(lat, lon) {
  const row = Math.round((G.uly - lat) / G.dy);
  const col = Math.round((lon - G.ulx) / G.dx);
  if (row < 0 || row >= G.rows || col < 0 || col >= G.cols) return null;
  const buf = Buffer.alloc(4);
  const fd = openSync(gridBil, 'r');
  readSync(fd, buf, 0, 4, (row * G.cols + col) * 4);
  closeSync(fd);
  const v = buf.readFloatLE(0);
  return v === G.nodata ? null : v;
}

/** USDA definition: 10°F zones from -60°F, each split into 5°F halves a and b. */
function zoneOf(t) {
  const n = Math.floor((t + 60) / 10) + 1;
  const half = (((t + 60) % 10) + 10) % 10 < 5 ? 'a' : 'b';
  return { zone: n, subzone: `${n}${half}` };
}

// ---- NOAA normals -----------------------------------------------------------
function parseCsvLine(line) {
  const out = [];
  let cur = '', q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === ',' && !q) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

async function normals(id) {
  const file = join(cacheDir, `${id}.csv`);
  if (!existsSync(file)) {
    const res = await fetch(NORMALS_URL(id));
    if (!res.ok) throw new Error(`${id}: NOAA normals ${res.status}`);
    writeFileSync(file, await res.text());
  }
  const [head, row] = readFileSync(file, 'utf8').trim().split('\n');
  const h = parseCsvLine(head);
  const r = parseCsvLine(row);
  return Object.fromEntries(h.map((k, i) => [k, r[i]]));
}

/**
 * NOAA marks unusable values with a measurement flag (M missing, V too cold to
 * compute, X rounded to zero, Y insufficient values, Z logically inconsistent)
 * and fills them with -9999 or similar. Any flagged value becomes null and its
 * cell is left out: no number without a source.
 */
const clean = (n, k) => (n[`meas_flag_${k}`] ? null : n[k]);

/** "04/16" -> "04-16". */
function mmdd(n, k) {
  const v = clean(n, k);
  return v && /^\d{2}\/\d{2}$/.test(v) ? v.replace('/', '-') : null;
}
function days(n, k) {
  const v = Number(clean(n, k));
  return Number.isFinite(v) && v > 0 ? Math.round(v) : null;
}
function pct(n, k) {
  const raw = clean(n, k);
  if (raw === null || raw === undefined || raw === '') return null;
  const v = Number(raw);
  return Number.isFinite(v) && v >= 0 && v <= 100 ? Math.round(v * 10) / 10 : null;
}

const rows = [];
for (const s of stations) {
  const n = await normals(s.station);
  const lat = Number(n.LATITUDE);
  const lon = Number(n.LONGITUDE);
  const t = minTempAt(lat, lon);
  const z = t === null ? null : zoneOf(t);
  // The list says which zone page a city is meant for; the grid has the final say.
  if (probeIdx === -1 && s.zone !== undefined && z?.zone !== s.zone) {
    throw new Error(`${s.city}, ${s.state}: listed for zone ${s.zone}, USDA grid says ${z?.subzone}`);
  }
  rows.push({
    city: s.city,
    state: s.state,
    zone: z?.zone ?? null,
    subzone: z?.subzone ?? null,
    minTempF: t === null ? null : Math.round(t * 10) / 10,
    lastFrost: {
      p50: mmdd(n, 'ANN-TMIN-PRBLST-T32FP50'),
      p30: mmdd(n, 'ANN-TMIN-PRBLST-T32FP30'),
      p10: mmdd(n, 'ANN-TMIN-PRBLST-T32FP10'),
    },
    firstFrost: {
      p50: mmdd(n, 'ANN-TMIN-PRBFST-T32FP50'),
      p30: mmdd(n, 'ANN-TMIN-PRBFST-T32FP30'),
      p10: mmdd(n, 'ANN-TMIN-PRBFST-T32FP10'),
    },
    frostFreeDays: days(n, 'ANN-TMIN-PRBGSL-T32FP50'),
    // Share of years with any 32°F freeze. Below 50 the median dates describe the
    // rare freeze years, not a typical one, so the page shows this instead.
    freezeChancePct: pct(n, 'ANN-TMIN-PRBOCC-LSTH032'),
    station: { id: s.station, name: n.NAME, lat, lon },
    source: NORMALS_URL(s.station),
    zoneSource: `${GRID_PAGE} (2023 grid, sampled at ${lat}, ${lon})`,
  });
}

if (probeIdx > -1) {
  for (const r of rows) {
    console.log(
      [r.subzone ?? '--', `${r.city}, ${r.state}`.padEnd(26), String(r.minTempF).padStart(6),
       r.lastFrost.p50, r.lastFrost.p30, r.lastFrost.p10, '|',
       r.firstFrost.p50, r.firstFrost.p30, r.firstFrost.p10, '|', r.frostFreeDays, `occ ${r.freezeChancePct}`,
       r.station.name].join('  ')
    );
  }
  process.exit(0);
}

const out = {
  note:
    'Representative cities per USDA zone. Frost dates are NOAA NCEI 1991-2020 Climate Normals for the named weather station (usually the airport), not for the whole city. "p50" is the date with a 50% chance of a later spring freeze (or an earlier fall freeze) at 32°F; p30 and p10 are the safer dates. The zone is read from the 2023 USDA Plant Hardiness Zone Map grid at the station\'s coordinates. Generated by scripts/fetch-noaa.mjs; do not edit by hand.',
  sources: [
    { name: 'NOAA NCEI U.S. Climate Normals 1991-2020, annual/seasonal', url: 'https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals', used_for: 'Freeze-probability dates and growing-season length per station' },
    { name: 'USDA Plant Hardiness Zone Map 2023 (PRISM Climate Group, Oregon State University)', url: GRID_PAGE, used_for: 'Zone and sub-zone at each station' },
  ],
  generated: new Date().toISOString().slice(0, 10),
  cities: rows,
};
writeFileSync(join(root, 'src', 'data', 'cities.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${rows.length} cities to src/data/cities.json`);
