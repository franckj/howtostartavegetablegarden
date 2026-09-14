# CLAUDE.md — howtostartavegetablegarden.com

Astro static site on Cloudflare Pages. Evergreen beginner-gardening resource, US market,
built so the homepage answers the question in the domain. Anonymous site, no author personas.

**Update this file after every completed task on this project** — deploys, new pages, data
changes, schema changes. It is the source of truth.

**Doc layout:** `CLAUDE.md` = technical truth · `PROJECT-STATUS.md` = mutable operating state
(status, calibration log, ideas queue — the analyst project reads and writes it via a scoped
PAT) · `PROJECT-BRIEF.md` = strategy context · project knowledge holds stable operator
instructions only.

## Briefs

Build briefs from the analyst project live in `briefs/` (dated). Read the newest one before
starting work; it names the acceptance checks and the control pages that must not be edited.

## Status

- **Live:** https://howtostartavegetablegarden.com (apex + www)
- **Pages URL:** https://howtostartavegetablegarden.pages.dev
- **Repo:** git@github.com:franckj/howtostartavegetablegarden.git (branch `main`, SSH)
- **v1 shipped:** 2026-07-30 — 18 routes
- **Fact-check pass 1:** 2026-07-31 — calendar dataset corrected against extension sources
- **Succession sowing:** 2026-07-31 — repeating sowing runs; fixed the empty-month defect
- Domain registered 2026-07-29 at Spaceship, zone `503472023b8afc3b3d7470e0db12a766` in the
  Cloudflare **Templatery** account (`caaea080dc96ef6541c3f5091718fe1e`)

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name howtostartavegetablegarden --branch main
```

Wrangler OAuth only — **never ask Franck for a `CLOUDFLARE_API_TOKEN` to deploy.** A
DNS-scoped token is only needed for DNS record changes (OAuth has no DNS permission).

**`git push` deploys.** `.githooks/pre-push` builds and deploys before the push completes, so
the live site cannot silently lag the repo. A failed build or failed deploy aborts the push.
Non-main pushes build only. Escape hatches: `SKIP_DEPLOY=1 git push`, `git push --no-verify`,
and `npm run deploy` to deploy without pushing.

Enabled via `core.hooksPath = .githooks` so the hook is versioned; `npm install` sets it
through `postinstall`.

This exists because Pages here is a **direct-upload** project — pushing to GitHub does not
deploy on its own. Cloudflare's own Git integration would be the better fix but needs a
dashboard OAuth flow to install the Cloudflare GitHub App (no project on the account uses it,
and there is no CLI). If that ever gets connected, delete the hook — do not run both, or every
push will deploy twice.

After a meaningful content change: `node scripts/indexnow.mjs` (key file already deployed).

## Header, footer and nav

- Header: logo left, site title as two stacked spans (`.brand__name`), nav links + green CTA
  right. **Below 780px `.nav` is `display: none`** — mobile is logo + button only, by request.
  Adding a nav item means editing `NAV` in `src/lib/site.ts`; it will not show on mobile.
- `NAV_CTA` is the green button, always visible.
- Footer sits on `--leaf-dark` and has its own on-dark token ramp (`--footer-*`) in
  `tokens.css`. Do not reuse the light-theme text colours there.
- **Footer prose links must stay underlined** (`.site-footer p a`). Colour alone fails WCAG
  1.4.1 and Lighthouse catches it as `link-in-text-block`. Footer list links are standalone and
  stay undecorated.

## Ads and affiliate links

**Google AdSense is live** (publisher `ca-pub-3174922327325961`, added 2026-09-12). The tag is
`SITE.adsensePublisherId` in `src/lib/site.ts` and renders from `BaseLayout.astro` — set that
string to `''` to pull the tag sitewide. Two deliberate details:

- **`is:inline` is required**, same reason as Plausible: Astro would otherwise bundle it as a
  module and Google's review crawler would not find the tag it looks for.
- **Not emitted on `noindex` pages** (the 404), so only the 19 indexable routes carry it.

**`public/ads.txt`** (added 2026-09-14) authorises the publisher ID:
`google.com, pub-3174922327325961, DIRECT, f08c47fec0942fa0`. It 404'd for the first two days of
AdSense review. If the publisher ID ever changes, change it here too.

`src/content/pages/privacy-policy.md` was updated in the same commit: it now names Google,
describes the cookies, links Google's ad policies and the opt-outs, and the old "no cookies"
claim is narrowed to "no cookies of our own". **The cookie-free claim is gone — do not
reintroduce it.**

**Placement is Auto ads** (dashboard setting, not code). Google injects placements through the
tag already in `BaseLayout.astro`; there are no `<ins class="adsbygoogle">` units in the repo and
none are needed. If you ever want manual control, that is when units get added to the templates.

**Consent: Google's own CMP is enabled** (AdSense -> Privacy & messaging -> GDPR message,
2026-09-12), which satisfies Google's EU user consent policy for EEA/UK/Swiss traffic and makes
good on the consent prompt the privacy policy promises those readers. It loads dynamically from
`adsbygoogle.js`, so it does **not** appear in the served HTML — curl/grep cannot verify it and
its absence there is not a fault. Check it in the AdSense dashboard or a real EU browser session.

**The Lighthouse 100s no longer describe the live site.** Auto ads inject into the DOM after
paint, so CLS and performance will drop from the launch numbers recorded under "Measured at
launch" — those were taken on a local preview build with no ad tag. Re-measure against
production before treating any of them as current, and tune via AdSense's ad load slider and
the anchor/vignette toggles rather than in code.

Affiliate links: nothing is affiliate-linked yet. Toolkit items in `src/data/resources.json`
carry `affiliate: null`; fill one in and `/resources/` renders it with `rel="noopener sponsored"`
and shows the disclosure block automatically (`hasAffiliates` drives it). FTC rules want the
disclosure above the links, which is how it renders.

## Analytics

Plausible, new `pa-*` script format (`SITE.plausibleScript` in `src/lib/site.ts`), verified
sending on 2026-07-30: `POST https://plausible.io/api/event` -> 202, domain
`howtostartavegetablegarden.com`, pageview + engagement events.

