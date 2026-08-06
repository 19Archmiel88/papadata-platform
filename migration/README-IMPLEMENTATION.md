# PapaData — implementacja migracji backendu do nowej architektury

**Data:** 2026-08-06
**Baza docelowa:** `papadata-platform`
**Repozytorium-dawca:** `papadata-main`

## Cel

Ten zakres jest przygotowany do dalszej implementacji backendu w **nowym projekcie**. Nie wykonuje pełnego merge starego monolitu. Zachowuje mocniejsze elementy obecnej architektury i przenosi do nich wybrane, bezpieczne do wydzielenia zachowania domenowe.

## Zasada nadrzędna

Nie wolno osłabić:

- granicy BFF i podpisanego internal principal;
- capability guards, MFA/step-up, CSRF i kontroli Origin;
- tenant scope, RLS oraz rozdziału ról bazy;
- durable workera: lease, heartbeat, checkpoint, retry, cancel, DLQ i reconciliation;
- audytu, idempotency, korelacji i telemetry;
- supply-chain hardeningu, manifestów wydania i evidence gates.

Kod ze starego projektu jest **źródłem zachowania i testów**, a nie architekturą do skopiowania.

## Co zostało dostosowane w tej paczce

1. Naprawiono typecheck backendu w API, BFF, workerze i pakietach backendowych.
2. Wprowadzono jawne tokeny Nest DI w runtime produkcyjnym i generatorze kontrolerów.
3. Dodano testowy, izolowany driver kolejek dostępny wyłącznie przy `NODE_ENV=test`.
4. Zachowano bezpieczną trasę webhooka z `connectionId`, podpisem i replay protection.
5. Dodano `canonical provider record v2` dla siedmiu adapterów:
   - WooCommerce,
   - Shopify,
   - BaseLinker,
   - Allegro,
   - Google Ads,
   - Meta Ads,
   - GA4.
6. Durable worker zapisuje teraz jednocześnie payload kanoniczny, raw payload i lineage.
7. Przeniesiono czyste polityki domenowe ze starego backendu:
   - precedence i rozstrzyganie dostępu;
   - statusy billingowe i entitlementy planów;
   - VAT/reverse charge;
   - jawna, bezpieczna gotowość KSeF bez fałszywego statusu produkcyjnego;
   - normalizacja waluty;
   - klasyfikacja błędów providerów;
   - priorytety źródeł danych.
8. Podłączono semantyczne handlery dla wybranych operacji access, billing, data-quality i command-center.
9. Generator dokumentacji rozróżnia implementacje natywne, migrowane semantycznie, ograniczone oraz compatibility-only.
10. Status integracji 7/7 oznacza obecność implementacji w kodzie. Nie oznacza odbioru live.

## Czego paczka nie deklaruje

- pełnego parytetu funkcjonalnego ze `papadata-main`;
- produkcyjnego odbioru siedmiu providerów;
- zakończonego portu billingów Stripe, AI, pełnego dashboardu, reports/exports, DSAR i wszystkich domen starego API;
- potwierdzenia migracji danych na rzeczywistym PostgreSQL;
- staging/production acceptance.

Pozostałe prace są opisane w `MIGRATION-MATRIX.md` i `IMPLEMENTATION-GAPS.md`. Aktualny manifest klasyfikuje **159 operacji jako `contract-compatibility-runtime`**; ich lista znajduje się w `remaining-compatibility-operations.tsv`.

## Struktura

- `apps/`, `packages/`, `contracts/`, `infra/` — aktualny projekt i dostosowany kod;
- `migration/MIGRATION-MANIFEST.json` — maszynowy zakres paczki;
- `migration/MIGRATION-MATRIX.md` — mapowanie starego backendu na nowe granice;
- `migration/NO-REGRESSION-GUARDRAILS.md` — elementy, których nie wolno osłabić;
- `migration/IMPLEMENTATION-GAPS.md` — zakres nadal wymagający natywnego portu;
- repozytorium-dawca `papadata-main` jest przechowywane poza repozytorium runtime i służy wyłącznie jako źródło zachowania oraz testów;
- `migration/reports/` — raport i metryki porównawcze;
- `migration/scripts/verify-backend-migration.sh` — pełna weryfikacja na wymaganym toolchainie.

## Sposób wdrożenia

1. Rozpakować paczkę do osobnego katalogu.
2. Utworzyć nowy branch migracyjny.
3. Uruchomić skrypt weryfikacyjny na Node `24.18.0` i pnpm `10.29.3`.
4. Portować domeny zgodnie z kolejnością P0/P1 w macierzy.
5. Dla każdej domeny jednocześnie dostarczyć kontroler, DTO, persistence, tenant/capability policy, audit/idempotency, telemetry, testy i generowaną dokumentację.
6. Nie oznaczać domeny jako `native` ani providera jako `live-accepted`, dopóki dowody wykonania nie przejdą.
