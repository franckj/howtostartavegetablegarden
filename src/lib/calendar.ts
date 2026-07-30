import zonesData from '@/data/zones.json';
import cropsData from '@/data/crops.json';

export type Method = 'indoors' | 'direct' | 'transplant';

export interface CropAction {
  method: Method;
  weeks: [number, number];
}

export interface Crop {
  slug: string;
  name: string;
  season: 'cool' | 'warm';
  difficulty: number;
  daysToHarvest: [number, number];
  spacingIn: string | number;
  rowSpacingIn: number;
  depthIn: string | number;
  minSoilTempF: number;
  sunHours: string;
  actions: CropAction[];
  fallSow: boolean;
  /** Routinely re-sown every 2-3 weeks through the season. */
  succession: boolean;
  why: string;
  watchOut: string;
}

export interface Zone {
  zone: number;
  minTempF: string;
  lastFrost: string;
  firstFrost: string;
  lastFrostDay: number;
  firstFrostDay: number;
  seasonDays: number;
  regions: string;
  summary: string;
}

export const zones = zonesData.zones as Zone[];
export const crops = cropsData.crops as Crop[];
export interface DataSource {
  name: string;
  url: string;
  used_for: string;
}

export const zonesMeta = { note: zonesData.note, source: zonesData.source };
export const cropsMeta = {
  note: cropsData.note,
  source: cropsData.source,
  limitations: cropsData.limitations,
};

