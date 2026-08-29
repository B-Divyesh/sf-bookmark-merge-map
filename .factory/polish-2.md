# Perfection loop polish 2

Completed 2026-08-29 against review commit `27305e3ec871ed9ea7b410bf25af7023796c34eb`.

## Finding closure map

| Finding | Change made | Evidence |
|---|---|---|
| F-2-1 | Added a compact live preview immediately below the demo banner. It shows shared, needs-review, and phone-only records with selected state, title, original URL, source, and folder. The full review remains below. | `@claim:demo-first-screen` measures the title and URL inside 390×844; `@claim:sample-results`; [live mobile demo](evidence/polish-2/live-demo/screenshot-mobile.png); live `/?demo=1` title `Demo — Bookmark Merge Map`. |
| F-2-2 | Changed the factory URL from the invalid `www` host to `https://sociobot.in/`, added safe external-link attributes, a visible arrow, and the accessible label “opens sociobot.in”. Updated the static 404 footer too. | `all product routes have metadata, one h1, a shared shell, and working internal links` asserts the exact URL and HTTP success; cold live `https://sociobot.in/` returned 200. |
| F-2-3 | Expanded `.factory/claims.json` from 13 to 19 direct claims. Added separate tests for first-screen demo entry, sample result types, campaign-label matching, two-export title/folder selection, demo reset, and artwork provenance. Added a policy test proving every registry id has exactly one source tag. | All 19 exact manifest commands passed separately in clean clone `/tmp/bookmark-merge-map-final-no2LBR` at `50dc605`; `registers every claim once and gives it exactly one tagged browser test`; final live suite 48/48. |
| F-2-4 | Replaced URL-component jargon with “Treat links that differ only by common campaign labels as the same bookmark.” | `@claim:campaign-label-matching`; `.factory/copy-audit.md`; cold live root copy check. |
| F-1-1 | Retained real `/demo` and `?demo=1` entry, separate `demo:bookmark-merge-map` IndexedDB, persistent banner, Reset demo, and Start for real. Added direct reset and first-screen tests. | `@claim:demo-isolation`, `@claim:demo-reset`, `?demo=1 opens the isolated sample result and its controls directly`; final live 48/48; [live demo](evidence/polish-2/live-demo/screenshot-desktop.png). |
| F-1-2 | Retained the concrete first screen: “Merge two bookmark exports,” the browser/phone audience, sample-first action, real-file alternative, and three facts. | `keyboard, mobile layout, reduced motion, and accessibility checks pass`; [live home mobile](evidence/polish-2/live-root/screenshot-mobile.png); live root verify title is concrete. |
| F-1-3 | Preserved the original 13 claim tests and added six missing direct claims. Registry integrity is now enforced in the unit suite. | Clean clone: 17/17 unit/policy checks, build passed, 19/19 claim commands passed; final live suite 48/48. |
| F-1-4 | Preserved real home/demo/privacy/terms routes, per-route titles and metadata, shared shell, focus/announcement/history handling, and designed 404. Enforced HTTP 404 for both `/404` and arbitrary unknown paths without combining rewrite and status. | `routes set titles, focus headings, support back, and show a designed 404`; route crawl; live `/demo`, `/privacy`, `/terms` = 200; live `/404` and `/this-route-does-not-exist` = 404 with the designed H1. |
| F-1-5 | Advanced the offline cache to `bookmark-merge-map-v8` and retained deterministic service-worker control and offline readiness. | `@claim:offline-reload` passed in both clean clones and the final live suite; `advances the offline cache for this repaired release`. |
| F-1-6 | Kept all task labels in bookmark language and removed the remaining matching jargon. The visual topographic identity remains in layout and materials, not in instructions. | `.factory/copy-audit.md`; banned-word review; live screenshots. |
| F-1-7 | Updated README demo, matching, verification, and artwork language. Every README sentence remains at most 14 words. | `.factory/copy-audit.md`; direct `merge-two-exports`, `demo-first-screen`, `demo-reset`, and matching claims. |
| F-1-8 | Retained `Bookmark Merge Map — merge two bookmark exports` and the concrete compare/review/download description. | Route metadata browser test; `.factory/evidence/polish-2/live-root/verify.json`; live root title check. |
| F-1-9 | Updated `.factory/demo.md` with the first-screen fields while retaining URL, sample makeup, namespaces, reset, exit, and offline procedure. | `.factory/demo.md`; demo claim suite; live `/?demo=1`. |

## Earlier verification regression map

| Earlier finding | Retained repair and evidence |
|---|---|
| Excluded-row contrast | No opacity reduction; `excluded rows remain legible and all pointer targets meet 44px`; axe serious/critical count 0. |
| Immutable assets and response policies | Live main JavaScript returns `public, max-age=31536000, immutable`; CSP, Permissions Policy, `nosniff`, and strict referrer policy are live. |
| CSP-blocked offline fallback | Same-origin `/offline.css` remains precached; `keeps the offline fallback CSP-safe and precaches its stylesheet`. |
| Tracking toggle discarded choices | `@claim:tracking-grouping` passed clean and live; existing decisions remain applied. |
| CSV formula injection | Six formula-leading prefixes remain neutralized by unit tests. |
| Result URL touch target | `excluded rows remain legible and all pointer targets meet 44px` passed at desktop and 390 px. |

## Verification and release evidence

- Final product commit checked from a clean clone: `50dc60502ba4814bb04b0444c50bf6eeed2b6335`.
- Clean clone `/tmp/bookmark-merge-map-final-no2LBR`: `npm ci` found zero vulnerabilities; unit/policy suite 17/17; production build passed; every one of 19 manifest commands passed separately.
- Local complete suite: 48/48 across Chromium desktop and 390×844; final live complete suite: 48/48.
- Accessibility: Playwright axe serious/critical count 0 on home and populated demo; keyboard, focus, reduced motion, 44 px targets, 390 px layout, and 200% text checks passed.
- Privacy/offline: same-origin-only demo flow, separate demo/real records, deterministic controlled offline reload, no account/payment flow.
- Performance: local mobile Lighthouse 100 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 0.9 s, LCP 1.4 s, TBT 30 ms, CLS 0, 77 KiB transfer. Report: `.factory/evidence/polish-2/lighthouse-local.json`.
- Bundle: JavaScript 30.31 KB raw / 10.58 KB gzip; CSS 19.86 KB raw / 5.21 KB gzip; mobile hero 60 KiB.
- Deployment: Azure Static Web Apps deployment `af3de35f-2244-4860-b424-e5f65c4913c2` succeeded.
- Live bytes: `main-C87KjegH.js` local and live SHA-256 both `920973b1aa125c5e818f0f91e4a82e5622fcb74adc2a8e60b622401e32ef9071`.
- Cold live verification: root and `/?demo=1` each have zero console errors, `lang=en`, one H1, a main landmark, no missing alt text, and no unlabeled buttons. Reports and screenshots are under `.factory/evidence/polish-2/live-root/` and `live-demo/`.

Every finding in review 1, polish 1, review 2, and the earlier verification reports is closed. No severity is deferred.
