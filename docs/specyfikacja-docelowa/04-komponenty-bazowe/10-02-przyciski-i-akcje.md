---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-312E5D402457
status: approved-target
updated_at: 2026-08-06T20:27:00+01:00
---

# Przyciski i akcje

## Source of truth i semantyka akcji
Publiczne React API jest własnością runtime w `apps/web/src/design-system/components/Button`. Aktywnym ownerem Storybooka jest `00.14 — Przyciski i akcje`. Podział odpowiedzialności jest jednoznaczny: `Button` = command/submit, `TextAction` = lekka komenda, `LinkAction` = nawigacja przez `<a href>`, `IconButton` = komenda ikonowa. `Button` nie ma wariantu `link`.

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.02 |
| Nazwa polska | Przyciski i akcje |
| Nazwa techniczna | przyciski-i-akcje |
| Typ dokumentu | kontrakt rodziny komponentów |
| Wersja | 1.1 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |
| Status implementacji | IMPLEMENTED |
| Status Storybooka | `00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje` → `Przyciski` |
| Plik Storybooka | `apps/web/src/design-system/components/Button/Button.stories.tsx` |
| Status testów | PASSING — play test + statyczny kontrakt prezentacji |

## Cel i decyzja docelowa

Runtime rodziny akcji jest jedynym źródłem produkcyjnych akcji PapaData, a `00.14` jest jedyną aktywną prezentacją Storybooka. Laboratorium decyzji, ekrany i kolejne stories używają tych komponentów bez lokalnego zmieniania ich koloru, geometrii, typografii, focusu ani znacznika aktywności.

Story `00.14` nie ma własnego canvasu, drabiny typograficznej ani układu strony. Dziedziczy wspólną prezentację z jednego źródła prawdy:

- `apps/web/src/storybook-next/presentation/StoryPresentation.tsx`;
- `apps/web/src/storybook-next/presentation/story-presentation.css`;
- klasy `pd-f0-page`, `pd-f0-page__*`, `pd-f0-section` i `pd-f0-section__*`.

Lokalny `action-showcase.css` odpowiada wyłącznie za rozmieszczenie przykładów przycisków.

## Zakres komponentów

- `Button`;
- `IconButton`;
- `TextAction`;
- `LinkAction`;
- `ButtonGroup`.

## Warianty i stany wymagane

| Lp. | Wymaganie | Dowód |
| --- | --- | --- |
| 1 | primary | story + play test |
| 2 | secondary | story + play test |
| 3 | ghost | story + play test |
| 4 | danger | story + play test |
| 5 | `TextAction` — lekka komenda | story + play test |
| 6 | `LinkAction` — nawigacja `<a href>` | story + play test |
| 7 | `IconButton` — komenda ikonowa | story + play test |
| 8 | loading i `aria-busy` | story + play test |
| 9 | disabled | story + play test |
| 10 | button group poziomy i pionowy | story + play test |
| 11 | small, medium i large | story + kontrola geometrii |
| 12 | akcja full-width | regresja szerokości kreski |

Potwierdzenie operacji destrukcyjnej jest odpowiedzialnością `Dialog` lub `AlertDialog`, a nie wariantem komponentu `Button`.

## Kontrakt kreski aktywności

Kreska hover/focus należy do klikanej akcji:

1. Dla `Button` ma szerokość zawartości akcji: ikona początkowa, etykieta i ikona końcowa.
2. Nie przejmuje szerokości komórki grida, kolumny, wiersza ani `fullWidth` rodzica.
3. Dla `TextAction` i `LinkAction` obejmuje całą akcję wraz z ikoną, a nie tylko tekst etykiety.
4. Dla `IconButton` pozostaje wewnątrz kontrolki ikonowej.
5. Loading i disabled ukrywają kreskę bez zmiany geometrii.
6. Lokalny CSS Storybooka i Laboratorium nie może nadpisywać selektorów `pd-button`, `pd-icon-button` ani `pd-inline-action`.

W implementacji właściciel kreski jest oznaczony `data-slot="activity-line-owner"`, a sama kreska `data-slot="activity-line"`. Umożliwia to test szerokości w rzeczywistym runtime Storybooka.

## Anatomia

```text
Button
└── activity-line-owner (fit-content)
    ├── opcjonalny spinner lub ikona początkowa
    ├── label
    ├── opcjonalna ikona końcowa
    └── activity-line
```

## Fundamenty

Rodzina korzysta wyłącznie z tokenów `--pd-*` dla:

- canvasu i powierzchni;
- tekstu i hierarchii typograficznej;
- koloru marki, interakcji i statusu danger;
- spacingu, promieni, separatorów i focus-visible;
- motion i reduced motion.

Nie wolno definiować lokalnego odpowiednika zaakceptowanego tokenu ani lokalnego wyglądu komponentu w Storybooku lub Laboratorium.

## Interakcje i dostępność

- natywny `button` ma domyślnie `type="button"`;
- Enter i Space uruchamiają kontrolkę;
- focus-visible jest zawsze widoczny;
- kontrolka ikonowa ma nazwę akcji;
- `loading` ustawia `aria-busy="true"` i blokuje kliknięcie;
- disabled nie jest dostępny jako aktywna akcja;
- znaczenie wariantu nie zależy wyłącznie od koloru;
- reduced motion nie usuwa rezultatu interakcji.

## Responsywność

Komponent zachowuje swoją geometrię. To kontener decyduje o zawijaniu grupy lub użyciu `fullWidth`. Przy 200% zoomu i wąskim reflow:

- etykieta może się bezpiecznie zawinąć;
- ikony nie tracą proporcji;
- kreska nadal odpowiada szerokości zawartości;
- akcja nie powoduje poziomego scrolla strony.

## Storybook i testy

Wymagane i wdrożone kontrole:

1. Story używa dokładnie tego samego shellu co Fundamenty i Laboratorium.
2. `action-showcase.css` nie redefiniuje tła, typografii strony ani produkcyjnych selektorów komponentów.
3. Play test sprawdza warianty, loading, disabled, dostępne nazwy, grupy poziome i pionowe oraz brak zmiany geometrii.
4. Play test porównuje szerokość `activity-line` z właścicielem treści dla zwykłego przycisku, linku, ikony i akcji full-width.
5. `check-storybook-presentation-contract.mjs` blokuje ponowne wprowadzenie lokalnych odchyleń.
6. `check-component-system-v1.mjs`, katalog, architektura, taksonomia, typecheck i build Storybooka pozostają bramkami odbioru.

## Kryteria akceptacji

- tło, typografia i geometria strony są identyczne z zaakceptowanymi Fundamentami;
- wygląd przycisków poza korektą kreski nie został zmieniony;
- Laboratorium korzysta z produkcyjnych komponentów akcji bez lokalnych override’ów;
- wszystkie testy statyczne i runtime przechodzą;
- light/dark, PL/EN, desktop, reflow, zoom 200% i reduced motion nie tworzą odchyłów;
- użytkownik zaakceptował końcowy wygląd story.
