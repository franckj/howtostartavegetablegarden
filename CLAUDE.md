# CLAUDE.md — howtostartavegetablegarden.com

Astro static site on Cloudflare Pages. Evergreen beginner-gardening resource, US market,
built so the homepage answers the question in the domain. Anonymous site, no author personas.

**Update this file after every completed task on this project** — deploys, new pages, data
changes, schema changes. It is the source of truth.

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

Direct upload, so there is no commit→deploy hook — **pushing to GitHub does not deploy.**
Deploy and push are two separate steps. Connecting Git is a one-time dashboard click
(Pages → project → Settings → Builds & deployments → Connect to Git) if you want
push-to-deploy; there is no CLI for it.

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

Nothing is affiliate-linked yet. Toolkit items in `src/data/resources.json` carry
`affiliate: null`; fill one in and `/resources/` renders it with `rel="noopener sponsored"` and
shows the disclosure block automatically (`hasAffiliates` drives it).

**Before adding any ad network**, update `src/content/pages/privacy-policy.md` first — it
currently states plainly that no ad network is running and that the cookie-free claim will be
corrected before one is added. The About page and footer already say ads and affiliate links
may appear. FTC rules want the disclosure above the links, which is how it renders.

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

No cookies, so no consent banner. Cookie-free status is asserted in the privacy policy.

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

**When touching the calendar, re-run the tool-vs-static cross-check.** The island and the zone
pages both call the same functions, so they must agree for all 96 zone-months. The bug this
caught: the zone page still guarded month sections on `m.entries.length === 0`, so months with
only re-sow rows rendered nothing — the original defect, resurfacing silently. Guard on
`m.entries.length === 0 && m.resow.length === 0`.

## Google site name and favicon

Google's site-name line comes from, in priority order: `WebSite` structured data `name`,
then `og:site_name`, then `<title>`. Google states the `WebSite` node must be on the **home
page** — "the domain or subdomain root URI, not subdirectories" — so `BaseLayout.astro` emits
it only when `path === '/'`. Other pages reference it by `@id`, which is fine.

**Never set `alternateName` to the bare domain.** Google treats `alternateName` as the fallback
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

## Routes (v1)

`/` · `/planting-calendar/` · `/planting-calendar/zone-3/` … `zone-10/` ·
`/easiest-vegetables-for-beginners/` · `/raised-beds-vs-containers-vs-in-ground/` ·
`/starting-seeds-indoors/` · `/about/` · `/contact/` · `/privacy-policy/` ·
`/terms-of-service/` · `/404.html` · `/llms.txt`

Schema: `WebSite` + `Organization` + `WebPage` sitewide; `HowTo` + `FAQPage` on home;
`Dataset` + `FAQPage` on calendar pages; `FAQPage` + `BreadcrumbList` on spokes.

## Launch checklist — done

- Deployed, apex + www live with valid SSL (2026-07-30)
- Plausible verified sending (see Analytics above)
- Google Search Console: verified, sitemap submitted
- Bing Webmaster Tools: verified, sitemap submitted
- IndexNow: 17 URLs submitted, 202 accepted (`node scripts/indexnow.mjs`)
- Sitemap serves 17 apex URLs; only `/404.html` carries `noindex`

## Measured at launch

Lighthouse (local preview, Playwright Chromium): performance 100, accessibility 100,
best practices 100, SEO 100 on home, spoke and calendar. No horizontal overflow at 375px or
768px on any route. Calendar island: no page errors, `localStorage` zone persistence works.

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

**Still unverified.** Days-to-harvest, seed depth and sun-hour figures were not checked against
a source in pass 1 — only timings, soil temperatures and spacings were. The cost figures on the
homepage are 2026 US retail estimates and have no source at all. Spoke prose beyond the numbers
corrected in pass 1 has not been through an edit pass.

**www is not redirected to apex.** Both hostnames serve 200 with identical content; the
canonical tag on every page points at the apex, which Google honours, so this is safe but not
ideal. The clean fix is one Cloudflare Redirect Rule (dashboard: Rules -> Redirect Rules,
hostname eq `www.howtostartavegetablegarden.com` -> 301 to apex, preserve path). Deliberately
NOT done with a Pages `functions/_middleware.ts`, which would put a Worker in front of every
request on an otherwise fully static site.

**Confirm:** the terms page states governing law is France, inferred from Franck being the
Paris-based operator. Change `src/content/pages/terms-of-service.md` if that is wrong.

## Not built (deliberately)

No ads, no affiliate links, no newsletter, no cookies, no consent banner. Privacy policy
states this explicitly — update it *before* adding any of them.
