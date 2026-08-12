---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: accepted
updated_at: 2026-08-11T12:00:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Macierz stanów przekrojowych

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.10 |
| Nazwa polska | Macierz stanów przekrojowych |
| Nazwa techniczna | macierz-stanow-przekrojowych |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Macierz stanów przekrojowych` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Macierz przypisuje rodziny stanów do powierzchni i właścicieli przez DataTable oraz lekką listę zasad, bez ściany checklist ani lokalnych kart.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

Domenowa gotowość procesu danych pozostaje przy domenach danych i integracji. Analityczne stany prezentacyjne `noData`, `partial`, `stale` i `delayed` pozostają przy `15.08 / ChartDataState`.

## Anatomia

```text
macierz-stanow-przekrojowych
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- DataTable
- InlineNotice
- StatusBadge

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Rodziny stanów | Uniwersalne, dane, dostęp, billing, AI, operacje i integracje są widoczne w DataTable. | Storybook + fixture |
| 2 | Statusy | Gotowość rodzin stanów używa neutralnego StatusBadge w kolumnie statusu. | Storybook + fixture |
| 3 | Zasady | Przypisanie stanu opisuje semantykę, powierzchnię i recovery. | Storybook + fixture |
| 4 | Brak duplikacji | Macierz nie zastępuje właścicieli komponentów, gotowości procesu danych ani kontraktów 15.*. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.
- Story nie implementuje lokalnego sortowania; workflow sortowania pozostaje w `18.04`.
- Pierwsza kolumna DataTable jest nagłówkiem wiersza przez `rowHeaderColumnId="family"`, a poziomy scroll pozostaje własnością `DataTable/Table`.

## Storybook

- Title: `18 Wzorce interfejsu/Macierz stanów przekrojowych`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/CrossStateMatrix.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

## Testy i kryteria akceptacji

1. Play test sprawdza tabelę macierzy, nagłówek wiersza i listę zasad.
2. Audyt Storybook obejmuje viewporty i zoom dla tej story.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
