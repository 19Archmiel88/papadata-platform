---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: accepted
updated_at: 2026-08-11T12:00:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# DataDecisionWorkspace

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.11 |
| Nazwa polska | Przestrzeń decyzji danych |
| Nazwa techniczna | data-decision-workspace |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Product UI |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/DataDecisionWorkspace` |
| Status testów | fixture + audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje produktową kompozycję decyzji: obszar danych w ChartFrame, TrendChart, alternatywę DataTable, rekomendację, sidecar Papa Asystenta i toast operacyjny. `18.11` nie tworzy nowych tokenów, statusów, powierzchni ani lokalnych wariantów komunikatów. Źródłem zasad wizualnych pozostaje `00`, właścicielem wykresów i danych pozostaje `15`, a workflow tabeli należy do `18.04`.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu i nie zmienia ownerów `00`, `15` ani istniejącego runtime API.

## Anatomia

```text
data-decision-workspace
├── canvas aplikacji z metrykami
├── powierzchnia danych z wykresem i tabelą
├── panel rekomendacji jako warstwa pomocnicza
├── sidecar Papa Asystenta bez scrimu
└── toast operacyjny bez zmiany layoutu
```

## Komponenty składowe

- ChartFrame
- TrendChart
- DataTable
- InlineNotice
- StatusBadge
- Toast

Wzorzec konsumuje fundamenty z `00` i komponenty z `15`/runtime. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do decyzji kompozycyjnej tej story.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Dane jako główny obszar pracy | ChartFrame utrzymuje powierzchnię danych, TrendChart renderuje wykres, a DataTable jest alternatywą tabelaryczną. | Storybook + fixture |
| 2 | Rekomendacja | Warstwa pomaga w decyzji i nie zastępuje danych. | Storybook + fixture |
| 3 | Papa Asystent | Sidecar jest panelowy, bez scrimu i bez przejmowania ownerstwa komunikatów. | Storybook + fixture |
| 4 | Toast | Potwierdza operację i nie zmienia układu strony. | Storybook + fixture |

## Kontrakt UI

- `00` jest jedynym źródłem prawdy dla canvasu, powierzchni, głębi, akcji, komunikatów, statusu i koloru.
- `15` jest właścicielem wykresów i danych analitycznych.
- `18.11` pokazuje tylko realny układ pracy, bez lokalnego systemu komponentów.
- Story nie tworzy drugiego Button, DataTable, StatusBadge, InlineNotice, Toast, Drawer ani OverlayRoot.

## Storybook

- Title: `18 Wzorce interfejsu/DataDecisionWorkspace`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DataDecisionWorkspace.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

## Testy i kryteria akceptacji

1. Fixture wskazuje `18.11` jako wzorzec Storybook/pattern-only, a nie runtime component.
2. Play test sprawdza ChartFrame/TrendChart, rekomendację, sidecar, toast i alternatywną tabelę DataTable.
3. Audyt Storybook obejmuje viewporty i zoom dla tej story.
4. Lokalny CSS nie override'uje klas produkcyjnych ani fundamentów `00`.
5. Brak poziomego scrolla strony na mobile i przy zoom 200%.
