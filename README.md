# Bookmark Merge Map

Compare two browser bookmark exports. Review duplicates, links found in one export, and same-title URL conflicts.

Choose titles and folders. Download merged bookmark HTML and a review CSV.

Bookmark Merge Map is for people whose browser and phone bookmarks no longer match.

Files stay in your browser. Real projects are saved there for recovery. Downloads create new files and keep source URLs unchanged.

## Try the isolated demo

Open `/demo` to explore five sample results in one click. It uses the separate `demo:bookmark-merge-map` IndexedDB database.

**Reset demo** restores the original sample. **Start for real** discards demo data and restores only your real project.

The installed app works offline after an online visit. It is free and needs no account.

## Run locally

Requires Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Open the printed local URL. Choose two browser bookmark exports in HTML format, or open `/demo`.

## Test and build

```bash
npm test
npm run build
npm run test:e2e
```

Every visitor-facing product claim is listed in `.factory/claims.json`. Run each listed command from a clean checkout.

The production build writes `dist/index.html`, route assets, the service worker, and static deployment configuration.

## Deploy

Deploy the contents of `dist/` as a static site. HTTPS is required for service-worker installation.

The factory work order owns deployment. Do not change DNS, billing, or infrastructure from this repository.

## Privacy and behavior

Bookmark contents are not sent to an API. Demo and real projects use separate IndexedDB databases.

Known campaign tags can be ignored for matching without changing downloaded URLs. The control is reversible.

See `/privacy` and `/terms` in the built app.

## License and artwork

MIT. The generated map artwork is original to this product.

Its prompt and provenance are recorded in `.factory/design.md` and `assets/src/`.
