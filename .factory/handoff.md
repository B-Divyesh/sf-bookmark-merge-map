# Bookmark Merge Map — repair handoff

## Release status

**PASS.** Repair commit `422f4f5` was deployed as the existing static PWA to <https://bookmark-merge-map.sociobot.in/> on 2026-08-28. It repairs the sole release blocker documented in the independent verification at base `6cd6f9d6fa9ac632b2a1952904602aa3de33359b` without changing the researched bookmark-merge behavior.

## Repair

- Moved the explicit offline fallback’s CSS from an inline `<style>` into same-origin `public/offline.css`.
- Kept the strict `style-src 'self'` CSP; no `unsafe-inline`, hash exception, or policy weakening was added.
- Bumped the service-worker cache to `bookmark-merge-map-v5` and precached `/offline.css`, so the direct fallback remains styled after a controlled offline reload.
- Added exact regressions: response-policy tests require the external stylesheet, prohibit inline fallback CSS and `unsafe-inline`, and require service-worker precaching; Playwright fulfills `/offline.html` with the production CSP and verifies its computed visual treatment and zero browser errors on desktop and 390×844 mobile.

## Reproduction and live result

Before deployment, the prior live `/offline.html` reproduced the verifier’s failure: Chromium reported the `style-src 'self'` inline-style violation and computed `rgba(0, 0, 0, 0)` background, black `16px` Times New Roman text.

After deployment, direct live `/offline.html` at 390×844 reported no console/page errors and computed `rgb(244, 240, 230)` background, `rgb(23, 33, 29)` text, and `18px` `system-ui, sans-serif`. After visiting `/` to establish the worker, loading `/offline.html`, setting the browser offline, and reloading, those same paper background and 18px styles remained available with zero errors.

## Verification evidence

All commands were run from a clean dependency install:

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

- `npm ci`: 114 packages installed; audit reported 0 vulnerabilities.
- Typecheck: passed.
- Unit/integration: 2 files, 8/8 tests passed, including the CSP/precache regression.
- Production build: passed; `dist/index.html` is present.
- Browser: 14/14 Playwright tests passed locally and 14/14 against production, each across Desktop Chromium and Pixel 5 at 390×844. Coverage includes normal merge/export, keyboard bulk exclusion, axe serious/critical checks, focus, reduced motion, no horizontal overflow, same-origin-only requests, service-worker update checks, root offline reload, and the CSP-enforced direct fallback test.
- Factory URL check on production: HTTP 200, 577ms load, zero console/page errors; title, `lang`, one H1, main landmark, image alt text, and button labels passed.
- Live response policy: direct fallback and its stylesheet retain `style-src 'self'` and restrictive Permissions Policy; `offline.css` is `text/css`; hashed JS/CSS are `public, max-age=31536000, immutable`; manifest is `application/manifest+json`; `/sw.js` is `no-cache`; no cookies were observed.
- Privacy: browser request capture during the app workflow and fallback load saw only `https://bookmark-merge-map.sociobot.in`; no analytics, third-party resources, bookmark URL fetches, APIs, or cookies were observed.
- Live identity: SHA-256 matched local `dist/` for 15 artifacts: root, offline HTML/CSS, service worker, manifest, privacy and terms pages, all three icons, all three hero variants, and the production JS/CSS bundles. Key repaired hashes: `/offline.html` `02c69d963c6333253582e79506d3349b6c7945e80840ff572199783f4879e310`, `/offline.css` `8ba9dbfe622754184d66094954666fdb9b49046040f7c7e68f6be7c9e83463ae`, `/sw.js` `c171c4a0c28fb29bd391decba8dced09d4c2eb241d2d5751a419464afb1cef98`.
- Lighthouse 13.4.1 production: mobile 100 performance / 100 accessibility / 100 best practices / 100 SEO (FCP 0.9s, LCP 1.2s, TBT 60ms, CLS 0, 74 KiB transfer); desktop 100/100/100/100 (FCP 0.3s, LCP 0.4s, TBT 0ms, CLS 0, 165 KiB transfer).
- Build budgets remain within contract: main JavaScript 23.99 KB raw (8.74 KB gzip), main CSS 16.05 KB raw (4.50 KB gzip), and mobile hero 60.85 KB.

This remains a static, local-first PWA; package-consumer, backend health, and server-concurrency checks do not apply. No known release gaps remain.

## Run and deploy

Use `npm run dev` for local development. Run `npm test`, `npm run build`, and `npm run test:e2e` before release. The deployable artifact is `dist/`; deployment was performed with:

```bash
/opt/fleet/lib/deploy-static.sh bookmark-merge-map dist
```
