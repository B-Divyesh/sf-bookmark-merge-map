import './styles.css';
import { parseBookmarkHtml, reconcile, reparseMap } from './bookmarks';
import { downloadText, exportBookmarkHtml, exportReviewCsv, selectedRows } from './exporters';
import { clearProject, loadProject, saveProject } from './storage';
import type { ImportedMap, MergeRow, RowStatus, SavedProject, SourceId } from './types';

const app = document.querySelector<HTMLDivElement>('#app')!;

const state: {
  mapA?: ImportedMap;
  mapB?: ImportedMap;
  rows: MergeRow[];
  stripTracking: boolean;
  filter: RowStatus | 'all';
  query: string;
  visible: number;
  error: string;
  note: string;
  restoring: boolean;
  exported: boolean;
} = { rows: [], stripTracking: true, filter: 'all', query: '', visible: 80, error: '', note: '', restoring: true, exported: false };

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function filenameDate(): string { return new Date().toISOString().slice(0, 10); }

function uniqueValues<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true; });
}

function counts() {
  const occurrences = (state.mapA?.bookmarks.length || 0) + (state.mapB?.bookmarks.length || 0);
  const included = selectedRows(state.rows).length;
  const byStatus = (status: RowStatus) => state.rows.filter((row) => row.status === status).length;
  return { occurrences, included, collapsed: occurrences - state.rows.length, excluded: state.rows.length - included, shared: byStatus('shared'), aOnly: byStatus('a-only'), bOnly: byStatus('b-only'), conflicts: byStatus('conflict') };
}

function currentDecisions(): SavedProject['decisions'] {
  return Object.fromEntries(state.rows.map((row) => [row.id, { included: row.included, title: row.title, folder: row.folder }]));
}

async function persist(): Promise<void> {
  const project: SavedProject = {
    mapA: state.mapA && { name: state.mapA.name, importedAt: state.mapA.importedAt, html: state.mapA.html },
    mapB: state.mapB && { name: state.mapB.name, importedAt: state.mapB.importedAt, html: state.mapB.html },
    stripTracking: state.stripTracking,
    savedAt: Date.now(),
    decisions: currentDecisions()
  };
  try { await saveProject(project); } catch { state.note = 'This browser could not save the working map. Exports still work.'; }
}

function calculate(decisions?: SavedProject['decisions']): void {
  if (!state.mapA || !state.mapB) { state.rows = []; return; }
  state.rows = reconcile(state.mapA.bookmarks, state.mapB.bookmarks);
  if (decisions) state.rows.forEach((row) => {
    const saved = decisions[row.id];
    if (!saved) return;
    row.included = saved.included;
    if (row.items.some((item) => item.title === saved.title)) row.title = saved.title;
    if (row.items.some((item) => item.folder.join('\u0000') === saved.folder.join('\u0000'))) row.folder = saved.folder;
  });
}

function mapCard(source: SourceId, map?: ImportedMap): string {
  const label = source === 'a' ? 'Map A · desktop' : 'Map B · mobile';
  const inputId = `file-${source}`;
  return `<section class="map-card ${map ? 'is-loaded' : ''}" data-drop="${source}" aria-labelledby="label-${source}">
    <div class="map-card-top"><span class="map-letter">${source.toUpperCase()}</span><div><h3 id="label-${source}">${label}</h3><p>${map ? `${map.bookmarks.length.toLocaleString()} bookmarks read` : 'Choose a browser HTML export'}</p></div></div>
    ${map ? `<div class="file-readout"><span aria-hidden="true">✓</span><strong>${escapeHtml(map.name)}</strong><button class="text-button" data-replace="${source}" type="button">Replace</button></div>` : `<label class="file-pick" for="${inputId}"><span>Choose HTML file</span><small>or drop it here · stays on this device</small></label>`}
    <input class="visually-hidden file-input" id="${inputId}" data-source="${source}" type="file" accept=".html,.htm,text/html" aria-label="Choose replacement HTML for ${label}" />
  </section>`;
}

