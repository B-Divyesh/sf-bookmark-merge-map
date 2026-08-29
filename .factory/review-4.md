# Adversarial first-read review 4 — PASS

**Reviewed:** 2026-08-29 UTC

**Live URL:** <https://bookmark-merge-map.sociobot.in/>

**Reviewed commit:** `82bb63e35d4819eea2e7a7d1b4fb15060d784d0a`
**Scope:** fresh Chromium contexts at 390×844 and 1440×900; clean-clone claim verification; live request, route, link, and accessibility checks; source, README, design thesis, all earlier reviews, all polish reports, and the prior handoff. `.factory/brief.json` is absent. No product code was changed.

## Verdict

**PASS.** There are zero findings, no unlisted visitor claim, and no untested registered claim. The first screen identifies the job, audience, and first action. The one-click demo immediately shows realistic results in an isolated namespace. All 21 claim commands pass separately from a clean clone. The complete local and live browser matrices each pass 54/54.

## Cold first read

Before scrolling, fresh mobile and desktop contexts showed:

> “Merge two bookmark exports”
>
> “For people whose browser and phone bookmarks no longer match.”
>
> “Try it with sample data”

My first-read answer is: this compares and merges two browser bookmark exports for people whose browser and phone bookmarks differ; click **Try it with sample data** first. Both viewports answer what it does, who it is for, and what to click. The first action and all three short facts fit in the 390×844 initial viewport.

## Findings

None.

## Copy audit

Counts use lexical words and numerals; hyphenated terms and paths count once, and standalone symbols do not count. Repeated identical shell labels are listed once with their locations. This covers all initially rendered root copy, including headings, labels, actions, status text, and image alt text, plus every README heading and sentence.

### Landing page

| Words | Exact text | Check |
|---:|---|---|
| 4 | Skip to main content | Clear action. |
| 3 | Bookmark Merge Map | Product name; header and footer. |
| 1 | Demo | Clear navigation. |
| 3 | How it works | Clear navigation. |
| 1 | Privacy | Clear navigation and footer link. |
| 4 | Merge two bookmark exports | Job-naming H1; verb first. |
| 9 | For people whose browser and phone bookmarks no longer match. | Names the audience and situation. |
| 6 | Try it with sample data | Result-naming primary action. |
| 4 | Choose two HTML exports | Clear real-data alternative. |
| 9 | See duplicates, missing links, and conflicts before using your files. | Plain; `sample-results`. |
| 5 | Files stay in your browser. | Plain; `privacy-local`. |
| 5 | Works offline after first visit. | Plain; `offline-reload`. |
| 4 | Free with no account. | Plain; `free-no-account`. |
| 13 | Two green routes converge into one red route on an abstract paper map. | Purposeful image alt text. |
| 5 | Two exports · one reviewed merge | Informative image caption. |
| 2 | Choose files | Clear progress step. |
| 1 | Compare | Clear progress step. |
| 1 | Review | Clear progress step. |
| 1 | Download | Clear progress step. |
| 3 | 01 · BOOKMARK EXPORTS | Descriptive section label. |
| 6 | Choose your two bookmark HTML files | Descriptive heading. |
| 9 | Export bookmarks as HTML from each browser or profile. | Usable instruction. |
| 4 | Try sample data instead | Clear alternative action. |
| 3 | Export A · desktop | Clear source label. |
| 5 | Choose a browser bookmark export | Useful empty state. |
| 3 | Choose HTML file | Result-naming file action. |
| 5 | or drop the file here | Usable alternative instruction. |
| 3 | Export B · mobile | Clear source label. |
| 6 | Your data stays in your browser | Descriptive privacy heading; `privacy-local`. |
| 7 | Comparison and downloads run on this device. | Plain; `privacy-local`. |
| 7 | Real projects are saved here for recovery. | Plain; `project-recovery`. |
| 4 | Group common campaign links | Clear control label. |
| 10 | Known campaign tags, such as `utm_source`, are ignored during matching. | Concrete example; `tracking-grouping`. |
| 6 | Downloaded URLs keep their original form. | Plain; `tracking-grouping`. |
| 3 | HOW IT WORKS | Descriptive section label. |
| 3 | How merging works | Descriptive heading. |
| 3 | Read each export | Descriptive step heading. |
| 9 | Read folder paths, titles, and URLs from both files. | Plain; `bookmark-reading`. |
| 4 | Find likely duplicate URLs | Descriptive step heading. |
| 13 | Treat links that differ only by common campaign labels as the same bookmark. | Predictable outcome; `campaign-label-matching`. |
| 4 | Keep unique bookmarks selected | Descriptive step heading. |
| 10 | Keep one-sided links and title conflicts until you remove them. | Plain; `default-inclusion`. |
| 3 | Download both records | Descriptive step heading. |
| 8 | Download merged bookmark HTML and a review CSV. | Plain; `html-export`, `csv-export`. |
| 5 | What this does not do | Descriptive limits heading. |
| 6 | It does not open bookmark pages. | Plain; `no-live-pages`. |
| 9 | It does not update bookmarks already in your browser. | Plain; `no-live-pages`. |
| 9 | Compare two bookmark exports and download one reviewed merge. | Useful footer description; merge/export claims. |
| 10 | Map illustration generated for this product with Azure AI Foundry. | Factual provenance; `artwork-provenance`. |
| 1 | Terms | Clear footer link. |
| 6 | Built by Param Factory (opens sociobot.in) | External destination is identified. |
| 3 | v1.3.0 · polish 3 | Build identifier. |
| 3 | Preparing offline use | Accurate transient status. |
| 3 | Offline use ready | Accurate ready-state label. |
| 1 | Offline | Accurate offline-state label. |

