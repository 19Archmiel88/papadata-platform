---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
---

# Motion i ograniczenie ruchu

| Pole | Wartość |
|---|---|
| Identyfikator | 00.10 |
| Status dokumentacji | ZAAKCEPTOWANA |
| Status implementacji | ZAAKCEPTOWANE — KANONICZNA IMPLEMENTACJA REFERENCYJNA |
| Story class | reference |
| Właściciel | Design System |
| Story export | `MotionIReducedMotion` |
| Story file | `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx` |
| Production status | `not_started` |
| Test status | `not_started` |

Kanoniczna ścieżka: `00 Fundamenty/Podstawy/Motion i ograniczenie ruchu`

## Cel

Motion wspiera orientację, zmianę stanu i ciągłość interakcji. Nie może być warunkiem odczytania informacji.

Akceptacja dotyczy referencyjnej story Fundamentów i jej kierunku
wizualnego. Nie oznacza automatycznie ukończenia wszystkich komponentów
produkcyjnych ani testów przekrojowych.

## Kontrakt zaakceptowany

- instant 70 ms
- fast 110 ms
- standard 180 ms
- deliberate 240 ms
- standard cubic-bezier(0.2, 0, 0, 1)
- emphasized cubic-bezier(0.16, 1, 0.3, 1)
- pełna obsługa reduced motion

## Reguły obowiązujące kolejne sekcje

- Czasy pochodzą z tokenów --pd-motion-duration-*.
- Easing pochodzi z tokenów --pd-motion-easing-*.
- Reduced motion skraca czasy do wartości technicznie minimalnej.
- Przerwanie animacji nie może powodować utraty stanu ani fokusu.

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
