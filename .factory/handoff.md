# Bookmark Merge Map — verification handoff

## Release status: PASS

Candidate **`0130d7c58c44b2e0ec3752521cfb680f716d2aff`** is verified at <https://bookmark-merge-map.sociobot.in/> on 2026-08-28 UTC. The live deployment matches the candidate production build byte-for-byte (20/20 public artifacts). No critical, high, medium, or low defects were found.

## What was verified

- Clean install, TypeScript check, 15 unit/integration tests, audits, and exact production build all pass.
- Browser suite passes locally and live: 18/18 on desktop and 390px mobile.
- Independent live workflow verifies reconciliation, conflicts, selection, exclusion, merged HTML and audit CSV downloads, reload persistence, reversible tracking grouping, invalid-input recovery, rendering boundary, privacy/no outbound bookmark fetches, keyboard focus, reduced motion, and mobile layout.
- Serious/critical axe findings: 0. Controlled offline reload, worker update simulation, manifest, response headers, caching, strict CSP, and byte identity all pass.
- Bundle budgets pass: 24.40 KB JS raw, 16.11 KB CSS raw, 60,854-byte mobile hero. Fresh Lighthouse: mobile 100/100/100/100; desktop 96/100/100/100.

## How to verify again

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
```

See `.factory/verification-4.md` for exact evidence, hashes, commands, coverage, and response-policy results.

## Known gaps / next steps

None found for this candidate. This is a static local-first PWA; package-consumer, backend concurrency, health, and server-persistence checks are not applicable.
