import { expect, test, type Page } from '@playwright/test';

const PATHS_TO_CHECK = ['/', '/login', '/app'];

function collectCspViolations(page: Page): string[] {
  const violations: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' && /content security policy/i.test(message.text())) {
      violations.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    if (/content security policy/i.test(error.message)) {
      violations.push(error.message);
    }
  });

  return violations;
}

for (const path of PATHS_TO_CHECK) {
  test(`no CSP violations on ${path}`, async ({ page }) => {
    const violations = collectCspViolations(page);

    const response = await page.goto(path, { waitUntil: 'networkidle' });
    expect(response?.ok(), `expected ${path} to load successfully`).toBeTruthy();

    // Give any async/deferred script or stylesheet a moment to fire its own
    // CSP violation reports before asserting.
    await page.waitForTimeout(500);

    expect(violations, `CSP violations on ${path}:\n${violations.join('\n')}`).toHaveLength(0);
  });
}

test('a real HTTP 500 on a route chunk is caught by the real ErrorBoundary in a real browser, not a blank page', async ({ page }) => {
  // apps/web/src/app/ErrorBoundary.test.tsx only exercises the class
  // component's render()/getDerivedStateFromError() directly, by its own
  // explicit admission, because this repo has no jsdom/browser environment
  // -- it has never proven the boundary catches a real error thrown by
  // React's actual reconciler in a real browser. This closes that gap using
  // a realistic, zero-app-code-change failure mode: every route in
  // apps/web/src/app/routing/AppRouter.tsx is React.lazy()-loaded via a
  // dynamic import() of a hashed chunk file (e.g. AuthPage-<hash>.js) --
  // exactly the shape of a real production incident (a stale deployed HTML
  // page requesting a chunk that a newer deploy has since purged, or a CDN
  // hiccup returning 5xx for one asset). Failing that request with a real
  // HTTP 500 makes the lazy() promise reject, which React throws during
  // render with no local catch -- the same as an unhandled 500 anywhere
  // else in the render path -- so it must reach the nearest ErrorBoundary.
  let interceptedChunkRequest = false;
  await page.route('**/assets/AuthPage-*.js', async (route) => {
    interceptedChunkRequest = true;
    await route.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal Server Error' });
  });

  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  // /login needs no authenticated session and renders AuthPage directly
  // (no AppShell in between), so a failure here reaches the *root*
  // ErrorBoundary from apps/web/src/app/main.tsx, not the AppShell one.
  const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), 'the SPA shell document itself must still load with HTTP 200').toBeTruthy();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible({ timeout: 10_000 });
  await expect(alert).toContainText('Coś poszło nie tak');
  await expect(alert).toContainText('Kod błędu: APP_RUNTIME_CRASH');
  // The retry button proves this is the real ErrorBoundary component (with
  // its onRetry wiring) rendering, not some unrelated error UI.
  await expect(page.getByRole('button', { name: 'Odśwież aplikację' })).toBeVisible();

  expect(interceptedChunkRequest, 'the AuthPage chunk request must actually have been intercepted').toBeTruthy();
  expect(
    pageErrors,
    `expected the ErrorBoundary to swallow the render error so it never surfaces as an uncaught page error; got: ${pageErrors.join('; ')}`,
  ).toHaveLength(0);
});

test('an unknown route renders the app NotFound screen, not just a loaded SPA shell', async ({ page }) => {
  // The edge/nginx layer always answers an unmatched path with HTTP 200 and
  // the SPA shell (tested at the HTTP level in
  // tests/web-production-parity/smoke.mjs) -- that alone doesn't prove the
  // client-side router actually recognizes the route as missing rather than,
  // say, silently rendering a blank AppRouter branch. This asserts the DOM.
  const response = await page.goto('/totally/bogus/route/that/was/never/registered', {
    waitUntil: 'networkidle',
  });
  expect(response?.ok(), 'expected the SPA shell to still load with HTTP 200').toBeTruthy();

  await expect(
    page.getByRole('heading', { level: 1, name: 'Nie znaleziono strony' }),
  ).toBeVisible();
});