No item exceeds 22 words. There is no banned marketing adjective, mood heading, uninformative slogan, metaphorical instruction, terminology drift, or non-result-naming action.

### README

| Words | Exact text | Check |
|---:|---|---|
| 3 | Bookmark Merge Map | Document title. |
| 5 | Compare two browser bookmark exports. | `merge-two-exports`. |
| 11 | Review duplicates, links found in one export, and same-title URL conflicts. | `sample-results`. |
| 4 | Choose titles and folders. | `merge-two-exports`. |
| 8 | Download merged bookmark HTML and a review CSV. | Export claims. |
| 14 | Bookmark Merge Map is for people whose browser and phone bookmarks no longer match. | Plain audience statement. |
| 5 | Files stay in your browser. | `privacy-local`. |
| 7 | Real projects are saved there for recovery. | `project-recovery`. |
| 9 | Downloads create new files and keep source URLs unchanged. | `new-file-exports`. |
| 4 | Try the isolated demo | Descriptive heading. |
| 10 | Open `/demo` to explore five sample results in one click. | `demo-first-screen`. |
| 9 | A populated result appears in the first phone-sized screen. | `demo-first-screen`. |
| 8 | The demo uses the separate `demo:bookmark-merge-map` IndexedDB database. | `demo-isolation`. |
| 6 | Reset demo restores the original sample. | `demo-reset`. |
| 12 | Start for real discards demo data and restores only your real project. | `demo-isolation`. |
| 9 | The installed app works offline after an online visit. | `offline-reload`. |
| 7 | It is free and needs no account. | `free-no-account`. |
| 2 | Run locally | Descriptive heading. |
| 5 | Requires Node.js 20 or newer. | `node-version` and package metadata. |
| 5 | Open the printed local URL. | Usable instruction. |
| 11 | Choose two browser bookmark exports in HTML format, or open `/demo`. | Usable instruction. |
| 3 | Test and build | Descriptive heading. |
| 9 | Run every command in `.factory/claims.json` from a clean checkout. | Verification instruction. |
| 14 | The production build writes `dist/index.html`, route assets, the service worker, and static deployment configuration. | `build-output`. |
| 1 | Deploy | Descriptive heading. |
| 9 | Deploy the contents of `dist/` as a static site. | Usable instruction. |
| 6 | The factory work order owns deployment. | Scope instruction. |
| 10 | Do not change DNS, billing, or infrastructure from this repository. | Scope instruction. |
| 3 | Privacy and behavior | Descriptive heading. |
| 8 | Bookmark contents are not sent to an API. | `privacy-local`. |
| 8 | Demo and real projects use separate IndexedDB databases. | `demo-isolation`. |
| 14 | Links that differ only by common campaign labels can match without changing downloaded URLs. | Matching claims. |
| 4 | The control is reversible. | `tracking-grouping`. |
| 8 | See `/privacy` and `/terms` in the built app. | Usable route instruction. |
| 3 | License and artwork | Descriptive heading. |
| 1 | MIT. | License statement. |
| 12 | The map illustration was generated for this product with Azure AI Foundry. | `artwork-provenance`. |
| 10 | Its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`. | `artwork-provenance`. |

No README item exceeds 22 words. Terms are consistent: **bookmark export** for input, **merge** for output, **bookmark** for one destination, **demo** for the isolated sample, **review CSV** for the audit file, and **real project** for non-demo saved state.

## Demo and sandbox

The root action enters `/demo` in one click. At 390×844, the first demo viewport shows the persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, **Start for real**, and populated sample output. The first record shows **Shared**, **Selected**, source **A+B**, title **Trail guide**, its full URL, and folder **Field notes**; a **Needs review** record also begins in the viewport.

The full demo contains five results covering shared, one-sided, and same-title conflict cases. After excluding one result, **Reset demo** restores all five selections. The isolation test imports named real files, snapshots the real IndexedDB record, changes the demo, exits it, and confirms the real record is byte-for-byte unchanged. Demo state uses `demo:bookmark-merge-map`; real state uses `bookmark-merge-map`.

The demo privacy request log contains only `https://bookmark-merge-map.sociobot.in` through filtering and both downloads. The offline claim loads the demo online, waits for service-worker control, switches the browser context offline, reloads, and confirms the populated sample remains usable.

