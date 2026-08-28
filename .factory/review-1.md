# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-28 UTC  
**Live URL:** <https://bookmark-merge-map.sociobot.in/>  
**Scope:** cold, separate Chromium contexts at 390×844 and 1440×1000; live-site requests; repository source and documentation. No product source was changed.

## Verdict

**FAIL.** A first-time visitor can eventually understand that this compares two bookmark exports, but the first screen uses cartographic slogans rather than the job, does not identify the intended person, and points to a manual import rather than a one-click trial. The purported sample path is not a demo sandbox: `?demo=1` is empty, sample data overwrites the same IndexedDB record used for real imports, and no demo controls exist. The mandatory claims registry is absent, so privacy/offline/export statements cannot be verified claim by claim.

## Cold first-read result

At both 390px and desktop, before scrolling, the page showed:

> “A dry-run before browser sync”  
> “Find the missing paths. Keep every landmark.”  
> “Map my bookmarks”

My best inference was: it might reconcile two bookmark files, probably for people who use multiple browsers or devices; click **Map my bookmarks**. The page does **not** plainly say “merge two browser bookmark exports,” who it is for, or that the first low-risk action is a sample. Therefore it fails all three required cold-read questions: what it does, for whom, and what to click first. The exact text above is metaphorical and does not answer them.

## Findings

### F-1-1 — BLOCKING — sample data is not an isolated demo and can replace real saved data

**Location:** root app; `src/main.ts` `loadSamples()` and `src/storage.ts`; live `/?demo=1`.

`https://bookmark-merge-map.sociobot.in/?demo=1` loaded the empty import screen: zero result rows, zero “Demo” banner, zero “Reset demo” controls, and zero “Start for real” controls. The visible sample action is lower in the import section and is labelled **“Use sample maps”**, not a first-screen **“Try it with sample data.”**

After clicking it, the app did show five realistic reconciliation rows. It also persisted `desktop-sample.html` and `mobile-sample.html` to the sole IndexedDB database/key, `bookmark-merge-map` / `projects` / `active`. Reload restored those samples. More seriously, after importing `real-a.html` and `real-b.html`, clicking **Use sample maps**, and reloading, the real names were gone and `desktop-sample.html` remained in that same `active` record. This contradicts README’s “Use sample maps exercises the workflow without private data.”

This is misleading and risks loss of the recoverable real working map. Implement `/demo` (or make `?demo=1` functional) with a `demo:` storage namespace; load the realistic comparison result immediately; show a persistent **“Demo — sample data, nothing is saved”** banner with **Reset demo** and **Start for real**; and make leaving demo discard only its namespace. Add a Playwright claim test that imports real data, enters demo, changes demo choices, and proves the real IndexedDB project is byte-for-byte unchanged.

### F-1-2 — BLOCKING — the first screen is not plain enough to establish the job, audience, or first action

**Location:** root hero, both 390px and desktop.

The H1 is “Find the missing paths. Keep every landmark.” It is a metaphor, not a job headline, and says neither “bookmarks” nor “merge.” The supporting sentence is 17 words but names no audience/situation. The primary action, “Map my bookmarks,” scrolls to manual file selection; it does not say what result occurs and conceals the required one-click sample path below the fold.

Replace the first screen with, for example:

> **Merge two bookmark exports safely**  
> For people whose browser and phone bookmarks no longer match.  
> **Try it with sample data** — See duplicate, missing, and conflicting bookmarks before you import your files.

Place the real alternative beside it: **Choose two HTML exports**. Keep three short, testable facts below: **Files stay in your browser. Works offline after first visit. Free with no account.** Register and test each retained fact.

### F-1-3 — BLOCKING — there is no claims registry or claim-tagged verification

**Location:** repository root / `.factory/`; landing page and README.

`.factory/claims.json` does not exist. Consequently there were no listed claim commands to run from a clean install, no `@claim:<id>` tests, no sandbox definitions, and no way to verify every visitor-facing statement as required.

Unlisted, reliance-bearing statements include:

- Landing hero: “Nothing is uploaded.”
- Landing import card: “or drop it here · stays on this device.”
- Landing privacy note: “Parsing, comparison, and export happen in this tab.”
- Landing network status: “Ready offline after first visit.”
- Landing export copy: “The HTML imports into Chrome, Firefox, Edge, or Safari.”
- Footer: “Free, offline, and account-free.”
- README: “Files never leave the browser.”
- README: “The originals are never modified, and the default merge keeps every distinct destination.”
- README: “No environment variables, backend, account, analytics, or paid service is needed.”

