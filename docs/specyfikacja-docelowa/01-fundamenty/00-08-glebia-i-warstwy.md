---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
---

# Głębia i warstwy

| Pole | Wartość |
|---|---|
| Identyfikator | 00.08 |
| Status dokumentacji | ZAAKCEPTOWANA |
| Status implementacji | ZAAKCEPTOWANE — KANONICZNA IMPLEMENTACJA REFERENCYJNA |
| Story class | reference |
| Właściciel | Design System |
| Story export | `GlebiaIWarstwy` |
| Story file | `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx` |
| Production status | `not_started` |
| Test status | `not_started` |

Kanoniczna ścieżka: `00 Fundamenty/Podstawy/Głębia i warstwy`

## Cel

System głębi rozróżnia canvas, panel uniesiony, element pływający i overlay. Cień jest sygnałem warstwy, nie ozdobą.

Akceptacja dotyczy referencyjnej story Fundamentów i jej kierunku
wizualnego. Nie oznacza automatycznie ukończenia wszystkich komponentów
produkcyjnych ani testów przekrojowych.

## Kontrakt zaakceptowany

- canvas bazowy
- panel uniesiony
- element pływający
- overlay i scrim
- kontrolowana hierarchia warstw

## Reguły obowiązujące kolejne sekcje

- Cień jest dozwolony tylko dla uzasadnionej relacji warstw.
- Z-index i overlay korzystają ze wspólnego systemu.
- Komponent nie tworzy prywatnej hierarchii warstw.

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
