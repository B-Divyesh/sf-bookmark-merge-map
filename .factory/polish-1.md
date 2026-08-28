# Perfection loop polish 1

Completed 2026-08-28 against review commit `183e9e254a3d62d9bf64c987e64f9c846fcf713e`.

## Finding closure map

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Added direct `/demo` and `?demo=1` entry. Seeded the five-result comparison immediately. Added the persistent required banner, Reset demo, and Start for real. Demo uses `demo:bookmark-merge-map`; real work remains in `bookmark-merge-map`. Exiting clears only demo data. | `@claim:demo-isolation demo changes never alter the real project`; `?demo=1 opens the isolated sample result and its controls directly`; [local demo desktop](evidence/local-demo-desktop.png); [live demo mobile](evidence/live-demo/screenshot-mobile.png); live `/demo` returned 200. |
| F-1-2 | Replaced the metaphorical hero with “Merge two bookmark exports,” named the browser/phone mismatch, put Try it with sample data first, placed the real file action beside it, and added three short facts. | `keyboard, mobile layout, reduced motion, and accessibility checks pass`; [local home mobile](evidence/local-home-mobile.png); [live home mobile](evidence/live-root/screenshot-mobile.png); live cold title is `Bookmark Merge Map — merge two bookmark exports`. |
| F-1-3 | Added `.factory/claims.json` with 13 reliance-bearing claims and exactly one tagged browser test per claim. Added observable privacy, offline, export-content, invalid-input, original-record, grouping, recovery, parsing, default-selection, and scope checks. | All 13 manifest commands passed separately in clean clone `/tmp/bookmark-merge-map-clean-v3xGTi` at `015136b`; full local and live browser suites passed. |
| F-1-4 | Implemented real SPA views for demo, privacy, terms, and in-app unknown paths. Added shared header/footer/skip link, route titles, canonical/OG/Twitter metadata, 1200×630 social art, SVG favicon, touch icon, History API focus/announcement, and back handling. Added static `404.html` plus Azure 404 response override. | `routes set titles, focus headings, support back, and show a designed 404`; `all product routes have metadata, one h1, a shared shell, and working internal links`; live `/demo`, `/privacy`, `/terms` = 200; live unknown route = 404. |
| F-1-5 | Advanced the service-worker cache to `bookmark-merge-map-v7`, precached all real routes, exposed accurate preparing/ready/offline states, and made the claim wait for control before the offline reload. | `@claim:offline-reload demo reloads offline after an online visit` passed in the clean clone, complete local matrix, and complete live matrix. |
| F-1-6 | Rewrote import, comparison, result, method, and download labels in bookmark language. Removed dry-run, terrain, survey, route, landmark, and proof metaphors from visitor copy while keeping the topographic visual system. | `.factory/copy-audit.md`; live and local screenshots above; banned-word scan found no banned visitor copy. |
| F-1-7 | Rewrote README around one term, “bookmark export,” split long sentences, documented `/demo`, and removed unsafe sample instructions. | `.factory/copy-audit.md`; README sentences are at most 18 words; `@claim:demo-isolation`. |
| F-1-8 | Set the root title to `Bookmark Merge Map — merge two bookmark exports` and the description to the concrete compare/review/download job. Removed unsupported safety wording from metadata. | `all product routes have metadata, one h1, a shared shell, and working internal links`; `.factory/evidence/live-root/verify.json`. |
| F-1-9 | Added `.factory/demo.md` with URLs, sample counts/types, namespace, reset/exit behavior, and offline procedure. | `.factory/demo.md`; `@claim:demo-isolation`; `@claim:offline-reload`. |

## Earlier regression findings retained

| Earlier item recorded in review 1 | Evidence still passing |
|---|---|
| Excluded-row contrast | `excluded rows remain legible and all pointer targets meet 44px`; Playwright axe serious/critical count 0. |
| Immutable assets and security policies | `production response policy`; live CSP, Permissions Policy, nosniff, and Referrer Policy headers checked on 2026-08-28. |
| Offline fallback CSP | `keeps the offline fallback CSP-safe and precaches its stylesheet`. |
| Tracking toggle preserved choices | `@claim:tracking-grouping`; existing unit reconciliation tests. |
| CSV formula injection | Six formula-prefix unit cases pass in `tests/bookmarks.test.ts`. |
| URL and control target size | `excluded rows remain legible and all pointer targets meet 44px` passes at desktop and 390 px. |

## Release evidence

- Local: `npm test` → 16/16; `npm run build` → success; `npm run test:e2e` → 36/36.
- Clean clone: 13/13 claim commands passed individually at `015136bd1fab30e6a732304c447b2103b1b1f924`.
- Performance: Lighthouse mobile 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.7 s; CLS 0; transfer 78 KiB. Report: `.factory/evidence/lighthouse-local.json`.
- Bundle: entry JS 29.03 KB / 10.36 KB gzip; CSS 18.52 KB / 4.95 KB gzip; mobile hero 60.85 KB.
- Live deployment: Azure Static Web Apps deployment `e1271b9d-4226-4eba-b6c4-117e0d2ca534` succeeded.
- Live cold verification: `verify-url.sh` found zero console errors, one H1, `lang=en`, a main landmark, and no missing alt text on `/` and `/demo`.
- Live full suite: 36/36 passed against `https://bookmark-merge-map.sociobot.in` on desktop and 390 px.

Every review finding and every earlier regression named by the review is closed. No severity remains deferred.
