# Zakres wydania backend-converged-2026-08

## Priorytet architektoniczny

Jedyną bazą rozwojową jest obecny projekt z rozdzielonym BFF, API, workerem i pakietami platformowymi. Kod ze starego `papadata-main` jest wyłącznie dawcą zachowań domenowych, adapterów, testów i modeli danych. Nie przeniesiono starego monolitycznego `AppModule` ani zależności domen od Prisma.

## Zakres repozytoryjny

Wydanie zawiera:

- 7/7 adapterów: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads i GA4;
- podpisane webhooki z trwałą replay protection dla WooCommerce, Shopify i Meta Ads;
- checkpointowany polling dla BaseLinker, Allegro, Google Ads i GA4;
- publiczną rejestrację i logowanie przez API oraz sesję HttpOnly zarządzaną przez BFF/Redis;
- dokładną zgodność 212/212 dla metod, ścieżek i `operationId` kontraktu `contracts/openapi-1.0.json`;
- trwały model tenancy, domen produktowych, audytu mutacji i wyszukiwania;
- natywne runtime dla głównych domen oraz generowaną warstwę kompatybilności dla pozostałych operacji kontraktu;
- automatycznie generowaną macierz możliwości, pokrycia kontraktu i integracji;
- migrację `0017_backend_product_convergence.sql` z wymuszonym RLS.

## Granice uczciwego statusu

`targetReleaseClaimed` i `semanticConformanceClaimed` pozostają `false`. Pokrycie trasy oznacza, że żądanie ma kontrolowany handler w aktualnej architekturze; nie oznacza jeszcze, że każda z 212 operacji posiada pełny, dedykowany model biznesowy i odbiór live.

Nadal wymagają odbioru środowiskowego:

- live OAuth/connect/sync/backfill/revoke dla wszystkich siedmiu providerów;
- callbacki webhooków z rzeczywistymi podpisami providerów;
- test PostgreSQL/Redis/storage w CI i staging;
- pełne scenariusze DSAR wraz z providerami i backupami;
- PDF/XLSX;
- zewnętrzne skutki AI, które pozostają wyłączone fail-closed;
- zastępowanie handlerów `compatibility` natywnymi usługami domenowymi i golden tests.

## Synchronizacja dokumentacji

Kontrolery kontraktowe generuje:

```text
node tools/generate-backend-contract-runtime.mjs
```

Manifest oraz dokumentację generuje:

```text
node tools/generate-backend-capability-docs.mjs
```

CI uruchamia oba generatory w wariancie `--check`. Drift pomiędzy OpenAPI, kontrolerami, providerami, manifestem i dokumentacją blokuje bramkę wydania.