Add `.factory/claims.json` and exactly one isolated, tagged test for every retained claim. At minimum cover same-origin-only request logging through the whole demo, controlled offline reload from demo after first visit, sample HTML/CSV export contents, unsupported-input recovery, no account/network API, and original-file preservation. Remove claims that cannot be observed in that sandbox.

### F-1-4 — BLOCKING — routing and per-route site structure are incomplete

**Location:** live `/demo`, `/?demo=1`, `/404.html`, unknown route, legal routes, root metadata.

There is no real demo route: `/demo` responds `200` with the normal empty root application and root title. `/404.html` and `/this-route-does-not-exist` also respond `200` with the normal root application and root title. There is no designed 404 page, no useful unknown-route state, and no route-change focus/announcement implementation. This is a broken routing failure under the site-structure contract.

The root has a title, description, canonical, and PNG favicon, but has no OG tags, Twitter tags, or apple-touch icon. `/privacy/` and `/terms/` omit canonical, favicon, apple-touch, OG, and Twitter metadata. Their header/footer are not the product header/footer (no consistent wordmark/nav/skip link/version/“Built by Param Factory”), and the root header does not provide Demo or Privacy navigation. The footer omits the required product one-liner in plain words, Param Factory attribution, and version/build identifier.

Create functional `/demo`, `/privacy`, `/terms`, and `/404` routes with the required title patterns, one focused H1 per route, canonical/OG/Twitter imagery, and consistent shell. Configure an actual 404 response/rewrite. On every History API route transition, restore state as appropriate, move focus to the H1, and announce it in an `aria-live` region. Add route/deep-link/back/focus tests and a link/route crawl.

### F-1-5 — BLOCKING — the checked live browser suite did not pass cleanly

**Location:** `tests/e2e/app.spec.ts:18`, live base URL.

From the fresh installed workspace:

```text
npm test                         15/15 passed
npm run build                    passed; dist/ produced
PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e
                                  17/18 passed; exit 1
```

The failed test was **“app reloads offline after first visit.”** It timed out after five seconds waiting for `navigator.serviceWorker.controller` to become true (`Expected: true; Received: false`). This is directly relevant to the unregistered “Ready offline after first visit” statement. Subsequent isolated spot checks obtained a controller, so this may be intermittent; an intermittent offline readiness test is still a failed quality gate and cannot establish the claim.

Make first-visit service-worker control deterministic, expose an accurate readiness state, and add a robust clean-context claim test that repeats the first-visit/offline-reload flow. It must pass reliably before the offline claim is used.

### F-1-6 — MINOR — landing headings, labels, and primary action use unexplained cartography rather than product language

**Location:** landing copy IDs L1–L7, L13, L22, L30–L37 in the audit below.

The terms “dry-run,” “paths,” “landmark,” “verified route,” “terrain,” “survey,” “trees,” and “proof” make the visitor translate the interface. Several headings are mood/metaphor headings and do not make sense out of context. The main button is not a result-naming verb and the sample button does not use the required plain label.

Rewrite these as: **Before browser sync** → delete; **Find the missing paths / Keep every landmark** → **Merge two bookmark exports safely**; **Map my bookmarks** → **Choose bookmark exports**; **Two exports · one verified route** → **Compare two bookmark exports**; **Lay the exports side by side** → **Choose your two bookmark HTML files**; **Private terrain** → **Your data stays in your browser**; **A merge with a paper trail** → **How merging works**; **Read the trees** → **Read each folder and bookmark**; **Normalize carefully** → **Find likely duplicate URLs**; **Keep by default** → **Keep unique bookmarks selected**; **Export the proof** → **Download merged bookmarks and a review CSV**. Use **Try it with sample data** for the first action.

### F-1-7 — MINOR — README starts with dense, inconsistent, unverified copy and its sample instructions are unsafe

**Location:** README opening and “Run locally” sections; audit IDs R1–R8, R14–R17.

The README calls the same concepts “bookmark trees,” “HTML exports,” “source-map fields,” “map,” and “workflow.” Its second sentence is 34 words, above the hard 22-word cap. “Use sample maps exercises the workflow without private data” is false for a browser with an existing recoverable project (F-1-1).

Use “bookmark export” consistently. Split R2 into: “Compare two browser bookmark exports. Review duplicates, links found in one export, and same-title URL conflicts. Choose titles and folders. Download merged HTML and a review CSV.” Replace R8 with: “Open `/demo` to explore sample bookmarks in an isolated workspace.” Put every product claim in the registry.

### F-1-8 — MINOR — the published title and description use unsupported safety language

**Location:** root `<title>` and `<meta name="description">`.

The root title is “Bookmark Merge Map — safe offline bookmark reconciliation.” “Safe” is an outcome claim without a listed test, and “reconciliation” is jargon. The description says “Safely compare, deduplicate, and merge two browser bookmark exports without uploading them,” combining an unverified safety claim with a privacy claim that has no registry test.

