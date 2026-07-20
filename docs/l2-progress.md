# L2 Progress

## Zakres

Prompt 1 obejmuje audyt repozytorium oraz minimalny szkielet backendu w
monorepo. Nie obejmuje auth, implementacji bazy danych, runtime workerów ani
Docker Compose.

## Audyt wejściowy

- Repozytorium działa jako prywatne monorepo pnpm i Turborepo.
- `pnpm-workspace.yaml` obejmuje `apps/*` oraz `packages/*`.
- Istniejący frontend znajduje się w `apps/web` i zachowuje konfigurację Vite,
  React, Storybook, Vitest oraz Playwright.
- Przed tym zakresem istniały lokalne zmiany w `apps/web/package.json` oraz
  `pnpm-lock.yaml`; nie były cofane.
- W repozytorium nie ma obecnie Dockerfile ani Docker Compose.
- Główna konfiguracja TypeScript frontendu jest lokalna dla `apps/web`.

## Wykonany stan L2

- Dodano `apps/api` jako minimalny pakiet TypeScript dla przyszłego API.
- Dodano `apps/worker` jako minimalny pakiet TypeScript dla przyszłych jobów.
- Dodano `packages/contracts` z wersją `domain-contracts.v1`, typami scope
  tenant/workspace i podstawowym kontraktem operacji.
- Dodano `packages/database` jako jawny placeholder granicy persistence bez
  sterownika, schematu i migracji.
- Dodano `packages/testing` z typowanymi fixture scope dla przyszłych testów
  izolacji.
- Dodano `tsconfig.base.json` dla nowych pakietów backendu.

## Korekta podziału backendu

Poprawiony podział backendu ma 9 zadań i jest zapisany w
`docs/backend-implementation-plan.md`. Zadanie 1 obejmuje audyt, ADR-y oraz
wspólny kontrakt API, ponieważ wszystkie późniejsze endpointy muszą używać
jednego standardu odpowiedzi, idempotencji i wersjonowania.

## Granice

- Backend nie uruchamia serwera HTTP.
- Worker nie uruchamia kolejki ani procesorów jobów.
- Pakiet database nie łączy się z bazą i nie zawiera migracji.
- Nie dodano zewnętrznych zależności produkcyjnych.
- Nie zmieniono struktury ani kodu `apps/web`.
