---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
---

# Kierunek wizualny

| Pole | Wartość |
|---|---|
| Identyfikator | 00.01 |
| Status dokumentacji | ZAAKCEPTOWANA |
| Status implementacji | ZAAKCEPTOWANE — KANONICZNA IMPLEMENTACJA REFERENCYJNA |
| Story class | reference |
| Właściciel | Design System |
| Story export | `KierunekWizualny` |
| Story file | `apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx` |
| Production status | `not_started` |
| Test status | `not_started` |

Kanoniczna ścieżka: `00 Fundamenty/Podstawy/Kierunek wizualny`

## Cel

Kanoniczny kierunek wizualny PapaData określa hierarchię, charakter powierzchni, zastosowanie akcentu marki oraz relację między trybem jasnym i ciemnym.

Akceptacja dotyczy referencyjnej story Fundamentów i jej kierunku
wizualnego. Nie oznacza automatycznie ukończenia wszystkich komponentów
produkcyjnych ani testów przekrojowych.

## Kontrakt zaakceptowany

- premium bez dekoracyjnego nadmiaru
- czytelna hierarchia wizualna
- pełna równoważność trybu jasnego i ciemnego
- akcent marki używany funkcjonalnie
- brak lokalnych systemów wizualnych tworzonych przez kolejne sekcje

## Reguły obowiązujące kolejne sekcje

- Każda kolejna sekcja korzysta z istniejących tokenów --pd-*.
- Nie wolno tworzyć alternatywnej palety, typografii ani geometrii.
- Nowy kierunek wizualny wymaga jawnej zmiany kontraktu Fundamentów.

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
