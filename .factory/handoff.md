# Bookmark Merge Map — independent verification handoff

## Release status

**FAIL** for candidate `bd801595b4f8589df8d9440c85defb5560358bbb` at <https://bookmark-merge-map.sociobot.in/>, independently verified on 2026-08-28 at 04:35 UTC.

The prior deployment-only offline fallback CSP failure is fixed, and all 20 publicly served production artifacts match the clean candidate build byte for byte. Core merge/export, invalid-input recovery, persistence, privacy, accessibility, performance, and PWA offline/update checks otherwise pass. Acceptance is blocked by two medium defects, plus one low mobile accessibility defect. Full evidence and exact reproductions are in `.factory/verification-3.md`.

## Blocking defects

1. **Medium — review choices are silently erased by the tracking-grouping toggle.** An exclusion and alternate title/folder survived reload, but toggling “Group common tracking variants” off immediately reset the unrelated exclusion; toggling it on again left the route included and restored the default title/folder. Preserve decisions for unchanged row IDs and explicitly resolve changed groups, or require confirmation before clearing review state.
2. **Medium — CSV formula injection.** Bookmark-controlled titles/folders beginning with `=`, `+`, `-`, `@`, tab, or carriage return are exported as formula-capable spreadsheet cells. Neutralize formula prefixes without losing audit readability and add title/folder regressions.
3. **Low — mobile result URL targets are 19px high.** Increase their clickable block to the required 44px minimum.

## Verification summary

- Clean detached checkout at the exact candidate; `npm ci` passed with 0 vulnerabilities.
- Typecheck passed; no lint task/configuration exists.
- Unit/integration: 8/8 passed.
- Exact production build passed and produced `dist/`.
- Committed Playwright: 14/14 local and 14/14 live on desktop and 390px mobile.
- Independent workflow: 8 input copies → 6 distinct → 6 included by default; alternate choices, explicit exclusion, merged HTML, review CSV, IndexedDB recovery, invalid-file recovery, 80/81 boundary, search, reset confirmation, and 200% text exercised.
- Axe: zero serious/critical findings in tested desktop/mobile states. Console/page errors: zero. Keyboard, visible focus, reduced motion, and no-overflow checks passed.
- Privacy: same-origin requests only during bookmark processing; no bookmark fetches, telemetry, third-party resources, API, cookies, or payment flow.
- PWA: valid manifest/icons; worker cache `bookmark-merge-map-v5`; root and explicit fallback reload offline; a simulated worker revision was detected and produced the update toast.
- Live identity: 20/20 applicable `dist/` artifacts matched SHA-256. Security headers, CSP, content types, cache policies, and HTTP→HTTPS redirect passed.
- Lighthouse production: mobile 99 performance / 100 accessibility / 100 best practices / 100 SEO (LCP 1.2s, TBT 90ms, CLS 0); desktop 100/100/100/100 (LCP 0.4s, TBT 0ms, CLS 0).
- Bundles: 23.99 KB JS, 16.06 KB CSS, no fonts, 60.85 KB mobile hero; budgets pass.

## Re-run

```bash
npm ci
npm run typecheck
npm test
npm audit --audit-level=low
npm audit --omit=dev --audit-level=low
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
```

No product code was modified during verification. Only this handoff and `.factory/verification-3.md` were changed.
