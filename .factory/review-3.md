# Adversarial first-read review 3 — FAIL

**Reviewed:** 2026-08-29 UTC  
**Live URL:** <https://bookmark-merge-map.sociobot.in/>  
**Candidate:** `77715b79fc00a24a90be2c7b006fe2e1cd97e207`

## Verdict

**FAIL.** The main job is clear, the one-click demo is genuinely populated, and all 19 registered claims passed from a fresh clone. However, the required crawl finds three visible demo bookmark links that return HTTP 404. This is a blocking dead-link failure. The designed 404 also uses a map metaphor for its only H1, and three README operational assertions remain outside the claims registry. A PASS requires zero findings.

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×1000, before scrolling, showed:

> “Merge two bookmark exports”
>
> “For people whose browser and phone bookmarks no longer match.”
>
> “Try it with sample data”

Answer in my own words: this compares and merges two browser bookmark exports for people whose phone and browser copies no longer match; click **Try it with sample data** first. All three answers are available on the first screen at both sizes. No cold-read blocker is raised.

## Findings

### F-3-1 — BLOCKING — the populated demo contains three dead external links

**Location:** live `/demo` result URLs and `src/main.ts` sample data.

The required link crawl followed every anchor rendered on `/`, `/demo`, `/privacy`, `/terms`, and `/404`. These visible links return HTTP 404:

| Visible link | Response |
|---|---:|
| `https://example.com/guide?utm_source=desktop` | 404 |
| `https://example.org/archive` | 404 |
| `https://example.net/archive` | 404 |

Each is rendered as a clickable `<a target="_blank">` from sample bookmark data. A first-time visitor can click a sample result to inspect it and lands on an error instead. This fails the no-dead-links requirement; the current test only crawls the product shell and does not cover result links.

Replace the three sample destinations with stable, real 200 responses that preserve the required shared, conflict, and campaign-label scenarios, or render sample URLs as non-navigable text if inspection of destinations is not a product action. Preserve the sample’s five-result semantics. Add a browser crawl test for every href in populated demo rows and assert 2xx (or an explicit download/mailto exception). If result URLs remain external links, expose that they open an external site.

### F-3-2 — MINOR — the designed 404 H1 is a metaphor, not a plain page name

**Location:** live `/404` and unknown routes; `notFoundPage()`.

The only H1 reads:

> “This page is not on the map”

It depends on the visual theme instead of naming the page. A screen-reader heading list or a visitor who does not understand the map metaphor gets less useful information than the page title already provides. Replace it with **“Page not found”**. Keep the topographic treatment in the illustration and layout, not in the required page label. Update the route test to expect the revised H1.

### F-3-3 — MINOR — README operational assertions are unlisted claims

**Location:** `README.md`, Run locally / Test and build / Deploy; `.factory/claims.json`.

The registry covers the product-facing merge, demo, privacy, recovery, export, and artwork statements. It does not contain entries for these reliance-bearing operational assertions:

| Exact sentence | Why it needs coverage | Concrete repair |
|---|---|---|
| “Requires Node.js 20 or newer.” | A developer uses it to select a supported runtime. | Add a `node-version` claim with a clean-install CI test, or state the supported version in package metadata and test that metadata. |
| “The production build writes `dist/index.html`, route assets, the service worker, and static deployment configuration.” | A deployer relies on this output contract. | Add a `build-output` claim that runs `npm run build` and asserts every named artifact. |
| “HTTPS is required for service-worker installation.” | This is an operational precondition for the documented offline behaviour. | Add an `https-service-worker` documented-platform claim with a test or link to the platform requirement, or remove the assertion from this product README. |

The rule for this review is every claim-like landing or README sentence must be listed and tested. Register these assertions with one tagged test each, or make the README purely imperative and remove the unsupported promises.

## Copy audit

Counts treat a hyphenated term, URL, product name, or version as one word. Buttons, headings, labels, and image alt text are included because they affect the first read. No audited root or README text exceeds 22 words. Items marked **finding** map to F-3-1 through F-3-3; all other product claims have a matching registry entry.

### Landing page (`/`)

