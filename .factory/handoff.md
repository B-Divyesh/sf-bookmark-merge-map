# Bookmark Merge Map — review 1 handoff

## Release status: FAIL

This review added `.factory/review-1.md`; it did not change product code.

## What was verified

- Cold live-site visits in separate desktop and 390px browser contexts.
- The live `?demo=1` path, sample flow, IndexedDB persistence, privacy request log, links, metadata, routes, and prior verification findings.
- `npm ci`, `npm test` (15/15 pass), and `npm run build` (passes and produces `dist/`).
- The live Playwright suite: 17/18 passed; its clean-context offline-control test failed, so the suite does not meet its required gate.

## Blocking gaps

- The sample flow is not isolated: it uses the real IndexedDB key and overwrites the recoverable real project; `?demo=1` is empty and lacks the required demo banner/reset/start-real controls.
- The hero is metaphorical and hides the sample path rather than naming the job, audience, and first action.
- `.factory/claims.json` and `.factory/demo.md` are missing; visitor-facing claims therefore have no tagged sandbox tests.
- `/demo` and unknown routes are root-app fallbacks rather than real demo/404 routes, and required route metadata/shell pieces are missing.

## How to verify after repair

```bash
npm ci
npm test
npm run build
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
```

Then follow every scenario and claim checklist in `.factory/review-1.md`, especially the real-data → demo → reset/start-real storage-isolation check.
