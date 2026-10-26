# Zone pages v2: +42-day verdict

Written 2026-10-26 by the Supervisor (due 2026-10-26). Deploy 2026-09-14. Brief: `briefs/2026-09-14-zone-pages-v2.md`. Previous read: `docs/seo/2026-09-28-zone-v2-check.md`.

Source: Search Console API (sc-domain, Web unless stated), pulled 2026-10-26. Windows (GSC lags ~2 days): before 2026-08-31..09-13 (14d), after 2026-09-15..09-28 (14d), latest 2026-10-12..10-24 (13d). The brief's baselines are 46-day totals, so the 14d/13d columns are the like-for-like read; the brief's absolute targets (250, 100) cannot be compared directly and are scored on the trend.

| # | Metric | Before | After | Latest 13d | Verdict at +42d |
|---|---|---|---|---|---|
| P1 | Image impressions on zone pages | 1 | 0 | 2,257 (1 click) | Hit. Kill rule (still 0) not triggered; target of 100 beaten by far. |
| P2 | Sub-zone (a/b) query impressions, avg position | 130, pos 66.0 | 68, pos 60.4 | 75, pos 53.6 | Miss on volume (predicted +50%, 130 to 75 is -42%). Position gain 12 places meets the 10-place half. Flat-or-down volume at +42d: the brief's kill rule points to dedicated sub-zone pages. |
| P3 | AI features impressions per day | n/a | n/a | n/a | Not measurable through the API. Needs the Search Console screen. |
| P4 | Month-phrased query impressions | 33 | 10 | 7 | Miss. Down, not toward 250. Kill rule (flat) applies: anchors do not get their own landing. |
| P5 | Zone pages, US mobile, avg position | 63.8 (8 impr) | 54.8 (13) | 50.8 (14) | Miss. Target was <= 12 from a baseline of ~16; the 14-day impression counts are too small to read, but nowhere near 12. No worsening either. |
| C1 | Control: glossary + raised-beds impressions | 9 + 7 | 5 + 4 | 12 + 8 | Controls recovered to the "before" level. |
| P6 | Plausible entries on zone pages from Google | 5 | 3 | not pulled | Not scored: Plausible is cancelled, and the counter has no referrer series for this window. |

Zone pages overall (web): 677 impressions, 4 clicks before; 334 / 3 after; 695 / 7 in the latest 13 days. Whole site, web: 739 / 4, 371 / 3, 738 / 9.

## Reading

- The only clear win is images: the Gantt PNGs are now indexed and shown, 2,257 impressions in 13 days, from zero. It produced 1 click, so the value so far is visibility, not traffic.
- Web impressions on zone pages are back to the pre-update level (695 vs 677) after the autumn dip, with clicks up from 4 to 7. Controls moved the same way (C1), so the web recovery cannot be attributed to the update. Interpretation, not a measurement.
- P2 and P4 missed and P5 missed. Calibration log entry: the update did not capture sub-zone or month-phrased demand within 42 days; those predictions were too optimistic.
- Per the brief's kill rule for P2, the next brief is dedicated `/zone-7b/`-style pages built around distinct city frost tables. That is a decision for the analyst project and Franck; nothing was built or edited here.
- The measurement window is now closed, so control pages may be edited again.
