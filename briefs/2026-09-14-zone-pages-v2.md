# BRIEF — Zone pages v2: image, sub-zones, city frost table, month anchors

Repo: `franckj/howtostartavegetablegarden` (`main`). Lives at `briefs/2026-09-14-zone-pages-v2.md`.
Read `CLAUDE.md` first — every hard rule
in it applies. Process: **read this brief → propose a plan → wait for approval → build.**
Do not start writing code before the plan is approved.

Date: 2026-09-14. Owner: Franck.

---

## Why (data, 46 days post-launch)

- 95% of Google impressions land on the 8 `/planting-calendar/zone-N/` pages (2.5K of 2.7K).
- 40 Google AI Overview impressions since Aug 7, all on zone pages, accelerating.
- 91% of ranking keywords trigger an AI Overview; 65% show an Image pack. We appear in neither.
- 39% of query impressions contain a sub-zone (5b, 8a, 9b…). We have no a/b content.
- 17 queries ask for "printable" / "pdf". Etsy sells zone planners for money.
- 74 queries are month/fall-phrased ("zone 6 fall planting schedule", "what to plant in july zone 5").

Demand data (DataForSEO, US, Sep 2026): sub-zone terms match or beat whole-zone terms —
"zone 7b planting schedule" 1,300/mo (KD 1), "zone 6b" 1,300, "zone 8b" 1,000 (KD 1),
"zone 8a" 880 — vs "zone 6" 1,300, "zone 7" 1,000, "zone 8" 880. "zone 8b planting schedule
pdf" 320/mo, "zone 9b vegetable planting schedule pdf" 260. All peak Mar–Apr at 2–3×.

SERP shape (US mobile, "zone 3 planting schedule"): AI Overview #1, Image pack #2, organic #2
is a bare PDF ranking with an image thumbnail. Related searches: "pdf", "3a", "by zip code".

Zone pages are the asset. This brief deepens them without touching any URL.

---

## Scope — four additions to every zone page (8 URLs), one pipeline

### 1. Gantt image per zone (Image pack + future PDF page 1)

- Build-time render from `zones.json` + `crops.json` via `calendar.ts` — **no data duplication**.
  If a crop window changes in the dataset, the image changes.
- One PNG per zone (`/img/planting-calendar/zone-8.png`), ~1200×900, plus a 1200×630 OG crop.
- Content: crop rows × 12 months; bars for indoors / direct sow / transplant / re-sow; frost
  markers; zone label and site domain in the footer (small, not a watermark).
