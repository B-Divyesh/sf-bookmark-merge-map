// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { canonicalizeUrl, parseBookmarkHtml, reconcile } from '../src/bookmarks';
import { exportBookmarkHtml, exportReviewCsv } from '../src/exporters';

const html = (folder: string, links: string) => `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><p><DT><H3>${folder}</H3><DL><p>${links}</DL><p></DL><p>`;

describe('bookmark parsing and reconciliation', () => {
  it('normalizes safe URL differences and optional tracking parameters', () => {
    expect(canonicalizeUrl('HTTPS://Example.COM:443/path/?b=2&utm_source=x&a=1#top')).toBe('https://example.com/path?a=1&b=2');
    expect(canonicalizeUrl('https://example.com/?utm_source=x', false)).toContain('utm_source=x');
    expect(canonicalizeUrl('javascript:alert(1)')).toBe('javascript:alert(1)');
  });
  it('reads nested folder paths', () => {
    const map = parseBookmarkHtml(html('Research', '<DT><H3>Maps</H3><DL><p><DT><A HREF="https://example.com">Example</A></DL><p>'), 'a');
    expect(map.bookmarks).toHaveLength(1);
    expect(map.bookmarks[0].folder).toEqual(['Research', 'Maps']);
  });
  it('keeps all distinct destinations and marks title conflicts', () => {
    const a = parseBookmarkHtml(html('A', '<DT><A HREF="https://example.com/?utm_source=a">Guide</A><DT><A HREF="https://one.test">Archive</A>'), 'a');
    const b = parseBookmarkHtml(html('B', '<DT><A HREF="https://example.com/">Guide new</A><DT><A HREF="https://two.test">Archive</A>'), 'b');
    const rows = reconcile(a.bookmarks, b.bookmarks);
    expect(rows).toHaveLength(3);
    expect(rows.filter((row) => row.status === 'conflict')).toHaveLength(2);
    expect(rows.every((row) => row.included)).toBe(true);
    expect(rows.find((row) => row.canonical === 'https://example.com/')?.items).toHaveLength(2);
  });
  it('exports valid bookmark HTML and an audit row for exclusions', () => {
    const a = parseBookmarkHtml(html('Keep', '<DT><A HREF="https://example.com?a=1&amp;b=2">A &amp; B</A>'), 'a');
    const rows = reconcile(a.bookmarks, []);
    expect(exportBookmarkHtml(rows)).toContain('NETSCAPE-Bookmark-file-1');
    expect(exportBookmarkHtml(rows)).toContain('A &amp; B');
    rows[0].included = false;
    expect(exportReviewCsv(rows)).toContain('a-only,false');
  });
});
