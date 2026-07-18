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
- Implementacje ekranów znajdują się tymczasowo w katalogu `.storybook`.
- Aplikacja Vite jest obecnie technicznym shellem bez produkcyjnego UI.
- Backend, BFF, API, workery i infrastruktura nie zostały jeszcze utworzone.
- Poprawny build lub test nie oznacza gotowości produkcyjnej produktu.

## Najbliższy cel

Przenieść istniejące implementacje z `.storybook` do właściwej struktury
`src` bez zmiany:

- wyglądu;
- copy;
- motywu;
- języków;
- zachowania ekranów;
- istniejących scenariuszy.

Docelowo:

- `.storybook` zawiera wyłącznie konfigurację Storybooka;
- `src/design-system` zawiera fundamenty i komponenty;
- `src/screens` zawiera kompletne ekrany;
- `src/stories` zawiera definicje stories;
- `src/fixtures` zawiera dane scenariuszy;
- `src/contracts` zawiera kontrakty UI;
- `src/i18n` zawiera konfigurację języków;
- `src/app` zawiera aplikację produkcyjną.

Storybook i aplikacja produkcyjna mają używać tych samych komponentów.

## Struktura bieżąca

- `.storybook` — konfiguracja oraz tymczasowa implementacja UI;
- `.vscode` — rekomendowane rozszerzenia i ustawienia edytora;
- `docs` — instrukcje techniczne i szablony pracy;
- `AGENTS.md` — obowiązujące reguły pracy z Codexem;
- `00-INSTRUKCJA-STARTU.md` — plan rozwoju platformy;
- `package.json` — skrypty i zależności aktualnego frontendu.

## Uruchamianie

Storybook:

    pnpm storybook

Aplikacja Vite:

    pnpm dev

## Kontrole jakości

    pnpm lint
    pnpm typecheck
    pnpm test:storybook
    pnpm verify
    pnpm build
    pnpm build-storybook

`pnpm verify` uruchamia lint, pełny typecheck oraz testy Storybooka.

## Zasady

- Nie odtwarzamy starego interfejsu.
- Stary projekt nie jest źródłem wyglądu ani komponentów.
- Nie zmieniamy zaakceptowanego wyglądu podczas porządkowania struktury.
- Każdy ekran docelowo posiada jedną implementację współdzieloną przez aplikację i Storybook.
- Dane scenariuszy są oddzielone od komponentów.
- Nie przedstawiamy prototypu jako funkcji gotowej produkcyjnie.
- Operacje Git, instalowanie zależności i zmiany architektoniczne wymagają jawnej zgody.

Szczegółowe reguły znajdują się w `AGENTS.md`.
