import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { fn } from 'storybook/test';

import { CookieConsentGlobalSurface } from '../../../runtime/shared/consent/CookieConsentSurface';
import { safeCookieConsentDefaults, type CookieConsentRuntime } from '../../../runtime/shared/consent/cookieConsentRuntime';

const meta = {
  id: 'papadata-cookie-consent',
  parameters: { layout: 'fullscreen' },
  title: 'SHARED/Cookie consent',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function runtime(overrides: Partial<CookieConsentRuntime> = {}): CookieConsentRuntime {
  return {
    acceptAll: fn(async () => undefined),
    bannerVisible: false,
    categories: safeCookieConsentDefaults,
    closePreferences: fn(),
    error: null,
    openPreferences: fn(),
    preferencesOpen: false,
    refresh: fn(async () => undefined),
    rejectOptional: fn(async () => undefined),
    savePreferences: fn(async () => undefined),
    status: 'decided',
    version: '1',
    ...overrides,
  };
}

function StoryFrame({ children }: { readonly children: ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', padding: '32px' }}>
      <h1>Cookie consent surface</h1>
      <p>Production shared component with a mocked runtime boundary.</p>
      {children}
    </main>
  );
}

export const UndecidedBanner: Story = {
  render: () => (
    <StoryFrame>
      <CookieConsentGlobalSurface policyLinkAvailable runtime={runtime({ bannerVisible: true, status: 'undecided' })} />
    </StoryFrame>
  ),
};

// BATCH F.1: an active cookie_policy document must not be assumed -- the
// "Cookie policy" link only renders once a real read confirms one exists
// (see cookiePolicyAvailability.ts). This proves the banner degrades
// gracefully (no dead link, no error, every consent action still present)
// when it doesn't -- covers "loading", "error" and "no active document"
// alike, since all three resolve to the same `policyLinkAvailable={false}`.
export const UndecidedBannerPolicyUnavailable: Story = {
  render: () => (
    <StoryFrame>
      <CookieConsentGlobalSurface policyLinkAvailable={false} runtime={runtime({ bannerVisible: true, status: 'undecided' })} />
    </StoryFrame>
  ),
};

export const CustomizeDialog: Story = {
  render: () => (
    <StoryFrame>
      <CookieConsentGlobalSurface policyLinkAvailable runtime={runtime({ preferencesOpen: true, status: 'undecided' })} />
    </StoryFrame>
  ),
};

// Same isolation as UndecidedBannerPolicyUnavailable, for the preferences
// dialog: the link disappears, category checkboxes and save still work.
export const CustomizeDialogPolicyUnavailable: Story = {
  render: () => (
    <StoryFrame>
      <CookieConsentGlobalSurface policyLinkAvailable={false} runtime={runtime({ preferencesOpen: true, status: 'undecided' })} />
    </StoryFrame>
  ),
};

export const ExistingDecisionReopen: Story = {
  render: () => (
    <StoryFrame>
      <CookieConsentGlobalSurface
        policyLinkAvailable
        runtime={runtime({
          categories: { analytics: true, marketing: false, necessary: true, preferences: true },
          status: 'decided',
        })}
      />
    </StoryFrame>
  ),
};

export const SaveError: Story = {
  render: () => (
    <StoryFrame>
      <CookieConsentGlobalSurface policyLinkAvailable runtime={runtime({ bannerVisible: true, error: 'save', status: 'undecided' })} />
    </StoryFrame>
  ),
};
