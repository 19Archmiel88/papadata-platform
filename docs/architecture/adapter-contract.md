# Kontrakt adaptera integracji

## Wersja

Aktualna wersja kontraktu adaptera to `integration-adapter.v1`.
Aktualna wersja polityki scopes to `integration-policy.2026-07`.

Schematy i typy znajdują się w
`apps/web/src/features/integrations/integrationContracts.ts`.

## Wymagany interfejs adaptera

Adapter musi obsłużyć:

- `authorize.begin` i deterministyczne `state`;
- `exchangeAuthorization`;
- `reauthorize`;
- `revoke`;
- `detectAccounts`;
- `fetchPage`;
- `verifyWebhook`.

Adapter nie zwraca sekretów do UI, fixtures, audit logów ani outboxa. Materiał
credential trafia wyłącznie do Secret Store, a dalej używany jest tylko
`credentialRef` i metadata wersji.

## Connection

`IntegrationConnection` przechowuje:

- `tenantId` i `workspaceId`;
- `providerId`;
- `externalAccountRef`;
- status connection;
- `credentialRef`;
- granted scopes i ostatni `ScopeDiff`;
- ostatni błąd w bezpiecznej kopercie.

Dozwolone statusy:

- `NOT_CONNECTED`;
- `CONNECTING`;
- `ACTIVE`;
- `SYNCING`;
- `LIMITED_ACCESS`;
- `REAUTH_REQUIRED`;
- `RETRY_WAIT`;
- `ERROR`;
- `DISABLED`.

Przejścia statusów są walidowane przez `transitionConnection`. Nie można
przeskoczyć do stanu odzyskiwania bez jawnej przyczyny i `correlationId`.

## Scopes

`calculateScopeDiff` wylicza:

- scopes przyznane;
- wymagane scopes, których brakuje;
- opcjonalne scopes, których brakuje;
- scopes nowo przyznane;
- scopes usunięte przy reconnect.

Brak wymaganych scopes daje `LIMITED_ACCESS`. Zwiększenie lub zmniejszenie
zakresu wymaga reconnect i ponownej walidacji connection.

## Błędy

Adapter i runtime zwracają `SafeIntegrationError`:

- `AUTH`;
- `REVOKED`;
- `RATE_LIMIT`;
- `TRANSIENT`;
- `TIMEOUT`;
- `SCHEMA_MISMATCH`;
- `PERMISSION`;
- `SCOPE`;
- `NOT_FOUND`;
- `VALIDATION_DATA`;
- `BUG`;
- `INVARIANT`.

Koperta błędu musi zawierać `code`, `correlationId`, klasę błędu, impact,
next action oraz decyzję retry bez sekretów i bez payloadów providera.

## Adapter WooCommerce

Fala 2 implementuje adapter WooCommerce dla local/CI/development.

Obsługiwane streamy:

- `orders`;
- `products`;
- `refunds`.

Obsługiwane ścieżki:

- connect;
- minimal scopes;
- initial sync;
- incremental sync z webhooka;
- bounded backfill;
- checkpoint;
- retry;
- DLQ;
- replay;
- reconnect;
- disconnect z retencją source data;
- revoke partial failure;
- schema mismatch;
- provider outage;
- worker crash recovery.
