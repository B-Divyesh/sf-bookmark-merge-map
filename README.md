# Bookmark Merge Map

Bookmark Merge Map is a free, offline-first browser utility for people whose desktop and mobile bookmark trees have diverged. It compares two standard browser HTML exports, groups canonical duplicates, calls out one-sided links and same-title URL conflicts, lets you choose titles/folders, and exports both a merged HTML file and an audit CSV.

Files never leave the browser. The originals are never modified, and the default merge keeps every distinct destination.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the printed local URL. Export bookmarks from two browsers/profiles as HTML and place them in the A and B source-map fields. “Use sample maps” exercises the workflow without private data.

## Test and build

```bash
npm test
npm run build
npm run test:e2e
```

The exact production build command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root. Preview it with `npx vite preview`.

## Deploy

Deploy the contents of `dist/` as a static site. HTTPS is required for service-worker installation. No environment variables, backend, account, analytics, or paid service is needed.

## Privacy and limits

The working files and review choices are stored in local IndexedDB for recovery. The app does not fetch bookmark pages, so it compares URL structure and bookmark metadata rather than live page content. Tracking-parameter grouping is explicit and reversible. See `/privacy/` and `/terms/` in the built app.

## License

MIT. The generated hero artwork is original to this product; its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`.
