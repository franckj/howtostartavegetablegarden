# BRIEF — Author box: named editor + AI disclosure (test on 3 spokes)

Repo: `franckj/howtostartavegetablegarden` (`main`). Lives at `briefs/2026-09-14-author-box.md`.
Read `CLAUDE.md` first. Process: **read → propose a plan → wait for approval → build.**
Sequence: **after** `2026-09-14-zone-pages-v2.md` has shipped and its +14-day check is logged,
so the two tests don't overlap on the same dates. Franck may override the order.

Date: 2026-09-14. Owner: Franck. Copy below is **approved by Franck**; wording tweaks only.

---

## Why

Semrush's AI-citation study (Jul–Aug 2025; 305K cited vs 922K uncited ranking URLs) put
E-E-A-T signals — named author, visible credentials, credible sources — at +31%, second only
to answer clarity. The site has the sources and the clarity; it has no named human. This adds
one, honestly: an editor, not a gardener, and an explicit statement that the site is built
with Claude from extension-service and NOAA data.

Franck's stated intent: demonstrate that AI is a strong tool for collecting, consolidating,
verifying and re-rendering existing public data (the calendar is the proof), and invite
readers to reach out with errors, questions, or needs. Tone: helpful and supportive.

## Risk, stated up front

Google's August 2026 spam update targeted scaled AI and programmatic content. Announcing
"built with AI" on a site with 8 programmatic zone pages could draw that lens. Disclosure is
still right — it's true — but this ships as a controlled test (below), not sitewide.

---

## Scope

### 1. Author box component — on the 3 live spoke guides only

`/easiest-vegetables-for-beginners/`, `/raised-beds-vs-containers-vs-in-ground/`,
`/starting-seeds-indoors/`. **Not** on the homepage, zone pages, glossary, resources, or
About (raised-beds is a control page in the zone-pages brief — see "Controls and coexistence"
below for how the two briefs are sequenced).

Placement: after the article body, before the "next steps" cards. Also a one-line byline
directly under the H1.

**Byline (under H1):**
`Edited by Franck J · Built with Claude from extension-service and NOAA data · Last updated {dateModified}`

**Author box copy (approved):**

> **Edited by Franck J**
>
> I'm not a gardener. I build websites, and this one is an experiment: every page was
> researched, checked and assembled with Claude, an AI assistant, working from
> cooperative-extension and NOAA data. The aim is to show what AI does well when it is kept
> honest — gathering public data that sits scattered across dozens of sources, reconciling it,
> checking every number against a named source, and turning it into something you can actually
> use, like the zone planting calendar. When it gets something wrong, the correction goes on the
> About page.
>
> If you spot an error, have a question, or want a tool like this built for your own data,
> write to me. I'll answer — that's what I'm here for.

Links inside the box: "zone planting calendar" → `/planting-calendar/`; "About page" →
`/about/`; "write to me" → `/contact/`. Name "Franck J" → `https://franckj.com/` with
`rel="author"`.

**Profile photo:** Franck's existing avatar. Franck drops the file at
`public/img/franck-j.jpg` (square, ≥ 400px) or tells Claude Code to pull the one used on
franckj.com. Rendered at 72px, `loading="lazy"`, alt "Franck J". Do not ship a placeholder.

### 2. Schema

- Add a `Person` node (`@id: https://franckj.com/#person`, `name`, `url`, `image`,
  `sameAs: [https://franckj.com/]`, `jobTitle: "Editor"`) to the sitewide graph.
- On the 3 spokes, set `author` and `editor` on the `Article`/`WebPage` node to that `@id`.
- Do **not** claim `Organization.founder` or any horticulture credential.

### 3. About page — one paragraph, not a rewrite

Add a short "Who makes this" paragraph mirroring the box (same facts, third person is fine),
so the About page and the box agree. Keep the corrections list where it is.

### 4. Style

Tokens from `tokens.css`; bordered box like the answer box but visually distinct (avatar
left, text right; stacks on mobile). No emoji. Footer prose-link underline rule applies.

### Controls and coexistence with the zone-pages brief

The zone-pages brief names glossary + raised-beds as untouched controls for **its** test. This
brief touches raised-beds. Resolution: run this brief only after the zone-pages +14-day check
is logged, then raised-beds stops being a control for zone-pages and becomes a treatment here.
Controls for **this** test: glossary, resources, homepage (untouched).

---

## Acceptance

- [ ] Box + byline render on exactly the 3 spokes; absent everywhere else.
- [ ] Photo is the real one; no placeholder shipped.
- [ ] `Person` schema validates; `author`/`editor` reference it by `@id`; no credential claims.
- [ ] About paragraph and box agree word-for-word on the facts.
- [ ] Copy matches the approved text (tweaks only, no added claims of experience).
- [ ] `llms.txt` regenerated; it now names the editor and the AI disclosure.
- [ ] No overflow 320–1280px; footer/prose link rules hold.
- [ ] Poll production for `rel="author"` on one spoke after deploy; several clean samples.
- [ ] `node scripts/indexnow.mjs`; `CLAUDE.md` updated (component, schema, the sitewide-vs-spoke rule).

## Pre-registered predictions (log at deploy; check +14d and +42d)

| # | Metric | Baseline | Predict +42d | Kill / rethink |
|---|---|---|---|---|
| A1 | Copilot + Google AI-feature citations on the 3 spokes (Bing WMT AI report + GSC AI features) | ~2 combined | ≥ 6 | flat → author box adds nothing for citation; keep for honesty, don't expand |
| A2 | GSC impressions on the 3 spokes vs controls (glossary, resources, home) | spokes 68, controls 67 | spokes ≥ controls, same direction | spokes drop > 30% while controls hold → AI disclosure is being read as scaled-AI signal; **revert the box, keep the byline**, log it |
| A3 | Contact-page visits from the 3 spokes (Plausible) | 0 | > 0 | — |
| C | Controls: glossary, resources, homepage untouched | — | — | — |

If A2 holds and A1 rises, roll the box out sitewide in a follow-up brief; that outcome —
honest AI disclosure + verified sources being citable — is a blueprint finding.

## Needs Franck

1. The photo (`public/img/franck-j.jpg`) or a "use the franckj.com one" go-ahead.
2. Confirm `https://franckj.com/` is the author URL to link.
