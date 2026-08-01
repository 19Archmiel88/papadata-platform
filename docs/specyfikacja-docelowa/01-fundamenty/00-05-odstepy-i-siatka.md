---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
---

# Odstępy, gęstość i siatka

| Pole | Wartość |
|---|---|
| Identyfikator | 00.05 |
| Status dokumentacji | ZAAKCEPTOWANA |
| Status implementacji | ZAAKCEPTOWANE — KANONICZNA IMPLEMENTACJA REFERENCYJNA |
| Story class | reference |
| Właściciel | Design System |
| Story export | `SpacingIGrid` |
| Story file | `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx` |
| Production status | `not_started` |
| Test status | `not_started` |

Kanoniczna ścieżka: `00 Fundamenty/Podstawy/Odstępy i siatka`

## Cel

Skala odstępów, gęstość oraz siatka kontrolują rytm ekranów, kart, formularzy, tabel i układów responsywnych.

Akceptacja dotyczy referencyjnej story Fundamentów i jej kierunku
wizualnego. Nie oznacza automatycznie ukończenia wszystkich komponentów
produkcyjnych ani testów przekrojowych.

## Kontrakt zaakceptowany

- kanoniczna skala odstępów
- marginesy ekranów i odstępy sekcji
- odstępy kart, formularzy i tabel
- wariant comfortable i compact
- desktop, tablet i mobile

## Reguły obowiązujące kolejne sekcje

- Wartości odstępów pochodzą z kontraktu spacing.
- Gęstość nie może obniżać czytelności ani dostępności.
- Lokalna arbitralna skala spacingu jest niedozwolona.

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
