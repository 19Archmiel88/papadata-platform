# ADR 0005: Granica BFF i API

## Status

Zaakceptowano.

## Kontekst

Frontend nie jest zaufaną granicą bezpieczeństwa. Aplikacja potrzebuje
browser-facing BFF dla cookies, CSRF i ergonomii UI oraz API domenowego dla
komend, zapytań, policy, audytu i procesów asynchronicznych.

## Decyzja

PapaData rozdziela procesy `bff` i `api`.

BFF:

- terminates browser session cookies;
- egzekwuje CSRF dla operacji zmieniających stan;
- mapuje potrzeby ekranu na stabilne żądania `/v1`;
- nie jest źródłem reguły domenowej.

API:

- egzekwuje tenant, workspace, membership, capability, data scope,
  entitlement, policy version i stan zasobu;
- obsługuje komendy i zapytania domenowe;
- wystawia statusy operacji po `operationId`;
- publikuje audyt i zdarzenia outbox.

Oba procesy uzywaja wspolnego `ApiResponseEnvelope`, `ApiErrorEnvelope`,
`correlationId`, `contractVersion`, `readiness`, `limitations`,
`Idempotency-Key`, `expectedVersion` i `ETag` z `packages/contracts`.

## Konsekwencje

- Endpointy publiczne sa wersjonowane pod `/v1`.
- Browser nigdy nie podejmuje ostatecznej decyzji autoryzacyjnej.
- BFF może agregować dane dla UI, ale API pozostaje właścicielem policy.
- Testy kontraktowe musza obejmowac BFF i API.
