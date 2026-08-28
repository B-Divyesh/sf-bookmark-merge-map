import type { Bookmark, ImportedMap, MergeRow, RowStatus, SourceId } from './types';

const TRACKING_PARAMS = new Set([
  'fbclid', 'gclid', 'dclid', 'msclkid', 'mc_cid', 'mc_eid', 'igshid',
  'ref_src', 'ref_url', 'vero_conv', 'vero_id', '_hsenc', '_hsmi'
]);

export function canonicalizeUrl(raw: string, stripTracking = true): string {
  const value = raw.trim();
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return value;
    url.hostname = url.hostname.toLowerCase();
    url.hash = '';
    if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) url.port = '';
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');
    const params = [...url.searchParams.entries()]
      .filter(([key]) => !stripTracking || (!key.toLowerCase().startsWith('utm_') && !TRACKING_PARAMS.has(key.toLowerCase())))
      .sort(([aKey, aValue], [bKey, bValue]) => aKey.localeCompare(bKey) || aValue.localeCompare(bValue));
    url.search = '';
    params.forEach(([key, item]) => url.searchParams.append(key, item));
    return url.toString();
  } catch {
    return value;
  }
}

function directChild<T extends Element>(element: Element, selector: string): T | undefined {
  return [...element.children].find((child) => child.matches(selector)) as T | undefined;
}

export function parseBookmarkHtml(html: string, source: SourceId, stripTracking = true, name = 'Bookmarks'): ImportedMap {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const roots = [...document.querySelectorAll('dl')].filter((node) => !node.parentElement?.closest('dl'));
  const bookmarks: Bookmark[] = [];
  let sequence = 0;

  const addAnchor = (anchor: HTMLAnchorElement, folder: string[]) => {
    const url = (anchor.getAttribute('href') || '').trim();
    if (!url) return;
    bookmarks.push({
      id: `${source}-${sequence++}`,
      source,
      title: (anchor.textContent || url).trim() || url,
      url,
      canonical: canonicalizeUrl(url, stripTracking),
      folder,
      addDate: anchor.getAttribute('add_date') || undefined
    });
  };

  const walk = (list: Element, path: string[]) => {
    for (const child of [...list.children]) {
      if (child.tagName === 'DT') {
        const heading = directChild<HTMLElement>(child, 'h3');
        const anchor = directChild<HTMLAnchorElement>(child, 'a');
        const nested = directChild<HTMLElement>(child, 'dl');
        if (anchor) addAnchor(anchor, path);
        if (heading && nested) walk(nested, [...path, heading.textContent?.trim() || 'Untitled folder']);
        continue;
      }
      if (child.tagName === 'DL') walk(child, path);
    }
  };

  roots.forEach((root) => walk(root, []));
  if (!bookmarks.length) {
    document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => addAnchor(anchor, []));
  }
  if (!bookmarks.length) throw new Error('No bookmarks were found. Choose an HTML file exported by your browser.');
  return { name, importedAt: Date.now(), html, bookmarks };
}

function normalizedTitle(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function unique<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const id = key(value);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function reconcile(a: Bookmark[], b: Bookmark[]): MergeRow[] {
  const groups = new Map<string, Bookmark[]>();
  [...a, ...b].forEach((bookmark) => {
    const current = groups.get(bookmark.canonical) || [];
    current.push(bookmark);
    groups.set(bookmark.canonical, current);
  });

  const rows = [...groups.entries()].map(([canonical, items]): MergeRow => {
    const hasA = items.some((item) => item.source === 'a');
    const hasB = items.some((item) => item.source === 'b');
    const folders = unique(items.map((item) => item.folder), (folder) => folder.join('\u0000'));
    const titles = unique(items.map((item) => item.title), (title) => title);
    const notes: string[] = [];
    if (items.length > 1) notes.push(`${items.length} copies collapse to one bookmark`);
    if (folders.length > 1) notes.push('Folder differs—review the destination');
    if (titles.length > 1) notes.push('Titles differ—the first title is selected');
    return {
      id: canonical,
      status: hasA && hasB ? 'shared' : hasA ? 'a-only' : 'b-only',
      canonical,
      items,
      title: items[0].title,
      folder: items[0].folder,
      included: true,
      notes
    };
  });

  const titleGroups = new Map<string, MergeRow[]>();
  rows.forEach((row) => {
    const key = normalizedTitle(row.title);
    if (!key || key.length < 3) return;
    const current = titleGroups.get(key) || [];
    current.push(row);
    titleGroups.set(key, current);
  });
  titleGroups.forEach((matching) => {
    if (matching.length < 2) return;
    const sources = new Set(matching.flatMap((row) => row.items.map((item) => item.source)));
    if (sources.size < 2) return;
    matching.forEach((row) => {
      row.status = 'conflict';
      row.notes.unshift('Same title points to a different URL—both are kept');
    });
  });
  const rank: Record<RowStatus, number> = { conflict: 0, 'a-only': 1, 'b-only': 2, shared: 3 };
  return rows.sort((left, right) => rank[left.status] - rank[right.status] || left.title.localeCompare(right.title));
}

export function reparseMap(map: ImportedMap, source: SourceId, stripTracking: boolean): ImportedMap {
  return parseBookmarkHtml(map.html, source, stripTracking, map.name);
}
