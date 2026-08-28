# Bookmark Merge Map — polish 1 handoff

## Release status

PASS. Every blocking and minor finding in `.factory/review-1.md` is repaired and mapped in `.factory/polish-1.md`. No earlier review or polish file exists. The prior regression items quoted by review 1 remain covered.

Live product: <https://bookmark-merge-map.sociobot.in/>

Direct demo: <https://bookmark-merge-map.sociobot.in/demo> and <https://bookmark-merge-map.sociobot.in/?demo=1>

## What changed

- Replaced the first screen with a job headline, audience sentence, one-click sample action, real import alternative, and three tested facts.
- Added a real demo sandbox with immediate sample results, persistent banner, reset/exit controls, and a separate IndexedDB database.
- Added 13 claim records and one isolated Playwright test for each claim.
- Added real route views, per-route titles and metadata, route focus/announcement, back support, a shared shell, and a styled 404 with a true 404 response.
- Rewrote metaphorical labels and dense README text in plain bookmark language.
- Added social-card art, SVG/touch icons, canonical/Open Graph/Twitter metadata, sitemap routes, and deployment security headers.
- Preserved the field-map palette, contour texture, generated art, condensed type, and restrained motion.

## Verification

Run locally:

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Observed evidence on 2026-08-28:

- `npm ci`: 115 packages audited, zero vulnerabilities.
- `npm test`: 16/16 unit and deployment-policy tests passed.
- `npm run build`: passed; `dist/index.html` exists.
- Bundle: 10.36 KB gzip entry JS and 4.95 KB gzip CSS.
- `npm run test:e2e`: 36/36 passed on desktop Chromium and 390×844.
- Clean clone `/tmp/bookmark-merge-map-clean-v3xGTi`, commit `015136bd1fab30e6a732304c447b2103b1b1f924`: all 13 commands in `.factory/claims.json` passed separately.
- Playwright axe: zero serious or critical violations on the empty root and populated demo at both viewports.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.7 s; CLS 0; 78 KiB transfer.
- Privacy: the whole demo filter/export flow requested only the application origin.
- Offline: a controlled `/demo` reloaded with five results after `context.setOffline(true)`.
- Live `verify-url.sh` on `/` and `/demo`: HTTPS 200, zero console errors, one H1, `lang=en`, main landmark, all image alt attributes present.
- Live route status: `/demo`, `/privacy`, `/terms` returned 200; an unknown route returned 404 with the styled page.
- Live full Playwright matrix: 36/36 passed at <https://bookmark-merge-map.sociobot.in>.

Evidence files:

- `.factory/evidence/live-root/verify.json`
- `.factory/evidence/live-root/screenshot-desktop.png`
- `.factory/evidence/live-root/screenshot-mobile.png`
- `.factory/evidence/live-demo/verify.json`
- `.factory/evidence/live-demo/screenshot-desktop.png`
- `.factory/evidence/live-demo/screenshot-mobile.png`
- `.factory/evidence/lighthouse-local.json`

## Deployment

- Source commits: `015136b`, `e793e5c`, `1adf38f`.
- Pushed branch: `origin/main`.
- Azure Static Web Apps deployment: `e1271b9d-4226-4eba-b6c4-117e0d2ca534`.
- Deployed with `/opt/fleet/lib/deploy-static.sh bookmark-merge-map dist`.
- Live security headers include CSP, Permissions Policy, nosniff, HSTS, and strict-origin referrer policy.

## Known gaps and next steps

None for this work order. All review findings, required claims, routes, mobile states, offline behavior, accessibility checks, and deployment checks pass.