Two gotchas, both already handled:

- **Both script tags need `is:inline`.** Without it Astro bundles the queue shim as a module,
  which defers it past the async script and `plausible.init()` never seeds `plausible.o`.
- **Plausible silently drops events when `navigator.webdriver` is true** — so Playwright and
  any headless check will see the script load and *no* event. Its own escape hatch is
  `window.__plausible = true` via an init script. A silent verification run is not a failure.

Plausible itself sets no cookies. The site as a whole is **not** cookie-free since AdSense
(see Ads and affiliate links) — consent for EEA/UK/CH readers is handled by Google's CMP.

## Content accuracy — what pass 1 established

Verified against cooperative-extension publications on 2026-07-31 (sources are listed in
`zones.json` / `crops.json` under `sources`, and rendered on the calendar page):

- **A hardiness zone is NOT a frost date.** It is average annual extreme minimum *winter*
  temperature — a winter-survival rating for perennials. Frost dates come from NOAA station
  normals. The site said otherwise on the homepage and the calendar; both are now corrected,
  and this is the single most important thing not to reintroduce.
- **An "average last frost" is the 50%-freeze-probability date**, so planting tender crops on
  it is near a coin flip. NOAA also publishes the 40/30/20/10% dates.
- Because the zone→frost-date mapping is an approximation, **the tool now accepts the reader's
  own frost dates** and recalculates every window from them. `windowsFor(lastFrostDay,
  firstFrostDay)` in `calendar.ts` is shared by the zone pages and the browser island, so the
  two can never disagree.
- Corrected against UNH Extension: onion indoors 10-12 → **8-10 weeks**; cucumber indoors 2-3 →
  **3-4 weeks**; zucchini and cucumber direct-sow **+2 to +3 weeks** at **70°F** (was +1 to +2
  at 65°F). Row spacings widened for beans, cucumber and pepper per VCE 426-331.
- Confirmed correct and left alone: tomato (6-8 wks indoors, +1-2), pepper (8-10, +2-3), radish
  (-2 to -4), spinach (-3 to -6), peas ("as soon as soil thaws"), lettuce, kale, carrot spacing.

## Succession sowing (added 2026-07-31)

Fixes the defect where zone 7 claimed "nothing to plant" in May and June: each crop had one
spring window, so gaps appeared once it passed.

`successionFor(lastFrostDay, firstFrostDay)` generates a repeating run per crop — from the
first outdoor window to the last sowing that can still mature before the first frost
(days-to-harvest + 14-day buffer), stepping every `SUCCESSION_EVERY_DAYS` (14, from UMD
Extension). **Both bounds derive from data already in the dataset; no summer-temperature model
was invented.** `monthsFrom()` takes the runs and populates `MonthPlan.resow` — one row per crop
per month, not one per sowing date.

