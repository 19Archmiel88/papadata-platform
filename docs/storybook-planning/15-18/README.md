# PapaData Storybook - kolejne dwie sekcje

## Status paczki

To jest paczka zakresowa / projektowa. Nie zawiera mutacji kodu produkcyjnego ani Storybooka.

Paczka została przygotowana na podstawie snapshotu projektu `papadata-platform-audit-20260807-071042` oraz audytu Fundamentow, Laboratorium i Komponentow Bazowych.

## Kolejnosc

Po sekcjach:

1. `00 - Fundamenty`
2. `05 - Tla i powierzchnie / Laboratorium`
3. `10 - Komponenty`

kolejne dwie sekcje Storybooka powinny byc realizowane w tej kolejnosci:

1. `15 - Wykresy i wizualizacje danych` (`Wykresy i dane`)
2. `18 - Wzorce i stany przekrojowe` (`Wzorce interfejsu`)

Dopiero po nich powinien wejsc `20 - Powloka produktu i nawigacja`.

## Zasada architektoniczna

- Fundamenty definiuja zasady i tokeny.
- Komponenty Bazowe sa wlascicielami prymitywow i publicznego API.
- Sekcja 15 jest wlascicielem komponentow analitycznych i wizualizacji danych.
- Sekcja 18 jest wlascicielem kompozycji/wzorcow przekrojowych zbudowanych z istniejacych komponentow.
- Laboratorium nie jest trwalym source of truth. Zaakceptowane decyzje z 05.03 sa promowane do 15 lub 18.
- Sekcja 20 sklada z zaakceptowanych komponentow i wzorcow AppShell, ale nie powinna ich redefiniowac.

## Warunek rozpoczecia implementacji

Najpierw nalezy zastosowac i zweryfikowac paczke `Source of Truth & Ownership Alignment`. Nowych sekcji nie nalezy implementowac na starym modelu ownership.

## Pliki paczki

- `15-WYKRESY-I-DANE.md` - dokladny zakres 15.01-15.10.
- `18-WZORCE-INTERFEJSU.md` - dokladny zakres 18.01-18.10.
- `OWNERSHIP-AND-HANDOFF.md` - granice odpowiedzialnosci i promocja decyzji z Laboratorium.
- `ACCEPTANCE-GATES.md` - kryteria techniczne i wizualne przed uznaniem sekcji za accepted.
