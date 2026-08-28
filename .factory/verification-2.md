# Independent verification 2 — FAIL

**Candidate:** `f22708ff55f7b6e50e0d6d05fe28b5c1bf6ef8ed`  
**Live URL:** https://bookmark-merge-map.sociobot.in/  
**Verified:** 2026-08-28 UTC  
**Scope:** clean candidate checkout, exact production build, local production preview, and live static PWA. No product code was changed.

## Verdict

**FAIL.** The bookmark reconciliation job works end to end and the live deployment matches the candidate's production output byte for byte. However, the live global Content Security Policy blocks the inline stylesheet in the shipped offline fallback document. Loading `/offline.html` produces a browser console error and renders the fallback without its intended product styling. This violates the explicit no-console-errors quality gate and the PWA requirement for a first-class offline fallback.

There were no critical or high-severity defects and no serious/critical axe findings. The single medium-severity acceptance defect below is release-blocking under this work order.

## Defect

### Medium — CSP blocks the explicit offline fallback's stylesheet

The candidate config applies this policy globally:

```text
style-src 'self'
```

`public/offline.html` contains its entire stylesheet in an inline `<style>` element. On the live deployment, Chromium reports:

```text
Applying inline style violates the following Content Security Policy directive 'style-src 'self''.
Either the 'unsafe-inline' keyword, a hash ('sha256-grBMVijRkNjKmY06OR5AJVfP2dVa6OJbtHS8CYWHBBA='),
or a nonce is required. The action has been blocked.
```

Reproduction:

1. Open https://bookmark-merge-map.sociobot.in/offline.html in Chromium.
2. Observe HTTP 200 and the browser console.
3. The CSP error appears and the page is rendered with browser-default styling rather than the documented topographic visual system.

An independent Playwright response-policy test passed for `/privacy/` and `/terms/`, then failed specifically on `/offline.html` with the error above. The root app's service-worker-controlled offline reload still passes because the worker normally falls back to its cached `/` shell; that does not remove the defect in the separately shipped fallback document.

Recommended repair: move the fallback CSS to a same-origin external stylesheet included in the precache, or authorize only the exact inline style hash. Do not weaken the global policy with unrestricted `unsafe-inline`.

## Clean checkout and repository gates

- Started from a clean `main` worktree at `f22708ff55f7b6e50e0d6d05fe28b5c1bf6ef8ed`; a fresh fetch confirmed `origin/main` at the same commit.
- `npm ci`: passed; 114 packages installed, 115 audited, 0 vulnerabilities.
- `npm run typecheck`: passed (`tsc --noEmit`).
- No lint script or lint configuration is present; TypeScript is the repository's available static source gate.
- `npm test`: passed, 2 files and 7 tests.
- `npm audit --audit-level=low`: passed, 0 vulnerabilities.
- `npm audit --omit=dev --audit-level=low`: passed, 0 vulnerabilities.
- Exact `npm run build`: passed (`tsc --noEmit && vite build`) and produced `dist/`.
- Local committed Playwright suite: 12/12 passed across desktop Chromium and 390×844 mobile.
- Live committed Playwright suite: 12/12 passed across the same two profiles.
- This is a static PWA, not a library, CLI, or backend; package-consumer, concurrency, persistence-server, and health-endpoint checks do not apply.

## Independent end-to-end exercise

A disposable verifier-only Playwright spec was run and removed before this report was committed.

Passed locally and live:

- Imported representative nested Netscape-format desktop and mobile exports containing eight input copies.
- Canonicalized host casing, default HTTPS port, fragment, parameter order, and optional `utm_source`; reported 8 input copies → 6 distinct routes → 6 included routes.
- Found two same-title/different-URL conflicts and kept both URLs by default.
- Collapsed exact duplicates while preserving one original URL and the selected title and folder in the exported HTML.
- Selected the alternate title and folder for a shared row, excluded it, reloaded, and confirmed the choice and exclusion recovered from IndexedDB.
- Exported and inspected both downloads. The merged HTML retained every included distinct row and only one duplicate URL; the CSV contained one header plus six audit rows and recorded the excluded shared row.
- Turned tracking grouping off and back on; the result count changed from 81 to 82 and back to 81 without altering original URLs.
- Exercised the 80-row rendering boundary with 81 results and “Show 1 more.”
- Exercised a no-match search state and recovery.
- Rejected a `.txt` input, an HTML file with no bookmarks, and a 20 MiB + 1 byte HTML input; each showed actionable text. A valid `.htm` import then recovered successfully and completed comparison.
- Cancelled “Start over” and retained the project; confirmed it and cleared both maps and saved review state.
- Captured requests throughout private-file processing: every request stayed on the application origin. No bookmark URL, analytics, tracking, font, script, or API request was made.

The oversized in-memory Playwright upload took longer than the app's 4.5-second toast in the first combined verifier run, so that assertion initially missed the transient message. The same boundary passed on an isolated retry with the verifier retaining the toast; this was a harness timing issue, not a product failure.

## Accessibility and responsive behavior