function route(): string {
  const active = state.exported ? 3 : state.rows.length ? 2 : state.mapA && state.mapB ? 1 : state.mapA || state.mapB ? 0 : 0;
  const steps = ['Import maps', 'Compare paths', 'Review choices', 'Export proof'];
  return `<nav class="route" aria-label="Merge progress"><ol>${steps.map((label, index) => `<li class="${index <= active ? 'reached' : ''}" ${index === active ? 'aria-current="step"' : ''}><span>${index + 1}</span>${label}</li>`).join('')}</ol></nav>`;
}

function resultRow(row: MergeRow, index: number): string {
  const titles = uniqueValues(row.items.map((item) => item.title), (title) => title);
  const folders = uniqueValues(row.items.map((item) => item.folder), (folder) => folder.join('\u0000'));
  const statusLabels: Record<RowStatus, string> = { shared: 'Shared', 'a-only': 'Only in A', 'b-only': 'Only in B', conflict: 'Needs review' };
  const original = row.items[0];
  return `<article class="result-row ${row.included ? '' : 'excluded'}" data-result-index="${index}">
    <label class="include-control"><input type="checkbox" data-action="include" ${row.included ? 'checked' : ''}/><span class="visually-hidden">Include ${escapeHtml(row.title)}</span></label>
    <div class="result-main">
      <div class="result-heading"><span class="status-mark status-${row.status}">${statusLabels[row.status]}</span><span class="sources" aria-label="Found in map ${[...new Set(row.items.map((item) => item.source.toUpperCase()))].join(' and ')}">${[...new Set(row.items.map((item) => item.source.toUpperCase()))].join('+')}</span></div>
      ${titles.length > 1 ? `<label class="choice-label">Export title<select data-action="title">${titles.map((title) => `<option ${title === row.title ? 'selected' : ''}>${escapeHtml(title)}</option>`).join('')}</select></label>` : `<h3>${escapeHtml(row.title)}</h3>`}
      ${/^https?:/i.test(original.url) ? `<a class="url" href="${escapeHtml(original.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(original.url)}</a>` : `<span class="url">${escapeHtml(original.url)}</span>`}
      <div class="row-meta">
        ${folders.length > 1 ? `<label class="choice-label">Destination<select data-action="folder">${folders.map((folder) => { const path = folder.join(' / ') || 'Bookmarks bar'; return `<option value="${escapeHtml(folder.join('\u0000'))}" ${folder.join('\u0000') === row.folder.join('\u0000') ? 'selected' : ''}>${escapeHtml(path)}</option>`; }).join('')}</select></label>` : `<span class="folder">⌁ ${escapeHtml(row.folder.join(' / ') || 'Bookmarks bar')}</span>`}
        ${row.notes.map((note) => `<span class="note">${escapeHtml(note)}</span>`).join('')}
      </div>
    </div>
  </article>`;
}

function results(): string {
  if (!state.rows.length) return '';
  const summary = counts();
  const matching = state.rows.filter((row) => {
    const statusMatch = state.filter === 'all' || row.status === state.filter;
    const haystack = `${row.title} ${row.canonical} ${row.folder.join(' ')}`.toLowerCase();
    return statusMatch && haystack.includes(state.query.toLowerCase());
  });
  const shown = matching.slice(0, state.visible);
  return `<section class="results-section" aria-labelledby="survey-title">
    <div class="section-kicker">02 · RECONCILIATION SURVEY</div>
    <div class="section-head"><div><h2 id="survey-title">Every route, accounted for.</h2><p>The default plan keeps every distinct destination. Review the marked terrain before exporting.</p></div><button class="secondary-button" data-action="reset">Start over</button></div>
    <div class="proof-strip" aria-label="Before and after count report">
      <div><strong>${summary.occurrences.toLocaleString()}</strong><span>input copies</span></div><span class="proof-arrow" aria-hidden="true">→</span>
      <div><strong>${state.rows.length.toLocaleString()}</strong><span>distinct routes</span></div><span class="proof-arrow" aria-hidden="true">→</span>
      <div><strong>${summary.included.toLocaleString()}</strong><span>in export</span></div>
      <p><b>${summary.collapsed}</b> duplicate ${summary.collapsed === 1 ? 'copy' : 'copies'} collapsed · <b>${summary.excluded}</b> distinct ${summary.excluded === 1 ? 'route' : 'routes'} excluded by you</p>
    </div>
    <div class="review-tools">
      <div class="filter-group" role="group" aria-label="Filter results">
        ${([['all', 'All', state.rows.length], ['conflict', 'Review', summary.conflicts], ['a-only', 'Only A', summary.aOnly], ['b-only', 'Only B', summary.bOnly], ['shared', 'Shared', summary.shared]] as const).map(([value, label, count]) => `<button type="button" data-filter="${value}" aria-pressed="${state.filter === value}">${label} <span>${count}</span></button>`).join('')}
      </div>
      <label class="search-label"><span class="visually-hidden">Search results</span><input id="search" type="search" value="${escapeHtml(state.query)}" placeholder="Search title, URL, or folder" /></label>
    </div>
    <div class="bulk-row"><p>Showing ${Math.min(shown.length, state.visible).toLocaleString()} of ${matching.length.toLocaleString()}</p><div><button type="button" class="text-button" data-action="include-all">Include visible</button><button type="button" class="text-button" data-action="exclude-all">Exclude visible</button></div></div>
    <div class="result-list">${shown.map((row) => resultRow(row, state.rows.indexOf(row))).join('') || `<div class="no-matches"><strong>No routes match this view.</strong><p>Change the filter or clear your search.</p></div>`}</div>
    ${matching.length > state.visible ? `<button class="secondary-button show-more" data-action="more">Show ${Math.min(80, matching.length - state.visible)} more</button>` : ''}
    <section class="export-field" aria-labelledby="export-title">
      <div><div class="section-kicker">03 · FIELD PACKAGE</div><h2 id="export-title">Take the proof with you.</h2><p>The HTML imports into Chrome, Firefox, Edge, or Safari. The CSV records every automatic match and every choice.</p></div>
      <div class="export-actions"><button class="primary-button" data-action="export-html" ${summary.included ? '' : 'disabled'}>Export merged HTML <span>${summary.included}</span></button><button class="secondary-button" data-action="export-csv">Export review CSV</button></div>
      <p class="safety-line"><span aria-hidden="true">◎</span> Your original files remain unchanged. Import the merged file only after checking the CSV.</p>
    </section>
  </section>`;
}

function render(): void {
  const ready = state.mapA && state.mapB;
  app.innerHTML = `<header class="site-header"><a class="brand" href="/" aria-label="Bookmark Merge Map home"><svg aria-hidden="true" viewBox="0 0 48 48"><path d="M5 10c8 0 12 5 19 14 7-9 11-14 19-14M24 24v19"/><circle cx="24" cy="24" r="3"/></svg><span>Bookmark<br/>Merge Map</span></a><div class="header-meta"><span class="privacy-badge"><i></i>LOCAL-ONLY</span><a href="#how">How it works</a></div></header>
    <main id="main">
      <section class="hero">
        <div class="hero-copy"><div class="eyebrow">A dry-run before browser sync</div><h1>Find the missing paths.<br><em>Keep every landmark.</em></h1><p>Compare two bookmark exports, expose duplicates and omissions, then download a merge you can prove is safe. Nothing is uploaded.</p><a class="primary-button hero-button" href="#import">Map my bookmarks <span aria-hidden="true">↓</span></a></div>
        <picture class="hero-map"><source media="(max-width: 700px)" srcset="/assets/merge-map-640.webp"><source srcset="/assets/merge-map-960.webp 960w, /assets/merge-map-1536.webp 1536w" sizes="(max-width: 1100px) 50vw, 560px"><img src="/assets/merge-map-960.webp" width="960" height="640" alt="An illustrated topographic map where two green routes converge into one vermilion path" fetchpriority="high" decoding="async"><span class="map-caption">TWO EXPORTS · ONE VERIFIED ROUTE</span></picture>
      </section>
      ${route()}
      <section class="import-section" id="import" aria-labelledby="import-title"><div class="section-kicker">01 · SOURCE MAPS</div><div class="section-head"><div><h2 id="import-title">Lay the exports side by side.</h2><p>In your browser, export bookmarks as HTML. Label either file however you like—the map compares both directions.</p></div><button class="text-button sample-button" data-action="sample">Use sample maps</button></div>
        <div class="map-grid">${mapCard('a', state.mapA)}<div class="merge-symbol" aria-hidden="true"><span>+</span></div>${mapCard('b', state.mapB)}</div>
        <div class="privacy-note"><span class="compass" aria-hidden="true">✣</span><div><strong>Private terrain</strong><p>Parsing, comparison, and export happen in this tab. The working map is saved only in this browser for recovery.</p></div></div>
        <label class="tracking-toggle"><input type="checkbox" id="tracking" ${state.stripTracking ? 'checked' : ''}><span><strong>Group common tracking variants</strong><small>Strips only known campaign parameters (such as <code>utm_source</code>) for matching. Original URLs stay untouched. Turn this off to review every variant separately.</small></span></label>
        ${ready && !state.rows.length ? `<button class="primary-button compare-button" data-action="compare">Compare ${state.mapA!.bookmarks.length.toLocaleString()} + ${state.mapB!.bookmarks.length.toLocaleString()} bookmarks</button>` : ''}
      </section>
      ${results()}
      <section class="method" id="how" aria-labelledby="method-title"><div><div class="section-kicker">HOW THE SURVEY WORKS</div><h2 id="method-title">A merge with a paper trail.</h2></div><ol><li><b>01</b><span><strong>Read the trees</strong>Folder paths, titles, URLs, and dates are read locally from both Netscape-format exports.</span></li><li><b>02</b><span><strong>Normalize carefully</strong>Hosts, fragments, parameter order, and optional campaign tags reveal likely duplicates.</span></li><li><b>03</b><span><strong>Keep by default</strong>One-sided links and same-title conflicts remain included until you explicitly remove them.</span></li><li><b>04</b><span><strong>Export the proof</strong>A browser-ready HTML and human-readable CSV make the outcome inspectable.</span></li></ol></section>
    </main>
    <footer><div class="brand footer-brand"><svg aria-hidden="true" viewBox="0 0 48 48"><path d="M5 10c8 0 12 5 19 14 7-9 11-14 19-14M24 24v19"/><circle cx="24" cy="24" r="3"/></svg><span>Bookmark Merge Map</span></div><p>Free, offline, and account-free. Original map illustration generated for this product with Azure AI Foundry.</p><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-bookmark-merge-map" target="_blank" rel="noopener noreferrer">Source</a></nav></footer>
    <div class="toast ${state.error ? 'is-error' : ''}" role="status" aria-live="polite" ${state.error || state.note ? '' : 'hidden'}>${escapeHtml(state.error || state.note)}</div>
    <div class="network-state" aria-live="polite">${navigator.onLine ? 'Ready offline after first visit' : 'Offline · your saved map is available'}</div>`;
  bind();
}

function showMessage(message: string, error = false): void {
  state.error = error ? message : '';
  state.note = error ? '' : message;
  render();
  window.setTimeout(() => { state.error = ''; state.note = ''; render(); }, 4500);
}

async function readFile(source: SourceId, file: File): Promise<void> {
  state.error = '';
  if (!/\.html?$/i.test(file.name) && file.type !== 'text/html') { showMessage('Choose a bookmark export ending in .html or .htm.', true); return; }
  if (file.size > 20 * 1024 * 1024) { showMessage('That file is over 20 MB. Split the export, then try again.', true); return; }
  state.note = `Reading ${file.name} on this device…`;
  render();
  try {
    const html = await file.text();
    const map = parseBookmarkHtml(html, source, state.stripTracking, file.name);
    if (source === 'a') state.mapA = map; else state.mapB = map;
    state.rows = [];
    await persist();
    showMessage(`${file.name}: ${map.bookmarks.length.toLocaleString()} bookmarks mapped.`);
  } catch (error) { showMessage(error instanceof Error ? error.message : 'This file could not be read.', true); }
}

function filteredRows(): MergeRow[] {
  return state.rows.filter((row) => (state.filter === 'all' || row.status === state.filter) && `${row.title} ${row.canonical} ${row.folder.join(' ')}`.toLowerCase().includes(state.query.toLowerCase()));
}

function bind(): void {
  document.querySelectorAll<HTMLInputElement>('.file-input').forEach((input) => input.addEventListener('change', () => { const file = input.files?.[0]; if (file) void readFile(input.dataset.source as SourceId, file); }));
  document.querySelectorAll<HTMLElement>('[data-drop]').forEach((zone) => {
    zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('is-dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragging'));
    zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('is-dragging'); const file = event.dataTransfer?.files[0]; if (file) void readFile(zone.dataset.drop as SourceId, file); });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-replace]').forEach((button) => button.addEventListener('click', () => document.querySelector<HTMLInputElement>(`#file-${button.dataset.replace}`)?.click()));
  document.querySelector<HTMLInputElement>('#tracking')?.addEventListener('change', (event) => {
    state.stripTracking = (event.currentTarget as HTMLInputElement).checked;
    if (state.mapA) state.mapA = reparseMap(state.mapA, 'a', state.stripTracking);
    if (state.mapB) state.mapB = reparseMap(state.mapB, 'b', state.stripTracking);
    if (state.rows.length) calculate();
    void persist(); render();
  });
  document.querySelector('[data-action="compare"]')?.addEventListener('click', () => { calculate(); void persist(); render(); document.querySelector('#survey-title')?.scrollIntoView({ behavior: 'smooth' }); });
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) => button.addEventListener('click', () => { state.filter = button.dataset.filter as typeof state.filter; state.visible = 80; render(); }));
  document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', (event) => { state.query = (event.currentTarget as HTMLInputElement).value; state.visible = 80; render(); document.querySelector<HTMLInputElement>('#search')?.focus(); });
  document.querySelectorAll<HTMLElement>('[data-result-index]').forEach((element) => {
    const row = state.rows[Number(element.dataset.resultIndex)];
    element.querySelector<HTMLInputElement>('[data-action="include"]')?.addEventListener('change', (event) => { row.included = (event.currentTarget as HTMLInputElement).checked; void persist(); render(); });
    element.querySelector<HTMLSelectElement>('[data-action="title"]')?.addEventListener('change', (event) => { row.title = (event.currentTarget as HTMLSelectElement).value; void persist(); render(); });
    element.querySelector<HTMLSelectElement>('[data-action="folder"]')?.addEventListener('change', (event) => { row.folder = (event.currentTarget as HTMLSelectElement).value ? (event.currentTarget as HTMLSelectElement).value.split('\u0000') : []; void persist(); render(); });
  });
  document.querySelector('[data-action="more"]')?.addEventListener('click', () => { state.visible += 80; render(); });
  document.querySelector('[data-action="include-all"]')?.addEventListener('click', () => { filteredRows().forEach((row) => { row.included = true; }); void persist(); render(); });
  document.querySelector('[data-action="exclude-all"]')?.addEventListener('click', () => { filteredRows().forEach((row) => { row.included = false; }); void persist(); render(); });
  document.querySelector('[data-action="export-html"]')?.addEventListener('click', () => { downloadText(`merged-bookmarks-${filenameDate()}.html`, exportBookmarkHtml(state.rows), 'text/html;charset=utf-8'); state.exported = true; window.setTimeout(() => showMessage(`Merged HTML exported with ${selectedRows(state.rows).length} distinct destinations.`), 0); });
  document.querySelector('[data-action="export-csv"]')?.addEventListener('click', () => { downloadText(`bookmark-review-${filenameDate()}.csv`, exportReviewCsv(state.rows), 'text/csv;charset=utf-8'); window.setTimeout(() => showMessage('Review CSV exported.'), 0); });
  document.querySelector('[data-action="reset"]')?.addEventListener('click', async () => { if (!confirm('Clear both imported maps and every review choice from this browser? Your original files will not be changed.')) return; await clearProject(); state.mapA = undefined; state.mapB = undefined; state.rows = []; state.query = ''; state.filter = 'all'; render(); });
  document.querySelector('[data-action="sample"]')?.addEventListener('click', () => { loadSamples(); });
}