## Claims

Clean clone: `/tmp/bookmark-merge-map-review4-BLxmld` at `82bb63e35d4819eea2e7a7d1b4fb15060d784d0a`. `npm ci` found zero vulnerabilities. Each exact manifest command was run separately.

| Claim id | Result | Observable check |
|---|---|---|
| `demo-isolation` | PASS | Demo changes leave the real project byte-for-byte unchanged. |
| `privacy-local` | PASS | Whole demo flow sends requests only to the app origin. |
| `offline-reload` | PASS | Controlled demo reload succeeds offline. |
| `free-no-account` | PASS | Sample workflow completes without account or payment UI. |
| `html-export` | PASS | Download has Netscape header and five selected entries. |
| `csv-export` | PASS | Download has the exact header and one row per result. |
| `input-recovery` | PASS | Unsupported input gives the next valid-file action and recovery works. |
| `new-file-exports` | PASS | Download keeps the source URL and source record unchanged. |
| `tracking-grouping` | PASS | Grouping changes 5→6→5 rows and preserves the original download URL. |
| `project-recovery` | PASS | Real files and an exclusion survive reload. |
| `bookmark-reading` | PASS | Titles, full URLs, and source folders appear. |
| `default-inclusion` | PASS | All five distinct results start selected. |
| `no-live-pages` | PASS | Comparison makes no bookmark-page request or browser-bookmark update. |
| `demo-first-screen` | PASS | A real title and full URL fit in the first 390×844 viewport. |
| `sample-results` | PASS | Shared, one-sided, and conflicting rows are present. |
| `campaign-label-matching` | PASS | Differently tagged sample URLs form one shared row. |
| `merge-two-exports` | PASS | Two fixtures merge and selected title/folder reach downloaded HTML. |
| `demo-reset` | PASS | Reset restores all five original choices. |
| `artwork-provenance` | PASS | Disclosure, asset, design record, generator record, and prompt exist. |
| `node-version` | PASS | Package metadata and clean runtime meet Node.js 20+. |
| `build-output` | PASS | All documented deployment artifacts exist in `dist/`. |

No landing or README claim lacks a registry entry. Every registry id has exactly one `@claim:<id>` test.

## History recheck

I read `.factory/review-1.md`, `.factory/review-2.md`, `.factory/review-3.md`, `.factory/polish-1.md`, `.factory/polish-2.md`, `.factory/polish-3.md`, and the prior handoff. Every earlier finding was checked in the live site and current source, not merely against its marked status.

