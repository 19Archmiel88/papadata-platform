import { describe, expect, it } from 'vitest';

import {
  cookieConsentReducer,
  safeCookieConsentDefaults,
  type CookieConsentRuntimeState,
} from './cookieConsentRuntime';

const initial: CookieConsentRuntimeState = {
  categories: safeCookieConsentDefaults,
  error: null,
  preferencesOpen: false,
  status: 'loading',
  version: null,
};

const decidedAll: CookieConsentRuntimeState = {
  categories: { analytics: true, marketing: true, necessary: true, preferences: true },
  error: null,
  preferencesOpen: false,
  status: 'decided',
  version: '1',
};

describe('safeCookieConsentDefaults', () => {
  it('optional categories fail-closed: only necessary is true', () => {
    expect(safeCookieConsentDefaults).toEqual({
      analytics: false, marketing: false, necessary: true, preferences: false,
    });
  });
});

describe('cookieConsentReducer', () => {
  it('initial state is loading with fail-closed defaults', () => {
    expect(initial.status).toBe('loading');
    expect(initial.categories).toEqual(safeCookieConsentDefaults);
  });

  it('load-succeeded with no current-version decision -> undecided, fail-closed categories', () => {
    const next = cookieConsentReducer(initial, { categories: null, currentVersion: '1', type: 'load-succeeded' });
    expect(next.status).toBe('undecided');
    expect(next.categories).toEqual(safeCookieConsentDefaults);
    expect(next.version).toBe('1');
  });

  it('load-succeeded with a current-version decision -> decided, that decision\'s categories', () => {
    const categories = { analytics: true, marketing: false, necessary: true, preferences: true } as const;
    const next = cookieConsentReducer(initial, { categories, currentVersion: '1', type: 'load-succeeded' });
    expect(next.status).toBe('decided');
    expect(next.categories).toEqual(categories);
  });

  it('stale version: a real decision exists but its version differs from currentVersion -> the caller passes categories:null, reducer treats it as undecided', () => {
    // useCookieConsentRuntime is the one that compares decision.version to
    // currentVersion via isCookieConsentDecisionCurrent before dispatching;
    // the reducer only ever sees the already-resolved categories:null for
    // "no *current* decision", whether that's because none exists or
    // because the one on file is stale. Both must produce the same
    // fresh-decision-required outcome.
    const next = cookieConsentReducer(initial, { categories: null, currentVersion: '2', type: 'load-succeeded' });
    expect(next.status).toBe('undecided');
    expect(next.categories).toEqual(safeCookieConsentDefaults);
  });

  it('load-failed -> error, fail-closed categories, no analytics/marketing enabled', () => {
    const next = cookieConsentReducer(decidedAll, { type: 'load-failed' });
    expect(next.status).toBe('error');
    expect(next.categories).toEqual(safeCookieConsentDefaults);
  });

  it('accept all: save-succeeded with every optional category true', () => {
    const categories = { analytics: true, marketing: true, necessary: true, preferences: true } as const;
    const next = cookieConsentReducer(
      { ...initial, status: 'saving' },
      { categories, currentVersion: '1', type: 'save-succeeded' },
    );
    expect(next.status).toBe('decided');
    expect(next.categories).toEqual(categories);
  });

  it('reject optional: save-succeeded with every optional category false', () => {
    const categories = { analytics: false, marketing: false, necessary: true, preferences: false } as const;
    const next = cookieConsentReducer(
      { ...initial, status: 'saving' },
      { categories, currentVersion: '1', type: 'save-succeeded' },
    );
    expect(next.status).toBe('decided');
    expect(next.categories).toEqual(categories);
  });

  it('custom save: exactly the requested mixed selection is what decides', () => {
    const categories = { analytics: false, marketing: true, necessary: true, preferences: true } as const;
    const next = cookieConsentReducer(
      { ...initial, status: 'saving' },
      { categories, currentVersion: '1', type: 'save-succeeded' },
    );
    expect(next.categories).toEqual(categories);
  });

  it('change an existing decision: a later save-succeeded fully replaces the prior categories', () => {
    const changed = { analytics: false, marketing: false, necessary: true, preferences: true } as const;
    const next = cookieConsentReducer(decidedAll, { categories: changed, currentVersion: '1', type: 'save-succeeded' });
    expect(next.categories).toEqual(changed);
  });

  it('save-failed falling back from a prior decided consent keeps status decided and the prior categories', () => {
    const next = cookieConsentReducer(
      { ...decidedAll, status: 'saving' },
      { fallbackStatus: 'decided', type: 'save-failed' },
    );
    expect(next.status).toBe('decided');
    expect(next.categories).toEqual(decidedAll.categories);
    expect(next.error).toBe('save');
  });

  it('save-failed falling back from undecided (first-ever decision attempt) returns to undecided, banner reappears', () => {
    const next = cookieConsentReducer(
      { ...initial, status: 'saving' },
      { fallbackStatus: 'undecided', type: 'save-failed' },
    );
    expect(next.status).toBe('undecided');
    expect(next.error).toBe('save');
  });

  it('reopen preferences after a decision was already made', () => {
    const next = cookieConsentReducer(decidedAll, { type: 'preferences-opened' });
    expect(next.preferencesOpen).toBe(true);
    expect(next.status).toBe('decided');
    expect(next.categories).toEqual(decidedAll.categories);
  });

  it('close preferences leaves the decision untouched', () => {
    const opened = { ...decidedAll, preferencesOpen: true };
    const next = cookieConsentReducer(opened, { type: 'preferences-closed' });
    expect(next.preferencesOpen).toBe(false);
    expect(next.status).toBe('decided');
  });

  it('save-started clears a prior error but keeps the current categories visible while saving', () => {
    const next = cookieConsentReducer({ ...decidedAll, error: 'save' }, { type: 'save-started' });
    expect(next.status).toBe('saving');
    expect(next.error).toBeNull();
    expect(next.categories).toEqual(decidedAll.categories);
  });
});
