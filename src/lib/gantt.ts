import {
  crops, windowsForZone, successionForZone, formatDay, MONTHS, type Zone,
} from '@/lib/calendar';
import { SITE } from '@/lib/site';

/**
 * The zone chart image (Google Images / og:image) is drawn from this model, and
 * scripts/check-calendar.mjs checks the model against the static zone page. So
 * the picture, the page and the tool all come from calendar.ts — never edit the
 * bars by hand.
 */
export type BarKind = 'indoors' | 'direct' | 'transplant' | 'fall' | 'resow';

export interface Bar {
  kind: BarKind;
  /** Day-of-year, may run past 365 or below 1; split() wraps it for drawing. */
  startDay: number;
  endDay: number;
}

export interface GanttRow {
  slug: string;
  name: string;
  bars: Bar[];
}

export interface GanttModel {
  zone: number;
  lastFrostDay: number;
  firstFrostDay: number;
  rows: GanttRow[];
}

export function ganttModel(zone: Zone): GanttModel {
  const windows = windowsForZone(zone);
  const runs = successionForZone(zone);

  const rows = crops.map((crop) => {
    const bars: Bar[] = windows
      .filter((w) => w.crop.slug === crop.slug)
      .map((w) => ({
        kind: w.fall ? 'fall' : w.method,
        startDay: w.startDay,
        endDay: w.endDay,
      }));

    // Re-sow band: the repeat sowings after the first one, which the first
    // window already covers. Matches MonthPlan.resow, which skips sowings[0].
    const run = runs.find((r) => r.crop.slug === crop.slug);
    if (run && run.sowings.length > 1) {
      bars.push({ kind: 'resow', startDay: run.sowings[1].day, endDay: run.sowings.at(-1)!.day });
    }
    return { slug: crop.slug, name: crop.name, bars };
  });

  return { zone: zone.zone, lastFrostDay: zone.lastFrostDay, firstFrostDay: zone.firstFrostDay, rows };
}

/** Palette from tokens.css. Indoors is hollow so it reads apart from the solid outdoor bars. */
export const BAR_STYLE: Record<BarKind, { fill: string; stroke?: string; label: string }> = {
  indoors: { fill: '#eae3d5', stroke: '#7a5330', label: 'Start indoors' },
  direct: { fill: '#2f6b3f', label: 'Sow outdoors' },
  transplant: { fill: '#8a6520', label: 'Transplant' },
  fall: { fill: '#99502c', label: 'Sow for fall' },
  resow: { fill: '#c3d9bd', label: 'Re-sow every 2 weeks' },
};

const CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

/** Split a day window into drawable [start, end] pieces inside 1..365. */
export function split(startDay: number, endDay: number): [number, number][] {
  const s = Math.round(startDay);
  const e = Math.round(endDay);
  const norm = (d: number) => ((d - 1) % 365 + 365) % 365 + 1;
  const ns = norm(s);
  const ne = ns + (e - s);
  if (ne <= 365) return [[ns, ne]];
  return [[ns, 365], [1, ne - 365]];
}

export interface Layout {
  width: number;
  height: number;
  labelW: number;
  gridX: number;
  gridW: number;
  top: number;
  rowH: number;
  /** x centre of a day-of-year. */
  x: (day: number) => number;
  /** main-lane bar geometry for row i */
  lane: (i: number) => { y: number; h: number };
  /** thin re-sow lane for row i */
  resowLane: (i: number) => { y: number; h: number };
}

export function layout(width: number, height: number, compact: boolean): Layout {
  const labelW = compact ? 250 : 280;
  const gridX = labelW;
  const right = 36;
  const gridW = width - gridX - right;
  const top = compact ? 150 : 214;
  const bottom = compact ? 58 : 132;
  const rowH = (height - top - bottom) / crops.length;
  const x = (day: number) => gridX + ((day - 1) / 365) * gridW;
  const barH = Math.round(rowH * 0.5);
  const resowH = Math.max(6, Math.round(rowH * 0.16));
  return {
    width, height, labelW, gridX, gridW, top, rowH, x,
    lane: (i) => ({ y: Math.round(top + i * rowH + rowH * 0.14), h: barH }),
    resowLane: (i) => ({ y: Math.round(top + i * rowH + rowH * 0.14 + barH + rowH * 0.1), h: resowH }),
  };
}

export interface BarRect {
  slug: string;
  kind: BarKind;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
}

