# howtostartavegetablegarden.com — status

**Last updated:** 2026-09-14 · **Status:** live, 20 pages, first AI Overview citation observed; zone-pages v2 brief queued

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

**Content debt is cleared.** Two fact-check passes against cooperative-extension publications
now cover sowing times, soil temperatures, spacing, planting depth, days-to-harvest and sunlight.
The only unsourced figures left are the homepage cost estimates, labelled as such on the page.

**Honesty is a feature here.** Pages state which numbers are sourced and which are estimates,
and the bolting warnings say plainly that the threshold is a rough calendar rule. The tool-kit
page carries a "what to skip" list that costs money to publish.

**AdSense went live 2026-09-12** (publisher `ca-pub-3174922327325961`, Auto ads, Google's own
CMP for EU consent; `ads.txt` added 2026-09-14). The privacy policy was rewritten in the same commit — the old "no cookies,
no ad network" posture is gone, deliberately, and must not be reintroduced. Affiliate links are
still not live; the disclosure mechanism is built and waiting for real programme URLs.

---

## Open — needs you

1. **Rotate three Cloudflare API tokens.** They sit in plaintext in
   `~/.claude/settings.local.json` with write access to the Templatery account. Rotate at
   https://dash.cloudflare.com/profile/api-tokens and delete the four rules containing
   `CLOUDFLARE_API_TOKEN=`. Wrangler OAuth is what actually deploys, so they are redundant.
   **This is the only real risk item on the project.**
2. **Request indexing on the homepage in Search Console.** The site-title and favicon fixes
   take days to weeks to appear; this is the only way to nudge it.
3. **Watch for AdSense approval**, then check Core Web Vitals in Search Console once ads
   actually serve. If CLS goes red, turn the ad load slider down in AdSense — a dashboard
   lever, not a code change.
4. **Bing zero-click check — partly done 2026-09-14.** DataForSEO's live Bing SERP (US, desktop)
   for "how to start a vegetable garden" does **not** show the site in the top 10, so the
   "title renders as bare domain" hypothesis could not be tested. Bing WMT's pos 6.2 is an
   average across markets and devices. Remaining: in Bing WMT → Search Performance, filter
   country = US and device, and see where the 1,007 impressions actually come from.
5. **Backlinks — done 2026-09-14, prior-owner spam, move on.** DataForSEO: 21 backlinks from 17
   domains, spam score 45–70 — web directories (australianwebdirectory.pro/.shop,
   simplewebdirectory.com), "website worth" pages, image hotlinks, plus 2 `pages.dev` links from
   2023 that predate registration. No real editorial links. Ahrefs' 324 vs DataForSEO's 21 is a
   tool disagreement (flagged, not resolved); neither is first-party.
6. **Filter your own traffic in Plausible.** Confirmed 2026-09-14: all 18 France visitors are
   Direct / None = you, and they account for 43 of 61 pageviews. Plausible → Site settings →
   Shields → IP addresses → add your IP.
7. **Join an affiliate programme** (Amazon Associates is the obvious one for hand tools), then
   fill the `affiliate` fields in `src/data/resources.json`. The disclosure renders itself.
8. **Optional: connect Cloudflare's Git integration.** Pages → project → Settings → Builds &
   deployments → Connect to Git. Not needed — a `pre-push` hook already makes `git push`
   build and deploy — but it would move builds onto Cloudflare's infrastructure and add PR
   previews. **If you connect it, delete `.githooks/pre-push`** or every push deploys twice.
9. **Optional: www → apex 301.** Rules → Redirect Rules, hostname equals
   `www.howtostartavegetablegarden.com`. Canonical tags already handle it, so cosmetic.

---

## Open — content work, in the order I would do it

1. **Zone pages v2** — see "Next build" below. Data says this before the spokes.
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
pages were indexed within ~36 hours of launch. **Observed:** first Google AIO citation at ~6.5
weeks (zone page); Copilot citations from week 5 (homepage). Neither has produced a referral
visit yet.

## Calibration log

Append-only. Every entry notes whether the lesson is site-specific or model-generalizable.

