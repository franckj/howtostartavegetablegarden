# PLAN — Zone pages v2

Answers `briefs/2026-09-14-zone-pages-v2.md`. Status: **deployed 2026-09-14.** Results in `PROJECT-STATUS.md`.

---

## What I found reading the code (changes the brief's assumptions)

1. **The tool-vs-static cross-check is not in the repo.** The brief says "already exists; re-run".
   CLAUDE.md describes it, but no script was ever committed. I will write it and commit it this
   time: `scripts/check-calendar.mjs`.
2. **Month anchors half-exist.** Every *active* month already has `<h3 id="july">`. Idle months
   (zone 3 has 6) have no anchor, so "what to plant in december zone 3" has no landing target.
   Fix: every month gets an anchor, idle ones included.
3. **NOAA has the numbers the brief wants.** I checked the 1991–2020 annual normals file for
   Chicago O'Hare: the 32°F last-spring and first-fall dates exist at 10/20/…/90% probability, plus
   growing-season length. The 50/30/10 columns are all sourceable, per station, as CSV.
4. **`llms.txt` contradicts the site's core rule.** Line 24 says "Every planting date is derived
   from USDA hardiness zone frost dates." That is the claim fact-check pass 1 removed everywhere
   else. It gets fixed here, because the brief requires regenerating `llms.txt` anyway.
5. **`dateModified` is hardcoded to `2026-07-31`** on all 8 zone pages. It gets bumped to the
   deploy date.

---

## Build order

### Step 0 — Baseline before touching anything
- Lighthouse on production `/planting-calendar/zone-8/`, mobile profile, **5 runs**, median plus
  range. Record LCP, CLS, TBT and the score. AdSense makes single runs noisy, which is why it's 5.
- Write and run `scripts/check-calendar.mjs` against the **current** site, so the check is proven
  on known-good output before it guards new output.

### Step 1 — Data: `src/data/cities.json` plus a fetch script
- `scripts/fetch-noaa.mjs` downloads each station's NCEI 1991–2020 normals CSV and writes the
  values. **No hand-typed frost numbers.** Every row carries `station` (name and GHCN id),
  `source` (the exact CSV URL) and a `zoneSource`.
- **City zone assignment gets a source too.** "Denver is zone 6b" is a number and needs a line.
  The source is the USDA 2023 PHZM ZIP lookup (PRISM, Oregon State).
- 6 cities per zone, airport stations (`USW…`), chosen by population and spread.
- **Known gaps, flagged now:**
  - **Zone 3:** the 2023 map left very few sizable lower-48 cities in zone 3. I expect 3–5 rows,
    not 5–8, rather than padding with towns nobody searches.
  - **Zone 10:** many stations rarely freeze, so NOAA flags the 30% and 10% dates as not
    computable. Those cells render "freezes in fewer than X% of years" from the flag, which keeps
    them sourced, or are left out.
- **Build fails** if any rendered number lacks a `source` (an assertion in the loader).
- `zones.json` gets the a/b 5°F bands with the USDA source line.

### Step 2 — Gantt PNG, rendered inside `astro build`
- An Astro endpoint `src/pages/img/planting-calendar/zone-[zone].png.ts` builds an SVG from
  `calendar.ts` and converts it with `sharp`. It runs in `npm run build`, with no separate script
  and no external service.
- One pure function, `ganttModel(zone)`, produces the bars. The SVG draws from it and the check
  tests against it.
- It also outputs a 1200×630 OG crop per zone. `BaseLayout` gets an optional `ogImage` prop, and
  the other 12 pages keep the site-wide image.
- `sharp` gets added to `package.json` explicitly. Today it's only present as a dependency of
  Astro, which is fragile.
- Crop names at 22px or larger so the image reads at 400px wide. Target under 150 KB, with
  palette quantisation if needed.
- Placed above the month tables with `loading="lazy"`, explicit width and height (so no CLS) and
  the brief's alt text.