Result: active months per zone now run 6 (zone 3) to 12 (zone 10), monotonic as it should be.

**The bolting flag is a labelled heuristic, not sourced.** `HEAT_RISK_WINDOW` in `calendar.ts`
is a fixed calendar span (June 15 - September 1) applied to cool-season crops. It is keyed to
the calendar and NOT to an offset from the last frost — an offset-based version flagged zone 9's
October sowings, which are its *best* fall window. Each zone page states how to read the flag
for that zone. If you ever get real summer-temperature data, this is the thing to replace.

**When touching the calendar, run `node scripts/check-calendar.mjs [baseUrl]`** (default
`http://localhost:4321`; start `npm run preview` first). It was only described here until
2026-09-14 — now it is committed. It checks, with Playwright (`playwright-core` + the cached
Chromium):

- tool vs static page for all 96 zone-months (row by row, ~536 rows);
- every chart-image bar against the month tables, both directions, plus a pixel sample of every
  bar in each PNG (~240 samples) and the 150 KB size cap;
- all 12 month anchors on each zone page;
- that the city table's "Use these dates" links fill in the tool, and malformed params do not
  break it.

It was proven by breaking output on purpose (a dropped month section, a shifted bar date, a
swapped PNG, a removed anchor) — each fails loudly. The original bug it exists for: the zone
page guarded month sections on `m.entries.length === 0`, so re-sow-only months rendered nothing.
Guard on `m.entries.length === 0 && m.resow.length === 0`.

## Zone pages v2 (deployed 2026-09-14, brief `briefs/2026-09-14-zone-pages-v2.md`)

Four additions to all 8 zone pages, no new page URLs.

