---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: review
updated_at: 2026-08-09T12:00:00+02:00
---

# Empty, error i no-access

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.02 |
| Nazwa polska | Empty, error i no-access |
| Nazwa techniczna | empty-error-i-no-access |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | review wzorca Storybook; decyzja wizualna oczekuje na akceptację właścicielską |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — REVIEW |
| Akceptacja właścicielska | `false` — wymaga osobnej akceptacji właściciela produktu |
| Status Storybooka | `18 Wzorce interfejsu/Empty, error i no-access` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec porządkuje empty, no results, no data, error, blocked, forbidden, missing entitlement i retry przez istniejące komponenty feedback.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
empty-error-i-no-access
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- EmptyState
- ErrorState
- InlineNotice
- Button
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Empty / no results / no data | Stany bez danych używają EmptyState i nie udają błędu systemu. | Storybook + fixture |
| 2 | Error | Tylko ErrorState tworzy realny alert i akcję retry. | Storybook + fixture |
| 3 | Blocked / forbidden | Blokada i brak dostępu są jawne, ale nie używają fałszywego role alert. | Storybook + fixture |
| 4 | Missing entitlement | Brak pakietu produktowego jest oddzielony od awarii źródła. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Empty, error i no-access`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/FeedbackStates.stories.tsx`.
- Status: implemented / visible / review.
- Accepted: false, do czasu osobnej akceptacji wizualnej.

## Testy i kryteria akceptacji

1. Play test sprawdza realny ErrorState alert oraz retry.
2. Fixture nie deklaruje focus restoration ani live region bez pokrycia.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