Use **“Bookmark Merge Map — merge two bookmark exports”** and **“Compare two browser bookmark exports, review duplicates and conflicts, then download a merged HTML file.”** Keep only claims that have registry evidence.

### F-1-9 — MINOR — required demo documentation is absent

**Location:** `.factory/`.

`.factory/demo.md` is absent. A verifier cannot learn the demo URL, sample contents, reset behavior, or storage namespace from the repository.

Add it once F-1-1 is implemented. State `/demo`, its sample counts and conflict types, the `demo:` namespace, Reset demo behavior, Start for real behavior, and the offline verification path.

## Copy audit

Word counts treat words/numbers as tokens. This inventory covers all static visitor-facing landing text initially rendered at `/` (including labels/buttons/headings, because they shape first read) and all prose sentences in `README.md`. Dynamic user-data rows are not landing copy. `†` identifies a phrase that is a finding in F-1-1, F-1-2, F-1-3, F-1-6, F-1-7, or F-1-8; each has a concrete rewrite above.

### Landing page

| ID | Words | Exact text | Flag |
|---|---:|---|---|
| L1 | 5 | A dry-run before browser sync | † jargon/mood |
| L2 | 4 | Find the missing paths. | † metaphor H1 |
| L3 | 3 | Keep every landmark. | † metaphor H1 |
| L4 | 17 | Compare two bookmark exports, expose duplicates and omissions, then download a merge you can prove is safe. | † unsupported “safe” |
| L5 | 3 | Nothing is uploaded. | † unlisted privacy claim |
| L6 | 3 | Map my bookmarks | † non-result primary action |
| L7 | 5 | Two exports · one verified route | † slogan/unsupported verification |
| L8 | 2 | Import maps | terminology drift |
| L9 | 2 | Compare paths | † metaphor |
| L10 | 2 | Review choices | clear label |
| L11 | 2 | Export proof | † metaphor |
| L12 | 2 | Source maps | terminology drift |
| L13 | 6 | Lay the exports side by side. | † metaphor heading |
| L14 | 7 | In your browser, export bookmarks as HTML. | clear instruction |
| L15 | 11 | Label either file however you like—the map compares both directions. | † “map” drift |
| L16 | 3 | Use sample maps | † wrong demo action/term |
| L17 | 3 | Map A · desktop | † “map” drift |
| L18 | 5 | Choose a browser HTML export | clear label |
| L19 | 3 | Choose HTML file | clear label |
| L20 | 8 | or drop it here · stays on this device | † unlisted privacy claim |
| L21 | 3 | Map B · mobile | † “map” drift |
| L22 | 2 | Private terrain | † mood heading |
| L23 | 8 | Parsing, comparison, and export happen in this tab. | † unlisted privacy claim |
| L24 | 11 | The working map is saved only in this browser for recovery. | † unlisted storage claim/“map” drift |
| L25 | 4 | Group common tracking variants | clear control label |
| L26 | 11 | Strips only known campaign parameters (such as utm_source) for matching. | † unlisted behavior claim/jargon |
| L27 | 4 | Original URLs stay untouched. | † unlisted behavior claim |
| L28 | 8 | Turn this off to review every variant separately. | clear instruction |
| L29 | 4 | How the survey works | † jargon heading |
| L30 | 6 | A merge with a paper trail. | † metaphor heading |
| L31 | 3 | Read the trees | † metaphor heading |
| L32 | 13 | Folder paths, titles, URLs, and dates are read locally from both Netscape-format exports. | † unlisted behavior/privacy claim |
| L33 | 2 | Normalize carefully | † vague heading |
| L34 | 11 | Hosts, fragments, parameter order, and optional campaign tags reveal likely duplicates. | † unlisted behavior claim/jargon |
| L35 | 3 | Keep by default | † incomplete heading |
| L36 | 12 | One-sided links and same-title conflicts remain included until you explicitly remove them. | † unlisted behavior claim |
| L37 | 3 | Export the proof | † metaphor heading |
| L38 | 10 | A browser-ready HTML and human-readable CSV make the outcome inspectable. | † unlisted export claim |
| L39 | 4 | Free, offline, and account-free. | † three unlisted claims |
| L40 | 11 | Original map illustration generated for this product with Azure AI Foundry. | provenance; “map” drift |
| L41 | 3 | Bookmark Merge Map | product name |
| L42 | 1 | LOCAL-ONLY | † unlisted privacy claim |
| L43 | 3 | How it works | clear navigation label |
| L44 | 14 | An illustrated topographic map where two green routes converge into one vermilion path | image alt; decorative purpose is clear |
| L45 | 5 | Ready offline after first visit | † unlisted offline claim |

