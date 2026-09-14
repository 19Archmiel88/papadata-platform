import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Button, Checkbox, Dialog } from '../../../design-system';
import { bffClient } from '../api/bffClient';
import {
  CookieConsentRuntimeProvider,
  safeCookieConsentDefaults,
  useCookieConsentRuntime,
  type CookieConsentRuntime,
  type CookieConsentSelection,
} from './cookieConsentRuntime';
import {useCookiePolicyLinkAvailable} from './cookiePolicyAvailability';

import './cookie-consent.css';

type Copy = {
  readonly bannerTitle: string;
  readonly bannerText: string;
  readonly acceptAll: string;
  readonly rejectOptional: string;
  readonly customize: string;
  readonly change: string;
  readonly dialogTitle: string;
  readonly dialogDescription: string;
  readonly savePreferences: string;
  readonly close: string;
  readonly necessary: string;
  readonly necessaryHelp: string;
  readonly preferences: string;
  readonly preferencesHelp: string;
  readonly analytics: string;
  readonly analyticsHelp: string;
  readonly marketing: string;
  readonly marketingHelp: string;
  readonly saving: string;
  readonly error: string;
  readonly policyLink: string;
};

const copyByLocale = {
  en: {
    acceptAll: 'Accept all',
    analytics: 'Analytics',
    analyticsHelp: 'Product measurement and aggregate usage diagnostics.',
    bannerText: 'We use necessary cookies to keep PapaData working. Optional categories stay off until you choose them.',
    bannerTitle: 'Cookie choices',
    change: 'Cookie settings',
    close: 'Close',
    customize: 'Customize',
    dialogDescription: 'Necessary cookies are always on. Optional categories are saved only after you confirm.',
    dialogTitle: 'Cookie preferences',
    error: 'We could not save your cookie choices. Please try again.',
    marketing: 'Marketing',
    marketingHelp: 'Campaign measurement and marketing personalization.',
    necessary: 'Necessary',
    necessaryHelp: 'Required for security, sessions and basic product operation.',
    policyLink: 'Cookie policy',
    preferences: 'Preferences',
    preferencesHelp: 'Remember interface choices and product preferences.',
    rejectOptional: 'Reject optional',
    savePreferences: 'Save preferences',
    saving: 'Saving...',
  },
  pl: {
    acceptAll: 'Akceptuj wszystkie',
    analytics: 'Analityczne',
    analyticsHelp: 'Pomiar produktu i zbiorcza diagnostyka użycia.',
    bannerText: 'Używamy niezbędnych cookies, aby PapaData działała poprawnie. Kategorie opcjonalne pozostają wyłączone, dopóki ich nie wybierzesz.',
    bannerTitle: 'Ustawienia cookies',
    change: 'Ustawienia cookies',
    close: 'Zamknij',
    customize: 'Dostosuj',
    dialogDescription: 'Niezbędne cookies są zawsze włączone. Kategorie opcjonalne zapisujemy dopiero po potwierdzeniu.',
    dialogTitle: 'Preferencje cookies',
    error: 'Nie udało się zapisać ustawień cookies. Spróbuj ponownie.',
    marketing: 'Marketingowe',
    marketingHelp: 'Pomiar kampanii i personalizacja marketingowa.',
    necessary: 'Niezbędne',
    necessaryHelp: 'Wymagane dla bezpieczeństwa, sesji i podstawowego działania produktu.',
    policyLink: 'Polityka cookies',
    preferences: 'Preferencje',
    preferencesHelp: 'Zapamiętywanie wyborów interfejsu i preferencji produktu.',
    rejectOptional: 'Odrzuć opcjonalne',
    savePreferences: 'Zapisz preferencje',
    saving: 'Zapisywanie...',
  },
} satisfies Record<'en' | 'pl', Copy>;

function useCookieCopy(): Copy {
  const language = typeof navigator === 'undefined' ? 'pl' : navigator.language.toLowerCase();
  return language.startsWith('en') ? copyByLocale.en : copyByLocale.pl;
}

export function CookieConsentRoot({ children }: { readonly children: ReactNode }) {
  const runtime = useCookieConsentRuntime(bffClient);
  // Independent of `runtime` on purpose (see BATCH F.1): a failed or
  // still-loading legal-document read must never affect cookie consent's
  // own status/categories/saving/error, only whether the policy link
  // renders. Read once here (CookieConsentRoot mounts once at the app
  // root) so the banner and the dialog never each fire their own request.
  const policyLinkAvailable = useCookiePolicyLinkAvailable(bffClient);

  return (
    <CookieConsentRuntimeProvider value={runtime}>
      {children}
      <CookieConsentGlobalSurface policyLinkAvailable={policyLinkAvailable} runtime={runtime} />
    </CookieConsentRuntimeProvider>
  );
}

