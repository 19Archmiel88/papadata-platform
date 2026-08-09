---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: review
updated_at: 2026-08-09T12:00:00+02:00
---

# Ładowanie danych i operacje w tle

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.03 |
| Nazwa polska | Ładowanie danych i operacje w tle |
| Nazwa techniczna | ladowanie-danych-i-operacje-w-tle |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | review wzorca Storybook; decyzja wizualna oczekuje na akceptację właścicielską |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — REVIEW |
| Akceptacja właścicielska | `false` — wymaga osobnej akceptacji właściciela produktu |
| Status Storybooka | `18 Wzorce interfejsu/Ładowanie danych i operacje w tle` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje loading, queued, running, partial completion, cancelled i retry przez Skeleton, Spinner, Button loading, BackgroundOperationItem i ProgressIndicator.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
ladowanie-danych-i-operacje-w-tle
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- Skeleton
- Spinner
- Button
- BackgroundOperationItem
- ProgressIndicator
- InlineNotice
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Loading | Skeleton stabilizuje region, a Spinner komunikuje rzeczywisty role status. | Storybook + fixture |
| 2 | Queued / running | Operacje w tle pokazują status i postęp bez blokowania strony. | Storybook + fixture |
| 3 | Partial / cancelled | Częściowe zakończenie i anulowanie są odróżnione od błędu. | Storybook + fixture |
| 4 | Retry | Retry występuje tylko jako realna akcja przy operacji failed. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Ładowanie danych i operacje w tle`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/LoadingOperations.stories.tsx`.
- Status: implemented / visible / review.
- Accepted: false, do czasu osobnej akceptacji wizualnej.

## Testy i kryteria akceptacji

1. Play test sprawdza Spinner, progressbar i realną akcję Ponów import.
2. Nie ma deklaracji fikcyjnego live region poza komponentami, które same go renderują.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
