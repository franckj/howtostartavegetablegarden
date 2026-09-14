import type { APIRoute, GetStaticPaths } from 'astro';
import sharp from 'sharp';
import { zones } from '@/lib/calendar';
import { ganttSvg, ganttModel, barRects, layout, GANTT_FULL, GANTT_OG } from '@/lib/gantt';

// Build-time only: /img/planting-calendar/zone-8.png, zone-8-og.png and zone-8.json
// (the model the picture is drawn from, used by scripts/check-calendar.mjs).
export const getStaticPaths: GetStaticPaths = () =>
  zones.flatMap((zone) => [
    { params: { file: `${zone.zone}.png` }, props: { zone, kind: 'full' } },
    { params: { file: `${zone.zone}-og.png` }, props: { zone, kind: 'og' } },
    { params: { file: `${zone.zone}.json` }, props: { zone, kind: 'model' } },
  ]);

export const GET: APIRoute = async ({ props }) => {
  const { zone, kind } = props as { zone: (typeof zones)[number]; kind: 'full' | 'og' | 'model' };

  if (kind === 'model') {
    const model = ganttModel(zone);
    const rects = barRects(model, layout(GANTT_FULL.width, GANTT_FULL.height, false));
    return new Response(JSON.stringify({ ...model, image: { ...GANTT_FULL, rects } }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const svg = kind === 'og' ? ganttSvg(zone, { ...GANTT_OG, compact: true }) : ganttSvg(zone, GANTT_FULL);
  // Flat colours quantise losslessly to a small palette, which keeps each PNG well under 150 KB.
  const png = await sharp(Buffer.from(svg))
    .png({ palette: true, colours: 64, compressionLevel: 9, effort: 10 })
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