| Words | Exact text | Result |
|---:|---|---|
| 4 | Skip to main content | clear skip link |
| 3 | Bookmark Merge Map | wordmark |
| 1 | Demo | clear nav |
| 3 | How it works | clear nav/section |
| 1 | Privacy | clear nav |
| 4 | Merge two bookmark exports | plain job headline |
| 9 | For people whose browser and phone bookmarks no longer match. | plain audience and situation |
| 6 | Try it with sample data | result-naming primary action |
| 4 | Choose two HTML exports | clear real-data alternative |
| 9 | See duplicates, missing links, and conflicts before using your files. | `sample-results` |
| 5 | Files stay in your browser. | `privacy-local` |
| 5 | Works offline after first visit. | `offline-reload` |
| 4 | Free with no account. | `free-no-account` |
| 5 | Two exports · one reviewed merge | informative caption |
| 2 | Choose files | clear progress step |
| 1 | Compare | clear progress step |
| 1 | Review | clear progress step |
| 1 | Download | clear progress step |
| 3 | 01 · Bookmark exports | clear section label |
| 6 | Choose your two bookmark HTML files | clear heading |
| 9 | Export bookmarks as HTML from each browser or profile. | usable instruction |
| 4 | Try sample data instead | clear alternative action |
| 3 | Export A · desktop | clear source label |
| 5 | Choose a browser bookmark export | clear empty state |
| 3 | Choose HTML file | result-naming verb |
| 5 | or drop the file here | usable instruction |
| 3 | Export B · mobile | clear source label |
| 6 | Your data stays in your browser | `privacy-local` |
| 7 | Comparison and downloads run on this device. | `privacy-local` |
| 7 | Real projects are saved here for recovery. | `project-recovery` |
| 4 | Group common campaign links | clear control label |
| 10 | Known campaign tags, such as utm_source, are ignored during matching. | `tracking-grouping` |
| 6 | Downloaded URLs keep their original form. | `tracking-grouping` |
| 3 | How merging works | clear heading |
| 3 | Read each export | clear heading |
| 9 | Read folder paths, titles, and URLs from both files. | `bookmark-reading` |
| 4 | Find likely duplicate URLs | clear heading |
| 12 | Treat links that differ only by common campaign labels as the same bookmark. | `campaign-label-matching` |
| 4 | Keep unique bookmarks selected | clear heading |
| 10 | Keep one-sided links and title conflicts until you remove them. | `default-inclusion` |
| 3 | Download both records | clear heading |
| 8 | Download merged bookmark HTML and a review CSV. | `html-export`, `csv-export` |
| 5 | What this does not do | clear heading |
| 6 | It does not open bookmark pages. | `no-live-pages` |
| 9 | It does not update bookmarks already in your browser. | `no-live-pages` |
| 9 | Compare two bookmark exports and download one reviewed merge. | footer description |
| 10 | Map illustration generated for this product with Azure AI Foundry. | `artwork-provenance` |
| 1 | Terms | clear footer link |
| 5 | Built by Param Factory (opens sociobot.in) | external link identified |
| 3 | v1.2.0 · polish 2 | build identifier |
| 13 | Two green routes converge into one red route on an abstract paper map. | purposeful image alt |

### README

