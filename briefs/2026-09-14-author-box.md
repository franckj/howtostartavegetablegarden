# BRIEF — Author box: named editor (test on 3 spokes)

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
one, honestly: an editor with a real biography, not a gardener, and no invented expertise.

Franck's decision (2026-09-14, revised same day): **no mention of AI or Claude anywhere on
the site.** The credibility story is verified sources + visible corrections + a real person.

## Risk

Low. With the AI disclosure removed, the Aug 2026 spam-update exposure is gone. Remaining
risk is rule 3 (no claims of growing experience): the childhood potager is biography, not a
credential, and the copy says so explicitly. Do not let edits drift it toward "I know
gardening."

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
`Edited by Franck J · Every number sourced from extension services and NOAA · Last updated {dateModified}`

**Author box copy (approved 2026-09-14, revised):**

> **Edited by Franck J**
>
> I'm not a gardener. I grew up in the French countryside with a potager out back, and that's
> the extent of it — I build websites for a living. This site exists because the information
> beginners need is public but scattered across dozens of extension-service and NOAA
> publications, in formats nobody can use. So it's gathered here, reconciled, checked against
> a named source for every number, and turned into something you can act on, like the zone
> planting calendar. When something is wrong, the correction goes on the About page.
>
> If you spot an error, have a question, or want a tool like this built for your own data,
> write to me. I'll answer.

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

**Childhood photo:** Franck may supply a real photo of the family potager. It goes **here on
About**, beside the paragraph, with a one-line caption ("The potager, {year}") — not in the
author box, which keeps the current headshot so the face matches franckj.com and the `Person`
schema. File: `public/img/potager-{year}.jpg`, `loading="lazy"`, descriptive alt. Optional;
ship without it if not provided.

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
- [ ] `llms.txt` regenerated; it now names the editor. **No AI/Claude mention anywhere** — grep
      the built `dist/` for "Claude" and "AI assistant" and require zero hits.
- [ ] No overflow 320–1280px; footer/prose link rules hold.
- [ ] Poll production for `rel="author"` on one spoke after deploy; several clean samples.
- [ ] `node scripts/indexnow.mjs`; `CLAUDE.md` updated (component, schema, the sitewide-vs-spoke rule).

## Pre-registered predictions (log at deploy; check +14d and +42d)

| # | Metric | Baseline | Predict +42d | Kill / rethink |
|---|---|---|---|---|
| A1 | Copilot + Google AI-feature citations on the 3 spokes (Bing WMT AI report + GSC AI features) | ~2 combined | ≥ 6 | flat → author box adds nothing for citation; keep for honesty, don't expand |
| A2 | GSC impressions on the 3 spokes vs controls (glossary, resources, home) | spokes 68, controls 67 | spokes ≥ controls, same direction | spokes drop > 30% while controls hold → investigate; revert the box, keep the byline, log it |
| A3 | Contact-page visits from the 3 spokes (Plausible) | 0 | > 0 | — |
| C | Controls: glossary, resources, homepage untouched | — | — | — |

If A2 holds and A1 rises, roll the box out sitewide in a follow-up brief.

## Needs Franck

1. The headshot (`public/img/franck-j.jpg`) or a "use the franckj.com one" go-ahead.
2. Optional: the childhood potager photo + year, for About.
3. Confirm `https://franckj.com/` is the author URL to link.
