# Demo sandbox

- URL: `https://bookmark-merge-map.sociobot.in/demo` (the equivalent `/?demo=1` entry also works).
- First screen: the sample title, original URL, selected state, export source, and folder appear immediately below the demo banner at 390×844 and larger viewports.
- Sample: three desktop bookmarks and four phone bookmarks become five results. The set includes two shared destinations, two same-title URL conflicts, and one phone-only link.
- Sample URLs are displayed as text, not links. This keeps fictional sample destinations from sending visitors to dead external pages.
- Isolation: demo state uses IndexedDB database `demo:bookmark-merge-map`. Real work uses `bookmark-merge-map`. Demo code never reads or writes the real database.
- Reset: **Reset demo** clears the demo record and immediately reseeds the original five results.
- Exit: **Start for real** clears the demo record, opens `/`, and restores only the real project.
- Offline check: visit `/demo` online once, wait for service-worker control, set the browser context offline, then reload `/demo`.
