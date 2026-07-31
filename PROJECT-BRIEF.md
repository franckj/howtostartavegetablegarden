# Project brief — howtostartavegetablegarden.com

Context document for a Claude Project. Self-contained: assumes no repo access.
Last updated 2026-07-31.

---

## 1. What this is

An evergreen beginner-gardening content site on an exact-match domain, built to be cited by
Google SERP features and by AI answer engines (AI Overviews, ChatGPT, Perplexity).

- **Live:** https://howtostartavegetablegarden.com
- **Repo:** https://github.com/franckj/howtostartavegetablegarden (`main`)
- **Stack:** Astro static → Cloudflare Pages, Plausible analytics, no framework
- **Market:** United States. All dates, temperatures and prices are US-centric.
- **Owner:** Franck, solo. Anonymous site — no bylines, no author persona.
- **Monetisation:** ads and affiliate links, disclosed. Nothing live yet.
- **Registered:** 2026-07-29. Launched 2026-07-30.

**Core principle:** the domain is a question, so the homepage is the answer. Domain, title, H1,
above-the-fold copy, TOC, FAQ and structured data all tell the same story. Never a blog-index
homepage.

---

## 2. Current state

**20 pages.**

| Group | Pages |
|---|---|
| Pillar | `/` — 9-step guide, cost box, 10-question FAQ, HowTo + FAQPage schema |
| Tool | `/planting-calendar/` + 8 zone pages (`zone-3` … `zone-10`), Dataset schema |
| Guides | easiest-vegetables-for-beginners, raised-beds-vs-containers-vs-in-ground, starting-seeds-indoors |
| Reference | `/glossary/` (25 terms, DefinedTermSet), `/resources/` (ItemList) |
| Site | about, contact, privacy-policy, terms-of-service, 404, `llms.txt` |

**Measured:** Lighthouse 100/100/100/100 on every page type tested. No horizontal overflow or
flush-left text 320–1280px. Zero broken internal links.

**Done:** deployed · GSC verified + sitemap submitted · Bing Webmaster verified · IndexNow
submitted · `git push` builds and deploys automatically.

---

## 3. Strategy

**The calendar is the moat.** Every competitor maps USDA zone → planting date. That mapping is
wrong (see §5), and ours says so while still accepting the zone as an entry point — then lets
readers substitute their own NOAA frost dates and recalculates everything. That is the thing
worth linking to and citing.

**Citation-first formatting.** Every guide opens with a visually distinct answer box holding a
direct, snippet-ready answer in the first two sentences. Tables are the citation magnets.
`llms.txt` is generated from the site so it never drifts.

**Honesty as differentiation.** Pages state which numbers are sourced and which are estimates.
The tool-kit page has a "what to skip" list. The About page lists corrections we have made.
On a site with no credentials, a visible correction history is the credibility signal.

**Lean v1 was deliberate.** 7 spoke pages deferred rather than shipping 20 unverified pages onto
a domain registered the day before.

---

## 4. Non-negotiable rules

1. **All planting data derives from two files** (`zones.json`, `crops.json`) through one module.
   Never hardcode a date, spacing, depth or temperature into a page. The tool and the 8 static
   zone pages call the same functions and must agree — there is a 96-zone-month cross-check.
2. **Prose lives in content collections** so an upgraded draft can replace a page without
   touching a component.
3. **Never claim hands-on growing experience.** No farm, no "we tested this", no invented
   credentials, no grandmother's tomatoes. Credibility comes from named sources only.
4. **Name the source, or label the estimate.** If a number is not from an extension service or
   NOAA, the page must say so next to the number.
5. **Every guide opens with a direct answer.** First two sentences fully answer the H1.
6. **Affiliate links carry `rel="noopener sponsored"` and a disclosure above them** (FTC).
7. **No ad network is running.** The privacy policy states this explicitly. Update the policy
   *before* adding one, not after.
8. Trailing slashes everywhere. Internal links end in `/`.

---

## 5. Established facts — do not reintroduce these errors

