import { useState } from 'react';

import { Button } from '../design-system';
import { useSession } from '../app/providers';
import { bffClient } from '../shared/api/bffClient';

type ProbeState =
  | { readonly status: 'idle' }
  | { readonly status: 'checking' }
  | {
      readonly status: 'done';
      readonly ok: boolean;
      readonly httpStatus: number;
      readonly requestId: string | null;
    }
  | {
      readonly status: 'error';
      readonly message: string;
    };

export function CommandCenterScreen() {
  const { session } = useSession();
  const [probe, setProbe] = useState<ProbeState>({ status: 'idle' });

  async function runProbe() {
    setProbe({ status: 'checking' });
    try {
      const result = await bffClient.probeProtectedApi();
      setProbe({
        status: 'done',
        ok: result.ok,
        httpStatus: result.status,
        requestId: result.requestId,
      });
    } catch (cause) {
      setProbe({
        status: 'error',
        message: cause instanceof Error ? cause.message : 'Nie udało się sprawdzić API.',
      });
    }
  }

  return (
    <section className="runtime-dashboard" aria-labelledby="command-center-title">
      <div className="runtime-dashboard__heading">
        <div>
          <p className="runtime-dashboard__eyebrow">Pierwsza chroniona powierzchnia LP-4</p>
          <h1 id="command-center-title">Centrum Dowodzenia</h1>
          <p>
            Ten ekran potwierdza realny frontend runtime, routing, sesję i granicę BFF.
            Dane produktowe, KPI oraz seed należą do kolejnych etapów.
          </p>
        </div>
      </div>

      <div className="runtime-dashboard__grid">
        <article className="runtime-panel">
          <h2>Aktywny kontekst</h2>
          <dl>
            <div>
              <dt>Tenant</dt>
              <dd>{session?.activeTenantId ?? '—'}</dd>
            </div>
            <div>
              <dt>Workspace</dt>
              <dd>{session?.activeWorkspaceId ?? '—'}</dd>
            </div>
            <div>
              <dt>Poziom sesji</dt>
              <dd>{session?.authLevel ?? '—'}</dd>
            </div>
            <div>
              <dt>Wygaśnięcie</dt>
              <dd>{formatDate(session?.expiresAt)}</dd>
            </div>
          </dl>
        </article>

        <article className="runtime-panel">
          <h2>Capabilities</h2>
          {session?.capabilities.length ? (
            <ul className="runtime-capabilities">
              {session.capabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          ) : (
            <p>Sesja nie zwróciła capabilities.</p>
          )}
        </article>

        <article className="runtime-panel runtime-panel--wide">
          <h2>Przejście BFF → API</h2>
          <p>
            Kontrolny odczyt używa chronionej trasy integracji. Nie podmienia danych
            i nie udaje gotowości modułu biznesowego.
          </p>

          <div className="runtime-probe">
            <Button
              loading={probe.status === 'checking'}
              loadingLabel="Sprawdzanie…"
              onClick={() => void runProbe()}
              variant="secondary"
            >
              Sprawdź chronione API
            </Button>

            {probe.status === 'done' ? (
              <span
                className="runtime-probe__result"
                data-ok={probe.ok ? true : undefined}
              >
                HTTP {probe.httpStatus}
                {probe.requestId ? ` · request ${probe.requestId}` : ''}
              </span>
            ) : null}
            {probe.status === 'error' ? (
              <span className="runtime-probe__result" role="alert">
                {probe.message}
              </span>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('pl-PL', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}