const sampleA = `<!DOCTYPE NETSCAPE-Bookmark-file-1><TITLE>Desktop</TITLE><H1>Desktop</H1><DL><p><DT><H3>Field notes</H3><DL><p><DT><A HREF="https://example.com/guide?utm_source=desktop">Trail guide</A><DT><A HREF="https://developer.mozilla.org/en-US/docs/Web/API">Web APIs</A><DT><A HREF="https://example.org/archive">Reading archive</A></DL><p></DL><p>`;
const sampleB = `<!DOCTYPE NETSCAPE-Bookmark-file-1><TITLE>Mobile</TITLE><H1>Mobile</H1><DL><p><DT><H3>Saved on phone</H3><DL><p><DT><A HREF="https://example.com/guide?utm_source=mobile">Trail guide</A><DT><A HREF="https://developer.mozilla.org/en-US/docs/Web/API#interfaces">MDN Web APIs</A><DT><A HREF="https://example.net/archive">Reading archive</A><DT><A HREF="https://web.dev/learn/pwa/">Learn PWA</A></DL><p></DL><p>`;

function loadSamples(): void {
  state.mapA = parseBookmarkHtml(sampleA, 'a', state.stripTracking, 'desktop-sample.html');
  state.mapB = parseBookmarkHtml(sampleB, 'b', state.stripTracking, 'mobile-sample.html');
  calculate(); void persist(); render(); document.querySelector('#survey-title')?.scrollIntoView({ behavior: 'smooth' });
}

async function restore(): Promise<void> {
  try {
    const saved = await loadProject();
    if (saved) {
      state.stripTracking = saved.stripTracking;
      if (saved.mapA) state.mapA = parseBookmarkHtml(saved.mapA.html, 'a', saved.stripTracking, saved.mapA.name);
      if (saved.mapB) state.mapB = parseBookmarkHtml(saved.mapB.html, 'b', saved.stripTracking, saved.mapB.name);
      if (state.mapA && state.mapB) calculate(saved.decisions);
      state.note = 'Recovered your last working map from this browser.';
    }
  } catch { state.error = 'The saved map could not be restored. Import the original exports again.'; }
  state.restoring = false;
  render();
}

window.addEventListener('online', render);
window.addEventListener('offline', render);
if ('serviceWorker' in navigator) {
  const wasControlled = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.addEventListener('updatefound', () => { if (wasControlled) { state.note = 'An updated offline map is ready. It will apply on the next visit.'; render(); } });
  }).catch(() => { /* The app remains fully usable without installation support. */ });
  navigator.serviceWorker.addEventListener('message', (event) => { if (event.data?.type === 'SW_READY' && wasControlled) { state.note = 'Offline map updated and ready.'; render(); } });
}

render();
void restore();
