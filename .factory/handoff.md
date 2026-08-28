# Bookmark Merge Map — build handoff

## Independent verification 1 (2026-08-28) — FAIL

Candidate `3ef87e03fa878e0df32fce2ba33d34d228b9bf16` at https://bookmark-merge-map.sociobot.in/ was independently verified from a clean checkout. **Do not release as accepted:** excluding a review row applies `opacity: .5` to the entire row and produces axe serious color-contrast failures (effective contrast as low as 2.10:1). The complete evidence, live byte-parity hashes, test results, header/cache findings, PWA/offline results, and required remediation are in `.factory/verification-1.md`.

The prior committed unit/build/e2e gates do pass, and the live deployment matches the candidate's checked artifacts, so this is a product accessibility failure rather than a deployment mismatch. A secondary deployment finding is that content-hashed JS/CSS are served with only `max-age=30, must-revalidate`, not long-lived immutable caching.

## Shipped

- Complete local-first reconciliation flow for two Netscape-format browser bookmark HTML exports.
- Recursive folder parsing; URL normalization for casing, default ports, fragments, query order, and optional known tracking parameters.
- Dry-run report for shared URLs, A-only/B-only omissions, duplicates, folder/title differences, and same-title/different-URL conflicts.
- Loss-aware defaults: every distinct canonical destination stays included; users can change the exported title/folder or explicitly exclude a route.
- Browser-ready merged HTML plus review CSV with status, source, copy count, canonical/original URL, folder, notes, and inclusion decision.
- IndexedDB recovery of both source exports, tracking setting, and review choices. “Start over” deletes the working copy only after confirmation.
- Installable PWA with manifest, 192/512/maskable icons, versioned service-worker cache, offline navigation fallback, update messaging, and explicit online/offline state.
- Responsive 390px layout, drag/drop and keyboard-operable inputs, legal pages, no accounts/analytics/runtime third parties.
- Original generated topographic hero and hand-authored icon system. Prompts, review, palette, typography, motion, and provenance are in `.factory/design.md` and `assets/src/`.

## Verification (2026-08-28, local production preview)

- `npm test`: 4/4 unit tests passed.
- `npm run build`: passed; output at `dist/index.html`.
- `npm run test:e2e`: 6/6 tests passed across desktop Chromium and Pixel 5 profiles, covering sample reconciliation, both downloads, one-h1 structure, a true offline reload, and axe checks.
- Axe via Playwright: zero serious or critical violations before and after reconciliation.
- Console/page error smoke test at 1440px and 390px: zero errors; no horizontal overflow.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s, LCP 1.7s, total blocking time 100ms, CLS 0.
- Initial production bundle: 23.90 KB JS and 15.66 KB CSS uncompressed (8.71 KB and 4.43 KB gzip). Mobile hero WebP: 60 KB; default 960px hero: 152 KB.
- `npm audit --omit=dev`: zero production vulnerabilities. Full dependency audit also reports zero vulnerabilities after toolchain updates.

## Run and deploy

```bash
npm install
npm test
npm run build
npm run test:e2e
```

Deploy `dist/` as the static root over HTTPS. No environment variables or backend are required.

## Known gaps / next steps

- The parser preserves bookmark URL, title, folder path, and add date. Browser-specific favicon, tags, descriptions, and custom attributes are not carried into the merged HTML.
- “Likely conflict” matching is intentionally conservative: exact normalized titles across different URLs. The app does not fetch pages or infer semantic similarity.
- Very large inputs render review rows in batches of 80, but parsing and reconciliation still run on the main thread. A Web Worker would be the next step for unusually large (tens of thousands of links) exports.
- Installability/offline behavior is tested in Chromium. Safari and Firefox accept the exported HTML, but their platform-specific PWA installation UX was not separately automated.