| Date | Event | Data | Lesson |
|------|-------|------|--------|
| 2026-07-30 | Launch, lean v1, 20 routes | 2 pages indexed within ~36h | Clock starts |
| 2026-08-01 | First GSC impressions, ~48h post-launch | 9 queries, 0 clicks — all zone/month planting ("what to plant in february zone 8", "zone 6 planting calendar") plus "gardening terms for beginners" | Zone pages + glossary are the SERP entry surface, not the EMD query yet. Tool/reference surface indexes and matches first — likely model-generalizable. Half-zone queries (6b) matched to whole-zone pages; if they persist, add half-zone notes to zone pages, no new pages. |
| 2026-08-01 | Full GSC 24h export | 29 impressions, 0 clicks, avg pos ~70. Pages: zone-8 (15), zone-6 (8), calendar hub (3), homepage (1 @ pos 11), about (1), glossary (1). 21 queries, ~all zone-intent; 5/21 are half-zone (8b, 6b, 6a×2). One seasonal-intent query: "is it too late to start a vegetable garden" @ 47 | Zone-8 dominates — southern-zone fall-planting season is live NOW, matching July/Aug sowing content. Homepage already at pos 11 on 1 impression. Half-zone trend strengthening: threshold to act = still present in week-2 data. "Too late to start" = real Jul–Aug intent, homepage FAQ candidate. |
| 2026-09-12 | Ahrefs crawl: 5 internal 404s + 1 external 404 | All 5 were `/cdn-cgi/l/email-protection` — Cloudflare Email Address Obfuscation rewriting `mailto:` at the edge. Build output was clean. External: NIFA extension directory moved; `usdalocalfoodportal.com` 403 = USDA bot-block, false positive | **A crawler 404 that does not exist in `dist/` is an edge feature, not a code bug** — check the CDN before the repo. Model-generalizable. Obfuscation also hid the contact address from AI crawlers, working against the E-E-A-T signal the Contact page exists to give. Now off. |
| 2026-09-12 | AdSense installed, Auto ads | Tag on 19 indexable routes, suppressed on the `noindex` 404. Privacy policy rewritten; Google CMP enabled for EEA/UK/CH consent | Monetization clock starts. Launch Lighthouse 100s predate the ad tag and are now a stale baseline — Auto ads inject post-paint, so re-measure CLS against production before quoting them. Site-specific. |
| 2026-09-14 | First AI Overview citation observed | Google AIO for "zone 3 planting schedule" cites `/planting-calendar/zone-3/` in the "+2" behind ufseeds.com (FR locale). GSC AI-features report confirms 40 impressions across zone pages since Aug 7, ~2.5/day in Sept | Lag ~6.5 weeks. Zone pages cited before the pillar. **Model-generalizable:** programmatic tool pages earn AI citations first. |
| 2026-09-14 | Etsy sells a zone-3 printable planner, ranked in the Image pack | Site absent from Google Images — SVG and HTML tables only, no bitmaps | Paid demand for the PDF magnet confirmed. **Model-generalizable:** a rendered image of the tool element is its own SERP surface. |
| 2026-09-14 | 6-week checkpoint (GSC, Bing WMT, Plausible, Semrush, Ahrefs) | Google: 2,666 impr, 95% on zone pages, avg pos 55–75, 4 clicks; 47% of impressions non-US desktop = rank-tracker noise, US mobile ≈ pos 16 is the real signal. Bing: EMD query pos 6.2, 1,007 impr, **0 clicks**; 126 Copilot citations (111 homepage, 43% share on "how to grow a vegetable garden"). Plausible ~12 real visitors, 0 AI referrers. 91% of ranking keywords trigger an AIO, 65% an Image pack. Sub-zone (a/b) queries = 39% of impressions; 17 "printable/pdf" queries | Engines split: Bing rewards EMD + pillar at once; Google opens only the long tail. Citations do not yet convert to visits. **Model-generalizable:** pair every EMD pillar with a programmatic dataset surface. |
| 2026-09-14 | DataForSEO demand check | "zone 7b planting schedule" 1,300/mo KD 1; "6b" 1,300; "8b" 1,000 KD 1 — equal to whole-zone terms. "…schedule pdf" 260–320/mo. "planting schedule by zip code" 480/mo. All peak Mar–Apr at 2–3×, trough Nov–Dec | **Model-generalizable:** check sub-segment volumes before calling them long tail — the "precise" variant can be the head term. Ship in the trough, judge in the peak. |
| 2026-09-14 | Analyst error caught by Franck | Recommended an indexable free PDF from one SERP observation (a PDF at organic #2); Google had dropped most PDFs from the index on ~Aug 8 (Amsive / SERoundtable, widely confirmed) | Corrected same day. **Method:** one SERP result is an anecdote — check for platform-level changes before designing around a format. PDF stays gated + `noindex`; "pdf" queries captured by the HTML zone page. |
| 2026-09-14 | Decision: named editor + AI disclosure | Semrush AI-citation study: E-E-A-T (named author, credentials, sources) +31%, second-largest lift. Site has sources, no named human. Franck approves an editor byline ("not a gardener; built with Claude from extension + NOAA data") with photo and contact invitation | Ship as a 3-spoke test with controls; revert if spokes fall vs controls (Aug 2026 spam update risk). If it holds: honest AI disclosure + verified sources = citable, a **model-generalizable** blueprint finding. |
| 2026-09-14 | Plausible read via share link, France excluded | All-time non-FR: 17 visitors, 17 visits, **18 pageviews** (1.06 pages/visit). Sources: Direct 9, Google 7, Bing 1. All 7 Google entries land on calendar pages (zone-8 ×3, hub, zone-3, -5, -10). Week of Sep 7 = 6 visitors, best week so far. France = 18 visitors, all Direct = operator | Real audience is ~12 US visitors in 46 days, and almost nobody visits a second page. Zone pages are the only Google entry, which confirms the v2 priority. P6 baseline ("~7") holds. **Model-generalizable:** exclude the operator before reading any small-site analytics — here they were 51% of visitors and 70% of pageviews. |

## Verification rules (adopted 2026-09-14, apply to every update)

1. Pre-registered predictions with numeric targets, check dates, and kill criteria written
   before deploy. Misses are logged as misses.
2. Control pages left untouched (glossary, raised-beds spoke) to separate update effect from
   domain aging.
3. First-party data (GSC, Bing Webmaster) wins over Semrush/Ahrefs when tools disagree;
   disagreements are flagged, not resolved by picking the flattering number.

## Next build — zone pages v2

Brief: `briefs/2026-09-14-zone-pages-v2.md`. Four additions to the 8 zone pages, no new URLs:
build-time gantt PNG per zone, honest sub-zone (a/b) section + title, NOAA city frost table,
month anchors + month/printable FAQs. Predictions P1–P6 and control C1 are in the brief;
check at +14 and +42 days after deploy and log results here.

Decisions behind it: zone pages outrank the 7 deferred spokes on priority (95% of impressions);
no `/zone-8a/` URLs unless P2 fails; PDF magnet gated + `noindex`, "pdf" intent captured by the
HTML page; zip-code lookup parked (see Ideas queue).

## Queued build — author box (after zone pages v2)

Brief: `briefs/2026-09-14-author-box.md`. Named editor byline + AI-disclosure author box with
Franck's photo, on the 3 spoke guides only, `Person` schema linking franckj.com. Copy approved
by Franck 2026-09-14. Ships after the zone-pages +14-day check; predictions A1–A3 in the brief.
Risk noted: Google's Aug 2026 spam update targets scaled AI content — A2 is the kill switch.
Needs Franck: the photo file and confirmation of the author URL.

## Ideas queue (not committed — demand-gated)

**Zip-code frost lookup (tool feature)**
- "planting schedule by zip code" 480/mo, CPC $7. Zip → nearest NOAA station → frost dates
  pre-filled in the calendar island. Needs a station index; not before zone pages v2 ships.


**Progress Tracker — "My First Garden" (visitor-side gamification)**
- Concept: pillar guide converted to a trackable season checklist, zone-aware
- V1 = printable PDF checklist — same generation path as the zone calendar PDF; ship as page 2
  of that magnet or as a second magnet to A/B demand
- V2 (only on demand signal) = interactive island: localStorage progress, Plausible event per
  step, generated share card for virality. One page, no accounts, no backend
- Pairs with the Message Box intent question: stall-point data + intent answers = what to
  build/upgrade next
- Earliest sensible launch: Jan–Feb 2027, into the spring wave
- Expand PDF→interactive trigger: PDF download rate + any organic shares/mentions
- Blueprint note: "checklist-ification of pillar + share card" is model-generalizable