- Palette from `tokens.css`. Readable at 400px wide (that's how Google Images shows it).
- Place it above the monthly table on the zone page with descriptive `alt`
  ("Zone 8 vegetable planting calendar: indoor start, direct sow and transplant windows by month
  for 12 beginner crops"). Add `ImageObject` to the page's existing schema and an image sitemap
  (or `<image:image>` entries in the existing sitemap).
- Also set it as the page's `og:image`.
- Renderer choice is yours (SVG → PNG with `sharp`/`resvg`, or canvas). Must run inside
  `npm run build` with no external service.

### 2. Sub-zone section — honest version

Google demand is for "zone 8a" / "zone 8b". Our own corrected thesis (zone ≠ frost date) says
`/zone-8a/` pages would be manufactured precision. So:

- **No new URLs.** Add one H2 to each zone page: "Zone 8a vs 8b: what the letter means"
  (id `sub-zones`). Content: a/b = 5°F split of the average annual extreme *winter* minimum;
  it tells you about perennial survival, not about frost dates; what to do instead (get your
  NOAA station frost dates, enter them in the tool). Numbers for the a/b temperature bands
  come from USDA — source them in `zones.json` if not already present.
- Extend `<title>` and H1 to name both: "Zone 8 Planting Calendar (8a & 8b): …". Keep the
  existing answer box as the first two sentences; do not break the snippet.
- Add "8a" and "8b" to the page's FAQ with a real-phrasing question each, drawn from the query
  log ("Is zone 8a or 8b better for tomatoes?" → honest answer: the letter doesn't decide that).

### 3. Representative cities frost table (the real moat)

Per zone, 5–8 US cities in that zone with **NOAA NCEI 1991–2020 normals**: last spring frost
at 50% / 30% / 10% probability, first fall frost at 50% / 30% / 10%, and the frost-free days.

- Data goes in a new `src/data/cities.json` with `source` per row (station name + NOAA URL).
  **No number without a source line.** If a value can't be sourced, leave the cell out.
- Rendered as a table (`<th scope="row">` — see the table gotcha in `CLAUDE.md`), H2 "Frost
  dates for cities in zone 8" (id `city-frost-dates`), one sentence above it making the point:
  same zone, frost dates weeks apart — this is why the tool asks for your own dates.
- Each row gets a "Use these dates" button that pre-fills the calendar island on
  `/planting-calendar/` via query params (`?last=…&first=…`). Cheap, and it turns the table into
  the tool's front door.
- Pick cities by population and geographic spread across the zone. Franck will not review the
  list; the sourcing rule is the review.

### 4. Month anchors + month FAQs

- Every monthly H2/H3 in the zone page gets a stable id (`#july`), so month-phrased queries have
  a landing target. Add a compact month nav under the gantt image.
- Add two month-phrased FAQ entries per zone, phrased like the query log:
  "What can I plant in July in zone 5?" / "When does fall planting start in zone 5?" —
  answers generated from the dataset (list the crops the model says are sowable that month),
  not hand-written.
- Add one FAQ entry "Is there a printable PDF of the zone 5 planting calendar?" answering
  honestly for now (the on-page chart and table print cleanly; a downloadable version is
  coming). Add a `@media print` stylesheet so that sentence is true. Swap the answer for the
  real download when the PDF brief ships.

### Untouched, deliberately

- No URL changes, no new routes. Hard rule.
- Glossary, resources, and the three spoke guides are **control pages** — do not edit them in
  this brief, even for small fixes. They're the baseline for measuring this update.
- No PDF, no email form, no privacy-policy change here. That's the next brief. Design note
  for it: **Google dropped most PDFs from its index in August 2026** (Amsive / SERoundtable,
  widely confirmed), so the PDF is not a ranking asset. The 320/mo "…schedule pdf" queries are
  captured by the **HTML zone page**: add "printable" to the title tail, an FAQ entry
  ("Is there a printable PDF of this calendar?"), and a download CTA. The PDF itself is the
  email trade (gated, `X-Robots-Tag: noindex`); the gantt PNG on the page does the Image-pack
  job. Correction logged 2026-09-14 — an earlier draft of this note recommended an indexable
  PDF on the strength of one SERP observation.
- Zip-code lookup ("planting schedule by zip code", 480/mo, CPC $7) is a future tool feature:
  zip → nearest NOAA station → frost dates pre-filled. Not this brief; noted so it isn't lost.

---

## Acceptance (verify before reporting done)

- [ ] 8 zone pages render image, sub-zone section, city table, month anchors, new FAQs.
- [ ] **Tool-vs-static cross-check passes for all 96 zone-months** (already exists; re-run).
      Add a second check: every bar in each PNG matches the static page's monthly rows.
- [ ] Every number in `cities.json` has a `source`. Build fails if one is missing.
- [ ] FAQPage schema validates with the new entries; `ImageObject` present; sitemap carries
      image entries; `llms.txt` regenerated and lists the new sections.
- [ ] Lighthouse: the launch 100s are a stale baseline now that the AdSense tag is live (see
      `CLAUDE.md`). Measure one zone page on production **before and after** this change, same
      device profile, and report both — the update must not worsen LCP or CLS. Image
      lazy-loaded, PNG under 150 KB.
- [ ] No horizontal overflow at 320 / 375 / 768 px with the new table (it's wide — test it).
- [ ] Poll the live site after deploy for a signal unique to the new build (e.g. the
      `#sub-zones` id) and require several consecutive clean samples (edge serves old/new for
      ~1 min).
- [ ] `node scripts/indexnow.mjs` after deploy.
- [ ] `CLAUDE.md` updated: new data file, new sections, the image pipeline, and the control-page
      rule.

Report what the numbers actually said, including variance.

---

## Pre-registered predictions (Franck: paste this into the calibration log at deploy)

Deploy date: `____`. Checks at **+14 days** and **+42 days**. Compare against the 46-day
baseline (GSC Web, last 3 months, US only where possible).

| # | Metric | Baseline (Sep 14) | Predict at +42d | Kill / rethink if |
|---|---|---|---|---|
| P1 | GSC **Image** search type, impressions on zone pages | 0 | > 0 by +14d; ≥ 100 by +42d | still 0 at +42d → image not indexed; check image sitemap / robots |
| P2 | Share of query impressions containing a sub-zone (a/b) | 39% (476 / 1,233) | volume ≥ +50%, avg position on a/b queries improves ≥ 10 places | flat at +42d → on-page sections don't capture a/b demand; next brief = dedicated `/zone-7b/`-style pages built around distinct city frost tables (KD 1, 1,300/mo justifies it) |
| P3 | GSC "AI features" impressions per day | ~2.5/day (Sept) | ≥ 5/day | < 2/day → AIO presence was not driven by page depth |
| P4 | Impressions on month-phrased queries | 113 | ≥ 250 | flat → anchors don't get their own landing |
| P5 | Zone-page average position, **US mobile** | ~16 | ≤ 12 | worsens > 3 places → sub-zone title change diluted relevance; revert titles |
| C1 | **Control**: glossary + raised-beds impressions | 40 + 52 | if these rise as much as zone pages → attribute the gain to domain age, not this update | — |
| P6 | Plausible: entries on zone pages from `google.com` | ~7 total | ≥ 3/week | — |

Rules: GSC and Bing Webmaster are the source of truth; Semrush/Ahrefs are directional only.
A miss is logged as a miss.

---

## Two things only Franck can do (not Claude Code)

1. **Bing zero-click check.** Search "how to start a vegetable garden" on bing.com (US region)
   and screenshot the listing. 1,007 impressions at position 6.2 with 0 clicks is abnormal —
   likely the title renders as the bare domain, or Copilot's answer sits above and absorbs
   clicks. Paste the screenshot to the project.
2. **Ahrefs backlinks.** 324 "all time" backlinks on a domain registered July 29. Open
   the referring-domains list; if it's spam from a previous owner, note it and move on. If
   there are real links, note them — that's the pre-launch history we didn't know about.