| Words | Exact sentence or heading | Result |
|---:|---|---|
| 3 | Bookmark Merge Map | document title |
| 5 | Compare two browser bookmark exports. | `merge-two-exports` |
| 11 | Review duplicates, links found in one export, and same-title URL conflicts. | `sample-results` |
| 4 | Choose titles and folders. | `merge-two-exports` |
| 8 | Download merged bookmark HTML and a review CSV. | export claims |
| 14 | Bookmark Merge Map is for people whose browser and phone bookmarks no longer match. | audience statement |
| 5 | Files stay in your browser. | `privacy-local` |
| 7 | Real projects are saved there for recovery. | `project-recovery` |
| 9 | Downloads create new files and keep source URLs unchanged. | `new-file-exports` |
| 4 | Try the isolated demo | clear heading |
| 10 | Open `/demo` to explore five sample results in one click. | `demo-first-screen` |
| 10 | A populated result appears in the first phone-sized screen. | `demo-first-screen` |
| 8 | The demo uses the separate `demo:bookmark-merge-map` IndexedDB database. | `demo-isolation` |
| 5 | Reset demo restores the original sample. | `demo-reset` |
| 12 | Start for real discards demo data and restores only your real project. | `demo-isolation` |
| 9 | The installed app works offline after an online visit. | `offline-reload` |
| 7 | It is free and needs no account. | `free-no-account` |
| 2 | Run locally | clear heading |
| 5 | Requires Node.js 20 or newer. | **finding F-3-3** |
| 5 | Open the printed local URL. | instruction |
| 11 | Choose two browser bookmark exports in HTML format, or open `/demo`. | instruction |
| 3 | Test and build | clear heading |
| 8 | Run every command in `.factory/claims.json` from a clean checkout. | instruction |
| 14 | The production build writes `dist/index.html`, route assets, the service worker, and static deployment configuration. | **finding F-3-3** |
| 1 | Deploy | clear heading |
| 7 | Deploy the contents of `dist/` as a static site. | instruction |
| 6 | HTTPS is required for service-worker installation. | **finding F-3-3** |
| 7 | The factory work order owns deployment. | scope instruction |
| 8 | Do not change DNS, billing, or infrastructure from this repository. | scope instruction |
| 3 | Privacy and behavior | clear heading |
| 8 | Bookmark contents are not sent to an API. | `privacy-local` |
| 8 | Demo and real projects use separate IndexedDB databases. | `demo-isolation` |
| 13 | Links that differ only by common campaign labels can match without changing downloaded URLs. | matching claims |
| 4 | The control is reversible. | `tracking-grouping` |
| 7 | See `/privacy` and `/terms` in the built app. | route instruction |
| 3 | License and artwork | clear heading |
| 1 | MIT. | license label |
| 11 | The map illustration was generated for this product with Azure AI Foundry. | `artwork-provenance` |
| 10 | Its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`. | provenance pointer |

## Demo, sandbox, claims, and privacy checks

- `/demo` and `/?demo=1` open the isolated five-result sample. At 390×844, the first preview title and full URL are inside the initial viewport.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and supplies **Reset demo** and **Start for real**. The fresh-clone isolation test imports real fixtures, changes demo state, and confirms byte-for-byte unchanged `bookmark-merge-map` storage while the demo uses `demo:bookmark-merge-map`.
- Reset restores all five selected samples. Start for real discards the demo record and restores the real project. These behaviours passed locally and in the 48-test live suite.
- Demo request logs in the registered privacy test contain only the application origin through filtering and both downloads. The controlled offline reload claim passed.
- I ran each of the 19 exact commands in `.factory/claims.json` separately from fresh clone `/tmp/bookmark-merge-map-review3-NiUSAK`: all passed. `npm test` passed 17/17 and `npm run build` produced `dist/`. The complete live suite, `PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e`, passed 48/48.

## History recheck

I read `.factory/review-1.md`, `.factory/review-2.md`, `.factory/polish-1.md`, `.factory/polish-2.md`, all four verification reports, and the prior handoff. `.factory/brief.json` is absent; the existing verification record documents that absence. I checked each earlier finding on the live deployment and source.

| Earlier finding | Current confirmation |
|---|---|
| F-1-1 demo isolation | fixed: separate database, direct demo URL, banner, reset/exit; direct test passed |
| F-1-2 first-screen clarity | fixed at mobile and desktop; cold-read result above |
| F-1-3 claims registry | fixed for the 19 registered product claims; F-3-3 is a newly found README coverage gap |
| F-1-4 routes, shell, metadata, 404 | fixed: `/demo`, `/privacy`, `/terms` return 200; unknown routes return designed 404/HTTP 404; F-3-2 is new plain-language copy debt |
| F-1-5 offline reliability | fixed: controlled demo offline reload passed |
| F-1-6 / F-1-7 / F-1-8 / F-1-9 copy, README, metadata, demo guide | fixed except the new explicit operational-claim gap in F-3-3 |
| F-2-1 first demo viewport | fixed: populated preview title and URL are in the first 390px viewport |
| F-2-2 factory link | fixed: apex Sociobot link returns 200 and identifies its external destination |
| F-2-3 registry coverage | product-copy gaps were repaired; F-3-3 identifies the remaining operational README assertions under this round’s literal all-claim rule |
| F-2-4 URL jargon | fixed: campaign-label wording is plain |
| Prior verification regressions | contrast, caching/security headers, CSP-safe offline fallback, grouping decision preservation, CSV formula neutralization, and 44px targets passed the current test matrix |

F-3-1 is not a regression of an earlier fixed item: it is a new full-anchor crawl of result data. It is nevertheless blocking under the current no-dead-links requirement.

## Structure, accessibility, and scope

- Root, demo, privacy, terms, and 404 have the expected per-route titles, meta descriptions, canonical URLs, OG/Twitter image, favicon/touch icon, one H1, main landmark, shared shell, and footer. `/404` and arbitrary unknown paths return HTTP 404.
- Back navigation restores the route and focuses its H1. The live suite confirms route announcements, keyboard use, reduced motion, 390px layout, 200% text layout, and no serious/critical axe findings.
- `verify-url.sh` on the live root reported `lang=en`, one H1, a main landmark, no unlabeled buttons or missing image alt text, and no root console errors. CSP and other response headers are present; the live root request log used only same-origin product assets.
- The paper-map visual system is distinct and matches `.factory/design.md`; it does not read as a generic SaaS template.
- The deterministic bookmark comparison does not need an AI feature. Importing two exports and exporting HTML/CSV already cover the obvious implied capabilities. No missed-leverage AI finding is raised.

## What would make this perfect

1. Make every demo result URL either a stable, live external destination or non-navigable sample text, then crawl those links in CI.
2. Rename the 404 H1 to **“Page not found.”**
3. Register and test—or remove—the three README operational assertions in F-3-3.
4. Re-run the fresh-clone claim matrix, full live suite, and complete anchor crawl. Only zero remaining findings warrants PASS.
