import './styles.css';
import { parseBookmarkHtml, reconcile, reparseMap } from './bookmarks';
import { downloadText, exportBookmarkHtml, exportReviewCsv, selectedRows } from './exporters';
import { clearProject, loadProject, saveProject, type StorageSpace } from './storage';
import type { ImportedMap, MergeRow, RowStatus, SavedProject, SourceId } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;
const BUILD = 'v1.2.0 · polish 2';
const ORIGIN = 'https://bookmark-merge-map.sociobot.in';
type PageRoute = 'home' | 'demo' | 'privacy' | 'terms' | 'not-found';

const state: {
  route: PageRoute; mapA?: ImportedMap; mapB?: ImportedMap; rows: MergeRow[];
  stripTracking: boolean; filter: RowStatus | 'all'; query: string; visible: number;
  error: string; note: string; exported: boolean;
  decisions: NonNullable<SavedProject['decisions']>; offlineReady: boolean;
} = {
  route: routeFromLocation(), rows: [], stripTracking: true, filter: 'all', query: '', visible: 80,
  error: '', note: '', exported: false, decisions: {}, offlineReady: Boolean(navigator.serviceWorker?.controller)
};

const sampleA = `<!DOCTYPE NETSCAPE-Bookmark-file-1><TITLE>Desktop</TITLE><H1>Desktop</H1><DL><p><DT><H3>Field notes</H3><DL><p><DT><A HREF="https://example.com/guide?utm_source=desktop">Trail guide</A><DT><A HREF="https://developer.mozilla.org/en-US/docs/Web/API">Web APIs</A><DT><A HREF="https://example.org/archive">Reading archive</A></DL><p></DL><p>`;
const sampleB = `<!DOCTYPE NETSCAPE-Bookmark-file-1><TITLE>Mobile</TITLE><H1>Mobile</H1><DL><p><DT><H3>Saved on phone</H3><DL><p><DT><A HREF="https://example.com/guide?utm_source=mobile">Trail guide</A><DT><A HREF="https://developer.mozilla.org/en-US/docs/Web/API#interfaces">MDN Web APIs</A><DT><A HREF="https://example.net/archive">Reading archive</A><DT><A HREF="https://web.dev/learn/pwa/">Learn PWA</A></DL><p></DL><p>`;

function routeFromLocation(): PageRoute {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  if (new URLSearchParams(location.search).get('demo') === '1' || path === '/demo') return 'demo';
  if (path === '/') return 'home';
  if (path === '/privacy') return 'privacy';
  if (path === '/terms') return 'terms';
  return 'not-found';
}

function storageSpace(): StorageSpace { return state.route === 'demo' ? 'demo' : 'real'; }
function escapeHtml(value: string): string { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function filenameDate(): string { return new Date().toISOString().slice(0, 10); }
function uniqueValues<T>(items: T[], key: (item: T) => string): T[] { const seen = new Set<string>(); return items.filter((item) => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true; }); }
function decisionKey(row: MergeRow): string { return `v2\u0000${row.id}\u0000${row.items.map((item) => `${item.source}:${item.id}`).sort().join(',')}`; }

function setHead(title: string, description: string, path: string): void {
  document.title = title;
  const canonical = `${ORIGIN}${path}`;
  const values: Record<string, string> = { description, 'og:title': title, 'og:description': description, 'og:url': canonical, 'twitter:title': title, 'twitter:description': description };
  Object.entries(values).forEach(([name, content]) => {
    const selector = name === 'description' ? 'meta[name="description"]' : `meta[property="${name}"], meta[name="${name}"]`;
    document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
  });
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
}

function brand(): string {
  return `<a class="brand" href="/" data-nav aria-label="Bookmark Merge Map home"><svg aria-hidden="true" viewBox="0 0 48 48"><path d="M5 10c8 0 12 5 19 14 7-9 11-14 19-14M24 24v19"/><circle cx="24" cy="24" r="3"/></svg><span>Bookmark<br>Merge Map</span></a>`;
}

