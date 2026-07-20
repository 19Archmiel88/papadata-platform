# Bezpieczeństwo integracji

## Granica zaufania

UI i Storybook nie są źródłem decyzji bezpieczeństwa. Runtime ponownie sprawdza:

- `tenantId`;
- `workspaceId`;
- capability;
- entitlement;
- status providera;
- status connection;
- wymagane scopes;
- idempotency fingerprint.

## Sekrety

Secret Store przechowuje credential material wyłącznie lokalnie w runtime.
Na zewnątrz wychodzi tylko `CredentialMetadata`:

- `credentialRef`;
- status;
- wersja;
- daty utworzenia, rotacji i wygaśnięcia;
- tenant;
- workspace;
- provider;
- connection.

Fixtures, Storybook, audit log, outbox i error envelope są skanowane testami
pod kątem braku tokenów, secretów i materiału credential.

## Webhooki

Webhook wymaga:

- zgodnego providera;
- istniejącego connection w tym samym tenant/workspace;
- poprawnego timestampu;
- poprawnego podpisu;
- deduplikacji event ID.

Niepoprawny podpis zwraca `invalid_signature`. Duplikat zwraca `duplicate` i nie
tworzy kolejnego joba incremental.

## Izolacja

Testy security pokrywają:

- mutację obcego connection;
- webhook wskazujący obce connection;
- replay z obcego tenant/workspace;
- ten sam external ID w dwóch workspace bez kolizji source records.

W odpowiedziach dla obcego scope stosowany jest `NOT_FOUND`, aby nie ujawniać
istnienia zasobu.

## Audit i observability

Runtime zapisuje strukturalne audit eventy dla:

- connect;
- sync;
- retry;
- DLQ;
- replay;
- reconnect;
- disconnect;
- webhook.

Logi i metryki zawierają identyfikatory operacyjne, ale nie zawierają sekretów
ani payloadów providera.
