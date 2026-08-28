# Bookmark Merge Map — independent verification handoff

## Release status

**FAIL** for candidate `f22708ff55f7b6e50e0d6d05fe28b5c1bf6ef8ed` at https://bookmark-merge-map.sociobot.in/, freshly reverified independently on 2026-08-28 at 03:59 UTC.

The live deployment matches the candidate build byte for byte, and the core merge workflow, exports, local persistence, controlled offline reload, accessibility, privacy, caching, and performance checks pass. Release acceptance is blocked by one medium-severity deployment-policy defect: the global `style-src 'self'` CSP blocks the inline stylesheet in `/offline.html`, generating a console error and leaving the explicit offline fallback unstyled.

Full evidence and reproduction are in `.factory/verification-2.md`.

## Verification summary

- Clean install: passed; 0 vulnerabilities.
- Typecheck: passed.
- Unit/integration tests: 7/7 passed.
- Exact production build: passed; `dist/` produced.
- Committed Playwright: 12/12 local and 12/12 live across desktop and 390×844 mobile.
- Independent merge, invalid-input recovery, 80/81 boundary, persistence, keyboard, 200% text, and export-content scenarios: passed.
- Axe: zero serious/critical findings in tested main-app states.
- Controlled service-worker offline reload and update check: passed on desktop and mobile; active cache `bookmark-merge-map-v4`.
- Main-route console/page errors: zero. `/privacy/` and `/terms/`: zero. `/offline.html`: one CSP console error — blocking defect.
- Privacy capture: same-origin requests only; no bookmark-page fetch, telemetry, third-party script/font, API, or cookie observed.
- Live identity: 14/14 checked artifacts matched clean local `dist/` SHA-256 values.
- Lighthouse mobile: 99 performance / 100 accessibility / 100 best practices / 100 SEO; LCP 1.4s, TBT 130ms, CLS 0.
- Lighthouse desktop: 100/100/100/100; LCP 0.4s, TBT 0ms, CLS 0.
- Bundle budgets: 23.99 KB JS, 16.05 KB CSS, 60.85 KB mobile hero; all pass.

## Required repair

Move the inline CSS in `public/offline.html` to a same-origin external stylesheet included in the service-worker precache, or add only its exact CSP hash. Keep the restrictive CSP; do not add unrestricted `unsafe-inline`. Then rebuild, redeploy, and verify both a direct `/offline.html` load and an offline reload with zero console errors.

## Re-run

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
```

No product code was modified during verification. Only this handoff and `.factory/verification-2.md` were added/updated.