### Step 3 — Zone page template (`zone-[zone].astro`)
- **Title and H1:** "Zone 8 Planting Calendar (8a & 8b): Printable, by Month", 56 characters.
  **Approved by Franck 2026-09-14.** It drops "What to Plant Each Month", which would push the
  title to ~75 characters and get it truncated.
- The answer box stays unchanged, keeping the first two sentences.
- **New H2 `#sub-zones`:** a/b is a 5°F split in winter lows. It says nothing about frost dates,
  so use your station's dates in the tool.
- **New H2 `#city-frost-dates`:** the lead sentence, then a table with `<th scope="row">`.
  - It will be wide (8 columns), so on narrow screens I collapse it to city, last frost 50% and
    first frost 50%, with the 30%/10% columns behind a "show all probabilities" toggle. That
    beats a sideways-scrolling table on a 320px phone.
  - Each row gets a "Use these dates" link to `/planting-calendar/?last=MM-DD&first=MM-DD`. It's a
    plain link, not a JS button.
- **Month nav** under the image with 12 anchors. Idle months get an anchor on a one-line stub
  ("Nothing to sow outdoors in December in zone 3").
- **FAQ, +5 entries**, for 10 per page:
  - Two a/b questions, e.g. "Is zone 8a or 8b better for tomatoes?"
  - "What can I plant in July in zone N?", with the crop list generated from `calendarForZone`.
  - "When does fall planting start in zone N?", generated from the earliest fall window.
  - "Is there a printable PDF of the zone N planting calendar?", with an honest answer.
  - July is fixed rather than "this month" because static pages would go stale.
- **Schema:** `ImageObject` on the page. `FAQPage` picks up the new entries automatically.

### Step 4 — Calendar tool accepts `?last=&first=`
- In `CalendarTool.astro`, query params override `localStorage` and the zone defaults and open
  the "own frost dates" panel. Malformed params are ignored.
- The hub page is not a control page, so this is in bounds.

### Step 5 — Print stylesheet
- `@media print` hides header, footer, nav, ads, FAQ and next-steps, and keeps the image, month
  tables and city table. Tables don't split rows across pages. This makes the FAQ's "prints
  cleanly" true.

### Step 6 — Sitemap and `llms.txt`
- The sitemap `serialize` hook adds `img` entries for the 8 zone URLs.
- `llms.txt`: fix the zone/frost claim and list the new sections and the city dataset.

### Step 7 — Verify (the brief's acceptance list)
- `check-calendar.mjs`, run with Playwright against `astro preview`:
  - **96 zone-months:** the tool's output matches the zone page table for every zone and month.
  - **Gantt:** every bar in `ganttModel` matches a row on the static page. On top of that, a pixel
    sample of each PNG at each bar's midpoint confirms it was actually drawn in the right colour.
    Full pixel-diffing is overkill.
  - **Query params:** `?last=&first=` round-trips into the tool.
- **Sourcing:** the build fails on an unsourced number. I'll prove it by deleting one `source`
  and confirming the build breaks.
- **Schema:** schema.org validator on 2 zone pages, plus the Rich Results Test for FAQPage.
- **Overflow:** Playwright checks for no horizontal overflow at 320, 375 and 768px on all 8 zone
  pages.
- **Control pages:** `git diff --stat` must show zero changes to glossary, resources and the 3
  spokes.
- **Deploy:** poll production for `id="sub-zones"` until 5 consecutive clean samples, then
  IndexNow.
- **Lighthouse after:** 5 runs, same profile, reported next to Step 0 with the ranges. A worse
  median LCP or CLS than baseline blocks "done".
- **CLAUDE.md:** update with `cities.json`, the image pipeline, the check script and the
  control-page rule.

---

## Not doing (per brief)
No new URLs, no PDF, no email form, no privacy-policy change, no zip lookup, and no edits to the
glossary, resources or the 3 spokes.

## Size
Roughly one long session. The NOAA fetch and city selection is the least predictable part, around
50 station lookups. Everything else is mechanical on top of `calendar.ts`.

## Decisions
1. **Title:** approved 2026-09-14, the shorter version above.
2. **Zone 3 with 3–5 cities** instead of 5–8: approved 2026-09-14.