function shellHeader(): string {
  return `<header class="site-header">${brand()}<nav class="header-meta" aria-label="Main navigation"><a href="/demo" data-nav>Demo</a><a href="/#how" data-nav>How it works</a><a href="/privacy" data-nav>Privacy</a></nav></header>`;
}

function shellFooter(): string {
  return `<footer>${brand()}<p>Compare two bookmark exports and download one reviewed merge.<br><span>Map illustration generated for this product with Azure AI Foundry.</span></p><nav aria-label="Footer"><a href="/privacy" data-nav>Privacy</a><a href="/terms" data-nav>Terms</a><a href="https://sociobot.in/" target="_blank" rel="noopener noreferrer">Built by Param Factory <span class="visually-hidden">(opens sociobot.in)</span><span aria-hidden="true">↗</span></a><span>${BUILD}</span></nav></footer>`;
}

function demoBanner(): string {
  return state.route === 'demo' ? `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button type="button" data-action="reset-demo">Reset demo</button><a href="/" data-action="start-real">Start for real</a></div></aside>` : '';
}

function counts() {
  const occurrences = (state.mapA?.bookmarks.length || 0) + (state.mapB?.bookmarks.length || 0);
  const included = selectedRows(state.rows).length;
  const byStatus = (status: RowStatus) => state.rows.filter((row) => row.status === status).length;
  return { occurrences, included, collapsed: occurrences - state.rows.length, excluded: state.rows.length - included, shared: byStatus('shared'), aOnly: byStatus('a-only'), bOnly: byStatus('b-only'), conflicts: byStatus('conflict') };
}

function currentDecisions(): SavedProject['decisions'] {
  state.decisions = { ...state.decisions, ...Object.fromEntries(state.rows.map((row) => [decisionKey(row), { included: row.included, title: row.title, folder: [...row.folder] }])) };
  return state.decisions;
}

async function persist(): Promise<void> {
  const project: SavedProject = {
    mapA: state.mapA && { name: state.mapA.name, importedAt: state.mapA.importedAt, html: state.mapA.html },
    mapB: state.mapB && { name: state.mapB.name, importedAt: state.mapB.importedAt, html: state.mapB.html },
    stripTracking: state.stripTracking, savedAt: Date.now(), decisions: currentDecisions()
  };
  try { await saveProject(project, storageSpace()); } catch { state.note = 'This browser could not save the current comparison. Downloads still work.'; }
}

function calculate(decisions = state.decisions): void {
  if (!state.mapA || !state.mapB) { state.rows = []; return; }
  state.rows = reconcile(state.mapA.bookmarks, state.mapB.bookmarks);
  state.rows.forEach((row) => {
    const saved = decisions?.[decisionKey(row)] || decisions?.[row.id];
    if (!saved) return;
    row.included = saved.included;
    if (row.items.some((item) => item.title === saved.title)) row.title = saved.title;
    if (row.items.some((item) => item.folder.join('\u0000') === saved.folder.join('\u0000'))) row.folder = saved.folder;
  });
}

function resetState(): void {
  state.mapA = undefined; state.mapB = undefined; state.rows = []; state.decisions = {}; state.query = '';
  state.filter = 'all'; state.visible = 80; state.exported = false; state.error = ''; state.note = '';
}

function seedDemo(): void {
  resetState(); state.stripTracking = true;
  state.mapA = parseBookmarkHtml(sampleA, 'a', true, 'desktop-sample.html');
  state.mapB = parseBookmarkHtml(sampleB, 'b', true, 'mobile-sample.html');
  calculate();
}

