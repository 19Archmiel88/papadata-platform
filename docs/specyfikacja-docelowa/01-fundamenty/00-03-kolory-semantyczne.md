---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
---

# Kolory semantyczne

| Pole | Wartość |
|---|---|
| Identyfikator | 00.03 |
| Status dokumentacji | ZAAKCEPTOWANA |
| Status implementacji | ZAAKCEPTOWANE — KANONICZNA IMPLEMENTACJA REFERENCYJNA |
| Story class | reference |
| Właściciel | Design System |
| Story export | `KolorySemantyczne` |
| Story file | `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx` |
| Production status | `not_started` |
| Test status | `not_started` |

Kanoniczna ścieżka: `00 Fundamenty/Podstawy/Kolory semantyczne`

## Cel

Kolory są przypisane do ról interfejsu, danych i komunikacji. Znaczenie nie może wynikać wyłącznie z wartości barwy.

Akceptacja dotyczy referencyjnej story Fundamentów i jej kierunku
wizualnego. Nie oznacza automatycznie ukończenia wszystkich komponentów
produkcyjnych ani testów przekrojowych.

## Kontrakt zaakceptowany

- kolory marki i role interfejsu
- neutralne powierzchnie i tekst
- kolory danych i serie wykresów
- ton neutralny, informacyjny, sukcesu, ostrzeżenia i błędu
- kontrast w trybie jasnym i ciemnym

## Reguły obowiązujące kolejne sekcje

- Komponent używa tokenu semantycznego, nie surowej wartości koloru.
- Status musi mieć etykietę tekstową lub równoważną semantykę.
- Nowe role kolorystyczne dodaje się w foundations, nie lokalnie.

## Źródła kanoniczne

- kontrakt: `apps/web/src/storybook-next/storybook-contract.json`
- mapa taksonomii: `apps/web/src/storybook-next/storybook-taxonomy-map.json`
- story: `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx`
- theme: `apps/web/src/design-system/foundations/themes/carbon-pearl.css`
- foundations entrypoint: `apps/web/src/design-system/foundations/foundations.css`

## Zasada zmian

Zmiana zaakceptowanego kontraktu wymaga jednoczesnej aktualizacji kodu,
dokumentacji, kontraktu Storybooka, mapy taksonomii, katalogu generowanego
i technicznych bram kontrolnych. Lokalne obejście w pojedynczym komponencie
nie jest zmianą Fundamentów i nie może zastępować ich kontraktu.