export function CookieConsentGlobalSurface({
  policyLinkAvailable,
  runtime,
}: {
  readonly policyLinkAvailable: boolean;
  readonly runtime: CookieConsentRuntime;
}) {
  const copy = useCookieCopy();
  const saving = runtime.status === 'saving';
  const showReopen = !runtime.bannerVisible && !runtime.preferencesOpen && runtime.status !== 'loading';

  return (
    <>
      {runtime.bannerVisible ? (
        <section className="pd-cookie-consent" aria-labelledby="pd-cookie-consent-title">
          <div className="pd-cookie-consent__panel">
            <div className="pd-cookie-consent__copy">
              <h2 id="pd-cookie-consent-title">{copy.bannerTitle}</h2>
              <p>
                {copy.bannerText}
                {policyLinkAvailable ? (
                  <> <a className="pd-cookie-consent__policy-link" href="/legal/cookie_policy" rel="noopener noreferrer" target="_blank">{copy.policyLink}</a></>
                ) : null}
              </p>
              {runtime.error === 'save' ? <p className="pd-cookie-consent__error" role="alert">{copy.error}</p> : null}
            </div>
            <div className="pd-cookie-consent__actions">
              <Button disabled={saving} loading={saving} loadingLabel={copy.saving} onClick={() => void runtime.acceptAll()}>
                {copy.acceptAll}
              </Button>
              <Button disabled={saving} variant="secondary" onClick={() => void runtime.rejectOptional()}>
                {copy.rejectOptional}
              </Button>
              <Button disabled={saving} variant="ghost" onClick={runtime.openPreferences}>
                {copy.customize}
              </Button>
            </div>
          </div>
        </section>
      ) : null}
      {showReopen ? (
        <button className="pd-cookie-consent__reopen" type="button" onClick={runtime.openPreferences}>
          {copy.change}
        </button>
      ) : null}
      <CookiePreferencesDialog copy={copy} policyLinkAvailable={policyLinkAvailable} runtime={runtime} />
    </>
  );
}

function CookiePreferencesDialog({
  copy,
  policyLinkAvailable,
  runtime,
}: {
  readonly copy: Copy;
  readonly policyLinkAvailable: boolean;
  readonly runtime: CookieConsentRuntime;
}) {
  const initialSelection = useMemo(() => ({
    analytics: runtime.status === 'decided' ? runtime.categories.analytics : safeCookieConsentDefaults.analytics,
    marketing: runtime.status === 'decided' ? runtime.categories.marketing : safeCookieConsentDefaults.marketing,
    preferences: runtime.status === 'decided' ? runtime.categories.preferences : safeCookieConsentDefaults.preferences,
  }), [runtime.categories.analytics, runtime.categories.marketing, runtime.categories.preferences, runtime.status]);
  const [selection, setSelection] = useState<CookieConsentSelection>(initialSelection);
  const saving = runtime.status === 'saving';

  useEffect(() => {
    if (runtime.preferencesOpen) setSelection(initialSelection);
  }, [initialSelection, runtime.preferencesOpen]);

  const update = (key: keyof CookieConsentSelection, checked: boolean) => {
    setSelection((current) => ({ ...current, [key]: checked }));
  };

  return (
    <Dialog
      closeOnEscape={!saving}
      description={copy.dialogDescription}
      dismissible={!saving}
      modal
      onOpenChange={(open) => {
        if (!open && !saving) runtime.closePreferences();
      }}
      open={runtime.preferencesOpen}
      title={copy.dialogTitle}
    >
      {policyLinkAvailable ? (
        <p className="pd-cookie-consent__dialog-policy-link"><a href="/legal/cookie_policy" rel="noopener noreferrer" target="_blank">{copy.policyLink}</a></p>
      ) : null}
      <form className="pd-cookie-consent__dialog" onSubmit={(event) => {
        event.preventDefault();
        void runtime.savePreferences(selection).catch(() => undefined);
      }}>
        <div className="pd-cookie-consent__options">
          <Checkbox checked disabled helperText={copy.necessaryHelp} label={copy.necessary} value="necessary" onChange={() => undefined} />
          <Checkbox checked={selection.preferences} disabled={saving} helperText={copy.preferencesHelp} label={copy.preferences} value="preferences" onChange={(event) => update('preferences', event.currentTarget.checked)} />
          <Checkbox checked={selection.analytics} disabled={saving} helperText={copy.analyticsHelp} label={copy.analytics} value="analytics" onChange={(event) => update('analytics', event.currentTarget.checked)} />
          <Checkbox checked={selection.marketing} disabled={saving} helperText={copy.marketingHelp} label={copy.marketing} value="marketing" onChange={(event) => update('marketing', event.currentTarget.checked)} />
        </div>
        {runtime.error === 'save' ? <p className="pd-cookie-consent__error" role="alert">{copy.error}</p> : null}
        <div className="pd-cookie-consent__dialog-actions">
          <Button disabled={saving} variant="ghost" type="button" onClick={runtime.closePreferences}>{copy.close}</Button>
          <Button disabled={saving} loading={saving} loadingLabel={copy.saving} type="submit">{copy.savePreferences}</Button>
        </div>
      </form>
    </Dialog>
  );
}
