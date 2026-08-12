---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: accepted
updated_at: 2026-08-11T12:00:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
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
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Ładowanie danych i operacje w tle` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje ładowanie, kolejkę, operację w toku, częściowe zakończenie, anulowanie i ponowienie przez Skeleton, Spinner, Button loading, BackgroundOperationItem i ProgressIndicator.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
ladowanie-danych-i-operacje-w-tle
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo ścieżka naprawy
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
| 1 | Ładowanie | Skeleton stabilizuje region, a Spinner komunikuje rzeczywisty role status. | Storybook + fixture |
| 2 | Kolejka / operacja w toku | Operacje w tle pokazują status i postęp bez blokowania strony. | Storybook + fixture |
| 3 | Częściowe zakończenie / anulowanie | Częściowe zakończenie i anulowanie są odróżnione od błędu. | Storybook + fixture |
| 4 | Ponowienie | Ponowienie występuje tylko jako realna akcja przy operacji failed. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Ładowanie danych i operacje w tle`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/LoadingOperations.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

## Testy i kryteria akceptacji

1. Play test sprawdza Spinner, pasek postępu, realne anulowanie i realną akcję Ponów import.
2. Nie ma deklaracji fikcyjnego live region poza komponentami, które same go renderują.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
