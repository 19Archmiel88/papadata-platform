# Bramy akceptacyjne dla sekcji 15 i 18

## Wspólne

1. Light i dark wyglądają jak ten sam system.
2. Brak lokalnych kopii tokenów lub bazowych komponentów.
3. Każde story ma jawnego ownera.
4. Każdy element ma jedno source of truth.
5. Brak poziomego scrolla jako głównego mechanizmu layoutu.
6. Brak martwego CSS i historycznych klas po poprzednich eksperymentach.
7. Publiczne Props są definiowane przy runtime komponencie, nie w równoległym ręcznym API.
8. Storybook nie wprowadza nowej semantyki kolorów/efektów bez Foundation.
9. Stany są reprezentowane przez fixture, a nie przez przypadkowe lokalne mocki.
10. Dokumentacja i storybook-contract/rejestry są aktualizowane w tym samym zakresie.

## Sekcja 15

1. ChartFrame i MetricCard są realnymi reużywalnymi komponentami, nie tylko makietami story.
2. Rodziny wykresów korzystają z jednego wspólnego modelu osi, tooltipu, legendy i stanów danych tam, gdzie ma to sens.
3. 15.09 nie duplikuje Select/DateRange/FilterBar.
4. 15.08 nie przejmuje odpowiedzialności całego page-level readiness.
5. Reprezentatywne dane obejmują małe, duże, brakujące i częściowe zbiory.
6. Mobile/reflow jest rozwiązany reorganizacją, redukcją informacji lub alternatywną reprezentacją, nie poziomym scrollbarem całej sekcji.

## Sekcja 18

1. Każda story składa istniejące komponenty; utworzenie nowego prymitywu wymaga jawnego uzasadnienia.
2. 18.04 używa kanonicznego DataTable.
3. 18.05 i 18.06 pozostają rozdzielone semantycznie.
4. 18.07 nie redefiniuje EvidencePanel/RecommendationCard.
5. 18.10 jest macierzą referencyjną i blokuje lokalne duplikowanie stanów.
6. Wzorce są domain-neutral - nie są ekranami Command Center, Integrations, Billing ani AI.

## Dostępność

Podstawowy gate dostępności obejmuje tylko:
- Contrast;
- Keyboard;
- Focus;
- Forms;
- Semantics;
- ARIA;
- Alt text;
- Error states.

## Warunek wejścia do sekcji 20

Sekcja `20 - Powłoka produktu i nawigacja` może ruszyć dopiero, gdy:
- 15.01 ChartFrame i 15.02 MetricCard mają ustalony kontrakt;
- 18.01 page layout ma ustalone granice;
- 18.02/18.03 mają ustalone stany page-level;
- 18.07 ma ustalony model detail/evidence layer;
- Source of Truth & Ownership Alignment jest zweryfikowany w repo.
