# Adversarial first-read review 2 — FAIL

**Reviewed:** 2026-08-29 UTC

**Live URL:** <https://bookmark-merge-map.sociobot.in/>
**Scope:** fresh Chromium contexts at 390×844 and 1440×1000; live routes and requests; clean-clone verification; source, documentation, and prior-review recheck. No product code was changed.

## Verdict

**FAIL.** The landing page is now clear within one screen, and the isolated demo really does load five realistic records. However, a first-time visitor who takes the advertised one-click demo path sees a banner, a large heading, a progress bar, and file cards—not a single populated sample result. The first real result is 2,606 px below the top at 390px and 2,056 px below the top at desktop. This is a weak demo under the mandatory requirement that its first screen already show the product being used. A dead external footer link and a small set of unregistered claims remain.

## Cold first-read result

At `scrollY = 0`, before any interaction, both viewports showed:

> “Merge two bookmark exports”
>
> “For people whose browser and phone bookmarks no longer match.”
>
> “Try it with sample data”

My first-read answer was: this merges two browser bookmark exports for people whose phone and browser bookmarks do not match; click **Try it with sample data** first. The initial screen answers all three questions. No cold-read finding is raised.

## Findings

### F-2-1 — BLOCKING — the demo is populated but does not visibly demonstrate the product on its first screen

**Location:** live `/demo`, first viewport at 390×844 and 1440×1000; `src/main.ts`, `renderProduct()` places `demo-intro`, `progress()`, and `importSection()` before `results()`.

The one-click demo enters correct isolated state: it shows the banner **“Demo — sample data, nothing is saved”**, five `.result-row` elements, **Reset demo**, and **Start for real**. The initial viewport nevertheless contains only:

> “Compare sample bookmark exports”
>
> “Review five results from desktop and phone bookmark exports.”
>
> “Choose your two bookmark HTML files”

No bookmark title, URL, source folder, conflict, or selected result is visible before scrolling. Measured from a fresh live load, the results section starts at 1,783 px / its first row at 2,606 px on 390px mobile; the corresponding desktop positions are 1,492 px / 2,056 px. Calling this “sample data” asks visitors to trust a description rather than letting them inspect the result.

Move a compact, realistic populated result preview (for example one shared link, one **Needs review** conflict, and one **Only in B** link) directly below the demo banner and above the fold. It must show the selected state, title, URL, and source/folder information. Keep the full review controls below it. Add `@claim:demo-first-screen` that opens `/demo` in a fresh 390px context and asserts a sample result’s title and URL have bounding boxes inside the initial viewport; retain the existing namespace/isolation test separately.

### F-2-2 — MINOR — the required factory footer link is dead and is not identified as external

**Location:** every footer, **“Built by Param Factory”**; `src/main.ts` `shellFooter()` and `404.html`.

The link target is `https://www.sociobot.in/`. Both Playwright’s request client and `curl` reject it with a certificate hostname mismatch: the certificate has no `www.sociobot.in` alternative name. The apex <https://sociobot.in/> returned HTTP 200 in the same check. The visible link also gives no indication that it leaves the product site.

Point the link to `https://sociobot.in/`, retain the safe `target`/`rel` attributes, and label it **“Built by Param Factory (opens sociobot.in)”** or add an accessible external-link indicator. Add the URL to the link crawl test and assert a successful response.

### F-2-3 — MINOR — visitor-facing feature and provenance statements do not each have a direct registered claim

**Location:** landing hero/method/footer and `README.md`; `.factory/claims.json`.

The registry and its 13 current tagged tests are a substantial improvement, but the following reliance-bearing sentences have no matching claim entry that names and tests the stated outcome:

