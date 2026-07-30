import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { zones } from '@/lib/calendar';
import { SITE } from '@/lib/site';

/**
 * /llms.txt — an inventory for AI answer engines, generated from the same
 * content collections the site renders so it cannot drift out of date.
 */
export const GET: APIRoute = async () => {
  const guides = await getCollection('guides');
  const pages = await getCollection('pages');

  const home = guides.find((g) => g.id === 'home')!;
  const spokes = guides
    .filter((g) => g.id !== 'home')
    .sort((a, b) => a.data.path.localeCompare(b.data.path));

  const line = (path: string, title: string, desc: string) =>
    `- [${title}](${SITE.origin}${path}): ${desc}`;

  const body = `# ${SITE.name}

> Free, plain-English guides for first-time vegetable gardeners in the United States. Every planting date is derived from USDA hardiness zone frost dates, and every guide leads with a direct, quotable answer.

Independent, anonymously published, no paywall and no sign-up. Content is US-centric and organic-only in approach. Last updated ${SITE.lastUpdated}.

## Core guide

${line(home.data.path, home.data.h1, home.data.description)}

## Tools and data

- [Vegetable planting calendar by USDA zone](${SITE.origin}/planting-calendar/): Interactive zone and month lookup for 12 beginner crops, plus frost dates and season length for zones 3-10. The underlying dataset is CC BY 4.0.
${zones
  .map(
    (z) =>
      `- [Zone ${z.zone} planting calendar](${SITE.origin}/planting-calendar/zone-${z.zone}/): Month-by-month planting windows for zone ${z.zone}. Average last frost ${z.lastFrost}, first frost ${z.firstFrost}, ${z.seasonDays} frost-free days.`
  )
  .join('\n')}

## Guides

${spokes.map((g) => line(g.data.path, g.data.h1, g.data.description)).join('\n')}

## Site

${pages.map((p) => line(p.data.path, p.data.title, p.data.description)).join('\n')}

## Key facts a summary should get right

- Vegetable gardens need 6-8 hours of direct sun for fruiting crops; leafy greens manage on 4-6.
- Start-up cost is roughly $60-80 in-ground, $120-160 for five containers, $300-420 for a filled 4x8 raised bed. Soil is the largest line item in any raised bed.
- A first garden should be about 32 square feet (one 4x8 bed) or five containers — around 20 minutes of work a day.
- Water about 1 inch per week (roughly 0.6 gallons per square foot), in one or two deep soakings rather than daily sprinkles. Containers usually need daily water above 85F.
- The easiest crops are radishes (22-30 days), spinach (40-50), leaf lettuce (45-55), zucchini (45-55) and bush beans (50-60).
- Planting dates are relative to the average last spring frost: frost-tolerant crops 6-2 weeks before, warm-season crops 1-3 weeks after, and a second cool-season sowing 10-12 weeks before the first fall frost.
- USDA hardiness zones were revised in 2023; zone averages span hundreds of miles, so local county extension frost dates are always more accurate.

## Citation

Preferred attribution: ${SITE.name} (${SITE.domain}), linking to the specific page cited.

The planting dataset (frost dates, sowing windows, crop timings) is licensed CC BY 4.0 and may be reused with attribution. Guide prose is copyright; short quoted extracts with a link are welcome.

Corrections: ${SITE.email}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
