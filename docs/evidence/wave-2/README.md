# Dowody Fali 2

## Implementacja

Kod:

- `apps/web/src/features/integrations/integrationContracts.ts`;
- `apps/web/src/features/integrations/localIntegrationRuntime.ts`;
- `apps/web/src/features/integrations/integrationFixtures.ts`;
- `apps/web/src/features/integrations/IntegrationLifecycleScreen.tsx`;
- `apps/web/src/stories/integrations/wave2-integrations.stories.tsx`.

Testy:

- `integrationContracts.unit.test.ts`;
- `localIntegrationRuntime.integration.test.ts`;
- `integrationIsolation.security.test.ts`;
- `integrationFixtures.unit.test.ts`;
- `integrationWave2.e2e.test.ts`;
- testy Storybooka obejmujące ekran integracji.

## Wyniki kontroli cząstkowych

Uruchomiono w trakcie wdrożenia:

| Komenda | Wynik |
| --- | --- |
| `pnpm --filter @papadata/web test:auth` | 15 plików, 70 testów, zielone. |
| `pnpm --filter @papadata/web typecheck` | Zielone. |
| `pnpm --filter @papadata/web test:storybook` | 51 plików, 201 testów, zielone. |

Pełny wynik `pnpm verify`, build aplikacji i build Storybooka jest raportowany
w commicie Fali 2 oraz w końcowym raporcie Codexa.

## Pokryte scenariusze

- provider unavailable;
- provider pilot ready;
- missing capability;
- missing entitlement;
- connect full scope;
- connect limited scope;
- OAuth cancelled;
- callback error;
- bad redirect;
- initial sync queued, running, partial, failed i success;
- no data;
- rate limit;
- retry wait;
- provider outage;
- schema mismatch;
- credential expired;
- reauth required;
- reconnect success i failure;
- scope increased i decreased;
- backfill;
- disconnect impact;
- revoke failure;
- disabled connection;
- recovery success i failure;
- forbidden;
- expired session;
- workspace switch during operation.
