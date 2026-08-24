import {
  useEffect,
  useState,
} from 'react';

import {
  Button,
  Checkbox,
  TextAction,
} from '../../design-system';
import './auth-surface.css';

type CookieConsentDecision = {
  readonly analytics: boolean;
  readonly decidedAt: string;
  readonly marketing: boolean;
  readonly necessary: true;
};

const STORAGE_KEY = 'papadata.cookie-consent.v1';

export function CookieConsentBanner() {
  const [decision, setDecision] = useState<CookieConsentDecision | null>(
    () => readStoredDecision(),
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(false);
  const [marketingDraft, setMarketingDraft] = useState(false);

  useEffect(() => {
    if (decision) return;
    setDecision(readStoredDecision());
  }, [decision]);

  if (decision) return null;

  function persist(next: Omit<CookieConsentDecision, 'decidedAt' | 'necessary'>) {
    const record: CookieConsentDecision = {
      analytics: next.analytics,
      decidedAt: new Date().toISOString(),
      marketing: next.marketing,
      necessary: true,
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Brak dostępu do localStorage (np. tryb prywatny) nie blokuje dalszego korzystania z aplikacji.
    }

    setDecision(record);
  }

  return (
    <div className="pd-auth-cookie-banner pd-auth-theme" role="region" aria-label="Zgoda na pliki cookie">
      <div className="pd-auth-cookie-banner__panel">
        <div className="pd-auth-cookie-banner__row">
          <div className="pd-auth-cookie-banner__copy">
            <p className="pd-auth-cookie-banner__title">Ta strona używa plików cookie</p>
            <p className="pd-auth-cookie-banner__text">
              Niezbędne pliki cookie utrzymują bezpieczne logowanie i sesję. Za Twoją zgodą
              używamy też cookies analitycznych i marketingowych, aby rozwijać PapaData.
              Możesz zmienić wybór w każdej chwili w ustawieniach.
            </p>
          </div>

          <div className="pd-auth-cookie-banner__actions">
            <TextAction onClick={() => setPreferencesOpen((open) => !open)}>
              {preferencesOpen ? 'Ukryj ustawienia' : 'Dostosuj'}
            </TextAction>
            <Button
              onClick={() => persist({ analytics: false, marketing: false })}
              variant="secondary"
            >
              Tylko niezbędne
            </Button>
            <Button
              onClick={() => persist({ analytics: true, marketing: true })}
            >
              Akceptuj wszystkie
            </Button>
          </div>
        </div>

        {preferencesOpen ? (
          <div className="pd-auth-cookie-banner__preferences">
            <div className="pd-auth-cookie-banner__preference">
              <Checkbox
                checked
                disabled
                helperText="Zawsze aktywne — wymagane do działania logowania i sesji."
                label="Niezbędne"
                onChange={() => {}}
                value="necessary"
              />
            </div>
            <div className="pd-auth-cookie-banner__preference">
              <Checkbox
                checked={analyticsDraft}
                helperText="Pomaga nam zrozumieć, jak używacie PapaData, aby ulepszać produkt."
                label="Analityczne"
                onChange={(event) => setAnalyticsDraft(event.currentTarget.checked)}
                value="analytics"
              />
            </div>
            <div className="pd-auth-cookie-banner__preference">
              <Checkbox
                checked={marketingDraft}
                helperText="Pozwala dopasować treści marketingowe do Twoich zainteresowań."
                label="Marketingowe"
                onChange={(event) => setMarketingDraft(event.currentTarget.checked)}
                value="marketing"
              />
            </div>
            <Button
              onClick={() => persist({ analytics: analyticsDraft, marketing: marketingDraft })}
              variant="secondary"
            >
              Zapisz wybór
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function readStoredDecision(): CookieConsentDecision | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CookieConsentDecision>;
    if (
      typeof parsed.analytics !== 'boolean'
      || typeof parsed.marketing !== 'boolean'
      || typeof parsed.decidedAt !== 'string'
    ) {
      return null;
    }

    return {
      analytics: parsed.analytics,
      decidedAt: parsed.decidedAt,
      marketing: parsed.marketing,
      necessary: true,
    };
  } catch {
    return null;
  }
}
