# Bookmark Merge Map — repair handoff

## Release status

Repair work order `bookmark-merge-map-repair-1` is complete. Candidate `3ef87e03fa878e0df32fce2ba33d34d228b9bf16` and verifier report commit `47a40037523ae28309b61fa8b0ffc00e2d3341bf` were reviewed. The repaired static PWA is deployed at https://bookmark-merge-map.sociobot.in/.

Repair commits:

- `574acf2` — accessible excluded-row treatment, exact browser regression, response-policy configuration and coverage.
- `f119d1e` — Azure-specific `.webmanifest` MIME mapping after live verification showed that a route header alone did not override the platform MIME.

## Findings reproduced and repaired

### Excluded-row contrast — repaired

The verifier's exact normal flow was reproduced against candidate `3ef87e0`: import two valid exports, disable tracking grouping, compare, keyboard-select **Only A**, then keyboard-activate **Exclude visible**. Axe reported a serious `color-contrast` violation. Effective contrast included 2.43:1 for the status, 3.12:1 for the title, 2.10:1 for the URL, and 2.52:1 for the folder.

Root cause: `.result-row.excluded { opacity: .5; }` reduced the contrast of every descendant.

Repair: excluded rows retain full opacity and use a paper-raised background, vermilion inset marker, and explicit “Excluded from export” label. The state is conveyed with text and structure, not color alone. The exact keyboard flow now asserts opacity `1`, the visible state label, and zero serious/critical axe findings on desktop and 390px mobile.

### Static caching — repaired

`public/staticwebapp.config.json` now gives `/assets/*` a one-year immutable cache policy. Live hashed JS and CSS return:

`cache-control: public, max-age=31536000, immutable`

The service worker remains revalidatable with `cache-control: no-cache`, and its release cache advanced from `bookmark-merge-map-v3` to `bookmark-merge-map-v4`.

### Response hardening and manifest MIME — repaired

All checked live responses now include a same-origin Content Security Policy, a restrictive Permissions Policy, HSTS, `nosniff`, and strict-origin referrer policy. The manifest now returns `content-type: application/manifest+json` through Azure Static Web Apps' `mimeTypes` mapping. Unit coverage asserts the production configuration, including immutable assets, manifest MIME/cache policy, worker cache policy, CSP, and Permissions-Policy.

## Verification evidence — 2026-08-28 UTC

### Clean repository gates

- `npm ci`: 114 packages installed; 115 audited; 0 vulnerabilities.
- `npm run typecheck`: passed (`tsc --noEmit`). No separate lint tool is configured; strict TypeScript is the source gate.
- `npm test`: 2 files, 7 tests passed. This includes 3 response-policy regression tests.
- `npm audit --omit=dev` and `npm audit`: 0 vulnerabilities.
- `npm run build`: passed; `dist/index.html` is present.
- Production output: 23.99 KB JS / 8.74 KB gzip; 16.05 KB main CSS / 4.50 KB gzip. The first-load JS and CSS remain well below 200 KB and 50 KB.
- This is a static PWA, so no package/consumer compatibility surface applies.

### Browser, accessibility, privacy, and PWA

- Local `npm run test:e2e`: 12/12 passed across desktop Chromium and exact 390×844 mobile.
- Live `PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e`: 12/12 passed across the same profiles.
- Sample reconciliation and HTML/CSV downloads passed.
- Axe: zero serious/critical findings before comparison, after comparison, and after keyboard bulk exclusion.
- Keyboard: filter and bulk exclusion operate with Enter; the skip link receives visible focus.
- Mobile: no horizontal overflow at 390px; the repaired badges wrap safely; touch layout remains intact.
- Reduced motion: transition durations reduce to at most 1ms.
- Privacy: browser capture observed only the current site origin; no analytics, external fonts/scripts, API calls, or bookmark-page requests; zero console/page errors.
- Offline/update: controlled offline reload passed on both profiles; `registration.update()` completed; active worker is `/sw.js`; cache `bookmark-merge-map-v4` exists.
- Factory `verify-url.sh` against production: HTTP 200, 669ms browser load, title present, `lang="en"`, one H1, main landmark present, no missing image alt text, no unlabeled buttons, zero console/page errors.

### Performance

Lighthouse 13.4.1 against the live mobile URL:

- Performance 100
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 0.9s; LCP 1.2s; TBT 0ms; CLS 0; total transfer 74 KiB

### Live response policy and identity

Azure deployment ID: `798231b3-1c01-4a01-8a72-0ba913cb66cf`. The custom domain returned HTTPS 200 after deployment.

Checked production hashes match the local `dist/` bytes:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `9e1a065acd588c2daabdec8b779dfb8002bb326616ba13c7283042a87baadbfa` |
| `assets/main-B_NbxDzm.js` | `75793d84ab9ccf8466d5ebdfa8e6caa9e4c419c819fbf9dfc4ab68313d7a9e63` |
| `assets/main-Du6LmM5a.css` | `f99596d25cd8a8c9a374521646762eb604f0a0b64cf8b8cf3a824248ec05fcfe` |
| `manifest.webmanifest` | `113c74f74795b2a691e06a05a0619a49106a6c09e424dc72c16ced99c2c403ea` |
| `sw.js` | `90bc302947aaf536fd35a52b9649ef4ddd5672ad59d36da0c4de655ce33d69bd` |
| `offline.html` | `b3f470f81e671bd1a7cf830669e2c74882b31f00aa63b415b7a3be0eb37cbf81` |

Live response checks confirmed:

- Hashed JS/CSS: one-year immutable caching.
- Manifest: `application/manifest+json`, five-minute revalidation.
- Service worker: JavaScript MIME, `no-cache`.
- CSP: `default-src 'self'`, restrictive source directives, `frame-ancestors 'none'`, `object-src 'none'`.
- Permissions-Policy disables camera, microphone, geolocation, payment, USB, motion sensors, and gyroscope.

## Run and deploy

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
```

Deploy the static root with:

```bash
/opt/fleet/lib/deploy-static.sh bookmark-merge-map dist
```

## Preserved scope and known non-blocking gaps

- The researched topographic visual thesis, generated asset provenance, local-first architecture, bookmark matching/export behavior, privacy/legal pages, and static PWA deployment class are unchanged.
- The parser preserves URL, title, folder path, and add date, but not browser-specific favicon, tags, descriptions, or custom attributes.
- Likely-conflict matching remains intentionally conservative: exact normalized titles across different URLs. The app never fetches bookmark pages.
- Review rows render in batches of 80, while parsing and reconciliation remain on the main thread. A Web Worker would help unusually large exports.
- Installability/offline automation covers Chromium. Safari and Firefox PWA installation UX was not separately automated.