function mapCard(source: SourceId, map?: ImportedMap): string {
  const label = source === 'a' ? 'Export A · desktop' : 'Export B · mobile';
  const inputId = `file-${source}`;
  return `<section class="map-card ${map ? 'is-loaded' : ''}" data-drop="${source}" aria-labelledby="label-${source}"><div class="map-card-top"><span class="map-letter">${source.toUpperCase()}</span><div><h3 id="label-${source}">${label}</h3><p>${map ? `${map.bookmarks.length.toLocaleString()} bookmarks read` : 'Choose a browser bookmark export'}</p></div></div>${map ? `<div class="file-readout"><span aria-hidden="true">✓</span><strong>${escapeHtml(map.name)}</strong><button class="text-button" data-replace="${source}" type="button">Replace file</button></div>` : `<label class="file-pick" for="${inputId}"><span>Choose HTML file</span><small>or drop the file here</small></label>`}<input class="visually-hidden file-input" id="${inputId}" data-source="${source}" type="file" accept=".html,.htm,text/html" aria-label="Choose an HTML file for ${label}"></section>`;
}

function progress(): string {
  const active = state.exported ? 3 : state.rows.length ? 2 : state.mapA && state.mapB ? 1 : 0;
  const steps = ['Choose files', 'Compare', 'Review', 'Download'];
  return `<nav class="route" aria-label="Merge progress"><ol>${steps.map((label, index) => `<li class="${index <= active ? 'reached' : ''}" ${index === active ? 'aria-current="step"' : ''}><span>${index + 1}</span>${label}</li>`).join('')}</ol></nav>`;
}

function resultRow(row: MergeRow, index: number): string {
  const titles = uniqueValues(row.items.map((item) => item.title), (title) => title);
  const folders = uniqueValues(row.items.map((item) => item.folder), (folder) => folder.join('\u0000'));
  const statusLabels: Record<RowStatus, string> = { shared: 'Shared', 'a-only': 'Only in A', 'b-only': 'Only in B', conflict: 'Needs review' };
  const original = row.items[0];
  return `<article class="result-row ${row.included ? '' : 'excluded'}" data-result-index="${index}"><label class="include-control"><input type="checkbox" data-action="include" ${row.included ? 'checked' : ''}><span class="visually-hidden">Include ${escapeHtml(row.title)}</span></label><div class="result-main"><div class="result-heading"><span class="status-mark status-${row.status}">${statusLabels[row.status]}</span><span class="inclusion-state">${row.included ? 'Included in export' : 'Excluded from export'}</span><span class="sources" aria-label="Found in export ${[...new Set(row.items.map((item) => item.source.toUpperCase()))].join(' and ')}">${[...new Set(row.items.map((item) => item.source.toUpperCase()))].join('+')}</span></div>${titles.length > 1 ? `<label class="choice-label">Export title<select data-action="title">${titles.map((title) => `<option ${title === row.title ? 'selected' : ''}>${escapeHtml(title)}</option>`).join('')}</select></label>` : `<h3>${escapeHtml(row.title)}</h3>`}${/^https?:/i.test(original.url) ? `<a class="url" href="${escapeHtml(original.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(original.url)}</a>` : `<span class="url">${escapeHtml(original.url)}</span>`}<div class="row-meta">${folders.length > 1 ? `<label class="choice-label">Destination<select data-action="folder">${folders.map((folder) => { const path = folder.join(' / ') || 'Bookmarks bar'; return `<option value="${escapeHtml(folder.join('\u0000'))}" ${folder.join('\u0000') === row.folder.join('\u0000') ? 'selected' : ''}>${escapeHtml(path)}</option>`; }).join('')}</select></label>` : `<span class="folder">⌁ ${escapeHtml(row.folder.join(' / ') || 'Bookmarks bar')}</span>`}${row.notes.map((note) => `<span class="note">${escapeHtml(note)}</span>`).join('')}</div></div></article>`;
}

