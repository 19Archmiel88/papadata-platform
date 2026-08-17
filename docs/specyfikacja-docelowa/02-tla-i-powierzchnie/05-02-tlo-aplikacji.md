---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-57FE6FF39170
status: approved-target
updated_at: 2026-08-17T00:00:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Tło aplikacji

## Rola Laboratorium i handoff
`05.02` ocenia canvas aplikacji, relacje regionów i scroll ownership. Nie jest docelową specyfikacją AppShell. Po akceptacji decyzja przechodzi do `20 — Powłoka produktu / AppShell`.

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.02 |
| Nazwa polska | Tło aplikacji |
| Nazwa techniczna | tlo-aplikacji |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Design System Lead |
| Moduł | M02 — Design System |

| Status implementacji | PROTOTYP STORYBOOK — ACCEPTED DECISION RECORD |
| Status Storybooka | accepted decision record; docelowy owner produkcyjny: 20 Product Shell / AppShell |
| Status testów | walidacje statyczne i kontraktowe: passing; dokument nie deklaruje runtime AppShell |

## Decyzja docelowa

Canvas i region treści rozdzielają nawigację od zadania. Shell nie tworzy dekoracyjnych kart, a panel Papa jest warstwą nakładaną i nie ściska głównego regionu treści.

**Aktualizacja 2026-08-17:** historyczny zapis tego decision record o obowiązkowo nieprzezroczystym topbarze bez blur/glass nie jest już wymaganiem produkcyjnym. Docelowy owner `20 — Powłoka produktu` definiuje Topbar, Sidebar i shell-owned overlays jako zawsze ciemny **Dark Crystal Shell** z kontrolowaną przezroczystością, refrakcją i backdrop blur. `05.02` pozostaje właścicielem decyzji o canvasie i scroll ownership, a nie o finalnym materiale shella.

## Stan prototypu Storybook 05.02

Prototyp pokazuje jeden reprezentatywny canvas z przełączanymi wariantami: sidebar, brak sidebara, panel Papa i compact rail. Nie mnoży czterech równorzędnych miniaturek. Panel Papa używa scrim, granicy regionu i technicznego cienia overlay; otwiera się nad canvasem i zachowuje szerokość zadania.

Sekcja właściciela scrolla używa skupionego dowodu zamiast powtarzać drugi kompletny AppShell. Pokazuje jeden przewijany region treści przy stabilnym topbarze i nawigacji pozostających poza odpowiedzialnością scrolla. Region jest dostępny w sekwencji klawiaturowej przez `tabIndex=0`, ma jednoznaczną nazwę i widoczny focus oparty na `--pd-focus-visible`. Lokalny scrollbar tego regionu używa neutralnego tracka i akcentowego thumba opartego wyłącznie na istniejących tokenach PapaData; hover i active wzmacniają akcent bez dekoracyjnego neonowego halo. Sticky topbar korzysta z aktualnego materiału Dark Crystal zdefiniowanego przez produkcyjny kontrakt AppShell. Sekcja szerokości treści rozróżnia szeroki region analityczny i kontrolowaną długość formularza. Decyzja i antyprzykład wyjaśniają, dlaczego karty wewnątrz kart i mechaniczne ściskanie przez panel są odrzucane.

Mobile i tablet pozostają wymaganiami katalogu, ale są odroczone poza bieżącym desktopowym decision record. Story nie pokazuje makiety mobile udającej zaakceptowany produkt.

## Reguły

- jeden canvas i jawne granice regionów
- wariant z sidebarem, bez sidebara, z panelem Papa i compact rail
- panel Papa jako warstwa overlay zgodna z „Głębia i warstwy”
- sticky topbar w kanonicznym materiale Dark Crystal należącym do AppShell
- jeden jawny właściciel scrolla: content region, dostępny z klawiatury i z widocznym fokusem
- lokalny firmowy scrollbar: neutralny track, akcentowy thumb, czytelne hover/active, bez zmiany globalnego scrollbara
- pełna szerokość dla analiz, ograniczona dla formularzy
- brak poziomego scrolla i brak dekoracyjnych wrapperów bez odpowiedzialności
- widoczne kontrolki demonstracyjne mają lokalne działanie; nie pozostają martwymi przyciskami
- globalne tokeny i Fundamenty pozostają bez zmian

## Anatomia powierzchni

```text
Surface
├── Background role
├── Content boundary
├── Optional status region
├── Interactive content
└── Overlay anchor
```

## Warianty wymagane przez katalog

- główne tło aplikacji
- region treści
- układ z sidebarem
- układ bez sidebara
- układ z panelem Papa
- układ compact

## Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-separator`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`, role warstw z `00-08-glebia-i-warstwy.md`.

## Responsywność

Aktywny zakres Stage 02 obejmuje desktop light/dark. Compact oznacza desktopowy rail, nie formalny projekt mobile. Wąski reflow nie może tworzyć poziomego scrolla; formalny odbiór tablet/mobile pozostaje odroczony.

## Dostępność

Landmark wynika z rzeczywistej roli i ma nazwę unikalną dla wariantu lub demonstracji, dzięki czemu kilka canvasów w jednej historii pozostaje rozróżnialnych. Przełącznik wariantu używa `aria-pressed`, nawigacja używa `aria-current`, a scroll owner jest nazwanym regionem dostępnym przez Tab i przewijanym klawiaturą. Panel Papa ma nazwę i kontrolkę zamknięcia. Warstwa zamyka się przez kontrolkę oraz scrim; produkcyjne zachowanie OverlayRoot pozostaje odpowiedzialnością docelowego komponentu.

## Storybook i odbiór

Dla utrzymania statusu accepted decision record wymagane są: typecheck, Storybook build, checki katalogu/architektury/taksonomii, Foundation verification, `git diff --check`, desktop light/dark, kontrola interakcji wariantów, panelu Papa, scroll ownera, klawiatury, focus, konsoli i braku poziomego overflow. Przejście walidacji utrzymuje status `accepted decision record`, bez deklarowania produkcyjnego runtime.

BRAK DECYZJI W DOKUMENTACJI: kontrakt 05.02 nie definiuje produkcyjnego publicznego API AppShell ani pełnego przepływu OverlayRoot. Story pozostaje lokalnym laboratorium struktury.