| Location | Exact text | Concrete repair |
|---|---|---|
| Hero action note | “See duplicates, missing links, and conflicts before using your files.” | Add `sample-results` to `claims.json` and a tagged demo test asserting the shared/duplicate, one-sided, and conflict rows, or remove this promise. |
| Method step | “Compare hosts, fragments, parameter order, and optional campaign tags.” | Add `url-normalization` with source fixtures that prove each stated comparison rule and preserve the exported original URL, or narrow the sentence to the behavior tested. |
| Footer | “Original illustration generated for this product with Azure AI Foundry.” | Remove this nonessential product claim from the footer and retain the provenance in `.factory/design.md`, or add an artifact/provenance test and registry entry. |
| README opening | “Compare two browser bookmark exports.” / “Choose titles and folders.” | Add a `merge-two-exports` claim that imports two fixtures and verifies review rows, title selection, folder selection, and merged output. |
| README demo instructions | “Open `/demo` to explore five sample results in one click.” / “**Reset demo** restores the original sample.” | Add direct demo-entry and reset tagged claims. The current untagged route test and the isolation test do not make those promises entries in the registry; the first of them also needs the viewport assertion from F-2-1. |
| README artwork section | “The generated map artwork is original to this product.” | Remove it from the README or register a provenance check alongside the footer statement. |

Do not use a broad nearby claim as a substitute for the named observable behavior. Each retained sentence needs one `claims.json` entry and exactly one `@claim:` test that proves its outcome from the documented sandbox.

### F-2-4 — MINOR — the matching explanation uses unexplained technical terms

**Location:** landing, **How merging works**, step 02.

> “Compare hosts, fragments, parameter order, and optional campaign tags.”

At 9 words it meets the length limit, but “hosts,” “fragments,” and “parameter order” are URL-structure jargon. A first-time visitor cannot use this to predict whether two links will be grouped. Replace it with, for example:

> “Treat links that differ only by common campaign labels as the same bookmark.”

If the more technical rules are important, put a short, concrete example in a disclosure: `example.com/page#notes` and `example.com/page` are compared as the same destination. Register the behavior as required by F-2-3.

## Copy audit

Counts treat hyphenated terms, URLs, product names, and version identifiers as one word. This inventory deliberately includes headings, labels, buttons, navigation, and image alt text as well as full prose, because all affect a cold first read. No item exceeds 22 words. `†` denotes a finding above; the table gives the proposed repair there.

### Landing page

| Words | Exact text | Result |
|---:|---|---|
| 3 | Bookmark Merge Map | Clear wordmark; repeated header/footer. |
| 1 | Demo | Clear navigation label. |
| 3 | How it works | Clear navigation/section label. |
| 1 | Privacy | Clear navigation label. |
| 4 | Merge two bookmark exports | Pass: concrete job headline. |
| 9 | For people whose browser and phone bookmarks no longer match. | Pass: names audience and situation. |
| 6 | Try it with sample data | Pass: result-naming first action. |
| 4 | Choose two HTML exports | Pass: clear real-data alternative. |
| 9 | See duplicates, missing links, and conflicts before using your files. | † Unlisted feature claim; F-2-3. |
| 5 | Files stay in your browser. | Pass: `privacy-local`. |
| 5 | Works offline after first visit. | Pass: `offline-reload`. |
| 4 | Free with no account. | Pass: `free-no-account`. |
| 5 | Two exports · one reviewed merge | Pass: informative visual caption, not a mood slogan. |
| 2 | Choose files | Clear progress label. |
| 1 | Compare | Clear progress label. |
| 1 | Review | Clear progress label. |
| 1 | Download | Clear progress label. |
| 2 | Bookmark exports | Clear section kicker. |
| 6 | Choose your two bookmark HTML files | Pass: concrete section heading. |
| 9 | Export bookmarks as HTML from each browser or profile. | Pass: usable instruction. |
| 4 | Try sample data instead | Pass: clear alternative action. |
| 3 | Export A · desktop | Clear source label. |
| 5 | Choose a browser bookmark export | Pass: usable empty-state instruction. |
| 3 | Choose HTML file | Pass: result-naming file action. |
| 5 | or drop the file here | Pass: usable instruction. |
| 3 | Export B · mobile | Clear source label. |
| 6 | Your data stays in your browser | Pass: `privacy-local`. |
| 7 | Comparison and downloads run on this device. | Pass: `privacy-local`. |
| 7 | Real projects are saved here for recovery. | Pass: `project-recovery`. |
| 4 | Group common campaign links | Clear control label. |
| 10 | Known campaign tags, such as utm_source, are ignored during matching. | Pass: `tracking-grouping`. |
| 6 | Downloaded URLs keep their original form. | Pass: `tracking-grouping`. |
| 3 | How merging works | Pass: descriptive heading. |
| 3 | Read each export | Pass: descriptive step heading. |
| 9 | Read folder paths, titles, and URLs from both files. | Pass: `bookmark-reading`. |
| 4 | Find likely duplicate URLs | Pass: descriptive step heading. |
| 9 | Compare hosts, fragments, parameter order, and optional campaign tags. | † Jargon and unlisted normalization claim; F-2-3/F-2-4. |
| 4 | Keep unique bookmarks selected | Pass: descriptive step heading. |
| 10 | Keep one-sided links and title conflicts until you remove them. | Pass: `default-inclusion`. |
| 3 | Download both records | Pass: descriptive step heading. |
| 8 | Download merged bookmark HTML and a review CSV. | Pass: `html-export`/`csv-export`. |
| 5 | What this does not do | Pass: descriptive limits heading. |
| 6 | It does not open bookmark pages. | Pass: `no-live-pages`. |
| 9 | It does not update bookmarks already in your browser. | Pass: `no-live-pages`. |
| 9 | Compare two bookmark exports and download one reviewed merge. | Clear footer one-liner. |
| 10 | Original illustration generated for this product with Azure AI Foundry. | † Unlisted provenance claim; F-2-3. |
| 1 | Terms | Clear footer label. |
| 4 | Built by Param Factory | † Dead external link and no external indicator; F-2-2. |
| 4 | v1.1.0 · repair 1 | Build identifier; clear enough. |
| 13 | Two green routes converge into one red route on an abstract paper map. | Pass: purposeful, plain image alt text. |

