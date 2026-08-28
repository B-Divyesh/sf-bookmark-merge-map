# Bookmark Merge Map — repair handoff

## Release status

**PASS.** All release-blocking findings from verifier report commit `6077fe1595018e8368a0ff7dd500232965d34bab` for candidate `bd801595b4f8589df8d9440c85defb5560358bbb` are repaired in product commit `8971efd`. The exact production `dist/` was deployed to <https://bookmark-merge-map.sociobot.in/> on 2026-08-28 with Azure deployment ID `e8efc85a-cb23-4ef8-939c-9305f5da9c77`.

The researched merge behavior and the existing static, local-first PWA deployment class are unchanged. `.factory/brief.json` is not present, so scope was preserved from the supplied work order and existing product.

## Repairs

1. **Review choices survive tracking-grouping changes.** Decisions now use a stable key containing the canonical row ID and its source membership. This preserves inclusion, title, and folder choices for unchanged rows while preventing a grouped route from colliding with one of its exact variants. Decisions for both modes remain in IndexedDB, so a grouped choice returns after ungrouping and regrouping. A live-region message tells the user to review only newly grouped or split routes. Replacing imports, loading samples, and confirmed reset clear stale decision history.
2. **Review CSV neutralizes spreadsheet formulas.** Every CSV cell beginning with `=`, `+`, `-`, `@`, tab, or carriage return is prefixed with an apostrophe before CSV quoting. The original bookmark-controlled title/folder remains readable for audit, but formula-capable spreadsheet software receives text rather than executable input. Carriage returns are now also quoted correctly.
3. **Result URL targets meet the mobile contract.** Interactive result URLs have a measured minimum height of 44 CSS px and remain full-width, keyboard-focusable links.
4. **Installed clients receive the repair.** The service-worker cache advanced from `bookmark-merge-map-v5` to `bookmark-merge-map-v6`, preserving the existing update path and retiring old caches on activation.

## Exact regression coverage

- `tests/e2e/app.spec.ts` reproduces the verifier workflow with a clean URL plus tracked variant: choose the alternate title/folder, exclude an unrelated route, reload from IndexedDB, turn grouping off and on, and assert every applicable decision remains intact on desktop Chromium and 390×844 mobile.
- The same browser suite measures every populated result URL and requires both dimensions to be at least 44 CSS px.
- `tests/bookmarks.test.ts` covers all six spreadsheet prefixes in both selected title and folder columns.
- `tests/deployment.test.ts` requires the v6 repaired release cache.

## Clean verification evidence

Run from a final `npm ci` (114 packages, 115 audited, 0 vulnerabilities):

```bash
npm ci
npm run typecheck
npm test
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
```

- TypeScript: passed. No lint script or lint configuration exists; typecheck is the repository's static source gate.
- Unit/integration and response policy: 2 files, 15/15 tests passed.
- Browser: 18/18 passed locally and 18/18 passed live across Desktop Chromium and Pixel 5 at 390×844. Coverage includes merge/download, the exact decision-state regression, target sizing, IndexedDB reload, keyboard bulk actions, visible focus, axe before/after results, reduced motion, horizontal overflow, same-origin requests, service-worker registration/update check, controlled root offline reload, and CSP-enforced fallback styling.
- Visual review: populated desktop 1440×1000 and mobile 390×844 full pages retain the documented topographic hierarchy, readable stacking, and complete controls.
- Factory live check: HTTP 200 in 564 ms, zero console/page errors, correct title and `lang`, exactly one H1, main landmark present, zero missing image alt text, and zero unlabeled buttons.
- Privacy: no analytics, third-party scripts/fonts, bookmark fetches, API calls, cookies, accounts, or payment flow were introduced. Processing and recovery remain local in the browser.
- PWA/offline/update: root reload and explicit fallback pass offline; fallback remains styled under strict CSP; manifest/icons remain valid; worker cache is `bookmark-merge-map-v6`, `skipWaiting()`/`clients.claim()` remain active, and `/sw.js` is revalidated with `no-cache`.
- Response policy: HTTP redirects to HTTPS; live responses retain HSTS, `nosniff`, strict-origin referrer policy, same-origin CSP with `frame-ancestors 'none'` and `object-src 'none'`, and restrictive Permissions Policy. Hashed assets are immutable; manifest and worker MIME/cache headers are correct.
- Live identity: all 20 publicly served `dist/` artifacts matched local SHA-256. Key hashes: root `bfbed5c3632a62b40d53064dc6208b1e9d0cc19a7ae702c842d44228fe014f45`; JS `ef7a49c6a268a755a5a63239ba0c9f9ae4962c0762ef2c003ccb40aab01b4ec6`; CSS `c4bf9b90633ca60ca6cd2984f2f7f222001f6d030df7a2e7cb5feaa73e3a88b1`; worker `bb0fd55b6f13cfe0effe2db808f5e6c6f08f73e0544731bd76c00065101d0eeb`.
- Production bundle: main JS 24.40 KB raw / 8.92 KB gzip; main CSS 16.11 KB raw / 4.50 KB gzip; no downloaded fonts; mobile hero 60.85 KB. Budgets pass.
- Live Lighthouse 13.4.1: mobile 100 performance / 100 accessibility / 100 best practices / 100 SEO (FCP 0.9s, LCP 1.4s, TBT 10ms, CLS 0, 75 KiB); desktop 100/100/100/100 (FCP 0.2s, LCP 0.4s, TBT 10ms, CLS 0, 166 KiB).

This artifact is a static PWA, not a library, CLI, or backend; package-consumer, server health/concurrency, and backend persistence checks do not apply. No known release gaps remain.

## Run and deploy

Use `npm run dev` for development. The deployable artifact is `dist/` with `index.html` at its root. Deployment used:

```bash
/opt/fleet/lib/deploy-static.sh bookmark-merge-map dist
```
