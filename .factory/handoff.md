# Bookmark Merge Map — polish 3 handoff

## Status

**PASS.** Every finding in `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` is closed. No known product, accessibility, privacy, offline, or deployment gap remains. `.factory/brief.json` was absent before this repair, so the cumulative reviews and existing design thesis remained the scope sources.

## What changed

- Demo sample URLs are non-interactive text, so the sample exposes no dead destinations. Real imported URLs remain labeled external links.
- Both SPA and static error pages use the plain H1 `Page not found` and retain the product-specific contour treatment.
- `package.json` now declares Node.js 20 or newer. New `node-version` and `build-output` claims prove the remaining README assertions.
- The unneeded HTTPS assertion was removed. The claims registry now contains 21 unique, directly tested claims.
- PWA cache/version identifiers advanced to v9 / v1.3.0, while demo isolation, first-screen copy, route focus, metadata, legal pages, mobile layout, and the visual thesis remain intact.
- The verb-first catalog description is 105 characters: “Merge two bookmark exports, resolve duplicates and conflicts, then download merged HTML and a review CSV.”

## How to verify

```bash
npm ci
npm test
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
```

Run every `test` command in `.factory/claims.json` separately from a clean checkout. The round-3 clean clone was `/tmp/bookmark-merge-map-polish3-clean-qTBnsF` at repair commit `9b5b23f5ba806472aff43420aff752822a296fa6`.

## Exact evidence

- Clean install: 114 packages, zero vulnerabilities.
- Unit/policy: 17/17 passed.
- Production build: passed; `dist/index.html`, `404.html`, service worker, deployment configuration, hashed JavaScript, and CSS present.
- Claim matrix: 21/21 exact registry commands passed independently from the clean clone.
- Browser matrix: 54/54 local and 54/54 live across desktop Chromium and 390×844.
- Accessibility: Playwright axe found zero serious/critical issues; keyboard, focus, reduced motion, 44 px targets, mobile, and 200% text checks passed.
- Privacy/offline: same-origin-only requests, separate demo/real IndexedDB, reset/exit isolation, and offline reload passed locally and live.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.6 s, CLS 0, 79 KiB transfer. See `.factory/evidence/polish-3/lighthouse-local.json`.
- Cold live root/demo: zero console errors, correct title/lang, one H1, main landmark, complete alt text, and labeled buttons. See `.factory/evidence/polish-3/live-root/` and `live-demo/`.
- Live 404: `/404` and `/this-route-does-not-exist` return HTTP 404 with `Page not found`. See `.factory/evidence/polish-3/live-404/screenshot-mobile.png`.
- Live artifact identity: `main-DMqISFLf.js` local/live SHA-256 is `3e9106ee4b9a3601507e9d124f7d527cb6ff5d30a423ffdcaa550deb211ca736`.
- Deployment: Azure Static Web Apps deployment `d74c7160-63a8-4533-bc98-0258eb3ff6bf` succeeded at <https://bookmark-merge-map.sociobot.in/>.

The complete finding-to-change-to-evidence map is in `.factory/polish-3.md`.

## Known gaps and next steps

None. The deployment is current, the repository is buildable, and no review finding is deferred.
