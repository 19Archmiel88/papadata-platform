# PapaData Platform — macierz zgodności implementacji

## Status dokumentu

- Typ: dokument realizacyjny.
- Cel: porównanie aktualnego repozytorium z obowiązującą dokumentacją.
- Dokument nie zmienia decyzji architektonicznych.
- Dokument nie jest dowodem gotowości produkcyjnej.
- Gałąź robocza: chore/zgodnosc-z-architektura.
- Punkt bazowy main: 01fc199.

## Źródła

1. PapaData — Rejestr decyzji i wymagań biznesowych, dokument 2, wersja 2.0.
2. 01_Architektura_produktu_i_plan_techniczny, wersja 2.0.
3. 04_Architektura_frontendowa_i_Storybook.
4. 02_System_wspólny_Storybooka, wersja 2.0.
5. STACK-DECISIONS.md.
6. 00-INSTRUKCJA-STARTU.md.

## Podsumowanie

- SPRZECZNE: 3
- BRAK: 22
- DECYZJA: 0
- CZĘŚCIOWE: 1
- ZGODNE: 15

## Macierz

Obszar | Wymaganie | Stan aktualny | Status | Działanie
--- | --- | --- | --- | ---
Frontend | Kod aplikacyjny poza .storybook; Storybook renderuje te same komponenty co aplikacja | Pliki implementacyjne w .storybook: 7; pliki w src: 0 | SPRZECZNE | Po przeniesieniu projektu do apps/web przenieść komponenty, CSS, fixtures i ekrany do src bez zmiany UI.
Środowisko | Node.js 24 LTS przypięty w repozytorium | .node-version=22.22.2, .nvmrc=22.22.2, engines.node=22.22.2 | SPRZECZNE | Po potwierdzeniu kompatybilności przejść na Node.js 24 LTS i ponownie wykonać pełne testy.
Walidacja | Jedna zatwierdzona biblioteka walidacji: Zod | Zod=nie, Valibot=tak | SPRZECZNE | W apps/web zastosować Zod. Valibot usunąć dopiero po potwierdzeniu braku użycia albo opisać odstępstwo w ADR.
Frontend | React Router | Brak: react-router | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | TanStack Query | Brak: @tanstack/react-query | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | Zod | Brak: zod | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | React Hook Form | Brak: react-hook-form | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | Zustand | Brak: zustand | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | ECharts | Brak: echarts | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | i18next | Brak: i18next | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | react-i18next | Brak: react-i18next | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | date-fns | Brak: date-fns | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | MSW | Brak: msw | BRAK | Dodać do apps/web po utworzeniu monorepo.
Frontend | React Testing Library | Brak: @testing-library/react | BRAK | Dodać do apps/web po utworzeniu monorepo.
Repozytorium | Modularne monorepo pnpm z Turborepo | Brak: pnpm-workspace.yaml, turbo.json | BRAK | Utworzyć root monorepo przed instalowaniem brakujących pakietów aplikacyjnych.
Repozytorium | Osobne aplikacje web, BFF, API i worker | Brak: apps/web, apps/bff, apps/api, apps/worker | BRAK | Najpierw przenieść obecny frontend do apps/web bez zmiany wyglądu i zachowania.
Repozytorium | Współdzielone pakiety monorepo | Brak: packages/contracts, packages/ui, packages/config, packages/testing | BRAK | Przed utworzeniem packages/ui rozstrzygnąć relację z apps/web/src/shared/ui.
Tooling root | Turborepo | Brak | BRAK | Dodać dopiero w root monorepo.
Tooling root | Prettier | Brak | BRAK | Dodać dopiero w root monorepo.
Tooling root | markdownlint | Brak | BRAK | Dodać dopiero w root monorepo.
Tooling root | Knip | Brak | BRAK | Dodać dopiero w root monorepo.
Tooling root | dependency-cruiser | Brak | BRAK | Dodać dopiero w root monorepo.
Tooling root | Husky | Brak | BRAK | Dodać dopiero w root monorepo.
Tooling root | lint-staged | Brak | BRAK | Dodać dopiero w root monorepo.
Tooling root | commitlint | Brak | BRAK | Dodać dopiero w root monorepo.
Storybook | Polskie nazwy, light/dark, pełne stany i flow produkcyjne | Obecny Storybook posiada polskie nazwy, motywy oraz 58 przechodzących testów; kompletność wszystkich stanów wymaga audytu modułowego. | CZĘŚCIOWE | Zachować istniejący wygląd. Uzupełniać stany wyłącznie według dokumentów M01-M15 i kontraktów domenowych.
Frontend | React | Obecne: react | ZGODNE | Zachować przy migracji do apps/web.
Frontend | React DOM | Obecne: react-dom | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Vite | Obecne: vite | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Tailwind CSS | Obecne: tailwindcss | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Radix UI | Obecne: @radix-ui/* | ZGODNE | Zachować przy migracji do apps/web.
Frontend | class-variance-authority | Obecne: class-variance-authority | ZGODNE | Zachować przy migracji do apps/web.
Frontend | clsx | Obecne: clsx | ZGODNE | Zachować przy migracji do apps/web.
Frontend | tailwind-merge | Obecne: tailwind-merge | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Lucide React | Obecne: lucide-react | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Motion | Obecne: motion | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Vitest | Obecne: vitest | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Playwright | Obecne: playwright | ZGODNE | Zachować przy migracji do apps/web.
Frontend | Storybook | Obecne: storybook | ZGODNE | Zachować przy migracji do apps/web.
Stan bazowy | Czysty punkt odniesienia przed migracją | Commit 01fc199 znajduje się na origin/main. | ZGODNE | Nie przepisywać historii main. Wszystkie zmiany wykonywać na osobnej gałęzi.
Środowisko | pnpm przypięty przez packageManager | pnpm@10.29.3 | ZGODNE | Zachować jedną wersję pnpm dla całego monorepo.

## Kolejność realizacji

1. Zachować commit 01fc199 jako niezmienny punkt bazowy.
2. Potwierdzić przejście projektu na Node.js 24 LTS.
3. Utworzyć root modularnego monorepo z pnpm workspace i Turborepo.
4. Przenieść obecny projekt do apps/web bez zmiany UI, copy, CSS, stories i testów.
5. Ponownie uruchomić lint, typecheck, 58 testów, build aplikacji i build Storybooka.
6. Rozstrzygnąć granicę packages/ui kontra apps/web/src/shared/ui.
7. Dodać brakujący tooling wyłącznie do root monorepo.
8. Dodać brakujące pakiety frontendowe wyłącznie do apps/web.
9. Zastąpić Valibot biblioteką Zod albo opisać odstępstwo w ADR.
10. Przenieść kod aplikacyjny z .storybook do produkcyjnej struktury src.
11. Pozostawić w .storybook wyłącznie konfigurację.
12. Uzupełniać stany i flow na podstawie dokumentów modułowych M01-M15.
13. Dopiero później utworzyć apps/bff, apps/api i apps/worker zgodnie z kolejnością wdrożenia.

## Bramy migracji frontendu

Migracja obecnego frontendu jest zakończona dopiero wtedy, gdy:

- wygląd Storybooka pozostaje bez zmian;
- polskie nazwy stories pozostają bez zmian;
- motyw jasny i ciemny działa;
- wszystkie 58 aktualnych testów przechodzi;
- lint przechodzi;
- TypeScript strict przechodzi;
- build Vite przechodzi;
- build Storybooka przechodzi;
- .storybook nie zawiera kodu aplikacyjnego;
- Storybook i aplikacja używają tych samych komponentów;
- fixtures są oddzielone od komponentów;
- brak zmian nieobjętych dokumentacją lub zaakceptowanym ADR.