function demoPreview(): string {
  if (state.route !== 'demo' || !state.rows.length) return '';
  const representatives = [
    state.rows.find((row) => row.status === 'shared'),
    state.rows.find((row) => row.status === 'conflict'),
    state.rows.find((row) => row.status === 'b-only')
  ].filter((row): row is MergeRow => Boolean(row));
  const statusLabels: Record<RowStatus, string> = { shared: 'Shared', 'a-only': 'Only in A', 'b-only': 'Only in B', conflict: 'Needs review' };
  return `<section class="demo-preview" aria-labelledby="demo-preview-title"><div class="demo-preview-head"><div><div class="section-kicker">SAMPLE RESULTS</div><h2 id="demo-preview-title">See the merge before you review it</h2></div><a class="text-button" href="#results-title">Review all five results</a></div><div class="demo-preview-grid">${representatives.map((row) => {
    const original = row.items[0];
    const sourceNames = [...new Set(row.items.map((item) => item.source.toUpperCase()))];
    return `<article class="demo-preview-card" data-preview-status="${row.status}"><div class="result-heading"><span class="status-mark status-${row.status}">${statusLabels[row.status]}</span><span class="inclusion-state">Selected</span><span class="sources" aria-label="Found in export ${sourceNames.join(' and ')}">${sourceNames.join('+')}</span></div><h3>${escapeHtml(row.title)}</h3><p class="preview-url">${escapeHtml(original.url)}</p><p class="folder">⌁ ${escapeHtml(row.folder.join(' / ') || 'Bookmarks bar')}</p></article>`;
  }).join('')}</div></section>`;
}

function results(): string {
  if (!state.rows.length) return '';
  const summary = counts();
  const matching = state.rows.filter((row) => (state.filter === 'all' || row.status === state.filter) && `${row.title} ${row.canonical} ${row.folder.join(' ')}`.toLowerCase().includes(state.query.toLowerCase()));
  const shown = matching.slice(0, state.visible);
  return `<section class="results-section" aria-labelledby="results-title"><div class="section-kicker">02 · REVIEW</div><div class="section-head"><div><h2 id="results-title">Review the comparison</h2><p>Each distinct destination stays selected until you remove it.</p></div><button class="secondary-button" data-action="reset">${state.route === 'demo' ? 'Reset demo' : 'Start over'}</button></div><div class="proof-strip" aria-label="Bookmark count report"><div><strong>${summary.occurrences}</strong><span>input bookmarks</span></div><span class="proof-arrow" aria-hidden="true">→</span><div><strong>${state.rows.length}</strong><span>distinct links</span></div><span class="proof-arrow" aria-hidden="true">→</span><div><strong>${summary.included}</strong><span>in download</span></div><p><b>${summary.collapsed}</b> duplicate ${summary.collapsed === 1 ? 'copy' : 'copies'} grouped · <b>${summary.excluded}</b> distinct ${summary.excluded === 1 ? 'link' : 'links'} removed by you</p></div><div class="review-tools"><div class="filter-group" role="group" aria-label="Filter results">${([['all', 'All', state.rows.length], ['conflict', 'Review', summary.conflicts], ['a-only', 'Only A', summary.aOnly], ['b-only', 'Only B', summary.bOnly], ['shared', 'Shared', summary.shared]] as const).map(([value, label, count]) => `<button type="button" data-filter="${value}" aria-pressed="${state.filter === value}">${label} <span>${count}</span></button>`).join('')}</div><label class="search-label"><span class="visually-hidden">Search results</span><input id="search" type="search" value="${escapeHtml(state.query)}" placeholder="Search title, URL, or folder"></label></div><div class="bulk-row"><p>Showing ${shown.length} of ${matching.length}</p><div><button type="button" class="text-button" data-action="include-all">Include visible</button><button type="button" class="text-button" data-action="exclude-all">Exclude visible</button></div></div><div class="result-list">${shown.map((row) => resultRow(row, state.rows.indexOf(row))).join('') || `<div class="no-matches"><strong>No bookmarks match this view.</strong><p>Change the filter or clear your search.</p></div>`}</div>${matching.length > state.visible ? `<button class="secondary-button show-more" data-action="more">Show ${Math.min(80, matching.length - state.visible)} more</button>` : ''}<section class="export-field" aria-labelledby="export-title"><div><div class="section-kicker">03 · DOWNLOAD</div><h2 id="export-title">Download the reviewed merge</h2><p>Create a merged bookmark HTML file and a CSV record of every match and choice.</p></div><div class="export-actions"><button class="primary-button" data-action="export-html" ${summary.included ? '' : 'disabled'}>Download merged HTML <span>${summary.included}</span></button><button class="secondary-button" data-action="export-csv">Download review CSV</button></div><p class="safety-line"><span aria-hidden="true">◎</span> Downloads create new files. Check the review CSV before importing the HTML.</p></section></section>`;
}

