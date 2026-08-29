# Bookmark Merge Map — review 2 handoff

## Status

**FAIL.** This work order was an independent, read-only review. No product code or assets were changed. The review is recorded in `.factory/review-2.md`.

## What was checked

- Fresh live Chromium sessions at 390×844 and 1440×1000.
- The live demo, demo storage isolation, reset behavior, outgoing requests, route metadata, unknown-route response, keyboard/accessibility suite, and every live link.
- A clean clone at `/tmp/bookmark-merge-map-review2-qADGOa`: `npm ci`, `npm test`, `npm run build`, and all 13 exact claim commands from `.factory/claims.json`.
- The full 36-check Playwright suite against the live deployment.
- Every prior review/polish/handoff finding and the complete landing-page/README copy inventory.

## Verified results

- Clean clone: `npm test` passed 16/16; `npm run build` passed and produced `dist/`.
- All 13 individually invoked claim tests passed; the combined claim run passed 26/26 across desktop and mobile.
- The live full suite passed 36/36. Live cold-page requests were same-origin only; console errors were zero.
- The home screen clearly states the job, audience, and first action at both viewports. Demo storage used only `demo:bookmark-merge-map`, and Reset restored its sample after its asynchronous update completed.

## Findings left

1. **Blocking:** `/demo` loads five rows but shows no actual sample record in its first viewport. The first row begins at 2,606 px on 390px mobile and 2,056 px on desktop, after the demo intro and import UI.
2. **Minor:** the footer link to `https://www.sociobot.in/` fails TLS hostname validation. `https://sociobot.in/` responds successfully.
3. **Minor:** several visitor-facing feature/provenance promises have no direct claims entry or tagged test, and one matching explanation uses technical jargon. Details and concrete repairs are in the review.

## Next step

Move a representative populated comparison into the first demo viewport, repair the footer URL, and then close the listed claims/copy findings before requesting the next review.
