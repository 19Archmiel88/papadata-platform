---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
---

# Dostępność systemowa

| Pole | Wartość |
|---|---|
| Identyfikator | 00.11 |
| Status dokumentacji | ZAAKCEPTOWANA |
| Status implementacji | ZAAKCEPTOWANE — KANONICZNA IMPLEMENTACJA REFERENCYJNA |
| Story class | reference |
| Właściciel | Design System |
| Story export | `Dostepnosc` |
| Story file | `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx` |
| Production status | `not_started` |
| Test status | `not_started` |

Kanoniczna ścieżka: `00 Fundamenty/Podstawy/Dostępność systemowa`

## Cel

Dostępność jest częścią kontraktu systemowego: obejmuje klawiaturę, focus-visible, semantykę, komunikaty dynamiczne, reflow, zoom i forced colors.

Akceptacja dotyczy referencyjnej story Fundamentów i jej kierunku
wizualnego. Nie oznacza automatycznie ukończenia wszystkich komponentów
produkcyjnych ani testów przekrojowych.

## Kontrakt zaakceptowany

- pełna obsługa klawiatury
- widoczny focus-visible
- semantyczny HTML i kolejność nagłówków
- accessible name i komunikaty dynamiczne
- reflow, mobile i zoom 200%
- forced colors i kontrast light/dark

## Reguły obowiązujące kolejne sekcje

- Element interaktywny musi być osiągalny i obsługiwalny z klawiatury.
- Po zamknięciu warstwy fokus wraca do elementu wywołującego.
- Stan aktywny, zaznaczony i focus są rozróżnione semantycznie.
- Nowa story nie może wprowadzać nienazwanych kontrolek.

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