function importSection(): string {
  const ready = state.mapA && state.mapB;
  return `<section class="import-section" id="import" aria-labelledby="import-title"><div class="section-kicker">01 · BOOKMARK EXPORTS</div><div class="section-head"><div><h2 id="import-title">Choose your two bookmark HTML files</h2><p>Export bookmarks as HTML from each browser or profile.</p></div>${state.route === 'home' ? '<a class="text-button" href="/demo" data-nav>Try sample data instead</a>' : ''}</div><div class="map-grid">${mapCard('a', state.mapA)}<div class="merge-symbol" aria-hidden="true"><span>+</span></div>${mapCard('b', state.mapB)}</div><div class="privacy-note"><span class="compass" aria-hidden="true">✣</span><div><strong>Your data stays in your browser</strong><p>Comparison and downloads run on this device. Real projects are saved here for recovery.</p></div></div><label class="tracking-toggle"><input type="checkbox" id="tracking" ${state.stripTracking ? 'checked' : ''}><span><strong>Group common campaign links</strong><small>Known campaign tags, such as <code>utm_source</code>, are ignored during matching. Downloaded URLs keep their original form.</small></span></label>${ready && !state.rows.length ? `<button class="primary-button compare-button" data-action="compare">Compare ${state.mapA!.bookmarks.length} + ${state.mapB!.bookmarks.length} bookmarks</button>` : ''}</section>`;
}

