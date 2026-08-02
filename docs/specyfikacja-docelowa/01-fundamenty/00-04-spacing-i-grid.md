---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-FB3D51C0C071
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Spacing i grid

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 00.04 |
| Nazwa polska | Spacing i grid |
| Nazwa techniczna | spacing-i-grid |
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

Skala odstępów jest oparta na 4 px; układ reaguje na zachowanie i dostępną szerokość, a nie nazwę urządzenia.

## Stan obecny i dowód

Snapshot zawiera `tokens/spacing.ts` oraz jawne density modes. Elementy istniejące są dowodem implementacji tylko dla wskazanego snapshotu; pozostałe reguły stanowią kontrakt docelowy.

## Zasady obowiązujące

- compact <768 px, medium 768–1199 px, wide ≥1200 px, extra-wide ≥1600 px
- gutter 16–24 px compact, 24–32 px medium, 32–48 px wide
- minimalny target interaktywny zgodny z WCAG 2.2 AA
- tabele poniżej użytecznego minimum przechodzą w scroll lub widok uproszczony
- zoom 200% nie powoduje utraty funkcji

## Zakres katalogu

- rytm odstępów
- marginesy ekranów
- odstępy między kartami
- odstępy w tabelach
- układ desktop
- układ tablet
- układ mobile
- compact density
- comfortable density
- jawne viewporty Storybooka: desktop wide, desktop standard, tablet, mobile.

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

- Kanoniczna ścieżka: `00 Fundamenty/Spacing i grid`.
- Wymagane stories: referencja tokenów, użycie poprawne, antyprzykład, light, dark, compact, reduced motion tam gdzie dotyczy.
- Testy: kontrast, klawiatura, zoom 200%, snapshot tokenów i brak wartości spoza kontraktu.

## Kryteria akceptacji

1. Reguły są odzwierciedlone w publicznych tokenach lub jawnie oznaczone jako wymagające implementacji.
2. Żaden komponent nie omija kontraktu lokalną wartością o tej samej roli.
3. Storybook pokazuje poprawne użycie i antyprzykłady.
4. Light i dark mode przechodzą identyczną macierz funkcjonalną.
5. Dokument jest powiązany z indeksem tokenów i mapą komponentów.
