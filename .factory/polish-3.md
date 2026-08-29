# Perfection loop polish 3

Completed 2026-08-29 against review commit `085ab9c4c8b0b83c479173cf3bdb838e09db33c8` and candidate `77715b79fc00a24a90be2c7b006fe2e1cd97e207`.

## Finding closure map

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept `/demo` and `?demo=1` on `demo:bookmark-merge-map`, separate from the real `bookmark-merge-map` database. Reset and exit clear only demo state. | `@claim:demo-isolation`; `@claim:demo-reset`; [live demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png); live `/demo` and `/?demo=1` returned 200. |
| F-1-2 | Retained the first-screen job, audience, sample-first action, real-file alternative, and three short facts. | `keyboard, mobile layout, reduced motion, and accessibility checks pass`; [live root mobile](evidence/polish-3/live-root/screenshot-mobile.png); live title `Bookmark Merge Map — merge two bookmark exports`. |
| F-1-3 | Expanded the registry to 21 claims and retained the one-source-tag policy. Every registry command passed separately in a clean clone. | `registers every claim once and gives it exactly one tagged browser test`; clean clone `/tmp/bookmark-merge-map-polish3-clean-qTBnsF`; 21/21 exact commands passed. |
| F-1-4 | Retained real home, demo, privacy, terms, and 404 routing; per-route titles/metadata; shared shell; history, focus, and announcement behavior. | `routes set titles, focus headings, support back, and show a designed 404`; `all product routes have metadata, one h1, a shared shell, and working internal links`; live status crawl. |
| F-1-5 | Advanced the offline cache to `bookmark-merge-map-v9` and retained deterministic service-worker control. | `@claim:offline-reload`; clean-clone claim pass; complete live browser pass. |
| F-1-6 | Kept task copy in bookmark language while preserving the topographic visual identity. | `.factory/copy-audit.md`; [live root desktop](evidence/polish-3/live-root/screenshot-desktop.png); banned-word and sentence audit has no flags. |
| F-1-7 | Kept README sentences short and terminology consistent. Added direct evidence for its remaining operational claims. | `.factory/copy-audit.md`; `@claim:node-version`; `@claim:build-output`; all README sentences remain within 22 words. |
| F-1-8 | Retained the concrete root title and compare/review/download description without unsupported safety language. | Route metadata browser test; [live root verification](evidence/polish-3/live-root/verify.json). |
| F-1-9 | Updated the demo guide with URL, sample makeup, namespace, reset/exit behavior, offline procedure, and non-interactive sample URL policy. | `.factory/demo.md`; demo claim suite; live `/?demo=1`. |
| F-2-1 | Retained the populated three-record preview directly after the demo banner, with the first title and URL inside 390×844. | `@claim:demo-first-screen`; `@claim:sample-results`; [live demo mobile](evidence/polish-3/live-demo/screenshot-mobile.png). |
| F-2-2 | Retained the working apex Sociobot link, external-site label, and safe target attributes. | `all product routes have metadata, one h1, a shared shell, and working internal links`; `populated demo URLs are non-interactive and every remaining demo link resolves`; live `https://sociobot.in/` returned 200. |
| F-2-3 | Retained direct claims for sample types, campaign matching, two-export choices, reset, and provenance; added Node and build-output claims. | 21 unique entries in `.factory/claims.json`; 21/21 clean-clone commands; policy test proves exactly one tag per id. |
| F-2-4 | Retained plain campaign-label matching wording instead of URL-component jargon. | `@claim:campaign-label-matching`; `.factory/copy-audit.md`; live root copy check. |
| F-3-1 | Demo destinations are now monospaced text, not anchors. Real imported destinations remain explicitly labeled external links. Added a populated-demo crawl for every remaining anchor. | `populated demo URLs are non-interactive and every remaining demo link resolves`; [live demo desktop](evidence/polish-3/live-demo/screenshot-desktop.png); full live suite passed. |
| F-3-2 | Changed both the SPA and static 404 H1 to `Page not found`; kept the contour illustration and layout. | `routes set titles, focus headings, support back, and show a designed 404`; [live 404 mobile](evidence/polish-3/live-404/screenshot-mobile.png); `/404` and `/this-route-does-not-exist` returned 404 with the revised H1. |
| F-3-3 | Added `engines.node >=20` plus `node-version`; added `build-output` with artifact assertions; removed the unnecessary HTTPS assertion. | `@claim:node-version`; `@claim:build-output`; both passed independently from the clean clone and in the live matrix. |

## Earlier verification regressions retained

| Earlier item | Current evidence |
|---|---|
| Excluded-row contrast | `excluded rows remain legible and all pointer targets meet 44px`; serious/critical axe count 0. |
| Immutable assets and security policies | Live hashed JavaScript returns `public, max-age=31536000, immutable`; CSP, Permissions Policy, `nosniff`, and strict referrer policy are live. |
| CSP-safe offline fallback | `keeps the offline fallback CSP-safe and precaches its stylesheet`; root/demo cold checks have zero console errors. |
| Tracking toggle choice preservation | `@claim:tracking-grouping` passed clean and live. |
| CSV formula neutralization | Six formula-prefix unit cases passed. |
| URL and control touch size | The 44 px target test passed at desktop and 390 px. |

## Verification and release evidence

- Repair commit: `9b5b23f5ba806472aff43420aff752822a296fa6`.
- Clean clone: `/tmp/bookmark-merge-map-polish3-clean-qTBnsF`; `npm ci` found zero vulnerabilities; `npm test` passed 17/17; build passed; every one of 21 claim commands passed separately.
- Complete local browser matrix: 54/54 passed across desktop Chromium and 390×844.
- Complete live browser matrix: `PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e` passed 54/54.
- Accessibility: serious/critical axe count 0; keyboard, route focus, reduced motion, 44 px targets, mobile layout, and 200% text checks passed.
- Privacy/offline: same-origin-only demo flow, isolated demo/real IndexedDB records, and controlled offline reload passed locally and live.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; FCP 1.0 s, LCP 1.6 s, TBT 120 ms, CLS 0, 79 KiB transfer. Report: `.factory/evidence/polish-3/lighthouse-local.json`.
- Bundle: JavaScript 30.43 KB raw / 10.47 KB gzip; CSS 19.86 KB raw / 5.21 KB gzip; mobile hero 60 KiB.
- Deployment: Azure Static Web Apps deployment `d74c7160-63a8-4533-bc98-0258eb3ff6bf` succeeded.
- Exact live bytes: local and live `main-DMqISFLf.js` SHA-256 both `3e9106ee4b9a3601507e9d124f7d527cb6ff5d30a423ffdcaa550deb211ca736`.
- Cold live checks: root and `/?demo=1` each have zero console errors, `lang=en`, one H1, a main landmark, no missing alt text, and no unlabeled buttons.
- Route status check: `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` return 200; `/404` and an arbitrary unknown path return 404 with `Page not found`.

Every finding from reviews 1–3 and every earlier regression named by those reviews is closed. No severity is deferred.