**A USDA hardiness zone is not a frost date.** It describes average annual extreme minimum
*winter* temperature — a winter-survival rating for perennials. Frost dates come from NOAA
weather-station normals. The site shipped this error and it was corrected.

**An "average last frost" is the 50%-freeze-probability date.** Planting tender crops on it is
a coin flip. NOAA also publishes the 40/30/20/10% dates.

**Sunlight:** NC State Extension puts fruiting crops (tomato, pepper, cucumber, squash, beans,
peas) at a minimum of 8 hours, better with 10. Leafy greens and root crops manage on 6 and still
produce in 4–6. Six hours is the practical floor. The site originally said 6–8 for fruiting
crops, which understated it.

**Succession sowing is modelled**, 14-day interval per UMD Extension, running to the last sowing
that can still mature before first frost. This fixed a real defect where zone 7 claimed nothing
could be planted in May or June.

**Sources used:** UNH Extension (sowing times, soil temperatures), Penn State Extension York MG
(planting depth, days to maturity), NC State Extension (days to harvest, sunlight), Virginia
Cooperative Extension 426-331 (spacing), USDA (zones), NOAA NCEI (frost dates), UMD Extension
(succession interval).

**The only unsourced numbers are the homepage cost estimates**, labelled as such on the page, in
`llms.txt` and on the About page. No extension service publishes tool prices.

---

## 6. Voice

Warm, plain, direct. Written for someone holding a seed packet who does not know the words.

**Do:** lead with a concrete frustration, not a mission statement · first-person plural ·
short sentences against longer ones · real numbers always · admit limits and corrections ·
send readers to local experts (county extension, community gardens, seed libraries) ·
link the glossary whenever a term appears.

**Don't:** claim experience · use "in this article we will" · give advice that cannot be acted
on ("water regularly") · assume prior knowledge without linking the glossary · use emoji ·
invent an origin story.

**Register reference:** Epic Gardening's about page — warm, mission-led, vulnerability-first.
Adopt the tone, never the experience claims.

---

## 7. Open work, prioritised

1. **7 deferred spokes** — soil preparation, cheap gardening supplies, small-space gardening,
   watering, beginner mistakes, garden pests, community gardens. Nothing links to them, so each
   is a clean addition.
2. **Editorial pass on spoke prose** beyond the numbers already corrected.
3. **Zones 9–10 do not wrap the sowing year** — cool-season windows anchor to the last spring
   frost, so zone 9 shows November idle though you could sow then. Low priority.
4. **The bolting heuristic** is a fixed calendar span (Jun 15 – Sep 1) applied to cool-season
   crops, labelled as a rough rule on every zone page. Replace if real summer-temperature data
   becomes available.

## 8. Needs Franck

1. **Rotate three Cloudflare API tokens** sitting in plaintext in
   `~/.claude/settings.local.json` with write access to the Templatery account.
   https://dash.cloudflare.com/profile/api-tokens — **the only real risk item.**
2. **Request indexing on the homepage in Search Console.** Site-title and favicon fixes take
   days to weeks; this is the only nudge available.
3. **Join an affiliate programme** (Amazon Associates for hand tools), then fill the
   `affiliate` fields in the resources data. Disclosure renders automatically.
4. Optional: connect Cloudflare's Git integration (would replace the local deploy hook — do not
   run both). Optional: www → apex 301, cosmetic since canonicals handle it.

---

## 9. How to work on this

Follow the domain-website build process: brief → discuss → plan → build, waiting for approval
between steps. The original spec is `htsavg-execution-kit.md` in the repo.

**Expectations when building:**

- Verify, do not assume. Check the rendered output, not the source.
- Numeric checks miss visual bugs. A flush-left layout does not trigger an overflow test.
- Cloudflare's edge serves old and new HTML alternately for up to a minute after deploy. Poll
  for a signal unique to the *new* build, and require several consecutive clean samples before
  reporting a result.
- If the calendar data or logic changes, re-run the tool-vs-static-page cross-check.
- Report what the numbers actually said, including variance.