### README

| Words | Exact text | Result |
|---:|---|---|
| 3 | Bookmark Merge Map | Clear document heading. |
| 5 | Compare two browser bookmark exports. | † Direct feature claim needs `merge-two-exports`; F-2-3. |
| 11 | Review duplicates, links found in one export, and same-title URL conflicts. | † Direct feature claim needs `sample-results`/merge coverage; F-2-3. |
| 4 | Choose titles and folders. | † Direct feature claim needs `merge-two-exports`; F-2-3. |
| 8 | Download merged bookmark HTML and a review CSV. | Pass: export claims. |
| 14 | Bookmark Merge Map is for people whose browser and phone bookmarks no longer match. | Pass: audience statement. |
| 5 | Files stay in your browser. | Pass: `privacy-local`. |
| 7 | Real projects are saved there for recovery. | Pass: `project-recovery`. |
| 9 | Downloads create new files and keep source URLs unchanged. | Pass: `new-file-exports`. |
| 4 | Try the isolated demo | Clear heading. |
| 10 | Open `/demo` to explore five sample results in one click. | † Direct demo-entry claim; F-2-1/F-2-3. |
| 7 | It uses the separate `demo:bookmark-merge-map` IndexedDB database. | Pass: `demo-isolation`. |
| 5 | **Reset demo** restores the original sample. | † Direct reset claim; F-2-3. |
| 12 | **Start for real** discards demo data and restores only your real project. | Pass: `demo-isolation`. |
| 9 | The installed app works offline after an online visit. | Pass: `offline-reload`. |
| 7 | It is free and needs no account. | Pass: `free-no-account`. |
| 2 | Run locally | Clear heading. |
| 5 | Requires Node.js 20 or newer. | Clear requirement. |
| 5 | Open the printed local URL. | Clear instruction. |
| 11 | Choose two browser bookmark exports in HTML format, or open `/demo`. | Clear instruction. |
| 3 | Test and build | Clear heading. |
| 8 | Every visitor-facing product claim is listed in `.factory/claims.json`. | † Contradicted by F-2-3; register or remove the unlisted statements. |
| 8 | Run each listed command from a clean checkout. | Clear verification instruction. |
| 14 | The production build writes `dist/index.html`, route assets, the service worker, and static deployment configuration. | Clear build behavior; observed in this review. |
| 1 | Deploy | Clear heading. |
| 7 | Deploy the contents of `dist/` as a static site. | Clear deployment instruction. |
| 6 | HTTPS is required for service-worker installation. | Clear platform requirement. |
| 7 | The factory work order owns deployment. | Clear scope instruction. |
| 8 | Do not change DNS, billing, or infrastructure from this repository. | Clear scope instruction. |
| 3 | Privacy and behavior | Clear heading. |
| 8 | Bookmark contents are not sent to an API. | Pass: `privacy-local`. |
| 8 | Demo and real projects use separate IndexedDB databases. | Pass: `demo-isolation`. |
| 12 | Known campaign tags can be ignored for matching without changing downloaded URLs. | Pass: `tracking-grouping`. |
| 5 | The control is reversible. | Pass: `tracking-grouping`. |
| 7 | See `/privacy` and `/terms` in the built app. | Clear route instruction. |
| 3 | License and artwork | Clear heading. |
| 1 | MIT. | Clear license statement. |
| 9 | The generated map artwork is original to this product. | † Unlisted provenance claim; F-2-3. |
| 10 | Its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`. | Pass: repository documentation pointer. |

## Claims, sandbox, and quality evidence

`.factory/claims.json` contains 13 entries. From clean clone `/tmp/bookmark-merge-map-review2-qADGOa` at the reviewed commit:

- `npm ci` completed with zero vulnerabilities.
- `npm test` passed 16/16.
- `npm run build` passed and produced `dist/`.
- Each of the 13 exact manifest commands was invoked individually with its declared Chromium project; the final Playwright result was passed with no failed tests.
- The combined tagged run passed 26/26 across Chromium desktop and mobile.
- The full live suite, `PLAYWRIGHT_BASE_URL=https://bookmark-merge-map.sociobot.in npm run test:e2e`, passed 36/36; its final run record reports `status: passed` and no failed tests.