function renderProduct(): string {
  const demo = state.route === 'demo';
  setHead(demo ? 'Demo — Bookmark Merge Map' : 'Bookmark Merge Map — merge two bookmark exports', demo ? 'Try a bookmark merge with isolated sample data.' : 'Compare two browser bookmark exports, review duplicates and conflicts, then download a merged HTML file.', demo ? '/demo' : '/');
  const hero = demo ? `<section class="demo-intro"><div class="section-kicker">SAMPLE COMPARISON</div><h1 tabindex="-1">Compare sample bookmark exports</h1><p>Review five results from desktop and phone bookmark exports.</p></section>` : `<section class="hero"><div class="hero-copy"><h1 tabindex="-1">Merge two bookmark exports</h1><p>For people whose browser and phone bookmarks no longer match.</p><div class="hero-actions"><a class="primary-button hero-button" href="/demo" data-nav>Try it with sample data</a><a class="secondary-button" href="#import">Choose two HTML exports</a></div><p class="action-note">See duplicates, missing links, and conflicts before using your files.</p><ul class="hero-facts"><li>Files stay in your browser.</li><li>Works offline after first visit.</li><li>Free with no account.</li></ul></div><picture class="hero-map"><source media="(max-width: 700px)" srcset="/assets/merge-map-640.webp"><source srcset="/assets/merge-map-960.webp 960w, /assets/merge-map-1536.webp 1536w" sizes="(max-width: 1100px) 50vw, 560px"><img src="/assets/merge-map-960.webp" width="960" height="640" alt="Two green routes converge into one red route on an abstract paper map." fetchpriority="high" decoding="async"><span class="map-caption">TWO EXPORTS · ONE REVIEWED MERGE</span></picture></section>`;
  return `${shellHeader()}${demoBanner()}<main id="main">${hero}${demoPreview()}${progress()}${importSection()}${results()}<section class="method" id="how" aria-labelledby="method-title"><div><div class="section-kicker">HOW IT WORKS</div><h2 id="method-title">How merging works</h2></div><ol><li><b>01</b><span><strong>Read each export</strong>Read folder paths, titles, and URLs from both files.</span></li><li><b>02</b><span><strong>Find likely duplicate URLs</strong>Treat links that differ only by common campaign labels as the same bookmark.</span></li><li><b>03</b><span><strong>Keep unique bookmarks selected</strong>Keep one-sided links and title conflicts until you remove them.</span></li><li><b>04</b><span><strong>Download both records</strong>Download merged bookmark HTML and a review CSV.</span></li></ol></section><section class="limits" aria-labelledby="limits-title"><h2 id="limits-title">What this does not do</h2><p>It does not open bookmark pages. It does not update bookmarks already in your browser.</p></section></main>${shellFooter()}`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  const title = privacy ? 'Privacy — Bookmark Merge Map' : 'Terms — Bookmark Merge Map';
  setHead(title, privacy ? 'How Bookmark Merge Map stores and processes bookmark files.' : 'Terms for using Bookmark Merge Map.', `/${kind}`);
  const body = privacy ? `<p class="section-kicker">EFFECTIVE 28 AUGUST 2026</p><h1 tabindex="-1">Privacy</h1><p>Bookmark Merge Map processes bookmark files inside your browser.</p><h2>Data on your device</h2><p>Real projects use IndexedDB so you can recover an interrupted comparison. Demo projects use a separate database and never read your real project.</p><h2>Network requests</h2><p>The app does not send bookmark contents to an API. The host may keep standard access logs, including the requested path, time, browser type, and IP address.</p><h2>Your downloads</h2><p>HTML and CSV files are created only when you choose a download button.</p><h2>Remove data</h2><p>Choose Start over to remove a real project. Choose Start for real to discard demo data.</p>` : `<p class="section-kicker">EFFECTIVE 28 AUGUST 2026</p><h1 tabindex="-1">Terms of use</h1><p>Bookmark Merge Map is provided under the MIT License.</p><h2>You control the result</h2><p>The app creates new files. Review the CSV and keep your original exports before importing a merged file.</p><h2>No warranty</h2><p>The software is provided “as is,” without warranty. Browser export formats can differ.</p><h2>Acceptable use</h2><p>Use only bookmark files that you are permitted to process.</p><h2>Changes</h2><p>The effective date identifies the current terms.</p>`;
  return `${shellHeader()}<main id="main" class="legal-page">${body}</main>${shellFooter()}`;
}

function notFoundPage(): string {
  setHead('Page not found — Bookmark Merge Map', 'This Bookmark Merge Map page does not exist.', '/404');
  return `${shellHeader()}<main id="main" class="not-found"><div class="contour-mark" aria-hidden="true">404</div><p class="section-kicker">PAGE NOT FOUND</p><h1 tabindex="-1">This page is not on the map</h1><p>Check the address or return to the bookmark merge tool.</p><a class="primary-button" href="/" data-nav>Return to Bookmark Merge Map</a></main>${shellFooter()}`;
}

function render(focusHeading = false): void {
  app.innerHTML = state.route === 'home' || state.route === 'demo' ? renderProduct() : state.route === 'privacy' || state.route === 'terms' ? legalPage(state.route) : notFoundPage();
  app.insertAdjacentHTML('beforeend', `<div class="toast ${state.error ? 'is-error' : ''}" role="status" aria-live="polite" ${state.error || state.note ? '' : 'hidden'}>${escapeHtml(state.error || state.note)}</div><div class="network-state" aria-live="polite">${navigator.onLine ? (state.offlineReady ? 'Offline use ready' : 'Preparing offline use') : 'Offline'}</div><div class="visually-hidden" id="route-status" aria-live="polite">${document.title}</div>`);
  bind(); if (focusHeading) requestAnimationFrame(() => document.querySelector<HTMLElement>('h1')?.focus());
}

