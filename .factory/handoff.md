# Bookmark Merge Map — review 3 handoff

## Status

**FAIL.** This review made no product-code changes. The committed review records one blocking and two minor findings.

## What was checked

- Cold live first reads in fresh 390×844 and 1440×1000 Chromium contexts.
- One-click demo, first-viewport sample visibility, Reset demo, Start for real, isolated IndexedDB storage, same-origin request logging, and offline reload.
- Every earlier review, polish, verification report, prior handoff, claims registry, design document, README, and source implementation. `.factory/brief.json` is absent.
- `npm ci`, `npm test` (17/17), `npm run build`, and each of the 19 exact claim commands from fresh clone `/tmp/bookmark-merge-map-review3-NiUSAK` (all passed).
- Full deployed Playwright matrix: `PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e` (48/48 passed).
- Route/metadata/header checks, live response headers, `verify-url.sh`, and a crawl of every anchor rendered on `/`, `/demo`, `/privacy`, `/terms`, and `/404`.

## Remaining work

1. **Blocking F-3-1:** replace or stop rendering the three dead demo URL anchors (`example.com/guide`, `example.org/archive`, `example.net/archive`); add a populated-result link crawl test.
2. **F-3-2:** change the 404 H1 from “This page is not on the map” to “Page not found.”
3. **F-3-3:** register and test, or remove, the three unlisted README operational claims about Node 20, build output, and HTTPS/service workers.

See `.factory/review-3.md` for exact evidence, all copy counts, and concrete repairs.
