# PapaData Platform

Repozytorium produktu PapaData.

Na obecnym etapie zawiera zaakceptowaną bazę wizualną rozwijaną
w Storybooku:

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
- Produkcyjny backend runtime, IdP, baza danych, workery i infrastruktura nie
  zostały jeszcze wybrane ani utworzone.
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

## Najbliższy cel

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

## Kontrole jakości

    pnpm lint
    pnpm typecheck
    pnpm test
    pnpm test:e2e:auth
    pnpm test:storybook
    pnpm verify
    pnpm build
    pnpm build-storybook

`pnpm verify` uruchamia lint, typecheck, spellcheck, markdownlint oraz pełny zestaw testów.

## Zasady

- Nie odtwarzamy starego interfejsu.
- Stary projekt nie jest źródłem wyglądu ani komponentów.
- Nie zmieniamy zaakceptowanego wyglądu podczas porządkowania struktury.
- Każdy ekran docelowo posiada jedną implementację współdzieloną przez aplikację i Storybook.
- Dane scenariuszy są oddzielone od komponentów.
- Nie przedstawiamy prototypu jako funkcji gotowej produkcyjnie.
- Obecny auth ma lokalną/testową granicę serwerową, ale nie jest produkcyjnym
  IdP ani produkcyjnym session store.
- Po zielonej weryfikacji Codex automatycznie tworzy polski commit i wykonuje bezpieczny push do `origin/main`.
- Nowe zależności produkcyjne, zmiany architektoniczne i operacje na GCP nadal wymagają jawnej zgody.

Szczegółowe reguły znajdują się w `AGENTS.md`.

## Stan realizacji monorepo

- Root repozytorium korzysta z pnpm workspace i Turborepo.
- Aplikacja webowa znajduje się w `apps/web`.
- Konfiguracja Storybooka znajduje się w `apps/web/.storybook`, a komponenty, ekrany, stories i fixtures w `apps/web/src`.
- `apps/bff`, `apps/api` i `apps/worker` nie zostały jeszcze utworzone jako
  produkcyjne runtime.
- Pakiety współdzielone w `packages/*` nie zostały jeszcze utworzone.
- Obecny etap nie potwierdza gotowości aplikacji produkcyjnej.