function showMessage(message: string, error = false): void {
  state.error = error ? message : ''; state.note = error ? '' : message; render();
  window.setTimeout(() => { state.error = ''; state.note = ''; render(); }, 4500);
}

async function readFile(source: SourceId, file: File): Promise<void> {
  if (!/\.html?$/i.test(file.name) && file.type !== 'text/html') { showMessage('This is not a bookmark HTML file. Choose a file ending in .html or .htm.', true); return; }
  if (file.size > 20 * 1024 * 1024) { showMessage('This file is over 20 MB. Split the export, then try again.', true); return; }
  try {
    const map = parseBookmarkHtml(await file.text(), source, state.stripTracking, file.name);
    if (source === 'a') state.mapA = map; else state.mapB = map;
    state.rows = []; state.decisions = {}; await persist(); showMessage(`${file.name}: ${map.bookmarks.length} bookmarks read.`);
  } catch (error) { showMessage(error instanceof Error ? `${error.message} Choose another browser bookmark export.` : 'This file could not be read. Choose another browser bookmark export.', true); }
}

function filteredRows(): MergeRow[] { return state.rows.filter((row) => (state.filter === 'all' || row.status === state.filter) && `${row.title} ${row.canonical} ${row.folder.join(' ')}`.toLowerCase().includes(state.query.toLowerCase())); }

function navigate(href: string, replace = false): void {
  const url = new URL(href, location.href); if (url.origin !== location.origin) { location.assign(url.href); return; }
  if (replace) history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`); else history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  void loadRoute(true);
}

function bind(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-nav]').forEach((link) => link.addEventListener('click', (event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || link.target) return; event.preventDefault(); navigate(link.href); }));
  document.querySelectorAll<HTMLInputElement>('.file-input').forEach((input) => input.addEventListener('change', () => { const file = input.files?.[0]; if (file) void readFile(input.dataset.source as SourceId, file); }));
  document.querySelectorAll<HTMLElement>('[data-drop]').forEach((zone) => { zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('is-dragging'); }); zone.addEventListener('dragleave', () => zone.classList.remove('is-dragging')); zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('is-dragging'); const file = event.dataTransfer?.files[0]; if (file) void readFile(zone.dataset.drop as SourceId, file); }); });
  document.querySelectorAll<HTMLButtonElement>('[data-replace]').forEach((button) => button.addEventListener('click', () => document.querySelector<HTMLInputElement>(`#file-${button.dataset.replace}`)?.click()));
  document.querySelector<HTMLInputElement>('#tracking')?.addEventListener('change', (event) => { const hadResults = state.rows.length > 0; currentDecisions(); state.stripTracking = (event.currentTarget as HTMLInputElement).checked; if (state.mapA) state.mapA = reparseMap(state.mapA, 'a', state.stripTracking); if (state.mapB) state.mapB = reparseMap(state.mapB, 'b', state.stripTracking); if (hadResults) calculate(); void persist(); if (hadResults) showMessage('Grouping changed. Existing choices were kept where the bookmark match stayed the same.'); else render(); });
  document.querySelector('[data-action="compare"]')?.addEventListener('click', () => { calculate(); void persist(); render(); document.querySelector('#results-title')?.scrollIntoView({ behavior: 'smooth' }); });
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter as typeof state.filter; state.visible = 80; render(); }));
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => { state.query = (event.currentTarget as HTMLInputElement).value; state.visible = 80; render(); document.querySelector<HTMLInputElement>('#search')?.focus(); });
  document.querySelectorAll<HTMLElement>('[data-result-index]').forEach((element) => { const row = state.rows[Number(element.dataset.resultIndex)]; element.querySelector<HTMLInputElement>('[data-action="include"]')?.addEventListener('change', (event) => { row.included = (event.currentTarget as HTMLInputElement).checked; void persist(); render(); }); element.querySelector<HTMLSelectElement>('[data-action="title"]')?.addEventListener('change', (event) => { row.title = (event.currentTarget as HTMLSelectElement).value; void persist(); render(); }); element.querySelector<HTMLSelectElement>('[data-action="folder"]')?.addEventListener('change', (event) => { row.folder = (event.currentTarget as HTMLSelectElement).value ? (event.currentTarget as HTMLSelectElement).value.split('\u0000') : []; void persist(); render(); }); });
  document.querySelector('[data-action="more"]')?.addEventListener('click', () => { state.visible += 80; render(); });
  document.querySelector('[data-action="include-all"]')?.addEventListener('click', () => { filteredRows().forEach((row) => { row.included = true; }); void persist(); render(); });
  document.querySelector('[data-action="exclude-all"]')?.addEventListener('click', () => { filteredRows().forEach((row) => { row.included = false; }); void persist(); render(); });
  document.querySelector('[data-action="export-html"]')?.addEventListener('click', () => { downloadText(`merged-bookmarks-${filenameDate()}.html`, exportBookmarkHtml(state.rows), 'text/html;charset=utf-8'); state.exported = true; window.setTimeout(() => showMessage(`Merged HTML downloaded with ${selectedRows(state.rows).length} distinct links.`), 0); });
  document.querySelector('[data-action="export-csv"]')?.addEventListener('click', () => { downloadText(`bookmark-review-${filenameDate()}.csv`, exportReviewCsv(state.rows), 'text/csv;charset=utf-8'); window.setTimeout(() => showMessage('Review CSV downloaded.'), 0); });
  document.querySelector('[data-action="reset"]')?.addEventListener('click', async () => { if (state.route === 'demo') { await resetDemo(); return; } if (!confirm('Remove both imported files and every review choice from this browser?')) return; await clearProject('real'); resetState(); render(); });
  document.querySelector('[data-action="reset-demo"]')?.addEventListener('click', () => { void resetDemo(); });
  document.querySelector('[data-action="start-real"]')?.addEventListener('click', (event) => { event.preventDefault(); void startReal(); });
}

