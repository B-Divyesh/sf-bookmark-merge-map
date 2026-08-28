import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface RouteConfig {
  route: string;
  headers?: Record<string, string>;
}

interface StaticWebAppConfig {
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: RouteConfig[];
}

const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as StaticWebAppConfig;
const route = (path: string) => config.routes.find((candidate) => candidate.route === path)?.headers;

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
});
