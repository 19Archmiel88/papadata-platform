---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
---

# Typografia i formatowanie danych

| Pole | Wartość |
|---|---|
| Identyfikator | 00.02 |
| Status dokumentacji | ZAAKCEPTOWANA |
| Status implementacji | ZAAKCEPTOWANE — KANONICZNA IMPLEMENTACJA REFERENCYJNA |
| Story class | reference |
| Właściciel | Design System |
| Story export | `Typografia` |
| Story file | `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx` |
| Production status | `not_started` |
| Test status | `not_started` |

Kanoniczna ścieżka: `00 Fundamenty/Podstawy/Typografia`

## Cel

Typografia interfejsu opiera się na Inter, a dane techniczne, identyfikatory i fragmenty kodowe na JetBrains Mono.

Akceptacja dotyczy referencyjnej story Fundamentów i jej kierunku
wizualnego. Nie oznacza automatycznie ukończenia wszystkich komponentów
produkcyjnych ani testów przekrojowych.

## Kontrakt zaakceptowany

- Inter jako font interfejsu
- JetBrains Mono jako font techniczny
- cyfry tabularne dla kwot, KPI i porównań
- bezpieczne zawijanie długich identyfikatorów
- formatowanie danych zgodne z lokalizacją PL/EN

## Reguły obowiązujące kolejne sekcje

- `--pd-font-sans` wskazuje Inter.
- `--pd-font-mono` wskazuje JetBrains Mono.
- Instrument Sans i IBM Plex Mono nie są częścią kanonicznego systemu.
- Komponenty nie definiują własnych rodzin fontów.

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