### README

| ID | Words | Exact text | Flag |
|---|---:|---|---|
| R1 | 19 | Bookmark Merge Map is a free, offline-first browser utility for people whose desktop and mobile bookmark trees have diverged. | † adjective/term drift and claims |
| R2 | 34 | It compares two standard browser HTML exports, groups canonical duplicates, calls out one-sided links and same-title URL conflicts, lets you choose titles/folders, and exports both a merged HTML file and an audit CSV. | † over 22 words |
| R3 | 5 | Files never leave the browser. | † unlisted privacy claim |
| R4 | 13 | The originals are never modified, and the default merge keeps every distinct destination. | † unlisted behavior claim |
| R5 | 3 | Requires Node.js 20+. | clear requirement |
| R6 | 5 | Open the printed local URL. | clear instruction |
| R7 | 18 | Export bookmarks from two browsers/profiles as HTML and place them in the A and B source-map fields. | † “source-map” terminology drift |
| R8 | 9 | Use sample maps exercises the workflow without private data. | † false/unlisted demo claim |
| R9 | 9 | The exact production build command is npm run build. | clear instruction |
| R10 | 11 | Static output lands in dist/, with dist/index.html at its root. | clear instruction |
| R11 | 6 | Preview it with npx vite preview. | clear instruction |
| R12 | 9 | Deploy the contents of dist/ as a static site. | clear instruction |
| R13 | 6 | HTTPS is required for service-worker installation. | clear instruction |
| R14 | 11 | No environment variables, backend, account, analytics, or paid service is needed. | † unlisted product/deployment claim |
| R15 | 13 | The working files and review choices are stored in local IndexedDB for recovery. | † unlisted storage claim |
| R16 | 20 | The app does not fetch bookmark pages, so it compares URL structure and bookmark metadata rather than live page content. | † unlisted privacy/behavior claim |
| R17 | 6 | Tracking-parameter grouping is explicit and reversible. | † unlisted behavior claim |
| R18 | 8 | See /privacy/ and /terms/ in the built app. | clear instruction |
| R19 | 1 | MIT. | clear license statement |
| R20 | 21 | The generated hero artwork is original to this product; its prompt and provenance are recorded in .factory/design.md and assets/src/. | provenance, acceptable |

## Demo, privacy, and claim-check evidence

Fresh-context request logs at 390px and desktop contained only the application origin for the cold root page. That supports the narrow observation that the cold page did not request third-party resources; it does **not** prove the broad page/README privacy and offline claims, which remain unlisted.

The visible sample has 3 desktop and 4 mobile bookmarks and immediately shows 5 reconciliation rows, including two same-title/different-URL conflicts, one B-only link, and two shared links. That is useful sample data, but it is not an isolated demo for the reasons in F-1-1. No claim tests could be run because there is no claims manifest.

## Earlier finding recheck

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists. I read every earlier `verification-*.md` and the prior handoff. Their concrete findings are fixed in the current source/live configuration:

| Earlier finding | Current verification |
|---|---|
| V1 excluded rows lost contrast | `src/styles.css` no longer lowers row opacity; the live suite’s excluded-row axe test passed. |
| V1 immutable assets and response policies | Live root returned CSP and Permissions Policy; `/assets/main-D-ssTGu0.js` and CSS are configured immutable. |
| V2 inline offline CSS blocked by CSP | `/offline.html` loads same-origin `/offline.css`; its dedicated live test passed. |
| V3 tracking toggle lost choices | `currentDecisions()` is carried into `calculate()`; the live preservation test passed. |
| V3 CSV formula injection | `exporters.ts` prefixes all six formula-leading values; unit tests passed. |
| V3 19px URL targets | `a.url` has `min-height: 44px`; live pointer-target test passed. |

The new findings above are not previously documented fixes. In particular, the lack of a demo sandbox and claims registry was not covered by the earlier release-oriented verification reports.

## Structure, links, and visual identity

All root navigation links returned 200, and the external Source link resolved 200. The topographic visual system is recognizably product-specific rather than a generic SaaS template; no visual-identity finding is raised. No AI step is an obvious need for deterministic bookmark comparison, and imports plus HTML/CSV exports already cover the implied transfer work. The missing high-leverage capability is the real, isolated sample demo in F-1-1.

## What would make this perfect

Make the first screen say the job and audience in plain language, make **Try it with sample data** a real sandboxed `/demo` experience, and prove every retained promise through a claims registry. Then finish the route shell/metadata/404 work and get the clean-context offline suite reliably green. At that point the distinctive topographic interface can support a genuinely clear and trustworthy product.
