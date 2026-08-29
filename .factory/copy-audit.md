# Copy audit — polish 3

Audited 2026-08-29. Counts treat contractions and hyphenated terms as one word. Sample bookmark titles, URLs, file names, and numeric result summaries are data rather than landing copy.

## Root landing page

| Words | Text | Result |
|---:|---|---|
| 4 | Merge two bookmark exports | Pass: job headline, verb first |
| 9 | For people whose browser and phone bookmarks no longer match. | Pass: audience and situation |
| 6 | Try it with sample data | Pass: primary action |
| 4 | Choose two HTML exports | Pass: real alternative |
| 9 | See duplicates, missing links, and conflicts before using your files. | Pass; `sample-results` claim |
| 5 | Files stay in your browser. | Pass; `privacy-local` claim |
| 5 | Works offline after first visit. | Pass; `offline-reload` claim |
| 4 | Free with no account. | Pass; `free-no-account` claim |
| 6 | Choose your two bookmark HTML files | Pass |
| 9 | Export bookmarks as HTML from each browser or profile. | Pass |
| 4 | Try sample data instead | Pass |
| 5 | Choose a browser bookmark export | Pass |
| 4 | Choose HTML file | Pass |
| 5 | or drop the file here | Pass |
| 6 | Your data stays in your browser | Pass; `privacy-local` claim |
| 7 | Comparison and downloads run on this device. | Pass; `privacy-local` claim |
| 8 | Real projects are saved here for recovery. | Pass; `project-recovery` claim |
| 4 | Group common campaign links | Pass |
| 10 | Known campaign tags, such as utm_source, are ignored during matching. | Pass; `tracking-grouping` claim |
| 6 | Downloaded URLs keep their original form. | Pass; `tracking-grouping` claim |
| 3 | How merging works | Pass |
| 3 | Read each export | Pass |
| 9 | Read folder paths, titles, and URLs from both files. | Pass; `bookmark-reading` claim |
| 4 | Find likely duplicate URLs | Pass |
| 12 | Treat links that differ only by common campaign labels as the same bookmark. | Pass; `campaign-label-matching` claim |
| 4 | Keep unique bookmarks selected | Pass |
| 10 | Keep one-sided links and title conflicts until you remove them. | Pass; `default-inclusion` claim |
| 3 | Download both records | Pass |
| 8 | Download merged bookmark HTML and a review CSV. | Pass; export claims |
| 5 | What this does not do | Pass |
| 6 | It does not open bookmark pages. | Pass; `no-live-pages` claim |
| 9 | It does not update bookmarks already in your browser. | Pass; `no-live-pages` claim |
| 9 | Compare two bookmark exports and download one reviewed merge. | Pass |
| 10 | Map illustration generated for this product with Azure AI Foundry. | Pass; `artwork-provenance` claim |

## Demo and result copy

| Words | Text | Result |
|---:|---|---|
| 7 | Demo — sample data, nothing is saved | Pass; `demo-isolation` claim |
| 2 | Reset demo | Pass |
| 3 | Start for real | Pass |
| 4 | Compare sample bookmark exports | Pass |
| 9 | Review five results from desktop and phone bookmark exports. | Pass |
| 7 | See the merge before you review it | Pass; sample preview heading |
| 5 | Review all five results | Pass; direct full-review link |
| 1 | Shared | Pass; sample status |
| 2 | Needs review | Pass; sample status |
| 3 | Only in B | Pass; sample status |
| 1 | Selected | Pass; explicit selected state |
| 3 | Review the comparison | Pass |
| 9 | Each distinct destination stays selected until you remove it. | Pass; `default-inclusion` claim |
| 4 | No bookmarks match this view. | Pass |
| 7 | Change the filter or clear your search. | Pass |
| 4 | Download the reviewed merge | Pass |
| 14 | Create a merged bookmark HTML file and a CSV record of every match and choice. | Pass; export claims |
| 4 | Downloads create new files. | Pass; `new-file-exports` claim |
| 8 | Check the review CSV before importing the HTML. | Pass |

## README prose

| Words | Sentence | Result |
|---:|---|---|
| 5 | Compare two browser bookmark exports. | Pass; `merge-two-exports` |
| 11 | Review duplicates, links found in one export, and same-title URL conflicts. | Pass; `sample-results` |
| 4 | Choose titles and folders. | Pass; `merge-two-exports` |
| 8 | Download merged bookmark HTML and a review CSV. | Pass; export claims |
| 14 | Bookmark Merge Map is for people whose browser and phone bookmarks no longer match. | Pass |
| 5 | Files stay in your browser. | Pass; `privacy-local` |
| 7 | Real projects are saved there for recovery. | Pass; `project-recovery` |
| 9 | Downloads create new files and keep source URLs unchanged. | Pass; `new-file-exports` |
| 10 | Open `/demo` to explore five sample results in one click. | Pass; `demo-first-screen` |
| 10 | A populated result appears in the first phone-sized screen. | Pass; `demo-first-screen` |
| 8 | The demo uses the separate `demo:bookmark-merge-map` IndexedDB database. | Pass; `demo-isolation` |
| 5 | Reset demo restores the original sample. | Pass; `demo-reset` |
| 12 | Start for real discards demo data and restores only your real project. | Pass; `demo-isolation` |
| 9 | The installed app works offline after an online visit. | Pass; `offline-reload` |
| 7 | It is free and needs no account. | Pass; `free-no-account` |
| 5 | Requires Node.js 20 or newer. | Pass; `node-version` claim and package metadata |
| 5 | Open the printed local URL. | Pass |
| 11 | Choose two browser bookmark exports in HTML format, or open `/demo`. | Pass |
| 9 | Run every command in `.factory/claims.json` from a clean checkout. | Pass; verification instruction |
| 14 | The production build writes `dist/index.html`, route assets, the service worker, and static deployment configuration. | Pass; `build-output` claim |
| 7 | Deploy the contents of `dist/` as a static site. | Pass |
| 7 | The factory work order owns deployment. | Pass |
| 8 | Do not change DNS, billing, or infrastructure from this repository. | Pass |
| 8 | Bookmark contents are not sent to an API. | Pass; `privacy-local` |
| 8 | Demo and real projects use separate IndexedDB databases. | Pass; `demo-isolation` |
| 13 | Links that differ only by common campaign labels can match without changing downloaded URLs. | Pass; matching claims |
| 4 | The control is reversible. | Pass; `tracking-grouping` |
| 7 | See `/privacy` and `/terms` in the built app. | Pass |
| 1 | MIT. | Pass |
| 11 | The map illustration was generated for this product with Azure AI Foundry. | Pass; `artwork-provenance` |
| 10 | Its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`. | Pass; `artwork-provenance` |

All README sentences are at or below 14 words. No banned term appears. Product claims map directly to `.factory/claims.json`.

## Terminology

| Concept | One term used |
|---|---|
| Browser-generated source file | bookmark export |
| Reconciled output | merge |
| Individual saved destination | bookmark |
| Isolated sample experience | demo |
| Human-readable decision record | review CSV |
| Persistent non-demo state | real project |

No sentence exceeds 22 words. No banned marketing word appears in visitor copy.
