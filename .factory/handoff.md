# Bookmark Merge Map — polish 2 handoff

## Status

**PASS.** Every cumulative review finding is fixed, tested, deployed, and rechecked cold on the live site. No known gap remains.

## What changed

- The isolated demo now shows real sample records in its first viewport, including selected state, title, URL, source, and folder.
- Six direct claims and six tagged browser tests close every coverage gap recorded in review 2. A policy test enforces one registry entry to one test tag.
- The Param Factory link uses the valid apex host and identifies itself as external.
- The matching explanation now uses plain user language.
- `/404` and arbitrary unknown routes both return the designed page with HTTP 404.
- Version, offline cache, catalog description, README, demo guide, copy audit, design note, and claim registry are current for v1.2.0.

The existing topographic reconciliation identity, local-first storage model, HTML/CSV workflow, privacy behavior, and static PWA deployment class are unchanged.

## How to run and verify

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Run each exact `test` command in `.factory/claims.json` separately. For deployed verification:

```bash
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh https://bookmark-merge-map.sociobot.in/ <evidence-dir>
```

## Evidence

- Clean clone `/tmp/bookmark-merge-map-final-no2LBR` at product commit `50dc60502ba4814bb04b0444c50bf6eeed2b6335`: install passed with zero vulnerabilities, unit/policy suite 17/17, build passed, and all 19 claim commands passed separately.
- Full local Playwright matrix: 48/48 across desktop and 390 px.
- Full live Playwright matrix after final deployment: 48/48.
- Axe: zero serious or critical findings on home and populated demo. Keyboard, focus, route announcements, reduced motion, 44 px targets, 200% text, and mobile overflow checks pass.
- Local Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.4 s; TBT 30 ms; CLS 0; 77 KiB transfer.
- Production bundles: JavaScript 30.31 KB raw / 10.58 KB gzip; CSS 19.86 KB raw / 5.21 KB gzip; mobile hero 60 KiB.
- Live root and `/?demo=1`: HTTP 200, zero console errors, correct route titles, `lang=en`, one H1, main landmark, complete alt text and button names.
- Live `/privacy` and `/terms`: HTTP 200. Live `/404` and an arbitrary unknown route: HTTP 404 with the designed page.
- Live JavaScript matches the local production artifact byte-for-byte and returns an immutable one-year cache policy.
- Final deployment id: `af3de35f-2244-4860-b424-e5f65c4913c2`.
- Detailed finding map and screenshot paths: `.factory/polish-2.md` and `.factory/evidence/polish-2/`.

## Known gaps and next steps

None. No finding or severity is deferred.