| Earlier finding | Current confirmation |
|---|---|
| F-1-1 — demo isolation | Fixed: direct demo entry, required controls, separate namespace, reset/exit behavior, and real-record isolation all pass. |
| F-1-2 — first-screen clarity | Fixed: job, audience, sample-first action, real-file alternative, and three facts fit at 390 px and desktop. |
| F-1-3 — claims registry | Fixed: 21 unique entries, one tagged test each, and 21/21 separate clean-clone commands pass. |
| F-1-4 — routing and structure | Fixed: real routes, shared shell, metadata, designed 404, history, focus, announcement, and crawl pass. |
| F-1-5 — offline reliability | Fixed: clean and live offline-reload tests pass. |
| F-1-6 — metaphorical interface copy | Fixed: instructions use bookmark language; the map theme remains visual. |
| F-1-7 — README density and terminology | Fixed: every sentence is at most 14 words and terms are consistent. |
| F-1-8 — unsupported metadata wording | Fixed: the root title and description name the compare/review/download job without “safe” or jargon. |
| F-1-9 — demo documentation | Fixed: `.factory/demo.md` documents URL, sample, namespace, reset, exit, and offline verification. |
| F-2-1 — demo result below the fold | Fixed: a populated title, URL, source, folder, and status appear in the first 390×844 viewport. |
| F-2-2 — dead factory link | Fixed: `https://sociobot.in/` returns 200 and the accessible label identifies the external destination. |
| F-2-3 — unregistered product claims | Fixed: the registry directly covers sample types, matching, two-file choices, demo entry/reset, and provenance. |
| F-2-4 — URL jargon | Fixed: the explanation uses common campaign labels and gives `utm_source` as a concrete example. |
| F-3-1 — dead sample links | Fixed: sample destinations are non-interactive text; all remaining populated-demo links resolve. |
| F-3-2 — metaphorical 404 H1 | Fixed: both static and SPA error views use **Page not found**. |
| F-3-3 — README operational claims | Fixed: Node and build output have direct claims; the unnecessary HTTPS assertion was removed. |

Earlier verification regressions also remain fixed: excluded-row contrast, immutable asset policy, CSP-safe offline fallback, tracking-choice preservation, CSV formula neutralization, and 44 px targets all pass current tests.

## Structure, accessibility, links, and identity

- Browser-rendered titles are `Bookmark Merge Map — merge two bookmark exports`, `Demo — Bookmark Merge Map`, `Privacy — Bookmark Merge Map`, `Terms — Bookmark Merge Map`, and `Page not found — Bookmark Merge Map`.
- Every checked route has one H1, a main landmark, route-specific description/canonical data, favicon/touch icon, OG/Twitter metadata, the shared header/footer, Privacy and Terms links, and the build id.
- `/`, `/demo`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` return 200. `/404` and arbitrary unknown paths return the designed page with HTTP 404.
- The live crawl resolves every actionable anchor. Sample destinations are deliberately text, not anchors. The 404 page's same-document skip link remains functional on the intentional 404 response.
- SPA navigation uses History API state, back restores the prior route, route changes focus the H1, and an `aria-live` region announces the title.
- `verify-url.sh` reports zero root console errors, `lang=en`, one H1, a main landmark, no missing alt text, and no unlabeled button.
- Playwright Axe finds zero serious or critical issues on home and populated demo. Keyboard, focus rings, reduced motion, 390 px layout, 200% text, and 44 px pointer targets pass.
- The generated relief-map image, paper palette, condensed map labels, contour rules, registration marks, and vermilion route create a recognisable topographic reconciliation identity. It is not a centered generic SaaS hero or feature-card template.

## Quality evidence

- `npm test`: 17/17 passed.
- `npm run build`: passed; `dist/` contains the documented artifacts.
- Entry JavaScript: 30.43 KB raw / 10.60 KB gzip.
- Every claims command: 21/21 passed separately from the clean clone.
- `npm run test:e2e`: 54/54 passed locally across desktop Chromium and 390×844.
- `PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e`: 54/54 passed live.
- Live root verification load: 644 ms in the verifier; zero console errors.

## Missed leverage

No finding. The product already provides the obvious implied import, review, HTML export, CSV audit, recovery, and offline paths. Bookmark comparison is deterministic; an AI step would add cost and uncertainty without improving the core job. Browser-account sync would require materially different permissions and infrastructure not implied by this local export-merging product.

## What would make this perfect

Nothing remains to change. Preserve the current zero-finding state by keeping every new visitor claim registered, maintaining demo/real namespace isolation, and rerunning the clean claim matrix plus live route crawl for future releases.
