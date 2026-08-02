---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-20F2ACAAF1C0
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Motion

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 00.07 |
| Nazwa polska | Motion |
| Nazwa techniczna | motion |
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

Standardowe przejście trwa 120–160 ms i nie zmienia układu. Ruch może zostać wyłączony bez utraty informacji.

## Stan obecny i dowód

Snapshot zawiera `tokens/motion.ts` oraz test demonstracyjny ruchu. Elementy istniejące są dowodem implementacji tylko dla wskazanego snapshotu; pozostałe reguły stanowią kontrakt docelowy.

## Zasady obowiązujące

- ease-out dla wejścia warstwy, linear dla krótkiej zmiany stanu
- bez bounce, spring i dużego scale
- skeleton zachowuje finalną geometrię
- wykres nie animuje całego datasetu od zera po każdej zmianie
- prefers-reduced-motion upraszcza wszystkie przejścia

## Zakres katalogu

- przejścia paneli
- hover
- focus
- loading
- skeleton
- drawer
- modal
- reduced motion
- play test: hover, focus-visible, disabled, drawer, Escape, focus restore, reduced motion.

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

- Kanoniczna ścieżka: `00 Fundamenty/Motion`.
- Wymagane stories: referencja tokenów, użycie poprawne, antyprzykład, light, dark, compact, reduced motion tam gdzie dotyczy.
- Testy: kontrast, klawiatura, zoom 200%, snapshot tokenów i brak wartości spoza kontraktu.

## Kryteria akceptacji

1. Reguły są odzwierciedlone w publicznych tokenach lub jawnie oznaczone jako wymagające implementacji.
2. Żaden komponent nie omija kontraktu lokalną wartością o tej samej roli.
3. Storybook pokazuje poprawne użycie i antyprzykłady.
4. Light i dark mode przechodzą identyczną macierz funkcjonalną.
5. Dokument jest powiązany z indeksem tokenów i mapą komponentów.
