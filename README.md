# howtostartavegetablegarden.com

Astro static site on Cloudflare Pages. Evergreen beginner-gardening resource for the US
market, built so the homepage *is* the answer to the domain's question.

Live: https://howtostartavegetablegarden.com

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/
npm run preview    # serve dist/ locally
```

Node 20+. The build fails loudly on content errors (see "Build-time guardrails" below), so a
green build means the structured data is intact.

## What is deployed (v1)

18 routes:

| Route | Source | Schema |
|---|---|---|
| `/` | `src/content/guides/home.mdx` | HowTo + FAQPage |
| `/planting-calendar/` | `src/pages/planting-calendar/index.astro` | Dataset + FAQPage |
| `/planting-calendar/zone-3/` … `zone-10/` | `src/pages/planting-calendar/zone-[zone].astro` | Dataset + FAQPage + BreadcrumbList |
| `/easiest-vegetables-for-beginners/` | `src/content/guides/*.mdx` | FAQPage + BreadcrumbList |
| `/raised-beds-vs-containers-vs-in-ground/` | `src/content/guides/*.mdx` | FAQPage + BreadcrumbList |
| `/starting-seeds-indoors/` | `src/content/guides/*.mdx` | FAQPage + BreadcrumbList |
| `/about/`, `/contact/`, `/privacy-policy/`, `/terms-of-service/` | `src/content/pages/*.md` | BreadcrumbList |
| `/404.html` | `src/pages/404.astro` | — |
| `/llms.txt` | `src/pages/llms.txt.ts` (generated) | — |

`WebSite` + `Organization` + `WebPage` are emitted sitewide from `BaseLayout.astro`.

Deferred from the full plan (7 spokes): soil preparation, cheap gardening supplies,
small-space gardening, watering, beginner mistakes, garden pests, community gardens. Add them
as new files in `src/content/guides/` — see below. **Nothing links to them yet**, so adding a
file is all that is needed.

## Architecture

```
src/
  data/zones.json          USDA zones 3-10: frost dates, season length, regions
  data/crops.json          12 crops: sowing offsets in weeks from last frost, depth,
                           spacing, soil temp, days to harvest, difficulty
  lib/calendar.ts          derives every planting window from those two files
  lib/site.ts              site constants, nav, footer, FAQ/breadcrumb schema helpers
  lib/rehype-table-wrap.mjs  wraps markdown tables so they scroll instead of the page
  content/guides/*.mdx     guide prose + structured frontmatter
  content/pages/*.md       about, contact, legal
  content.config.ts        collection schemas (Zod) — the contract for a new page
  components/              AnswerBox, Toc, Faq, NextSteps, Breadcrumbs, CalendarTool,
                           and three tables generated from crops.json
  layouts/BaseLayout.astro meta, OG, JSON-LD @graph, header, footer, Plausible
```

**All planting dates derive from `zones.json` + `crops.json`.** Nothing is hardcoded in a
page. Change a crop's timing offset and the calendar tool, all 8 zone pages, the spacing
table and the seed-starting table all follow.

The calendar is the only JavaScript on the site — one vanilla island, no framework. Data is
embedded as a JSON script tag and the zone choice persists in `localStorage`.

## Adding or replacing a page

Prose lives in content collections precisely so an upgraded draft can replace a page without
touching a component.

**To replace a page's content:** overwrite the `.mdx` body. Keep the frontmatter keys.

**To add a new guide:**

1. Create `src/content/guides/<slug>.mdx`. Required frontmatter (enforced by
   `src/content.config.ts`, so the build tells you what is missing):

   ```yaml
   ---
   title: "≤70 chars, for <title>"
   description: "≤160 chars"
   h1: "Question-form H1"
   crumb: "Short breadcrumb label"
   path: "/<slug>/"          # trailing slash required
   eyebrow: "Crop guide"     # optional
   dateModified: "2026-07-30"
   answer:                   # snippet-ready direct answer, 1-2 paragraphs
     - "First paragraph."
   faqs:                     # minimum 4 — becomes FAQPage schema
     - q: "Question?"
       a: "Answer. HTML entities allowed."
   related:                  # slugs of sibling guides
     - easiest-vegetables-for-beginners
   ---
   ```

2. Write the body starting at an `##` heading. The table of contents, the FAQ block and the
   breadcrumbs are all generated — do not hand-write them.
3. Add it to `GUIDE_LINKS` in `src/lib/site.ts` so it appears in the footer and in
   "next steps" cards.
4. `npm run build`. The route, sitemap entry and `llms.txt` entry appear automatically.

To embed a data-driven table, import a component at the top of the body (after the
frontmatter) — see `home.mdx` for the pattern. Markdown tables are fine too; they get a scroll
wrapper automatically.

## Build-time guardrails

- **Collection schemas** (Zod) reject a page with a missing/oversized title, a malformed path,
  fewer than 4 FAQs or a bad date.
- **`index.astro` asserts every HowTo step anchor matches a rendered H2.** Rename a homepage
  heading without updating `howTo.steps[].anchor` and the build fails rather than shipping
  schema that points at nothing.

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name howtostartavegetablegarden --branch main
```

Uses wrangler OAuth (`npx wrangler login`) — no API token needed for deploying. Project name
is `howtostartavegetablegarden`; production branch `main`.

Custom domain and DNS are already attached (apex + www CNAME to the Pages project, proxied).

### After a content change that matters

```bash
node scripts/indexnow.mjs        # ping Bing/Yandex with changed URLs
```

`scripts/og-gen.mjs` regenerates `public/og-image.png` from the palette if the headline
changes.

## SEO conventions

- Trailing slashes everywhere (`trailingSlash: 'always'`), canonical always the apex URL.
- Every page: unique title + description, one H1, canonical, OG + Twitter card, JSON-LD.
- Each guide opens with a visually distinct answer box — the snippet/AI-citation target.
- `robots.txt` explicitly allows GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot,
  Google-Extended, CCBot and friends.
- `llms.txt` is generated from the collections, so it never drifts from the site.
- The planting dataset is published CC BY 4.0 — stated in `llms.txt`, the terms page and the
  Dataset schema, to make it citable.

## Content accuracy

The v1 numbers are conservative, consistent and internally single-sourced, but they have **not
been checked line-by-line against extension-service publications**. The planting calendar
carries the most risk, since offset-from-frost-date logic cannot know whether your ground has
thawed — zones 3-5 get an explicit soil-workability caveat for that reason.

The upgrade cycle (research → draft → edit against a fact base) is in
`htsavg-execution-kit.md`, Part 2. Homepage and planting calendar first.
