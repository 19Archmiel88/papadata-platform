# PapaData Platform

Repozytorium produktu PapaData.

Na obecnym etapie zawiera zaakceptowaną bazę wizualną rozwijaną w Storybooku
oraz lokalny backend sandbox dla kontraktów, auth, tenant/workspace,
integracji, metryk, raportów, AI i billingu:

- motyw jasny i ciemny;
- zmianę języka;
- fundament marki;
- proces dostępu do konta;
- konfigurację workspace;
- dashboard;
- elementy analityczne.

## Aktualny status

- Storybook jest aktywnym środowiskiem projektowania i testowania UI.
- Obecny wygląd stanowi bazę do dalszego rozwoju.
- Implementacje ekranów znajdują się w `apps/web/src`, a Storybook używa tych
  samych komponentów.
- Aplikacja Vite używa runtime klienta `/api/auth`; Storybook jawnie wstrzykuje
  local/test adapter.
- Minimalna serwerowa granica auth istnieje lokalnie/testowo w
  `apps/web/src/server/auth`.
- `apps/api` i `apps/worker` istnieją jako lokalne runtime backendu sandbox.
- `packages/contracts`, `packages/database` i `packages/testing` zawierają
  współdzielone kontrakty, manifesty tabel oraz fixture testowe.
- Docker Compose uruchamia lokalnie PostgreSQL, Redis, API, worker i migracje.
- Produkcyjny backend, BFF, IdP, trwałe repozytoria `pg`, storage, kolejka,
  OTel, CI i hosting nie są jeszcze gotowe produkcyjnie.
- Poprawny build lub test nie oznacza gotowości produkcyjnej produktu.

## Model tenantów i GCP

- `papadata.pl` jest organizacją Google Cloud operatora platformy.
- Foldery `env-dev`, `env-stg` i `env-prod` rozdzielają środowiska GCP.
- Każdy klient PapaData posiada osobny aplikacyjny `tenantId`.
- Jeden tenant może posiadać jeden lub wiele workspace oznaczonych przez
  `workspaceId`.
- Identyfikator organizacji GCP nie jest używany w kontraktach domenowych.
- Dedykowany projekt GCP klienta jest opcjonalnym wariantem deploymentu i nie
  zastępuje `tenantId`.

## Najbliższy cel UI

Rozwijać współdzieloną implementację w `apps/web/src`, używaną przez aplikację i Storybook.
`src` bez zmiany:

- wyglądu;
- copy;
- motywu;
- języków;
- zachowania ekranów;
- istniejących scenariuszy.

Docelowo:

- `apps/web/.storybook` zawiera wyłącznie konfigurację Storybooka;
- `apps/web/src/design-system` zawiera fundamenty i komponenty;
- `apps/web/src/screens` zawiera kompletne ekrany;
- `apps/web/src/stories` zawiera definicje stories;
- `apps/web/src/fixtures` zawiera dane scenariuszy;
- `apps/web/src/contracts` zawiera kontrakty UI;
- `apps/web/src/i18n` zawiera konfigurację języków;
- `apps/web/src/app` zawiera aplikację produkcyjną.

Storybook i aplikacja produkcyjna mają używać tych samych komponentów.

## Struktura bieżąca

- `apps/web` — aplikacja React/Vite, Storybook, testy UI i lokalne testy auth;
- `apps/api` — lokalny backend API sandbox dla kontraktów `/v1`;
- `apps/worker` — lokalny worker sandbox;
- `packages/contracts` — wspólne kontrakty backendu i API;
- `packages/database` — manifest bazy i migracje SQL bez ORM;
- `packages/testing` — wspólne fixture testowe;
- `infra` — lokalny Dockerfile Node oraz inicjalizacja PostgreSQL;
- `apps/web/.storybook` — wyłącznie konfiguracja Storybooka;
- `.vscode` — rekomendowane rozszerzenia i ustawienia edytora;
- `docs` — instrukcje techniczne i szablony pracy;
- `AGENTS.md` — obowiązujące reguły pracy z Codexem;
- `00-INSTRUKCJA-STARTU.md` — plan rozwoju platformy;
- `package.json` — skrypty orkiestrujące monorepo i zależności root;
- `apps/web/package.json` — skrypty i zależności aplikacji webowej.

## Uruchamianie

Storybook:

    pnpm storybook

Aplikacja Vite:

    pnpm dev

Lokalny backend sandbox:

    pnpm start:local

Migracje lokalnej bazy:

    pnpm migrate
    pnpm migrate:status
    pnpm test:migrations

## Kontrole jakości

    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm test:e2e:auth
    pnpm test:storybook
    pnpm verify
    pnpm build
    pnpm build-storybook
    pnpm security:audit
    pnpm security:check

`pnpm verify` uruchamia lint, typecheck, spellcheck, markdownlint oraz pełny zestaw testów.
`pnpm security:check` uruchamia audyt produkcyjnych zależności, build repo oraz
build Storybooka.

## Zasady

- Nie odtwarzamy starego interfejsu.
- Stary projekt nie jest źródłem wyglądu ani komponentów.
- Nie zmieniamy zaakceptowanego wyglądu podczas porządkowania struktury.
- Każdy ekran docelowo posiada jedną implementację współdzieloną przez aplikację i Storybook.
- Dane scenariuszy są oddzielone od komponentów.
- Nie przedstawiamy prototypu jako funkcji gotowej produkcyjnie.
- Obecny auth ma lokalną/testową granicę serwerową, ale nie jest produkcyjnym
  IdP ani produkcyjnym session store.
- Lokalny backend sandbox nie zastępuje produkcyjnego API, BFF, storage,
  kolejek, providerów ani hostingu.
- Po zielonej weryfikacji Codex automatycznie tworzy polski commit i wykonuje bezpieczny push do `origin/main`.
- Nowe zależności produkcyjne, zmiany architektoniczne i operacje na GCP nadal wymagają jawnej zgody.

Szczegółowe reguły znajdują się w `AGENTS.md`.

## Stan realizacji monorepo

- Root repozytorium korzysta z pnpm workspace i Turborepo.
- Aplikacja webowa znajduje się w `apps/web`.
- Konfiguracja Storybooka znajduje się w `apps/web/.storybook`, a komponenty, ekrany, stories i fixtures w `apps/web/src`.
- `apps/api` i `apps/worker` zostały utworzone jako lokalne runtime sandbox;
  `apps/bff` nie istnieje jeszcze.
- Pakiety współdzielone `packages/contracts`, `packages/database` i
  `packages/testing` zostały utworzone.
- Pełny stan backendu lokalnego jest opisany w `docs/l2-progress.md`.
- Lokalny baseline bezpieczeństwa jest opisany w
  `docs/security/LOCAL_SECURITY_AUDIT.md`.
- Obecny etap nie potwierdza gotowości aplikacji produkcyjnej.
