# Source of Truth & Ownership — Storybook / Design System

Status: obowiązujący kontrakt architektoniczny.

## Zasada nadrzędna

Każda decyzja ma jednego właściciela. Storybook może demonstrować tę samą decyzję w wielu kontekstach, ale nie może definiować jej ponownie.

## Hierarchia źródeł prawdy

1. **Fundamenty (`00`)** — tokeny, role semantyczne i reguły systemowe. Nie utrzymują katalogów komponentów ani słowników domenowych.
2. **Komponenty bazowe (`10`)** — publiczne React API, zachowanie, warianty, stany i jedyny katalog danego komponentu. Runtime Props są własnością implementacji w `apps/web/src/design-system`.
3. **Patterns / powłoka / wizualizacje** — kompozycje wielu komponentów: AuthShell, AppShell, ChartFrame, DataTable i podobne wzorce.
4. **Laboratorium decyzji (`05`)** — tymczasowe miejsce porównania wariantów. Po akceptacji decyzja jest promowana do docelowego ownera. Laboratorium zostaje decision recordem, nie drugim source of truth.
5. **Domena produktu** — konkretne status keys, provider branding, capabilities i słowniki biznesowe.

## Kontrakty TypeScript

`contracts/components/*.ts` są kontraktami orkiestracyjnymi/specyfikacyjnymi dla ekranów, fixture'ów, zdarzeń i planowanej integracji. Nie kopiują i nie zastępują publicznego React API działającego komponentu.

Dla komponentu zaimplementowanego runtime source of truth jest współlokowany z implementacją. Rejestr znajduje się w `rejestry/runtime-component-api.csv`.

## Granice ownership

| Zakres | Właściciel docelowy | Granica |
|---|---|---|
| status tones | `00.03/00.04` | Fundament definiuje ton i anatomię; domena konkretne klucze |
| separatory i linie | `00.07` | `05.04` jest decision recordem / handoffem |
| reguły ikon | `00.09` | geometria, currentColor, znaczenie |
| pełny katalog ikon | `10.11 / Icon` | jedyny katalog nazw i wariantów |
| marka | `10.01 / PapaDataBrand` | bez publicznego dekoracyjnego glow |
| Auth canvas | `05.01` do decyzji | po decyzji handoff do `25 — Access/Auth patterns` |
| App canvas / shell composition | `05.02` do decyzji | po decyzji handoff do `20 — Product Shell / AppShell` |
| KPI / wykres / tabela / data layers | `05.03` do decyzji | handoff do `10 / 15 / 18` zgodnie z typem wzorca |
| efekty / głębia | `00.08` po decyzji | `05.05` porównuje warianty, nie tworzy drugiego standardu |
| command button | `Button` | `<button>`, submit/command |
| lightweight command | `TextAction` | `<button>`, komenda kontekstowa |
| navigation | `LinkAction` | `<a href>`, jedyny właściciel nawigacji tekstowej |
| icon command | `IconButton` | `<button>`, jawna etykieta |

## Reguła promocji z Laboratorium

1. Warianty są porównywane w `05`.
2. Podejmowana jest decyzja i wskazywany `target owner`.
3. Reguła, komponent albo pattern jest aktualizowany u target ownera.
4. Dokumentacja target ownera staje się kanoniczna.
5. Lab pozostaje opisem decyzji albo trafia do archiwum; nie może być używane jako alternatywna specyfikacja.

## Wspólna prezentacja Storybooka

Wspólny chrome stron ma jeden source of truth:

- `apps/web/src/storybook-next/presentation/StoryPresentation.tsx`
- `apps/web/src/storybook-next/presentation/story-presentation.css`

Lokalne story mogą dodawać CSS demonstracji, ale nie redefiniują `.pd-f0-page`, `.pd-f0-section` ani produkcyjnych selektorów `Button`, `IconButton`, `TextAction` i `LinkAction`.

## Reguła dla nowych prac

Przed dodaniem reguły lub wariantu trzeba wskazać jego ownera. Jeżeli po zmianie istnieją dwa miejsca, które mogą być interpretowane jako kanoniczne dla tej samej decyzji, zmiana nie jest gotowa do przyjęcia.
