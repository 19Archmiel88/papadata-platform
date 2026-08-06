# Konwergencja ze starego backendu

## Zasada

`papadata-main` nie jest mergowany jako całość. Obecny projekt pozostaje jedyną bazą rozwojową. Zachowania ze starego backendu są przenoszone do aktualnych granic odpowiedzialności i podlegają aktualnym zasadom bezpieczeństwa, tenancy, audytu oraz testów.

| Stary obszar | Docelowa warstwa obecnego projektu |
|---|---|
| connector/adapters | `packages/integrations` + durable worker ingestion |
| Prisma domain services | `ProductDomainRepository` + RLS PostgreSQL |
| auth/session | API identity + BFF Redis session boundary |
| dashboard/analytics | natywne kontrolery domenowe + canonical ingestion/metric snapshots |
| szeroki kontrakt HTTP | generowany contract compatibility runtime w aktualnym Nest API |
| jobs/scheduler | BullMQ worker + PostgreSQL reservation/lease |
| webhook dedup | provider verifier + `webhook_replay_receipts` |
| docs inventory | generator manifestu, macierzy możliwości i integracji |

## Co przeniesiono

- adaptery i mapowania domenowe WooCommerce, Google Ads i Meta Ads;
- zachowania biznesowe dla kampanii, zamówień, produktów, klientów, ruchu, jakości danych, ustawień, billing i support;
- szerokość kontraktu API: 212/212 par metoda, ścieżka i `operationId`;
- wymagania testowe i operacyjne dla integracji, synchronizacji, backfill i recovery.

Allegro zostało dodane jako nowy adapter, ponieważ żadna z porównywanych paczek nie zawierała kompletnej implementacji.

## Jak działa warstwa zgodności kontraktu

- kontrolery są generowane z `contracts/openapi-1.0.json`;
- istniejące natywne kontrolery mają pierwszeństwo;
- brakujące operacje trafiają do tenant-aware `ContractRuntimeService`;
- odczyty korzystają z trwałych rekordów domenowych, a mutacje z RLS, idempotency i audytu;
- pola sekretne są odrzucane przed persistence;
- skutki zewnętrznych akcji AI pozostają zablokowane fail-closed.

Dokładne route parity nie jest równoznaczne z pełnym odbiorem semantycznym. Operacje kompatybilności muszą być stopniowo zastępowane natywnymi usługami domenowymi i testami kontraktowymi.

## Co nie zostało skopiowane

- monolityczny moduł API;
- bezpośrednie zależności domen od Prisma;
- in-memory persistence w produkcyjnym runtime;
- pozorne wpisy providerów bez adaptera;
- zewnętrzne skutki AI bez approval i rewalidacji;
- dokumentacja deklarująca funkcję bez dowodu w kodzie i verifierze.
