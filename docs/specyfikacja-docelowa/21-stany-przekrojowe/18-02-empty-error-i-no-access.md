---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: accepted
updated_at: 2026-08-11T12:00:00+02:00
---

# Routing feedbacku

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.02 |
| Nazwa polska | Routing feedbacku |
| Nazwa techniczna | routing-feedbacku |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Routing feedbacku` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec porządkuje stan pusty, brak wyników, brak danych operacyjnych poza wykresem, błąd, blokadę procesu, brak dostępu, brak uprawnienia w planie i ponowienie przez istniejące komponenty feedback.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

Analityczne stany danych dla ChartFrame i wykresów, w tym `noData`, `partial`, `stale`, `delayed`, `blocked`, `error` i `unavailable`, pozostają własnością `15.08 / ChartDataState`. 18.02 routuje wyłącznie ogólne powierzchnie feedbacku poza kanoniczną ramą wykresu.

## Anatomia

```text
empty-error-i-no-access
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo ścieżka naprawy
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- EmptyState
- ErrorState
- InlineNotice
- TextAction

Wzorzec używa istniejących komponentów bazowych. Akcje przyciskowe pochodzą z `EmptyState`, `ErrorState` i `InlineNotice`; story nie importuje lokalnego zamiennika `Button`. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Stan pusty / brak wyników / brak danych operacyjnych | Stany bez danych poza wykresem używają EmptyState i nie udają błędu systemu ani stanu `15.08 / ChartDataState`. | Storybook + fixture |
| 2 | Error | Tylko ErrorState tworzy realny alert i akcję ponowienia. | Storybook + fixture |
| 3 | Blokada / brak dostępu | Blokada i brak dostępu są jawne, ale nie używają fałszywego role alert. | Storybook + fixture |
| 4 | Brak uprawnienia w planie | Brak pakietu produktowego jest oddzielony od awarii źródła. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.
- Story nie tworzy drugiego słownika analitycznych stanów danych; ten kontrakt pozostaje w `15.08 / ChartDataState`.
- Widoczne akcje w story muszą mieć realny lokalny efekt w play/smoke albo zostać usunięte.

## Storybook

- Title: `18 Wzorce interfejsu/Routing feedbacku`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/FeedbackStates.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

## Testy i kryteria akceptacji

1. Play test sprawdza realny ErrorState alert, pojedynczą rolę alertu, ponowienie oraz niealertowe akcje dostępu/planu.
2. Fixture nie deklaruje focus restoration ani live region bez pokrycia.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
