# howtostartavegetablegarden.com — Execution Kit

## PART 1 — CLAUDE CODE MASTER PROMPT (paste as-is)

---

Build a complete, production-ready Astro website for **howtostartavegetablegarden.com** and prepare it for Cloudflare Pages deployment. Ship everything in one pass — this goes live today.

### Context & strategy
- Evergreen beginner-gardening resource, US market, designed to be cited by Google SERP features and AI answer engines (AI Overviews, ChatGPT, Perplexity).
- Core principle (semantic SEO): the domain is a question — the homepage IS the answer. Domain, title, H1, above-the-fold copy, TOC, FAQ, and structured data must all tell the same story. No blog-index homepage.
- Tone: practical, direct, encouraging. Anonymous site (no author names). Angle: real, safe, organic food; getting outside; connecting with local people, community gardens, and farmers markets.

### Tech stack
- Astro (latest, static output), deployed to Cloudflare Pages
- Plausible analytics snippet (domain: howtostartavegetablegarden.com)
- No heavy frameworks. One interactive island only (zone calendar). Everything else pure static HTML/CSS.
- Fast: inline critical CSS, system font stack or one self-hosted font, lazy-load images, target Lighthouse 95+ across the board.

### Site architecture (build ALL pages with full v1 content — no stubs, no lorem ipsum)

**Homepage `/`** — the pillar. Complete "How to Start a Vegetable Garden" guide:
- H1: "How to Start a Vegetable Garden: A Beginner's Step-by-Step Guide"
- First two sentences answer the question directly (snippet-ready summary of the 9 steps)
- Sticky/inline TOC
- 9 steps as H2s: 1) Pick the right spot (6–8h sun) 2) Choose your setup: raised beds vs containers vs in-ground 3) Plan size — start small (10 easy vegetables list) 4) Prepare the soil 5) Decide seeds vs seedlings 6) Know your USDA zone & planting dates (link to calendar tool) 7) Plant properly (spacing table) 8) Water & mulch 9) Maintain, harvest, repeat
- Cost box: "What it costs to start" (budget vs standard setup)
- FAQ section (8–10 real questions: when to start, how much sun, easiest vegetables, how much it costs, can I do it on a balcony, etc.)
- Schema: HowTo + FAQPage (JSON-LD)
- Internal links to every spoke page in context

**Tool: `/planting-calendar/`** — interactive Astro island:
- Input: USDA hardiness zone (dropdown 3–10) → output: what to plant this month (indoors / direct sow / transplant), per common beginner crops (tomato, lettuce, carrot, radish, pepper, cucumber, zucchini, beans, peas, spinach, kale, onion)
- Build the planting-dates dataset as a local JSON file from standard USDA-zone frost-date logic (last frost ± weeks per crop). Keep it conservative and note "always check your local frost dates."
- **Also generate static pages `/planting-calendar/zone-3/` through `/zone-10/`** at build time from the same JSON — each with a full monthly table, zone description, and FAQPage schema. These are indexable surface area.
- Dataset schema on the tool page.

**Spoke pages** (each: question-form H1, direct answer in first two sentences, comparison or timing table where relevant, FAQ block with FAQPage schema, 1200–1800 words, links back to homepage + 2–3 sibling pages):
1. `/easiest-vegetables-for-beginners/` — ranked list of 10 with difficulty/time-to-harvest table
2. `/raised-beds-vs-containers-vs-in-ground/` — comparison table (cost, effort, yield, best for)
3. `/soil-preparation/` — testing, amending, compost basics
4. `/starting-seeds-indoors/` — timeline, equipment, hardening off
5. `/cheap-gardening-supplies/` — budget table: what to buy, what to skip, DIY alternatives, where to find free/cheap (dollar stores, buy-nothing groups, seed libraries, community garden surplus)
6. `/small-space-gardening/` — balcony/container/vertical
7. `/watering-vegetable-garden/` — how much, how often, signs of over/under
8. `/beginner-mistakes/` — 10 mistakes, each with the fix
9. `/vegetable-garden-pests/` — organic-only control, ID table for 8 common pests
10. `/community-gardens/` — how to find one, how to volunteer, what to expect, why it accelerates learning (ties to the connection/local angle)

**Supporting pages:**
- `/about/` — anonymous mission page: helping beginners grow real, safe, organic food, spend time outside, and connect with local people, community gardens, and farmers markets. No fake author personas.
- `/privacy-policy/`, `/terms-of-service/`, `/contact/` — standard, real content (contact = form-free, email address on a Cloudflare-safe format or simple mailto). Footer-linked on every page.

