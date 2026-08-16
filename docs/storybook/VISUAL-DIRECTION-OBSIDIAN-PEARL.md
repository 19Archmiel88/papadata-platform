# PapaData Prism Refractive — kierunek wizualny Storybooka

Data: 14.08.2026

## Decyzja

Kierunek `Obsidian Pearl` został odrzucony wizualnie. Dla sekcji Storybooka `00`, `05`, `15`, `18`, `20` i `25` przyjęty zostaje kierunek `Prism Refractive`: nowoczesny dark premium oraz bardzo czytelny light mode analityczny.

## Zakres obowiązywania

Ten kierunek dotyczy kompleksowo następujących sekcji Storybooka:

- `00 Fundamenty`,
- `05 Laboratorium decyzji`,
- `15 Wykresy i dane`,
- `18 Wzorce interfejsu`,
- `20 Powłoka produktu`,
- `25 Dostęp i onboarding`.

Sekcje te są traktowane jako jedna powierzchnia przeglądu języka wizualnego, a nie jako osobne eksperymenty kolorystyczne.

## Zasady wizualne

- Dark mode: głęboki charcoal/obsidian, szkło refrakcyjne, subtelne refleksy i mocna czytelność.
- Light mode: czysta analityczna przestrzeń, bardzo jasne powierzchnie, miękkie cienie i wysoki kontrast tekstu.
- Akcent: indigo/violet premium używany kontrolowanie w CTA, wykresach, aktywnych stanach i ikonach.
- Statusy: success, warning, danger i neutral pozostają semantyczne, ale mają pracować w tym samym refractive systemie.
- Powierzchnie: karty i panele mają mieć głębię przez blur, cień, wewnętrzny highlight i subtelny diagonalny refleks.
- Storybook: sekcje 00/05/15/18/20/25 mają wyglądać jak spójny system prezentacyjny, a nie zbiór niezależnych dokumentów.

## Decyzje implementacyjne

1. Scoping odbywa się przez `data-pd-prism-section="true"` i `data-pd-story-section` na `StoryPresentationPage`.
2. Zmiany są ograniczone do wskazanych sekcji Storybooka i ich wspólnej warstwy prezentacyjnej.
3. Runtime aplikacji nie jest w tej paczce przebudowywany kompleksowo poza tym, co jest widoczne we wskazanych stories.
4. Lokalne kolory poza foundations są zapisywane bez lokalnych HEX-ów, zgodnie z guardem CSS.
5. Stary opis Obsidian Pearl zostaje zastąpiony tą decyzją, aby dokumentacja nie promowała odrzuconego kierunku.

## Dalszy odbiór

Po wdrożeniu trzeba sprawdzić w Storybooku przede wszystkim:

- przełączanie light/dark dla sekcji 00, 05, 15, 18, 20 i 25,
- czy sekcja 20 zachowuje premium shell bez zlewania topbara i sidebara,
- czy sekcja 25 zachowuje czytelność Auth i onboarding,
- czy sekcja 15 ma wykresy zbliżone do referencji Prism Refractive,
- czy sekcje 00/05 nie wyglądają jak dokumentacja techniczna, tylko jak część systemu design review.

## Korekta po przeglądzie — hard reset zamiast nakładki

Po pierwszym wdrożeniu Prism Refractive potwierdzono, że część starych wariantów komponentów nadal przeciekała do wskazanych sekcji. Dotyczyło to szczególnie przycisków, inputów, stanów formularzy Auth, próbek light/dark i lokalnych powierzchni w Storybooku.

Decyzja wdrożeniowa:

- nie nakładamy Prism jako kolejnej warstwy na stare style,
- dla sekcji `00`, `05`, `15`, `18`, `20`, `25` obowiązuje najpierw wizualny reset komponentów i powierzchni,
- dopiero po resecie stosowany jest kierunek Prism Refractive,
- legacy button treatment, stare złote/oliwkowe CTA oraz poprzednie enterprise-BI link-action styling nie są docelowe w tych sekcjach,
- komponenty zachowują semantykę i dostępność, ale ich prezentacja w Storybook review ma być spójna z referencją Prism.

Kryterium odbioru: w sekcjach 00/05/15/18/20/25 użytkownik nie powinien widzieć mieszanki poprzednich kierunków wizualnych. Buttony, inputy, badge, panele i karty mają wyglądać jak jeden system, a nie jak historia kolejnych eksperymentów stylistycznych.
