import { defineConfig } from '@playwright/test';

// Narrow, single-purpose config: verifies the edge's Content-Security-Policy
// (infra/production/edge/nginx.conf.template) doesn't block the real app on
// /, /login and /app. Not a general E2E setup for apps/web.
//
// This config and its spec both live under apps/web (not next to
// tests/web-production-parity/smoke.mjs, despite testing the same thing)
// because Node's ESM resolver looks up "@playwright/test" relative to the
// importing file's own directory tree, and only apps/web declares that
// dependency in this pnpm workspace -- a file under the top-level tests/
// directory can't resolve it.
export default defineConfig({
  testDir: 'tests/production-parity',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.EDGE_BASE_URL?.trim() || 'https://papadata.localhost',
    // TLS trust for this internal smoke check is intentionally simplified:
    // certificate chain validity is already covered by
    // tests/web-production-parity/smoke.mjs via NODE_EXTRA_CA_CERTS. This
    // spec's only job is CSP, not TLS.
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