### Technical SEO (non-negotiable)
- Unique title + meta description per page, question-form where natural
- Canonical URLs, clean trailing-slash consistency
- JSON-LD on every page: WebSite + Organization sitewide; HowTo + FAQPage on home; FAQPage on spokes; Dataset on the calendar
- `sitemap.xml` (Astro integration) and `robots.txt` allowing all crawlers **including GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot**
- **`llms.txt`** at root: site purpose, page inventory with one-line descriptions, preferred citation format
- BreadcrumbList schema on spokes
- OpenGraph + Twitter cards
- `dateModified` visible on pages and in schema
- Descriptive alt text everywhere; use simple inline SVG illustrations or CSS-styled tables instead of stock photos for v1

### Design
- Clean, warm, minimal. Earthy palette (greens/soil tones), generous whitespace, mobile-first
- Answer-box styling: the direct answer at the top of each page visually distinct (bordered/tinted box)
- Tables styled for readability — they're the citation magnets
- Footer: legal links, "Last updated", no fake trust badges

### Deploy
- Configure for Cloudflare Pages (build command, output dir), include `wrangler.toml` if useful
- Plausible script in the base layout
- README with: local dev, deploy steps, and how to add/update a page (content collection structure)
- Use Astro content collections (markdown + frontmatter) so pages can be replaced by upgraded drafts later without touching components

### Acceptance checklist (verify before finishing)
- [ ] All 17 pages build with full content, zero placeholders
- [ ] Calendar island works without JS errors; zone pages generated
- [ ] Every page validates: one H1, schema present, canonical, meta
- [ ] Lighthouse 95+ performance on home and one spoke
- [ ] sitemap.xml, robots.txt, llms.txt present and correct
- [ ] Internal links: every spoke links home; home links every spoke

---

## PART 2 — DELEGATION PROMPTS (upgrade cycle, one page at a time)

### 2a. Research prompt (Gemini Deep Research / ChatGPT / Claude Research)

> I'm upgrading a page on a beginner vegetable-gardening site for the US market. Topic: **[PAGE TOPIC, e.g. "starting seeds indoors"]**.
>
> Produce a fact base, not an article:
> 1. The 15–25 most important facts a beginner needs, each with a reputable source (university extension programs — .edu extension sites preferred — USDA, or established horticulture orgs). Include numbers: dates, depths, spacing, temperatures, costs.
> 2. The top 10 questions real people ask about this topic (People Also Ask style), with concise sourced answers.
> 3. Any recent shifts (last 2 years): trends, product changes, climate-zone map updates.
> 4. Common myths or mistakes experts flag.
> 5. A table-ready dataset if the topic has one (e.g., seed-starting timeline per crop).
>
> Output as structured markdown. Cite every claim. US-centric. No filler.

### 2b. Drafting prompt (Sonnet / cheaper model)

> Write a webpage for a beginner vegetable-gardening site using ONLY the attached fact base. US audience, anonymous site, practical and encouraging tone.
>
> Hard structure:
> - H1: [QUESTION-FORM TITLE]
> - First two sentences: direct, complete answer to the H1 question (snippet-ready, no throat-clearing)
> - Body: H2 sections, short paragraphs, every number from the fact base preserved exactly
> - At least one table
> - FAQ section: 6–8 questions from the fact base, 2–3 sentence answers
> - 1200–1800 words. No fluff, no "in this article we will," no invented facts.
> - End with 2–3 sentence "Next step" pointing to [RELATED PAGES].
>
> Output as markdown with frontmatter: title, description (under 155 chars), dateModified.

### 2c. Editing pass (paste draft + fact base back to me in this project)

> Edit this draft against the fact base: verify every number matches a source, kill any unsourced claim, tighten the opening answer to snippet length, check the FAQ questions match real search phrasing, confirm table formatting, and flag anything that contradicts other pages on the site.

---

## PART 3 — LAUNCH-DAY SEQUENCE

1. Run the Claude Code prompt → deploy to Cloudflare Pages → point the domain
2. Google Search Console: verify domain, submit sitemap
3. Bing Webmaster Tools: same (feeds ChatGPT/Copilot)
4. Request indexing on homepage + calendar manually in GSC
5. IndexNow ping (Bing/Yandex) — one curl command, Claude Code can add it
6. First 48h: check GSC coverage, Plausible for first AI-referrer hits (perplexity.ai, chat.openai.com referrers)
7. Week 1+: start the upgrade cycle (Part 2), one page every 1–2 days, homepage first

**Traction markers to watch:** impressions in GSC within 3–7 days for the exact-match query; AI citations typically lag indexing by 2–6 weeks. Log referrers from AI engines in Plausible as your equivalent of Afternic search counts — that's your market signal.