/** Every source the dataset was checked against, for the citations block. */
export const dataSources: DataSource[] = [
  ...(zonesData.sources as DataSource[]),
  ...(cropsData.sources as DataSource[]),
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

/** Cumulative days before the start of each month (non-leap reference year). */
const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const YEAR = 365;

/** Wrap a day-of-year into 1..365 so windows can cross the new year (zones 9-10). */
const wrap = (day: number): number => ((Math.round(day) - 1) % YEAR + YEAR) % YEAR + 1;

/** Day-of-year (1-365) -> zero-based month index. */
export function monthOf(day: number): number {
  const d = wrap(day);
  for (let m = 11; m >= 0; m--) if (d > CUM[m]) return m;
  return 0;
}

/** Day-of-year (1-365) -> "May 15". */
export function formatDay(day: number): string {
  const d = wrap(day);
  const m = monthOf(d);
  return `${MONTHS[m]} ${d - CUM[m]}`;
}

/** Short form -> "May 15" becomes "May 15"; used in tight table cells. */
export function formatDayShort(day: number): string {
  const full = formatDay(day);
  return full.replace(
    /^(January|February|September|October|November|December|March|April|August)/,
    (m) => m.slice(0, 3)
  );
}

/** Inclusive list of month indices a day window touches, following calendar order. */
export function monthsSpanned(startDay: number, endDay: number): number[] {
  const out: number[] = [];
  let m = monthOf(startDay);
  const end = monthOf(endDay);
  for (let i = 0; i < 12; i++) {
    out.push(m);
    if (m === end) break;
    m = (m + 1) % 12;
  }
  return out;
}

export const METHOD_LABEL: Record<Method, string> = {
  indoors: 'Start indoors',
  direct: 'Direct sow outdoors',
  transplant: 'Transplant outdoors',
};

export interface WindowEntry {
  crop: Crop;
  method: Method;
  label: string;
  /** "April 16 - April 30" */
  window: string;
  startDay: number;
  endDay: number;
  /** true when this is the second, fall-season sowing */
  fall: boolean;
}

/**
 * Every planting window for a pair of frost dates: each crop action offset from
 * the last spring frost, plus a fall sowing for cool-season crops backed off the
 * first fall frost by days-to-harvest plus a two-week buffer.
 *
 * Takes raw day-of-year values rather than a Zone so the same derivation serves
 * the zone pages and a reader's own frost dates in the browser. A hardiness zone
 * is only ever a default guess at these two numbers — see zones.json.
 */
export function windowsFor(lastFrostDay: number, firstFrostDay: number): WindowEntry[] {
  const out: WindowEntry[] = [];

  for (const crop of crops) {
    for (const action of crop.actions) {
      const startDay = lastFrostDay + action.weeks[0] * 7;
      const endDay = lastFrostDay + action.weeks[1] * 7;
      out.push({
        crop,
        method: action.method,
        label: METHOD_LABEL[action.method],
        window: `${formatDay(startDay)} - ${formatDay(endDay)}`,
        startDay,
        endDay,
        fall: false,
      });
    }

    if (crop.fallSow) {
      // Back off the first frost by the slowest maturity plus a 14-day buffer.
      const endDay = firstFrostDay - (crop.daysToHarvest[1] + 14);
      const startDay = endDay - 14;
      out.push({
        crop,
        method: 'direct',
        label: 'Direct sow for a fall crop',
        window: `${formatDay(startDay)} - ${formatDay(endDay)}`,
        startDay,
        endDay,
        fall: true,
      });
    }
  }

  return out;
}

/** Convenience wrapper: a zone is just a default pair of frost dates. */
export function windowsForZone(zone: Zone): WindowEntry[] {
  return windowsFor(zone.lastFrostDay, zone.firstFrostDay);
}

/** UMD Extension: re-sow "a portion of that space every two weeks". */
export const SUCCESSION_EVERY_DAYS = cropsData.successionEveryDays as number;

/**
 * Heuristic, NOT a sourced figure. Cool-season crops bolt in summer heat, and
 * across the US peak heat falls in roughly the same calendar window regardless
 * of hardiness zone — June 15 to September 1 (days 166-244).
 *
 * Keyed to the calendar rather than to an offset from the last frost on purpose:
 * an offset flags zone 9's October sowings, which are its *best* fall window.
 * A hardiness zone carries no summer-temperature information at all, so this
 * stays a warning. Zone 3 gardeners can often ignore it; zones 9-10 should treat
 * it as starting earlier and ending later than the window given here.
 */
const HEAT_RISK_WINDOW: [number, number] = [166, 244];

export interface SuccessionPlan {
  crop: Crop;
  /** Start of the first sowing window. */
  startDay: number;
  /** Latest sowing that can still mature before the first frost. */
  lastDay: number;
  everyDays: number;
  /** Every sowing date in the run, first to last. */
  sowings: { day: number; heatRisk: boolean }[];
}

/**
 * A repeating sowing run per crop: first outdoor window through the last sowing
 * that still matures before the first frost (slowest days-to-harvest + 14-day
 * buffer), stepping every SUCCESSION_EVERY_DAYS.
 *
 * Both bounds come from the frost dates and days-to-harvest already in the
 * dataset — nothing here is invented.
 */
export function successionFor(lastFrostDay: number, firstFrostDay: number): SuccessionPlan[] {
  const out: SuccessionPlan[] = [];

  for (const crop of crops) {
    if (!crop.succession) continue;

    const first = crop.actions.find((a) => a.method === 'direct');
    if (!first) continue;

    const startDay = lastFrostDay + first.weeks[0] * 7;
    const lastDay = firstFrostDay - (crop.daysToHarvest[1] + 14);

    // A season too short for even one more sowing yields no run.
    const spanDays = lastDay - startDay;
    if (spanDays < SUCCESSION_EVERY_DAYS) continue;

    const sowings: { day: number; heatRisk: boolean }[] = [];
    for (let d = startDay; d <= lastDay; d += SUCCESSION_EVERY_DAYS) {
      // Cool-season crops sown into peak summer are the ones that bolt.
      const wrapped = ((Math.round(d) - 1) % YEAR + YEAR) % YEAR + 1;
      const heatRisk =
        crop.season === 'cool' &&
        wrapped >= HEAT_RISK_WINDOW[0] &&
        wrapped <= HEAT_RISK_WINDOW[1];
      sowings.push({ day: d, heatRisk });
    }

    out.push({ crop, startDay, lastDay, everyDays: SUCCESSION_EVERY_DAYS, sowings });
  }

  return out;
}

export interface MonthPlan {
  month: number;
  name: string;
  entries: WindowEntry[];
  /** Crops that can be re-sown this month, with the run's final sowing date. */
  resow: { crop: Crop; lastDay: number; heatRisk: boolean }[];
}

/**
 * Group planting windows by every month they touch, and mark which crops can be
 * re-sown in each month. Passing the succession runs is what stops a long-season
 * location showing empty months it can obviously plant in.
 */
export function monthsFrom(
  windows: WindowEntry[],
  succession: SuccessionPlan[] = []
): MonthPlan[] {
  const buckets: WindowEntry[][] = Array.from({ length: 12 }, () => []);

  for (const entry of windows) {
    for (const m of monthsSpanned(entry.startDay, entry.endDay)) {
      buckets[m].push(entry);
    }
  }

  // One re-sow row per crop per month, not one per sowing date.
  const resow: MonthPlan['resow'][] = Array.from({ length: 12 }, () => []);
  for (const plan of succession) {
    // Skip index 0 — that sowing is already listed as the crop's first window.
    for (const s of plan.sowings.slice(1)) {
      const m = monthOf(s.day);
      const existing = resow[m].find((r) => r.crop.slug === plan.crop.slug);
      if (existing) {
        existing.heatRisk = existing.heatRisk || s.heatRisk;
      } else {
        resow[m].push({ crop: plan.crop, lastDay: plan.lastDay, heatRisk: s.heatRisk });
      }
    }
  }

  const order: Record<Method, number> = { indoors: 0, direct: 1, transplant: 2 };
  return buckets.map((entries, month) => ({
    month,
    name: MONTHS[month],
    entries: entries.sort(
      (a, b) => order[a.method] - order[b.method] || a.crop.name.localeCompare(b.crop.name)
    ),
    resow: resow[month].sort((a, b) => a.crop.name.localeCompare(b.crop.name)),
  }));
}

export function successionForZone(zone: Zone): SuccessionPlan[] {
  return successionFor(zone.lastFrostDay, zone.firstFrostDay);
}

export function calendarForZone(zone: Zone): MonthPlan[] {
  return monthsFrom(windowsForZone(zone), successionForZone(zone));
}

/** One row per crop for a zone's summary table. */
export interface CropRow {
  crop: Crop;
  indoors: string | null;
  outdoors: string;
  fall: string | null;
  harvest: string;
}

export function cropRowsForZone(zone: Zone): CropRow[] {
  const all = windowsForZone(zone);
  return crops.map((crop) => {
    const w = all.filter((e) => e.crop.slug === crop.slug);
    const indoors = w.find((e) => e.method === 'indoors');
    const outdoors = w.find((e) => e.method === 'direct' && !e.fall) ?? w.find((e) => e.method === 'transplant');
    const fall = w.find((e) => e.fall);

    // Earliest realistic harvest: outdoor planting start + fastest maturity.
    const base = outdoors ? outdoors.startDay : zone.lastFrostDay;
    const harvestFrom = base + crop.daysToHarvest[0];
    const harvestTo = base + crop.daysToHarvest[1];

    return {
      crop,
      indoors: indoors ? indoors.window : null,
      outdoors: outdoors ? `${outdoors.label}: ${outdoors.window}` : '-',
      fall: fall ? fall.window : null,
      harvest: `${formatDay(harvestFrom)} - ${formatDay(harvestTo)}`,
    };
  });
}
