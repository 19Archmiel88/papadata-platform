import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Regression guard for the removed auth onboarding stepper (BATCH F.1
// correction pass): the visible 1-4 progress tracker must never come back --
// not in the real screen, its CSS, or the Storybook story that renders it.
// apps/web's vitest runs in a Node environment with no DOM (see
// apps/web/vitest.config.ts) and this repo has no React Testing Library
// setup, so this asserts on source text the same way
// CookieConsentController's "source shape" test does, rather than rendering
// the component.
const authDir = fileURLToPath(new URL(".", import.meta.url));
const storiesPath = fileURLToPath(
  new URL(
    "../../../storybook-next/stories/25-access-registration-onboarding/AuthSurfaces.stories.tsx",
    import.meta.url,
  ),
);

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("auth onboarding stepper removal", () => {
  it("AccessFlowScreen no longer imports or renders OnboardingProgress", () => {
    const source = read(`${authDir}AccessFlowScreen.tsx`);
    expect(source).not.toMatch(/OnboardingProgress/u);
    expect(source).not.toMatch(/resolveOnboardingProgress/u);
  });

  it("access-lifecycle.css no longer defines any .pd-onboarding-progress rule", () => {
    const source = read(`${authDir}access-lifecycle.css`);
    expect(source).not.toMatch(/pd-onboarding-progress/u);
  });

  it("the removed tracker's accessible label never reappears in the auth feature source", () => {
    const source = read(`${authDir}AccessFlowScreen.tsx`);
    expect(source).not.toContain("Postęp konfiguracji konta");
    expect(source).not.toContain("Account setup progress");
  });

  it("the Storybook story for these surfaces renders only the real AccessFlowScreen, no duplicate tracker", () => {
    const source = read(storiesPath);
    expect(source).not.toMatch(/OnboardingProgress/u);
    expect(source).not.toMatch(/pd-onboarding-progress/u);
    expect(source).not.toContain("Postęp konfiguracji konta");
    expect(source).not.toContain("Account setup progress");
  });

  it("OnboardingProgress.tsx and onboardingProgress.ts were deleted, not merely unlinked", () => {
    for (const name of ["OnboardingProgress.tsx", "onboardingProgress.ts"]) {
      expect(() => read(`${authDir}${name}`)).toThrow();
    }
  });
});
