import type { MergeRow } from './types';

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface FolderNode { bookmarks: MergeRow[]; children: Map<string, FolderNode> }

function node(): FolderNode { return { bookmarks: [], children: new Map() }; }

export function selectedRows(rows: MergeRow[]): MergeRow[] {
  return rows.filter((row) => row.included);
}

export function exportBookmarkHtml(rows: MergeRow[]): string {
  const root = node();
  selectedRows(rows).forEach((row) => {
    let current = root;
    row.folder.forEach((part) => {
      if (!current.children.has(part)) current.children.set(part, node());
      current = current.children.get(part)!;
    });
    current.bookmarks.push(row);
  });
  const render = (folder: FolderNode, indent: number): string => {
    const pad = '    '.repeat(indent);
    const bookmarks = folder.bookmarks.map((row) => {
      const original = row.items[0];
      const date = original.addDate ? ` ADD_DATE="${escapeHtml(original.addDate)}"` : '';
      return `${pad}<DT><A HREF="${escapeHtml(original.url)}"${date}>${escapeHtml(row.title)}</A>`;
    });
    const children = [...folder.children.entries()].map(([name, child]) =>
      `${pad}<DT><H3>${escapeHtml(name)}</H3>\n${pad}<DL><p>\n${render(child, indent + 1)}\n${pad}</DL><p>`
    );
    return [...children, ...bookmarks].join('\n');
  };
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<!-- Generated locally by Bookmark Merge Map. -->\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Merged bookmarks</TITLE>\n<H1>Merged bookmarks</H1>\n<DL><p>\n${render(root, 1)}\n</DL><p>\n`;
}

function csv(value: string | number | boolean): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportReviewCsv(rows: MergeRow[]): string {
  const header = ['status', 'included', 'title', 'export_url', 'canonical_url', 'chosen_folder', 'source', 'original_copies', 'all_folders', 'notes'];
  const body = rows.map((row) => [
    row.status, row.included, row.title, row.items[0].url, row.canonical,
    row.folder.join(' / '), [...new Set(row.items.map((item) => item.source.toUpperCase()))].join('+'),
    row.items.length, [...new Set(row.items.map((item) => item.folder.join(' / ')))].join(' | '), row.notes.join('; ')
  ].map(csv).join(','));
  return [header.join(','), ...body].join('\n');
}

export function downloadText(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
