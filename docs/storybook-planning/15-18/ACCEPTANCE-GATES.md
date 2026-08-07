# Bramy akceptacyjne dla sekcji 15 i 18

## Wspolne

1. Light i dark wygladaja jak ten sam system.
2. Brak lokalnych kopii tokenow lub bazowych komponentow.
3. Kazde story ma jawnego ownera.
4. Kazdy element ma jedno source of truth.
5. Brak poziomego scrolla jako glownego mechanizmu layoutu.
6. Brak martwego CSS i historycznych klas po poprzednich eksperymentach.
7. Publiczne Props sa definiowane przy runtime komponencie, nie w rownoleglym recznym API.
8. Storybook nie wprowadza nowej semantyki kolorow/efektow bez Foundation.
9. Stany sa reprezentowane przez fixture, a nie przez przypadkowe lokalne mocki.
10. Dokumentacja i storybook-contract/rejestry sa aktualizowane w tym samym zakresie.

## Sekcja 15

1. ChartFrame i MetricCard sa realnymi reuzywalnymi komponentami, nie tylko makietami story.
2. Rodziny wykresow korzystaja z jednego wspolnego modelu osi, tooltipu, legendy i stanow danych tam, gdzie ma to sens.
3. 15.09 nie duplikuje Select/DateRange/FilterBar.
4. 15.08 nie przejmuje odpowiedzialnosci calego page-level readiness.
5. Reprezentatywne dane obejmuja male, duze, brakujace i czesciowe zbiory.
6. Mobile/reflow jest rozwiazany reorganizacja, redukcja informacji lub alternatywna reprezentacja, nie poziomym scrollbarem calej sekcji.

## Sekcja 18

1. Kazda story sklada istniejace komponenty; utworzenie nowego prymitywu wymaga jawnego uzasadnienia.
2. 18.04 uzywa kanonicznego DataTable.
3. 18.05 i 18.06 pozostaja rozdzielone semantycznie.
4. 18.07 nie redefiniuje EvidencePanel/RecommendationCard.
5. 18.10 jest macierza referencyjna i blokuje lokalne duplikowanie stanow.
6. Wzorce sa domain-neutral - nie sa ekranami Command Center, Integrations, Billing ani AI.

## Dostepnosc

Formalne WCAG AA nie jest traktowane jako biznesowa brama release dla tego projektu.

Nadal wymagane sa podstawowe cechy poprawnego komponentu:
- prawidlowa semantyka elementu;
- brak martwych/inert controls;
- sensowna obsluga klawiatury dla elementow interaktywnych;
- jawne label/accessible name tam, gdzie komponent bez niego jest technicznie niepoprawny;
- reduced motion tam, gdzie animacja moglaby utrudniac korzystanie.

Nie blokujemy akceptacji sekcji z powodu formalnego dostrajania wszystkich kontrastow do WCAG AA, o ile nie powoduje to realnej nieczytelnosci produktu.

## Warunek wejscia do sekcji 20

Sekcja `20 - Powloka produktu i nawigacja` moze ruszyc dopiero, gdy:
- 15.01 ChartFrame i 15.02 MetricCard maja ustalony kontrakt;
- 18.01 page layout ma ustalone granice;
- 18.02/18.03 maja ustalone stany page-level;
- 18.07 ma ustalony model detail/evidence layer;
- Source of Truth & Ownership Alignment jest zweryfikowany w repo.