- Axe 4.10.2 found zero serious or critical violations on the empty app, populated results, and the keyboard bulk-exclusion state on both desktop and 390px mobile.
- An additional axe run after sample comparison at 200% root text size found zero serious or critical violations on both profiles.
- Keyboard checks covered the skip link, sample action, filters, and bulk exclusion with Tab/Enter; native row controls exposed labels and keyboard-operable roles. The skip link showed a computed 3px outline plus the designed outer focus ring.
- Reduced-motion emulation reduced transition durations to at most 1ms.
- No horizontal overflow occurred at 390×844, including at 200% text size. Desktop and mobile screenshots were visually inspected.
- Main document checks: descriptive title, `lang="en"`, exactly one `<h1>`, `<main>`, meaningful hero alt text, no unlabeled buttons, and correctly associated form labels.
- The factory URL verifier returned HTTP 200, loaded in 905ms, found zero console/page errors on the main route, and confirmed title/lang/one H1/main/alt/button basics.
- The only browser error found was the explicit `/offline.html` CSP failure described above.

## PWA, offline, and persistence

- Manifest is valid JSON with `name`, `short_name`, `display: standalone`, versioned `start_url`, matching theme/background colors, 192×192 and 512×512 icons, and a 512×512 maskable icon.
- Service worker registered and controlled the app on desktop and mobile.
- Controlled offline reload passed on both profiles and displayed the saved offline state.
- `registration.update()` completed; the active worker was `/sw.js`; cache `bookmark-merge-map-v4` was present.
- The worker uses a versioned cache, `skipWaiting()`, `clients.claim()`, and a same-origin fetch policy.
- Imported files and review decisions recovered from IndexedDB after reload; “Start over” cleared them only after confirmation.
- The explicit fallback document is present and cached, but its live styling is blocked by CSP as reported above.

## Privacy and response policy

- Browser request capture during import, comparison, persistence, and export observed only the current site origin.
- No analytics, accounts, cookies, third-party fonts/scripts, server API, bookmark-page fetches, or payment integration were observed.
- Bookmark files, choices, HTML output, and CSV output remained client-side. Originals were not modified.
- `/privacy/` and `/terms/` return 200 and accurately disclose local IndexedDB/service-worker storage and ordinary server logs.
- HTTP redirects to HTTPS. Live responses include HSTS, `nosniff`, strict-origin referrer policy, a same-origin CSP, and a restrictive Permissions Policy.
- Hashed JavaScript and CSS return `public, max-age=31536000, immutable`.
- `manifest.webmanifest` returns `application/manifest+json` with five-minute revalidation.
- `sw.js` returns JavaScript with `cache-control: no-cache`.
- No `Set-Cookie` header was observed on the checked routes.

## Live deployment identity

The live HTML referenced `assets/main-B_NbxDzm.js` and `assets/main-Du6LmM5a.css`, exactly as the clean local build did. SHA-256 comparison found byte-for-byte matches for 14 checked production artifacts: root HTML, main JS, main CSS, manifest, worker, offline page, both legal pages, all three icons, and all three responsive hero images.

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `9e1a065acd588c2daabdec8b779dfb8002bb326616ba13c7283042a87baadbfa` |
| `assets/main-B_NbxDzm.js` | `75793d84ab9ccf8466d5ebdfa8e6caa9e4c419c819fbf9dfc4ab68313d7a9e63` |
| `assets/main-Du6LmM5a.css` | `f99596d25cd8a8c9a374521646762eb604f0a0b64cf8b8cf3a824248ec05fcfe` |
| `manifest.webmanifest` | `113c74f74795b2a691e06a05a0619a49106a6c09e424dc72c16ced99c2c403ea` |
| `sw.js` | `90bc302947aaf536fd35a52b9649ef4ddd5672ad59d36da0c4de655ce33d69bd` |
| `offline.html` | `b3f470f81e671bd1a7cf830669e2c74882b31f00aa63b415b7a3be0eb37cbf81` |

This establishes that the live deployed product assets match candidate `f22708f`; the failure is not stale deployment content.

## Performance and bundle budgets

Local production output:

- Main JavaScript: 23.99 KB raw / 8.74 KB gzip (budget ≤ 200 KB).
- Main CSS: 16.05 KB raw / 4.50 KB gzip (budget ≤ 50 KB).
- No downloaded font files.
- Mobile hero: 60,854 bytes (budget ≤ 300 KB).

Lighthouse 13.4.1 against the live URL:

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 98 | 100 | 100 | 100 | 1.0s | 1.4s | 160ms | 0 | 88 KiB |
| Desktop | 100 | 100 | 100 | 100 | 0.3s | 0.4s | 0ms | 0 | 166 KiB |

All stated static/PWA performance budgets pass.

## Documentation and product-specific design

- README covers purpose, audience, local run/test/build/deploy, privacy, limits, and license.
- MIT `LICENSE`, `/privacy/`, `/terms/`, `.factory/design.md`, and generated-asset prompt/provenance files are present.
- The topographic reconciliation thesis defines a product-specific palette, type scale, spacing, interaction grammar, single-mode rationale, and reduced-motion policy. Original generated and hand-authored assets have provenance recorded.

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
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome npx --yes lighthouse@13.4.1 https://bookmark-merge-map.sociobot.in ...
```
