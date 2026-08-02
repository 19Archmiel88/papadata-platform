---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-46246C6C10C0
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Kolory

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 00.03 |
| Nazwa polska | Kolory |
| Nazwa techniczna | kolory |
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

Kolor jest rolą semantyczną, nie lokalną wartością komponentu. Akcent marki nie komunikuje warning ani danger.

## Stan obecny i dowód

Snapshot zawiera centralne `tokens/colors.ts` i `themes/carbon-pearl.css`. Elementy istniejące są dowodem implementacji tylko dla wskazanego snapshotu; pozostałe reguły stanowią kontrakt docelowy.

## Zasady obowiązujące

- canvas i surface 1–3
- text primary, secondary, muted i disabled
- border subtle, default i strong
- status info, success, warning, danger i neutral z wariantami on/subtle/border
- osobna paleta danych z kontrolą rozróżnialności
- focus ring widoczny w obu motywach

## Zakres katalogu

- kolory marki
- kolory neutralne
- kolory semantyczne
- kolory danych
- kolory statusów
- kolory ostrzeżeń
- kolory błędów
- kolory sukcesu
- kontrast light/dark.

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

- Kanoniczna ścieżka: `00 Fundamenty/Kolory`.
- Wymagane stories: referencja tokenów, użycie poprawne, antyprzykład, light, dark, compact, reduced motion tam gdzie dotyczy.
- Testy: kontrast, klawiatura, zoom 200%, snapshot tokenów i brak wartości spoza kontraktu.

## Kryteria akceptacji

1. Reguły są odzwierciedlone w publicznych tokenach lub jawnie oznaczone jako wymagające implementacji.
2. Żaden komponent nie omija kontraktu lokalną wartością o tej samej roli.
3. Storybook pokazuje poprawne użycie i antyprzykłady.
4. Light i dark mode przechodzą identyczną macierz funkcjonalną.
5. Dokument jest powiązany z indeksem tokenów i mapą komponentów.