The live demo created only `demo:bookmark-merge-map` in a fresh browser context. Changing a demo row and waiting for Reset restored five selected results. Cold-load and demo-flow request logs contained only `https://bookmark-merge-map.sociobot.in`; console errors were zero. The offline, export, recovery, original-URL, and non-live-page claim tests all passed. The claim failures in F-2-3 are registry coverage gaps, not failures of the currently listed tests.

## Earlier finding recheck

Every finding from `.factory/review-1.md` and `.factory/polish-1.md` was checked on the live site and in current code:

| Earlier id / item | Current result |
|---|---|
| F-1-1 demo isolation and controls | Fixed: `/demo` and `?demo=1` seed five rows, show the required banner/reset/exit controls, and use a separate IndexedDB database. F-2-1 is a new first-viewport failure, not a return to shared storage. |
| F-1-2 plain first screen | Fixed at both viewports; see cold first-read result. |
| F-1-3 registry and tagged tests | Fixed for the original listed claims: 13 entries and 13 tagged tests pass. F-2-3 identifies additional present copy that still needs entries. |
| F-1-4 routes, metadata, shell, 404 | Fixed: `/demo`, `/privacy`, and `/terms` return 200 with correct route titles and focused H1 on SPA navigation; unknown live paths return styled 404/HTTP 404. Canonical, OG image, Twitter card, favicon, shell, skip link, and legal links are present. |
| F-1-5 offline reliability | Fixed in the exercised clean/live claim suite. |
| F-1-6 / F-1-7 metaphorical copy and README density | Fixed except the technical wording recorded in F-2-4. All audited text is at most 22 words. |
| F-1-8 title/description | Fixed: root title is `Bookmark Merge Map — merge two bookmark exports`; description is concrete and plain. |
| F-1-9 demo documentation | Fixed: `.factory/demo.md` accurately documents entry, sample, namespace, reset, exit, and offline checking. |
| Earlier verification regressions: contrast, cache/security policy, CSP-safe offline page, grouping preservation, CSV formula safety, 44px controls | Confirmed by the current unit/e2e suite; no regression observed. |

## Structure, links, and product scope

The site uses a product-specific topographic field-map system rather than a generic SaaS template. It has one H1 per checked route, a language declaration, main landmark, visible focus support, reduced-motion coverage, responsive layout checks, sitemap/robots, canonical/OG/Twitter metadata, and a styled 404. The live unknown route returned HTTP 404; internal links crawled successfully. The only dead link is F-2-2.

No AI feature is required for the stated deterministic comparison job, and adding one would be decorative. The product already supports the implied import and HTML/CSV export work. No missed-leverage finding is raised.

## What would make this perfect

Make the demo look like a working comparison before the first scroll, not merely announce that one exists. Then make the factory footer link valid, remove or prove every unlisted visitor promise, and replace the URL-structure jargon with a result visitors can predict. Once those items have tests and the full suite remains green, the product can meet the zero-findings standard.
