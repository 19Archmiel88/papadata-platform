---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-2C5BC8D5161E
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Dostępność

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 00.08 |
| Nazwa polska | Dostępność |
| Nazwa techniczna | dostepnosc |
| Typ dokumentu | kontrakt fundamentu |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Design System Lead |
| Moduł | M02 — Design System |

| Status implementacji | CZĘŚCIOWO ISTNIEJE — WYMAGA DOMKNIĘCIA |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Decyzja normatywna

WCAG 2.2 AA jest kryterium odbioru, a nie deklaracją marketingową.

## Stan obecny i dowód

Snapshot udostępnia podstawowe tokeny focus, ale pokrycie stories i testów jest obecnie niewystarczające. Elementy istniejące są dowodem implementacji tylko dla wskazanego snapshotu; pozostałe reguły stanowią kontrakt docelowy.

## Zasady obowiązujące

- semantyczny HTML i logiczne landmarki
- pełna obsługa klawiatury i focus restore
- zoom, reflow i orientacja bez utraty funkcji
- live regions dla dynamicznych wyników
- alternatywy tabelaryczne dla wykresów
- testy axe, keyboard i screen-reader smoke dla powierzchni krytycznych

## Zakres katalogu

- obsługa klawiatury
- komunikaty dynamiczne
- mobile reflow.

## Tokeny i właścicielstwo

- Tokeny mają prefiks `--pd-` i są jedyną publiczną warstwą wartości wizualnych.
- Komponent nie może wprowadzić lokalnej wartości, jeżeli reprezentuje ona rolę globalną.
- Zmiana tokenu wymaga testu obu motywów, viewportów i stanów interakcji.
- Nazwa tokenu opisuje rolę, nie konkretny kolor ani ekran.

## Zastosowanie i zakazy

| Stosować | Nie stosować |
| --- | --- |
| w komponentach bazowych, wzorcach, ekranach i aplikacji mobilnej | lokalnych wyjątków bez decyzji i tokenu |
| w light i dark mode z identyczną geometrią | dekoracji zastępującej hierarchię |
| z testem Storybook i regresją wizualną | zmiany tylko na podstawie pojedynczego mockupu |

## Storybook i testy

- Kanoniczna ścieżka: `00 Fundamenty/Dostępność`.
- Wymagane stories: referencja tokenów, użycie poprawne, antyprzykład, light, dark, compact, reduced motion tam gdzie dotyczy.
- Testy: kontrast, klawiatura, zoom 200%, snapshot tokenów i brak wartości spoza kontraktu.

## Kryteria akceptacji

1. Reguły są odzwierciedlone w publicznych tokenach lub jawnie oznaczone jako wymagające implementacji.
2. Żaden komponent nie omija kontraktu lokalną wartością o tej samej roli.
3. Storybook pokazuje poprawne użycie i antyprzykłady.
4. Light i dark mode przechodzą identyczną macierz funkcjonalną.
5. Dokument jest powiązany z indeksem tokenów i mapą komponentów.
