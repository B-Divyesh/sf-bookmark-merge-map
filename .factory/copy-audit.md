# Copy audit — polish 1

Audited 2026-08-28. Counts treat contractions and hyphenated terms as one word. Sample bookmark titles, URLs, file names, and numeric result summaries are data rather than landing copy.

## Root landing page

| Words | Text | Result |
|---:|---|---|
| 4 | Merge two bookmark exports | Pass: job headline, verb first |
| 9 | For people whose browser and phone bookmarks no longer match. | Pass: audience and situation |
| 6 | Try it with sample data | Pass: primary action |
| 4 | Choose two HTML exports | Pass: real alternative |
| 9 | See duplicates, missing links, and conflicts before using your files. | Pass |
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
| 8 | Compare hosts, fragments, parameter order, and optional campaign tags. | Pass; `tracking-grouping` claim |
| 4 | Keep unique bookmarks selected | Pass |
| 10 | Keep one-sided links and title conflicts until you remove them. | Pass; `default-inclusion` claim |
| 3 | Download both records | Pass |
| 8 | Download merged bookmark HTML and a review CSV. | Pass; export claims |
| 5 | What this does not do | Pass |
| 6 | It does not open bookmark pages. | Pass; `no-live-pages` claim |
| 9 | It does not update bookmarks already in your browser. | Pass; `no-live-pages` claim |
| 9 | Compare two bookmark exports and download one reviewed merge. | Pass |

## Demo and result copy

| Words | Text | Result |
|---:|---|---|
| 7 | Demo — sample data, nothing is saved | Pass; `demo-isolation` claim |
| 2 | Reset demo | Pass |
| 3 | Start for real | Pass |
| 4 | Compare sample bookmark exports | Pass |
| 9 | Review five results from desktop and phone bookmark exports. | Pass |
| 3 | Review the comparison | Pass |
| 9 | Each distinct destination stays selected until you remove it. | Pass; `default-inclusion` claim |
| 4 | No bookmarks match this view. | Pass |
| 7 | Change the filter or clear your search. | Pass |
| 4 | Download the reviewed merge | Pass |
| 14 | Create a merged bookmark HTML file and a CSV record of every match and choice. | Pass; export claims |
| 4 | Downloads create new files. | Pass; `new-file-exports` claim |
| 8 | Check the review CSV before importing the HTML. | Pass |

## README prose

All 31 README sentences are at or below 18 words. No banned term appears. Product claims map to `.factory/claims.json`; build and deployment instructions describe repository operations.

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