async function resetDemo(): Promise<void> { await clearProject('demo'); seedDemo(); await persist(); render(true); }
async function startReal(): Promise<void> { await clearProject('demo'); resetState(); history.pushState({}, '', '/'); state.route = 'home'; await restore('real'); render(true); }

async function restore(space: StorageSpace): Promise<void> {
  try {
    const saved = await loadProject(space);
    if (saved) {
      state.stripTracking = saved.stripTracking; state.decisions = saved.decisions || {};
      if (saved.mapA) state.mapA = parseBookmarkHtml(saved.mapA.html, 'a', saved.stripTracking, saved.mapA.name);
      if (saved.mapB) state.mapB = parseBookmarkHtml(saved.mapB.html, 'b', saved.stripTracking, saved.mapB.name);
      if (state.mapA && state.mapB) calculate();
      if (space === 'real') state.note = 'Recovered your last bookmark comparison from this browser.';
    }
  } catch { state.error = 'The saved comparison could not be restored. Choose the original exports again.'; }
}

async function loadRoute(focusHeading = false): Promise<void> {
  const next = routeFromLocation(); const previous = state.route; state.route = next; resetState();
  if (next === 'demo') { await restore('demo'); if (!state.mapA || !state.mapB) { seedDemo(); await persist(); } }
  if (next === 'home') await restore('real');
  render(focusHeading || previous !== next);
  if (location.hash) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView()); else if (focusHeading) scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('popstate', () => { void loadRoute(true); });
window.addEventListener('online', () => render());
window.addEventListener('offline', () => render());
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => { state.offlineReady = true; render(); });
  navigator.serviceWorker.register('/sw.js').then(async () => { await navigator.serviceWorker.ready; state.offlineReady = Boolean(navigator.serviceWorker.controller); render(); }).catch(() => { state.offlineReady = false; render(); });
}
render();
void loadRoute();
