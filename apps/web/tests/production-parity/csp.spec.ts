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
