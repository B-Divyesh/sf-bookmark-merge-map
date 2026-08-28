# Independent verification 4 — PASS

**Candidate:** `0130d7c58c44b2e0ec3752521cfb680f716d2aff`
**Live URL:** <https://bookmark-merge-map.sociobot.in/>
**Verified:** 2026-08-28 UTC
**Scope:** fresh clean checkout, exact production build, local preview, and the deployed PWA. The supplied researched brief was used as the product contract because `.factory/brief.json` is absent. No product source was modified.

## Verdict

**PASS.** The candidate meets the offline bookmark-reconciliation job: it safely compares two browser HTML exports, retains every distinct URL by default, presents conflicts and one-sided routes for review, persists choices locally, and produces a merged HTML export plus an audit CSV. The deployed bytes match the exact candidate build. No release-blocking defects or serious/critical axe findings were found.

| Severity | Count | Result |
| --- | ---: | --- |
| Critical | 0 | None found |
| High | 0 | None found |
| Medium | 0 | None found |
| Low | 0 | None found |

## Clean checkout and repository gates

- The repository began clean at the requested SHA and remained source-clean throughout verification.
- `npm ci`: passed; 114 packages installed, 115 audited, 0 vulnerabilities.
- `npm run typecheck`: passed. There is no lint script or lint configuration, so TypeScript is the available static gate.
- `npm test`: passed, 2 files and **15/15** tests.
- `npm audit --audit-level=low` and `npm audit --omit=dev --audit-level=low`: both passed with 0 vulnerabilities.
- Exact `npm run build`: passed and produced `dist/`.
- Committed Playwright suite: **18/18** passed locally and **18/18** passed with `PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in`, covering Desktop Chromium and Pixel 5 at 390×844.

This is a static PWA, not a library, CLI, or backend, so package-consumer installation, server health/concurrency, and server persistence tests do not apply.

## Independent end-to-end evidence

Separate verifier-owned Playwright exercises against the live URL confirmed:

- Two nested Netscape exports containing host case/default-port/fragment/query-order differences and `utm_source` variants reconciled from **8 input copies → 6 distinct routes → 6 included routes**.
- Same-title/different-URL entries remained visible as review conflicts; the A-only and B-only routes remained represented. The user selected `Mobile guide` and the `Mobile` destination, excluded `Desktop only`, then downloaded the merged HTML. It contained exactly **5** anchors, retained the original uppercase/default-port source destination, used the selected title/folder, and omitted only the expressly excluded route.
- The CSV download contained the header plus six audit rows and recorded the exclusion. Repository regression tests additionally verify formula-neutralization for all six spreadsheet prefixes (`=`, `+`, `-`, `@`, tab, carriage return).
- Reload restored the explicit exclusion; turning tracking-variant grouping off and back on retained that unrelated exclusion and the reviewed choices.
- Invalid `.txt`, empty valid HTML, and a **20 MiB + 1 byte** HTML file each produced an actionable rejection. A valid export immediately recovered after the empty-file error.
- The 80/81 rendering boundary displayed 80 rows and then `Show 2 more`; at 390px there was no horizontal overflow. At 200% root text there was also no horizontal overflow.
- No page errors or console errors occurred through these workflows. Normal processing made requests only to `https://bookmark-merge-map.sociobot.in`; no cookies, analytics, bookmark-page requests, external fonts/scripts, account calls, or payment calls were observed.

## Accessibility, interaction, and visual review

- Independent axe 4.10.2 scans found **0 serious/critical** violations on the populated mobile excluded-row state. The committed suite also scans the initial and populated states on both profiles.
- Keyboard-only smoke check reached the skip link first; its designed focus treatment measured a 3px outline with 3px offset and a visible outer ring. Filters and bulk exclusion were operable by keyboard in the committed live suite; no trap was observed.
- `prefers-reduced-motion: reduce` reduced the checked primary-control transition to 0.01ms. URL links in populated results meet the 44px pointer-target regression check.
- The live shell has a descriptive title, `lang="en"`, exactly one H1, a main landmark, and no missing image alt text or unlabeled buttons (`verify-url.sh`: HTTP 200 in 670ms, zero errors).
- Visual inspection of full-page desktop 1440×1000 and mobile 390×844 sample-result captures found the documented topographic map hierarchy intact, readable route review, intentional mobile stacking, and no clipped controls. The single light paper treatment is explicitly supported by the design thesis.

## PWA, offline, and response policy

- The manifest is valid for this product: standalone display, versioned start URL, documented `#F4F0E6` theme/background colors, 192 and 512 icons, and a 512 maskable icon.
- After a real first live visit, the versioned `bookmark-merge-map-v6` worker controlled the page; setting the context offline and reloading kept the application shell available and announced `Offline · your saved map is available`, with zero errors.
- An independent local simulation serving the exact `dist/` changed only the worker revision after a controlled first visit. It produced the in-app update toast, activated the changed worker, and retained the v6 cache. This confirms the update path alongside `skipWaiting()` and `clients.claim()`.
- HTTP redirects to HTTPS. Live root responses have HSTS, `nosniff`, strict-origin referrer policy, same-origin CSP (`frame-ancestors 'none'`, `object-src 'none'`), and restrictive Permissions Policy. `sw.js` is JavaScript with `no-cache`; the manifest is `application/manifest+json` with five-minute revalidation; hashed main JS is `public, max-age=31536000, immutable`; direct offline CSS is `text/css` and CSP-safe.

## Deployment identity and performance

- SHA-256 comparison matched **20/20** publicly served candidate artifacts byte-for-byte. `staticwebapp.config.json` is correctly deployment configuration rather than a public artifact. Key hashes: root `bfbed5c3632a62b40d53064dc6208b1e9d0cc19a7ae702c842d44228fe014f45`; main JS `ef7a49c6a268a755a5a63239ba0c9f9ae4962c0762ef2c003ccb40aab01b4ec6`; main CSS `c4bf9b90633ca60ca6cd2984f2f7f222001f6d030df7a2e7cb5feaa73e3a88b1`; worker `bb0fd55b6f13cfe0effe2db808f5e6c6f08f73e0544731bd76c00065101d0eeb`.
- Production build budgets pass: main JS **24.40 KB raw / 8.92 KB gzip** (under 200 KB); main CSS **16.11 KB raw / 4.50 KB gzip** (under 50 KB); no downloaded fonts; mobile hero **60,854 bytes** (under 300 KB).
- Fresh Lighthouse 13.4.1, using the supplied Chromium headless shell: mobile **100 performance / 100 accessibility / 100 best practices / 100 SEO** (FCP 0.9s, LCP 1.2s, TBT 40ms, CLS 0, 74 KiB); desktop **96 / 100 / 100 / 100** (FCP 0.9s, LCP 1.2s, TBT 70ms, CLS 0, 74 KiB).

## Documentation and privacy

README, MIT `LICENSE`, `/privacy/`, `/terms/`, `.factory/design.md`, and image prompt/provenance are present. Privacy disclosure accurately describes IndexedDB recovery and service-worker caching. The original HTML files remain in browser-local storage unless the user explicitly exports or clears the project; no browser bookmark data is overwritten.

## Commands used

```bash
npm ci
npm run typecheck
npm test
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh https://bookmark-merge-map.sociobot.in <evidence-dir>
```

Additional independent Playwright checks covered the normal and invalid/recovery workflows, downloads, mobile layout, keyboard/focus, reduced motion, axe, actual offline reload, and a changed-worker update simulation. Lighthouse was run with `lighthouse@13.4.1` and the preinstalled Playwright Chromium headless shell.
