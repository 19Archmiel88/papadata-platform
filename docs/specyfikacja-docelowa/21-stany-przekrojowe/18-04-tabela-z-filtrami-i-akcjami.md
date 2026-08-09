---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: review
updated_at: 2026-08-09T12:00:00+02:00
---

# Tabela z filtrami i akcjami

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.04 |
| Nazwa polska | Tabela z filtrami i akcjami |
| Nazwa techniczna | tabela-z-filtrami-i-akcjami |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | review wzorca Storybook; decyzja wizualna oczekuje na akceptację właścicielską |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — REVIEW |
| Akceptacja właścicielska | `false` — wymaga osobnej akceptacji właściciela produktu |
| Status Storybooka | `18 Wzorce interfejsu/Tabela z filtrami i akcjami` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec używa DataTable jako kanonicznej powierzchni danych oraz FilterBar, SearchField, Select i SortControl dla realnego stanu search/filter/sort/row action.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
tabela-z-filtrami-i-akcjami
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- FilterBar
- SearchField
- Select
- SortControl
- DataTable
- StatusBadge
- Button
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Search / filter / sort | Kontrolki zmieniają stan story i wynik DataTable. | Storybook + fixture |
| 2 | Row actions | Akcja wiersza przechodzi przez DataTable actions menu. | Storybook + fixture |
| 3 | Bulk actions | Zbiorcza akcja pokazuje caller-owned selected count; brak fałszywych checkboxów. | Storybook + fixture |
| 4 | DataTable | Tabela pozostaje jedyną cięższą powierzchnią danych. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Tabela z filtrami i akcjami`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/FilteredTableActions.stories.tsx`.
- Status: implemented / visible / review.
- Accepted: false, do czasu osobnej akceptacji wizualnej.

## Testy i kryteria akceptacji

1. Play test sprawdza search, status filter, sort, row action i bulk action.
2. DataTable zachowuje własny scroll dla szerokich kolumn.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
