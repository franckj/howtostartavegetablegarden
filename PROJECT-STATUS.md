# howtostartavegetablegarden.com — status

**Last updated:** 2026-07-31 · **Status:** live, 20 pages, all launch tasks done

- **Live:** https://howtostartavegetablegarden.com (apex + www, valid SSL)
- **Repo:** https://github.com/franckj/howtostartavegetablegarden (branch `main`)
- **Host:** Cloudflare Pages project `howtostartavegetablegarden`, Templatery account
- **Domain:** registered 2026-07-29 at Spaceship, zone on Cloudflare
- **Analytics:** Plausible, verified sending

Technical detail lives in `CLAUDE.md`. This file is the status summary.

---

## What shipped

**20 pages.** Homepage pillar (9-step guide, cost box, 10-question FAQ), interactive planting
calendar, 8 static USDA zone pages, 3 spoke guides, glossary, resources, plus about, contact,
privacy, terms and a 404.

**The planting calendar is the differentiator.** Everything derives from two data files
(`zones.json`, `crops.json`) through one module, so the tool, all 8 zone pages and every table
stay in sync from a single source. It accepts the reader's own frost dates and recalculates,
which most competitors do not do. Succession sowing is modelled — re-sow rows every 14 days up
to the last date each crop can still mature.

**SEO.** Per-page meta, canonical, OG; JSON-LD (`HowTo`, `FAQPage`, `Dataset`,
`BreadcrumbList`, `DefinedTermSet`, `ItemList`); generated `llms.txt`; `robots.txt` explicitly
allowing GPTBot, ClaudeBot, PerplexityBot and friends. Planting dataset published CC BY 4.0 to
make it citable.

**Measured:** Lighthouse 100/100/100/100 (performance, accessibility, best practices, SEO) on
home, about, glossary, resources and a zone page. No horizontal overflow or flush-left text
from 320px to 1280px. Calendar island: no JS errors, choice persists.

**Done:** deployed · Google Search Console verified + sitemap submitted · Bing Webmaster
verified · IndexNow submitted (19 URLs, 200) · GitHub pushed · `git push` now builds and
deploys automatically.

---

## Decisions worth remembering

**Lean v1 over the full 17-page build.** 7 spoke pages deferred on purpose. Nothing links to
them, so each is a drop-in addition later.

**A hardiness zone is not a frost date.** It describes average extreme minimum *winter*
temperature — a winter-survival rating for perennials. Frost dates come from NOAA station
normals. The site said otherwise at launch and was corrected. Because the zone→frost mapping is
only an approximation, the calendar takes the reader's own dates.

**Honesty is a feature here.** Pages state which numbers are sourced and which are estimates,
and the bolting warnings say plainly that the threshold is a rough calendar rule. The tool-kit
page carries a "what to skip" list that costs money to publish.

**No ads or affiliate links are live yet** — only the disclosure that they may appear. The
mechanism is built and waiting for real programme URLs.

---

## Open — needs you

1. **Rotate three Cloudflare API tokens.** They sit in plaintext in
   `~/.claude/settings.local.json` with write access to the Templatery account. Rotate at
   https://dash.cloudflare.com/profile/api-tokens and delete the four rules containing
   `CLOUDFLARE_API_TOKEN=`. Wrangler OAuth is what actually deploys, so they are redundant.
   **This is the only real risk item on the project.**
2. **Request indexing on the homepage in Search Console.** The site-title and favicon fixes
   take days to weeks to appear; this is the only way to nudge it.
3. **Join an affiliate programme** (Amazon Associates is the obvious one for hand tools), then
   fill the `affiliate` fields in `src/data/resources.json`. The disclosure renders itself.
4. **Optional: connect Cloudflare's Git integration.** Pages → project → Settings → Builds &
   deployments → Connect to Git. Not needed — a `pre-push` hook already makes `git push`
   build and deploy — but it would move builds onto Cloudflare's infrastructure and add PR
   previews. **If you connect it, delete `.githooks/pre-push`** or every push deploys twice.
5. **Optional: www → apex 301.** Rules → Redirect Rules, hostname equals
   `www.howtostartavegetablegarden.com`. Canonical tags already handle it, so cosmetic.

---

## Open — content work, in the order I would do it

1. **Verify days-to-harvest, seed depth and sun hours.** The fact-check pass covered timings,
   soil temperatures and spacing only. Cost figures on the homepage have no source at all.
2. **The 7 deferred spokes.** Soil preparation, cheap gardening supplies, small-space
   gardening, watering, beginner mistakes, garden pests, community gardens.
3. **Zones 9–10 do not wrap the sowing year.** Cool-season windows anchor to the last spring
   frost, so zone 9 shows November idle even though you could sow then. Low priority.
4. **Replace the bolting heuristic** if real summer-temperature data ever becomes available.
   It is currently a fixed calendar span (Jun 15 – Sep 1), labelled as such on every zone page.

---

## Traction markers

Impressions in GSC for the exact-match query within 3–7 days. AI citations typically lag
indexing by 2–6 weeks — watch Plausible for `perplexity.ai` and `chatgpt.com` referrers. Two
pages were indexed within ~36 hours of launch.
