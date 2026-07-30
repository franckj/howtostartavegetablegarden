# CLAUDE.md — howtostartavegetablegarden.com

Astro static site on Cloudflare Pages. Evergreen beginner-gardening resource, US market,
built so the homepage answers the question in the domain. Anonymous site, no author personas.

**Update this file after every completed task on this project** — deploys, new pages, data
changes, schema changes. It is the source of truth.

## Status

- **Live:** https://howtostartavegetablegarden.com (apex + www)
- **Pages URL:** https://howtostartavegetablegarden.pages.dev
- **v1 shipped:** 2026-07-30 — 18 routes
- Domain registered 2026-07-29 at Spaceship, zone `503472023b8afc3b3d7470e0db12a766` in the
  Cloudflare **Templatery** account (`caaea080dc96ef6541c3f5091718fe1e`)

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name howtostartavegetablegarden --branch main
```

Wrangler OAuth only — **never ask Franck for a `CLOUDFLARE_API_TOKEN` to deploy.** A
DNS-scoped token is only needed for DNS record changes (OAuth has no DNS permission).

Direct upload, so there is no commit→deploy hook. Git integration would be a one-time
dashboard click (Pages → Settings → Builds & deployments → Connect to Git).

After a meaningful content change: `node scripts/indexnow.mjs` (key file already deployed).

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

## Measured at launch

Lighthouse (local preview, Playwright Chromium): performance 100, accessibility 100,
best practices 100, SEO 100 on home, spoke and calendar. No horizontal overflow at 375px or
768px on any route. Calendar island: no page errors, `localStorage` zone persistence works.

## Open work

**Deferred spokes (7).** Soil preparation, cheap gardening supplies, small-space gardening,
watering, beginner mistakes, garden pests, community gardens. Nothing links to them yet, so
each is just a new file in `src/content/guides/` + a `GUIDE_LINKS` entry.

**Content accuracy — the real risk.** v1 numbers are conservative and internally consistent
but have **not** been verified line-by-line against extension-service sources. The planting
calendar carries the most exposure: offset-from-frost-date logic cannot know whether the
ground has thawed, which is why zones 3-5 get an explicit soil-workability caveat. Run the
Part 2 upgrade cycle in `htsavg-execution-kit.md` (research → draft → edit against a fact
base), homepage and calendar first.

**Launch tasks needing Franck's accounts:** Plausible site not yet created (script is already
in the layout with `data-domain`); Google Search Console verify + submit sitemap; Bing
Webmaster Tools (feeds ChatGPT/Copilot).

**Confirm:** the terms page states governing law is France, inferred from Franck being the
Paris-based operator. Change `src/content/pages/terms-of-service.md` if that is wrong.

## Not built (deliberately)

No ads, no affiliate links, no newsletter, no cookies, no consent banner. Privacy policy
states this explicitly — update it *before* adding any of them.
