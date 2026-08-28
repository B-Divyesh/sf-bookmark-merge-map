# Independent verification 1 — FAIL

**Candidate:** `3ef87e03fa878e0df32fce2ba33d34d228b9bf16`  
**Live URL:** https://bookmark-merge-map.sociobot.in/  
**Verified:** 2026-08-28 UTC  
**Scope:** clean checkout, production build, local production preview, and the live PWA. No product source was changed.

## Verdict

**FAIL.** The normal reconciliation path works, but an ordinary review action (excluding a row) creates axe **serious** WCAG color-contrast violations. The factory acceptance contract requires no serious/critical axe findings, so this candidate cannot pass.

## Blocking defect

### High — excluded review rows fail contrast requirements

1. Import valid desktop/mobile Netscape bookmark HTML exports.
2. Compare with tracking grouping on, turn grouping off, select the **Only A** filter using the keyboard, then activate **Exclude visible**.
3. Run axe against the resulting review screen.

`src/styles.css` applies `.result-row.excluded { opacity: .5; }`, dimming all descendants. Axe 4.10.2 reports `color-contrast` with **serious** impact in this user-visible state, including:

- `.folder`: effective `#869e91` on `#f4f0e6`, contrast **2.52:1** (requires 4.5:1).
- `.note`: effective `#a4a9a1` on `#f4f0e6`, contrast **2.10:1** (requires 4.5:1).

This is a real normal recovery/review flow, not a synthetic DOM mutation. The committed axe test only audits states before exclusion and after the all-included sample comparison, so it misses it.

## Other defects / policy findings

### Medium — immutable hashed assets are not cacheable as required

The live hashed JS and CSS assets return `cache-control: public, must-revalidate, max-age=30`, rather than a long-lived immutable policy. Examples checked:

- `/assets/main-DYW9vgQE.js`
- `/assets/main-CO_kjT3x.css`

The service worker provides an offline cache, but this still violates the static/PWA caching requirement and forces routine revalidation when networked. This is deployment/header configuration rather than a source-code difference.

### Low — missing browser hardening policies

The live responses include HSTS, `X-Content-Type-Options: nosniff`, and a strict referrer policy, but no `Content-Security-Policy` or `Permissions-Policy`. The manifest is served as `application/octet-stream` rather than a manifest JSON MIME type. Chromium still registered the service worker and read the manifest link in this verification; these did not block the tested flow.

## Evidence of what works

### Clean install and repository gates

- `npm ci` completed successfully: 115 audited packages, 0 vulnerabilities reported.
- `npm test`: **4/4** unit tests passed.
- `npm run build`: passed (`tsc --noEmit && vite build`), producing `dist/`.
- `npm run test:e2e`: **6/6** committed Playwright tests passed on Desktop Chromium and Pixel 5 profiles after this verification. No separate lint script exists; type checking is part of the build.

Production output is within the stated static budget:

- JS: 23.90 KB uncompressed / 8.71 KB gzip (under 200 KB).
- Main CSS: 15.66 KB uncompressed / 4.43 KB gzip (under 50 KB).
- Mobile hero: 60,854 bytes; normal 960px hero: 153,984 bytes.

### Independent end-to-end browser exercise

Using disposable local-only Playwright checks against the production build (the temporary verifier test was removed afterward), I exercised:

- valid nested bookmark HTML imports; canonical host/default-port/fragment/query-order normalization; tracking-parameter grouping toggle; duplicate collapse; different-title/different-folder choices; same-title/different-URL conflicts; and before/after counts;
- merged HTML and review CSV downloads, including verification that original URLs are retained and duplicate URLs only appear once in merged HTML;
- invalid `.txt` rejection, a 20 MiB + 1 byte HTML rejection, followed by successful recovery with a valid file;
- refresh/IndexedDB recovery, filters, keyboard Enter activation, visible 3px focus on the skip link, and explicit inclusion/exclusion;
- desktop and 390px mobile layout (no horizontal overflow), reduced-motion computed transition reduction, and no page/console errors.

All of those behavioral checks passed until the deliberate axe audit of the excluded-row state above. Network capture from the live app showed requests only to `https://bookmark-merge-map.sociobot.in`; no analytics, third-party scripts, or bookmark-page fetches were made.

### Live deployment and PWA

The live deployment matches the candidate build byte-for-byte for the checked shell and runtime artifacts:

| File | SHA-256 |
| --- | --- |
| `index.html` | `5c5684c036e78342305ed4cf138aab174f50c43027fb9a2098ad991573a52b43` |
| `assets/main-DYW9vgQE.js` | `a6e74a61526156ebc471859ecca84062a88421bb5647c60586b66730c6fdc8e6` |
| `assets/main-CO_kjT3x.css` | `a00177cb949e76be1a6e97e472ac3cfd208c6f82b7ae1090aecaa2f5929d7362` |
| `sw.js` | `c97dcbe2c20bd5152182c8d470ef94c1ee7d531ef6d75333cb950a2ccafc8022` |
| `manifest.webmanifest` | `113c74f74795b2a691e06a05a0619a49106a6c09e424dc72c16ced99c2c403ea` |
| `offline.html` | `b3f470f81e671bd1a7cf830669e2c74882b31f00aa63b415b7a3be0eb37cbf81` |

On the live 390px viewport: one H1, no horizontal overflow, no console/page errors, same-origin-only requests, registered and controlling service worker, and successful offline reload after the first visit. `registration.update()` left the current candidate's worker active with no waiting/installing update, as expected when the live worker is unchanged. The candidate implements update hooks; a changed production worker was not available to force a second-version update cycle.

Live mobile Lighthouse 13.4.1: Performance **97**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.8 s, LCP 1.4 s, TBT 200 ms, CLS 0, 74 KiB transfer. Lighthouse's default all-included landing state does not cover the excluded-row contrast defect.

## Response headers observed

Root and static assets returned HTTP 200 with HSTS (`max-age=10886400; includeSubDomains; preload`), `referrer-policy: strict-origin-when-cross-origin`, `x-content-type-options: nosniff`, and `x-dns-prefetch-control: off`. No CSP or Permissions-Policy header was present. HTML and static assets were all `max-age=30, must-revalidate`.

## Required next step

Fix the excluded-row visual treatment without lowering descendant text contrast, add an axe regression test that excludes a result before auditing, configure immutable caching for content-hashed assets, then rebuild and re-verify the deployed artifacts.