/** Where each bar lands in the picture. Exported so the check can sample the PNG's pixels. */
export function barRects(m: GanttModel, L: Layout): BarRect[] {
  const out: BarRect[] = [];
  m.rows.forEach((row, i) => {
    for (const bar of row.bars) {
      const g = bar.kind === 'resow' ? L.resowLane(i) : L.lane(i);
      for (const [s, e] of split(bar.startDay, bar.endDay)) {
        const w = Math.max(6, L.x(e + 1) - L.x(s));
        // Keep short bars at the year's edges inside the grid.
        const x = Math.min(L.x(s), L.gridX + L.gridW - w);
        out.push({ slug: row.slug, kind: bar.kind, x, y: g.y, w, h: g.h, fill: BAR_STYLE[bar.kind].fill });
      }
    }
  });
  return out;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const FONT = "Arimo, 'Liberation Sans', Arial, 'DejaVu Sans', sans-serif";

export function ganttSvg(zone: Zone, opts: { width: number; height: number; compact?: boolean }): string {
  const compact = !!opts.compact;
  const m = ganttModel(zone);
  const L = layout(opts.width, opts.height, compact);
  const gridBottom = L.top + L.rowH * m.rows.length;
  const parts: string[] = [];

  parts.push(`<rect width="${L.width}" height="${L.height}" fill="#ffffff"/>`);

  // Title
  const titleSize = compact ? 44 : 46;
  parts.push(
    `<text x="36" y="${compact ? 62 : 66}" font-family="${FONT}" font-size="${titleSize}" font-weight="700" fill="#1f2a20">Zone ${m.zone} vegetable planting calendar</text>`,
    `<text x="36" y="${compact ? 104 : 112}" font-family="${FONT}" font-size="${compact ? 26 : 28}" fill="#3c4a3d">Average last frost ${esc(formatDay(m.lastFrostDay))} · first frost ${esc(formatDay(m.firstFrostDay))}</text>`
  );

  // Month columns and labels
  for (let i = 0; i < 12; i++) {
    const x0 = L.x(CUM[i] + 1);
    const x1 = L.x(CUM[i + 1] + 1);
    if (i % 2 === 1) {
      parts.push(`<rect x="${x0.toFixed(1)}" y="${L.top}" width="${(x1 - x0).toFixed(1)}" height="${(gridBottom - L.top).toFixed(1)}" fill="#f3eee4"/>`);
    }
    parts.push(
      `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${L.top - 14}" text-anchor="middle" font-family="${FONT}" font-size="${compact ? 22 : 26}" font-weight="700" fill="#3c4a3d">${MONTHS[i].slice(0, 3)}</text>`
    );
  }

  // Crop rows
  m.rows.forEach((row, i) => {
    const yMid = L.top + i * L.rowH + L.rowH / 2;
    parts.push(
      `<line x1="36" x2="${L.width - 36}" y1="${(L.top + (i + 1) * L.rowH).toFixed(1)}" y2="${(L.top + (i + 1) * L.rowH).toFixed(1)}" stroke="#e3dccc" stroke-width="1"/>`,
      `<text x="36" y="${(yMid + (compact ? 7 : 10)).toFixed(1)}" font-family="${FONT}" font-size="${compact ? 21 : 28}" font-weight="700" fill="#1f2a20">${esc(row.name)}</text>`
    );
  });
  for (const r of barRects(m, L)) {
    const style = BAR_STYLE[r.kind];
    const stroke = style.stroke ? ` stroke="${style.stroke}" stroke-width="3"` : '';
    parts.push(
      `<rect x="${r.x.toFixed(1)}" y="${r.y}" width="${r.w.toFixed(1)}" height="${r.h}" rx="4" fill="${style.fill}"${stroke}/>`
    );
  }

  // Frost markers
  for (const [day, label] of [[m.lastFrostDay, 'last frost'], [m.firstFrostDay, 'first frost']] as const) {
    const x = L.x(day).toFixed(1);
    parts.push(
      `<line x1="${x}" x2="${x}" y1="${L.top - 4}" y2="${gridBottom.toFixed(1)}" stroke="#1f2a20" stroke-width="2.5" stroke-dasharray="8 6"/>`
    );
    if (!compact) {
      parts.push(
        `<text x="${x}" y="${(gridBottom + 30).toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="700" fill="#1f2a20">${label}</text>`
      );
    }
  }

  // Legend (full image only)
  if (!compact) {
    let lx = 36;
    const ly = gridBottom + 62;
    for (const kind of ['indoors', 'direct', 'transplant', 'fall', 'resow'] as BarKind[]) {
      const st = BAR_STYLE[kind];
      const stroke = st.stroke ? ` stroke="${st.stroke}" stroke-width="3"` : '';
      parts.push(
        `<rect x="${lx}" y="${ly}" width="30" height="22" rx="4" fill="${st.fill}"${stroke}/>`,
        `<text x="${lx + 40}" y="${ly + 19}" font-family="${FONT}" font-size="22" fill="#1f2a20">${st.label}</text>`
      );
      lx += 40 + st.label.length * 11.5 + 30;
    }
  }

  // Footer
  parts.push(
    `<text x="${L.width - 36}" y="${L.height - (compact ? 20 : 22)}" text-anchor="end" font-family="${FONT}" font-size="${compact ? 20 : 22}" fill="#5f6b5e">Zone ${m.zone} · ${SITE.domain}</text>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L.width}" height="${L.height}" viewBox="0 0 ${L.width} ${L.height}">${parts.join('')}</svg>`;
}

/** Image dimensions, shared by the endpoint, the <img> tag and ImageObject schema. */
export const GANTT_FULL = { width: 1200, height: 900 } as const;
export const GANTT_OG = { width: 1200, height: 630 } as const;

export const ganttPath = (zone: number) => `/img/planting-calendar/zone-${zone}.png`;
export const ganttOgPath = (zone: number) => `/img/planting-calendar/zone-${zone}-og.png`;
export const ganttModelPath = (zone: number) => `/img/planting-calendar/zone-${zone}.json`;