**1. Chart image.** `src/lib/gantt.ts` builds `ganttModel(zone)` from `calendar.ts` and draws an
SVG; `src/pages/img/planting-calendar/zone-[file].ts` turns it into PNGs with `sharp` during
`astro build`: `zone-N.png` (1200×900, on the page, in the image sitemap, `ImageObject` schema),
`zone-N-og.png` (1200×630, the page's `og:image` via BaseLayout's `ogImage` prop) and `zone-N.json`
(the model plus each bar's drawn rectangle, for the check). ~28 KB per PNG.
- `sharp` is now an explicit dependency (was only transitive via Astro).
- **Fonts come from the build machine** (Arimo → Liberation Sans → DejaVu Sans). Builds run
  locally via the pre-push hook, where Arimo exists. If Cloudflare's Git integration ever builds
  the site, re-check the PNGs — the fallback font changes label widths.
- Indoors bars are hollow on purpose so they read apart from solid outdoor bars.

**2. Sub-zones (`#sub-zones`).** Title and H1 are "Zone N Planting Calendar (Na & Nb): Printable,
by Month" (Franck approved the shorter title). The a/b bands live in `zones.json` as `subzones`.
The section's example ("X and Y are both zone N, yet their typical last frosts are W weeks
apart") is **computed from `cities.json`**, not written by hand — so is the tomato FAQ.

**3. City frost table (`#city-frost-dates`) — `src/data/cities.json`, generated, never hand-edited.**
`node scripts/fetch-noaa.mjs` reads `scripts/noaa-stations.json` (city, state, NOAA station id,
intended zone) and writes the file:
- Frost dates: NOAA NCEI 1991–2020 annual normals, one CSV per station (`ANN-TMIN-PRBLST/PRBFST-T32FP50/30/10`,
  `PRBGSL-T32FP50`, `PRBOCC-LSTH032`). Any value carrying a NOAA measurement flag
  (M/V/X/Y/Z, e.g. Los Angeles's -9999 "insufficient values") becomes `null` and its cell is left out.
- Zone: the **2023 USDA PHZM grid (PRISM, Oregon State) sampled at the station's coordinates** —
  no ZIP lookup, nothing typed. The script throws if a station lands in a different zone than
  listed. Grid and CSVs cache in `node_modules/.cache/noaa/`.
- **The build fails if a row has frost values without a NOAA `source`** or a zone without a
  `zoneSource` (assertion in `src/lib/cities.ts`; proven by blanking one source).
- **Rare-freeze rule:** when NOAA's freeze occurrence is under 50% of years (Phoenix 17.5%, Tampa
  34.5%, LA 0%), the "50% date" describes rare cold snaps, so the row says how often it freezes
  instead and gets no "Use these dates" link. 50–95% shows the dates plus "freezes in X% of years".
- 6 cities per zone, **3 for zone 3** (approved: the 2023 map left few zone 3 cities).
- 30%/10% columns hide behind a no-JS checkbox toggle; they show automatically in print.
- "Use these dates" links to `/planting-calendar/?zone=N&last=MM-DD&first=MM-DD#calendar-tool`.
  `CalendarTool.astro` reads those params; they beat saved prefs, malformed values are ignored.

**4. Month anchors + FAQs.** All 12 months have an `h3` id (idle months get a one-line stub) and a
month nav under the chart. Five FAQs per zone were added (a/b difference, a/b for tomatoes, July,
fall start, printable PDF) — the July and fall answers are generated from the month plan. The
PDF answer says "not as a download yet" — **swap it when the PDF brief ships.**

**Print:** `@media print` rules in `global.css` are scoped with `body:has(.zone-chart)` so only
zone pages change how they print.

**Control pages — do not edit during a measurement window.** Glossary, resources and the three
spokes are the baseline for the brief's predictions (C1). v2 left their built HTML byte-identical
to production apart from the shared CSS bundle hash. Any future brief names its own controls.

**Zone `regions` text for zones 6–10 was corrected** to cities the 2023 grid actually puts there
(e.g. zone 9 no longer claims Phoenix or Orlando, which are 10a), so the prose cannot contradict
the city table on the same page. Zones 3–5 still name states only.

**`llms.txt` fixed:** its summary line claimed dates were "derived from USDA hardiness zone frost
dates" — the claim fact-check pass 1 removed everywhere else. It now lists the new sections per
zone and a computed same-zone frost-spread fact.

## Google site name and favicon

Google's site-name line comes from, in priority order: `WebSite` structured data `name`,
then `og:site_name`, then `<title>`. Google states the `WebSite` node must be on the **home
page** — "the domain or subdomain root URI, not subdirectories" — so `BaseLayout.astro` emits
it only when `path === '/'`. Other pages reference it by `@id`, which is fine.

**Site name is "HowToStartaVegetableGarden.com"** (Franck, 2026-09-14) — `SITE.name`, used in the
`WebSite`/`Organization` schema, `og:site_name`, the footer ©, the chart images, the OG card and
`llms.txt`. `SITE.alternateName` ("How to Start a Vegetable Garden") is on the `WebSite` node.
Prose mentioning the site uses the camel-case form; email addresses and URLs stay lowercase.

**Never set `alternateName` to the all-lowercase domain.** Google treats `alternateName` as the fallback
it reaches for when confidence in `name` is low, so listing the domain there invites the exact
"howtostartavegetablegarden.com" title we want replaced. v1 briefly shipped this; removed.

Favicons: Google looks for `/favicon.ico` by name and often falls back to a generic globe when
only an SVG is declared. `scripts/favicon-gen.mjs` generates `favicon.ico` (16/32/48 — 48 is
Google's stated minimum), `favicon-96.png` and `apple-touch-icon.png` from the same mark as
`favicon.svg`. Re-run it if the mark changes.

Both of these take **days to weeks** to appear in results — crawling, not caching. Requesting
indexing on the homepage in Search Console is the only way to nudge it.

## Table styling gotcha

The first column of most tables is a `<th scope="row">` for accessibility. **Every `tbody td`
rule in `global.css` must also list `tbody th`.** A `td`-only selector leaves row headers with
browser defaults — 1px padding, `vertical-align: middle`, no zebra stripe — which renders as
crop names jammed against the table border, misaligned against their own row, and a stripe that
covers only two of three cells. That shipped in v1 and Franck caught it.

Do not paper over it with inline `style=` on the `th` (v1 did, in five files; removed).

## Hard rules

1. **All planting dates come from `src/data/zones.json` + `src/data/crops.json`.** Never
   hardcode a date, spacing or depth in a page. `src/lib/calendar.ts` derives everything; the
   calendar island, all 8 zone pages, the spacing table and the seed-start table follow
   automatically.
2. **Prose lives in content collections** (`src/content/guides/*.mdx`,
   `src/content/pages/*.md`) so an upgraded draft can replace a page without touching a
   component. Frontmatter carries the structured parts (answer box, FAQs, schema, links).
3. **Every guide opens with a direct answer** in the answer box — that is the snippet and
   AI-citation target. First two sentences must fully answer the H1.
4. **Adding a guide?** Also add it to `GUIDE_LINKS` in `src/lib/site.ts`, or it will be
   orphaned from the footer and next-steps cards.
5. **Renaming a homepage H2** means updating the matching `howTo.steps[].anchor` in
   `home.mdx`. The build asserts this and fails loudly — that is intentional.
6. Trailing slashes everywhere. Internal links must end in `/`.
8. **"Last updated" dates are computed — never type one** (Franck, 2026-09-14: "do it at every
   update, or it doesn't make any sense"). `src/lib/updated.ts` gives each page the latest git
   commit date of *its own content files* (prose/template + the data it renders), today if they
   are uncommitted, never earlier than the old typed date. The top-of-page date and schema
   `dateModified` use it. The **footer** shows "Site last updated" = the latest content change
   anywhere on the site (a per-page footer date next to a sitewide change read as abandoned). **Mechanical commits** (imports, refactors,
   sitewide renames, CSS) must put `[skip-date]` in the message so they do not fake freshness —
   especially on control pages. Adding a page = pass its dependency files to `lastChanged()`.
7. **The site never mentions AI, Claude, or how pages are produced.** Credibility comes from
   named sources, visible corrections, and the named editor — nothing else. (Franck, 2026-09-14.)

## Routes (20)

`/` · `/planting-calendar/` · `/planting-calendar/zone-3/` … `zone-10/` ·
`/easiest-vegetables-for-beginners/` · `/raised-beds-vs-containers-vs-in-ground/` ·
`/starting-seeds-indoors/` · `/glossary/` · `/resources/` · `/about/` · `/contact/` ·
`/privacy-policy/` · `/terms-of-service/` · `/404.html` · `/llms.txt`

Build-time assets (not pages, not in the sitemap as URLs): `/img/planting-calendar/zone-N.png`,
`zone-N-og.png`, `zone-N.json` for N = 3…10. The PNGs are listed as `<image:image>` entries on
their zone page's sitemap URL.

Schema: `Organization` + `WebPage` sitewide, `WebSite` on the homepage only (see the site-name
section); `HowTo` + `FAQPage` on home; `Dataset` + `FAQPage` on calendar pages, plus
`ImageObject` (linked from `Dataset.image`) on zone pages; `FAQPage` +
`BreadcrumbList` on spokes; `DefinedTermSet` on the glossary; `ItemList` on resources.

## Launch checklist — done

- Deployed, apex + www live with valid SSL (2026-07-30)
- Plausible verified sending (see Analytics above)
- Google Search Console: verified, sitemap submitted
- Bing Webmaster Tools: verified, sitemap submitted
- IndexNow: 17 URLs submitted, 202 accepted (`node scripts/indexnow.mjs`)
- Sitemap serves 17 apex URLs; only `/404.html` carries `noindex`

## Measured at launch

Lighthouse (local preview, Playwright Chromium, **pre-AdSense**): performance 100, accessibility
100, best practices 100, SEO 100 on home, spoke and calendar. Auto ads landed 2026-09-12 and
these have not been re-measured since — treat them as a v1 baseline, not the current site. No horizontal overflow at 375px or
768px on any route. Calendar island: no page errors, `localStorage` zone persistence works.

**Production, with AdSense, before zone pages v2 (2026-09-14)** — Lighthouse 13.4.1, mobile,
performance only, `/planting-calendar/zone-8/`, 5 runs: score 72/68/69/69/67 (median **69**),
LCP 2373/1134/2374/2267/2187 ms (median **2267**), CLS .058/.088/.088/.110/.110 (median **.088**),
TBT 1181/4236/1783/1668/2063 ms (median **1783**). Ads make runs noisy — TBT ranged 3.6×.

**Production after v2 (same day, same profile, 5 runs):** score 72/74/63/60/71 (median **71**),
LCP 2394/2187/3530/3085/2392 (median **2394**, +127 ms), CLS .051/.052/.051/.052/.051 (median
**.051**, down from .088), TBT median **1497**. The remaining CLS is Google's consent dialog
(`fc-dialog-container`), not the page.

**The LCP rise is ad noise, not v2** — tested rather than assumed: old (pre-v2) and new builds
served locally, ads and analytics blocked, 5 alternating runs each. LCP 1384 vs 1384 ms (3 ms
spread), CLS 0 vs 0, score 100 vs 100. v2's real cost: **FCP +61 ms** (776 → 837 median) and
TBT +6 ms, from heavier HTML (zone-8: 6.8 → 10.4 KB gzipped). Method worth keeping: on an
ad-carrying page, compare builds with third parties blocked before blaming or clearing a change.

v2 local checks (2026-09-14): no horizontal overflow at 320/375/768px on all 8 zone pages; JSON-LD
parses on all 8 with 10 FAQ entries, `ImageObject`, `Dataset.image` link.

## Open work

**Deferred spokes (7).** Soil preparation, cheap gardening supplies, small-space gardening,
watering, beginner mistakes, garden pests, community gardens. Nothing links to them yet, so
each is just a new file in `src/content/guides/` + a `GUIDE_LINKS` entry.

**Residual: zones 9-10 do not wrap the sowing year.** A cool-season crop's first window is
derived from the last spring frost, so in zone 9 the January/February windows do not also appear
as "sow now for winter" in the preceding November. Zone 9 shows November idle for this reason;
zone 10 happens not to, because its windows already wrap into December. Low priority, but it is
a real artifact of anchoring everything to one last-frost date.

**Succession crops are a conservative set.** radish, lettuce, spinach, kale, carrot, bush beans.
Deliberately excluded: peas (heat-limited to spring and autumn), cucumber (resents root
disturbance, one or two sowings is the norm), zucchini (two plants already outproduce a
household). Revisit if the crop list grows.

**External link audit (2026-09-12).** The NIFA extension directory moved —
`/about-nifa/how-we-work/extension/land-grant-university-website-directory` now 404s and the live
URL is `/grants/land-grant-university-website-directory`. Updated in both places in
`resources.json`. `usdalocalfoodportal.com` returns **403 to crawlers and 200 to humans** — USDA
bot-blocking, a false positive. Do not "fix" it by swapping in an ams.usda.gov URL; those 403 to
bots too.

**Fact-check pass 2 (2026-07-31) closed the data debt.** Days-to-harvest, seed depth and sun
hours are now checked against Penn State Extension (depth, days to maturity), NC State Extension
(days to harvest, sunlight) and the NC State Extension Gardener Handbook. Corrections applied to
8 crops' days-to-harvest, carrot depth, and every crop's sun figure — the old 6-8 hours for
fruiting crops understated NC State's "at least 8, better with 10".

**The only unsourced numbers left are the homepage cost estimates**, and they are now explicitly
labelled as the site's own estimates on the page itself, in `llms.txt` and on the About page. No
extension service publishes tool and material prices. Do not quietly present them as sourced.

Still not done: spoke prose beyond the corrected numbers has not had a full editorial pass.

**Cloudflare Email Address Obfuscation is OFF — keep it that way (2026-09-12).** While it was
on, Scrape Shield rewrote every `mailto:` at the edge into `/cdn-cgi/l/email-protection#<hex>`,
which 404s for anything without JS. That produced 5 internal 404s in an Ahrefs crawl
(`/contact/`, `/glossary/`, `/resources/`, `/privacy-policy/`, `/terms-of-service/`) even though
the build output had clean `mailto:` hrefs — it is an edge rewrite, invisible in `dist/`.
Franck turned it off; all five now serve plain `mailto:`. If those 404s ever reappear, this
setting is the cause, not the code: dashboard -> zone -> Scrape Shield -> Email Address
Obfuscation. It also hid the contact address from crawlers and AI, working against the
contact/E-E-A-T signal the About and Contact pages exist to give.

**www is not redirected to apex.** Both hostnames serve 200 with identical content; the
canonical tag on every page points at the apex, which Google honours, so this is safe but not
ideal. The clean fix is one Cloudflare Redirect Rule (dashboard: Rules -> Redirect Rules,
hostname eq `www.howtostartavegetablegarden.com` -> 301 to apex, preserve path). Deliberately
NOT done with a Pages `functions/_middleware.ts`, which would put a Worker in front of every
request on an otherwise fully static site.

**Confirm:** the terms page states governing law is France, inferred from Franck being the
Paris-based operator. Change `src/content/pages/terms-of-service.md` if that is wrong.

## Not built (deliberately)

No affiliate links, no newsletter, no first-party cookies. Ads: AdSense went live 2026-09-12
(see Ads and affiliate links) — the "no ads / cookie-free" posture no longer holds and the
privacy policy has been corrected. Update the privacy policy *before* adding a newsletter or
any other tracker.
