import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react';

import {
  isCookieConsentDecisionCurrent,
  type CookieConsentCategories,
} from '@papadata/contracts';
import type { BffClient } from '../api/bffClient';

// Fail-closed default -- see BATCH E §12. Used before the real status is
// read, and again on a read/save error: optional functionality never
// starts just because the consent API is briefly unreachable.
export const safeCookieConsentDefaults: CookieConsentCategories = {
  analytics: false,
  marketing: false,
  necessary: true,
  preferences: false,
};

export type CookieConsentRuntimeStatus =
  | 'loading'
  | 'undecided'
  | 'decided'
  | 'saving'
  | 'error';

export type CookieConsentRuntimeState = {
  readonly status: CookieConsentRuntimeStatus;
  readonly categories: CookieConsentCategories;
  readonly version: string | null;
  readonly preferencesOpen: boolean;
  readonly error: string | null;
};

const initialState: CookieConsentRuntimeState = {
  categories: safeCookieConsentDefaults,
  error: null,
  preferencesOpen: false,
  status: 'loading',
  version: null,
};

export type CookieConsentRuntimeEvent =
  | { readonly type: 'load-started' }
  | { readonly type: 'load-succeeded'; readonly currentVersion: string; readonly categories: CookieConsentCategories | null }
  | { readonly type: 'load-failed' }
  | { readonly type: 'save-started' }
  | { readonly type: 'save-succeeded'; readonly currentVersion: string; readonly categories: CookieConsentCategories }
  // fallbackStatus is decided by the caller (useCookieConsentRuntime), which
  // has the pre-save snapshot -- 'saving' itself doesn't carry enough
  // information to know whether to fall back to a prior decided consent or
  // back to undecided, so the reducer doesn't have to guess.
  | { readonly type: 'save-failed'; readonly fallbackStatus: 'decided' | 'undecided' }
  | { readonly type: 'preferences-opened' }
  | { readonly type: 'preferences-closed' };

// Pure reducer, separated from the React binding below for the same reason
// authSessionRuntime.ts's authSessionReducer is: testable without a DOM
// renderer. See cookieConsentRuntime.test.ts.
export function cookieConsentReducer(
  state: CookieConsentRuntimeState,
  event: CookieConsentRuntimeEvent,
): CookieConsentRuntimeState {
  switch (event.type) {
    case 'load-started':
      return { ...state, error: null, status: 'loading' };
    case 'load-succeeded':
      return event.categories
        ? { categories: event.categories, error: null, preferencesOpen: state.preferencesOpen, status: 'decided', version: event.currentVersion }
        // A stale-version decision, or none at all: undecided either way --
        // the categories a fresh read returns for that case are never
        // trusted as the live gating value, only the safe defaults are.
        : { categories: safeCookieConsentDefaults, error: null, preferencesOpen: state.preferencesOpen, status: 'undecided', version: event.currentVersion };
    case 'load-failed':
      return { categories: safeCookieConsentDefaults, error: 'load', preferencesOpen: state.preferencesOpen, status: 'error', version: state.version };
    case 'save-started':
      return { ...state, error: null, status: 'saving' };
    case 'save-succeeded':
      return { categories: event.categories, error: null, preferencesOpen: false, status: 'decided', version: event.currentVersion };
    case 'save-failed':
      // The previous decision's categories (if any) are untouched -- a
      // failed save must never be presented as if it succeeded, but it also
      // must not silently downgrade an already-decided, already-current
      // consent back to the fail-closed defaults.
      return { ...state, error: 'save', status: event.fallbackStatus };
    case 'preferences-opened':
      return { ...state, preferencesOpen: true };
    case 'preferences-closed':
      return { ...state, preferencesOpen: false };
    default:
      return state;
  }
}

export type CookieConsentSelection = {
  readonly preferences: boolean;
  readonly analytics: boolean;
  readonly marketing: boolean;
};

export type CookieConsentRuntime = CookieConsentRuntimeState & {
  readonly bannerVisible: boolean;
  readonly acceptAll: () => Promise<void>;
  readonly rejectOptional: () => Promise<void>;
  readonly savePreferences: (selection: CookieConsentSelection) => Promise<void>;
  readonly openPreferences: () => void;
  readonly closePreferences: () => void;
  readonly refresh: () => Promise<void>;
};

export function useCookieConsentRuntime(client: BffClient): CookieConsentRuntime {
  const [state, dispatch] = useReducer(cookieConsentReducer, initialState);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    dispatch({ type: 'load-started' });
    try {
      const result = await client.readCookieConsent();
      if (!alive.current) return;
      const categories = isCookieConsentDecisionCurrent(result.decision, result.currentVersion)
        ? result.decision.categories
        : null;
      dispatch({ categories, currentVersion: result.currentVersion, type: 'load-succeeded' });
    } catch {
      if (alive.current) dispatch({ type: 'load-failed' });
    }
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(async (selection: CookieConsentSelection) => {
    const fallbackStatus = state.status === 'decided' ? 'decided' : 'undecided';
    dispatch({ type: 'save-started' });
    try {
      const result = await client.writeCookieConsent(selection);
      if (!alive.current) return;
      dispatch({ categories: result.decision?.categories ?? { ...selection, necessary: true }, currentVersion: result.currentVersion, type: 'save-succeeded' });
    } catch {
      if (alive.current) dispatch({ fallbackStatus, type: 'save-failed' });
      throw new Error('Nie udało się zapisać preferencji cookies.');
    }
  }, [client, state.status]);

  return {
    ...state,
    acceptAll: () => save({ analytics: true, marketing: true, preferences: true }),
    bannerVisible: state.status === 'undecided',
    closePreferences: () => dispatch({ type: 'preferences-closed' }),
    openPreferences: () => dispatch({ type: 'preferences-opened' }),
    refresh,
    rejectOptional: () => save({ analytics: false, marketing: false, preferences: false }),
    savePreferences: save,
  };
}

const CookieConsentRuntimeContext = createContext<CookieConsentRuntime | null>(null);
export const CookieConsentRuntimeProvider = CookieConsentRuntimeContext.Provider;
export function useCookieConsentRuntimeContext(): CookieConsentRuntime {
  const runtime = useContext(CookieConsentRuntimeContext);
  if (!runtime) throw new Error('useCookieConsentRuntimeContext used outside CookieConsentRuntimeProvider.');
  return runtime;
}
