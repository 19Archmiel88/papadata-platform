---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: accepted
updated_at: 2026-08-11T12:00:00+02:00
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
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Tabela z filtrami i akcjami` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec używa DataTable jako kanonicznej powierzchni danych oraz FilterBar, SearchField, Select i SortControl dla realnego stanu wyszukiwania, filtrowania, sortowania i akcji wiersza.

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
- SegmentedControl
- Checkbox
- DataTable
- StatusBadge
- Button

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Wyszukiwanie / filtrowanie / sortowanie | Kontrolki zmieniają stan story i wynik DataTable; sortowaniem steruje SortControl. | Storybook + fixture |
| 2 | Akcje wiersza | Akcja wiersza przechodzi przez DataTable actions menu. | Storybook + fixture |
| 3 | Akcje zbiorcze | Zbiorcza akcja pokazuje licznik zaznaczeń należący do widoku; brak lokalnych atrap checkboxów. | Storybook + fixture |
| 4 | DataTable | Tabela pozostaje jedyną cięższą powierzchnią danych. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Tabela z filtrami i akcjami`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/FilteredTableActions.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

## Testy i kryteria akceptacji

1. Play test sprawdza wyszukiwanie, filtr statusu, SortControl, akcję wiersza, akcję zbiorczą oraz ustawienia widoku tabeli.
2. DataTable zachowuje własny scroll dla szerokich kolumn.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
