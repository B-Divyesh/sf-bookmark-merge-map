import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface RouteConfig {
  route: string;
  headers?: Record<string, string>;
  rewrite?: string;
  statusCode?: number;
}

interface StaticWebAppConfig {
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: RouteConfig[];
  responseOverrides: Record<string, { rewrite: string }>;
}

const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as StaticWebAppConfig;
const route = (path: string) => config.routes.find((candidate) => candidate.route === path)?.headers;
const offlineHtml = readFileSync('public/offline.html', 'utf8');
const serviceWorker = readFileSync('public/sw.js', 'utf8');
const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Array<{ id: string; test: string }>;
const browserTests = readFileSync('tests/e2e/app.spec.ts', 'utf8');

describe('production response policy', () => {
  it('serves built assets with a long-lived immutable cache policy', () => {
    expect(route('/assets/*')?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
  });

  it('serves the manifest with its correct MIME type and keeps the worker revalidatable', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(route('/manifest.webmanifest')).toMatchObject({
      'Cache-Control': 'public, max-age=300, must-revalidate'
    });
    expect(route('/sw.js')?.['Cache-Control']).toBe('no-cache');
  });

  it('sets restrictive content and capability policies', () => {
    const csp = config.globalHeaders['Content-Security-Policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.globalHeaders['Permissions-Policy']).toContain('payment=()');
  });

  it('keeps the offline fallback CSP-safe and precaches its stylesheet', () => {
    const csp = config.globalHeaders['Content-Security-Policy'];
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
    expect(offlineHtml).toContain('<link rel="stylesheet" href="/offline.css">');
    expect(offlineHtml).not.toContain('<style');
    expect(serviceWorker).toContain("'/offline.css'");
  });

  it('advances the offline cache for this repaired release', () => {
    expect(serviceWorker).toContain("const CACHE = 'bookmark-merge-map-v9'");
  });

  it('rewrites every real route and uses a designed 404 response', () => {
    for (const path of ['/demo', '/privacy', '/terms']) expect(config.routes.find((item) => item.route === path)?.rewrite).toBe('/index.html');
    expect(config.routes.find((item) => item.route === '/404')).toEqual({ route: '/404', statusCode: 404 });
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });

  it('registers every claim once and gives it exactly one tagged browser test', () => {
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.test).toContain(`@claim:${claim.id}`);
      expect(browserTests.match(new RegExp(`@claim:${claim.id}(?![a-z0-9-])`, 'g'))).toHaveLength(1);
    }
  });
});
