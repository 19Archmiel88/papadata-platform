---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-913B883643FF
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Stany danych

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.08 |
| Nazwa polska | Stany danych |
| Nazwa techniczna | stany-danych |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i wizualizacje danych — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — REVIEW |
| Status Storybooka | `15 Wykresy i dane/Stany danych`, visible, implemented |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy A15.6 |

## Cel i decyzja docelowa

15.08 jest właścicielem wspólnego języka stanów danych dla wykresów analitycznych. Stan nie należy do pojedynczego wykresu; `ChartFrame` i wizualizacje konsumują jeden runtime `ChartDataState`, dzięki czemu loading, empty, no data, partial data, stale data, delayed, blocked, error i unavailable mają spójną semantykę.

## Stan obecny

Runtime `ChartDataState` jest wdrożony jako owner 15.08 i jest konsumowany przez `ChartFrame`. Storybook pokazuje pełny słownik stanów w jednym miejscu oraz przykład użycia w kontenerze wykresu.

Decyzja nazewnicza dla 15.01/15.02: kanoniczny stan trwającego pobierania to `loading`. `processing` pozostaje wyłącznie legacy aliasem publicznego typu `AnalyticsDataState` i jest normalizowany do `loading`. Analogicznie `conflict` jest aliasem `blocked`, a `providerError` aliasem `error`. Nowe rejestry i dokumenty promują nazwy kanoniczne.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | loading | stabilny szkielet i live region bez pustej osi | story + marker `data-chart-data-state="loading"` |
| 2 | empty | filtr nie zwraca wyników; nie jest to awaria | story + tekst stanu pustego |
| 3 | no data | źródło nie ma danych dla zakresu lub metryki | story + brak zastępczej wizualizacji |
| 4 | partial data | wykres może być widoczny z oznaczeniem braków | story + alternatywna tabela |
| 5 | stale data | dane starsze niż próg świeżości | story + status ostrzegawczy |
| 6 | delayed | źródło raportuje opóźnienie | story + status opóźnienia |
| 7 | blocked | dostęp lub policy blokuje odczyt | story + assertive notice |
| 8 | error | błąd wymaga retry albo ścieżki naprawy | story + akcja naprawcza |
| 9 | unavailable | źródło lub usługa czasowo niedostępne | story + stan informacyjny |
| 10 | shared state language | jeden słownik dla ChartFrame i wizualizacji | `pnpm check:analytics-system` |
| 11 | no per-chart states | brak lokalnych wariantów per wykres | `pnpm check:analytics-system` |

## Mapowanie nazw laboratoryjnych

05.03 pozostaje laboratorium decyzji i korzysta z publicznego `AnalyticsDataState`, ale nie jest właścicielem słownika. Mapowanie obowiązujące po 15.08:

| Etykieta w 05.03 lub legacy | Nazwa kanoniczna | Identyfikator techniczny |
| --- | --- | --- |
| ready | ready | `ready` |
| loading | loading | `loading` |
| processing | loading | `processing` jako legacy alias |
| empty | empty | `empty` |
| no data | no data | `noData` |
| partial | partial data | `partial` |
| stale | stale data | `stale` |
| delayed | delayed | `delayed` |
| blocked | blocked | `blocked` |
| conflict | blocked | `conflict` jako legacy alias |
| error | error | `error` |
| provider error | error | `providerError` jako legacy alias |
| unavailable | unavailable | `unavailable` |

## Anatomia

```text
ChartDataState
├── semantic root
├── accessible state name
├── stable message
├── optional action
└── canonical data-state marker
```

## Komponenty składowe

- `ChartDataState`
- `ChartFrame`
- `TrendChart` jako przykład renderowalnych danych
- `DataTable` jako alternatywny odczyt danych
- `TextAction` dla recovery

Każdy składnik ma osobny kontrakt. 15.08 nie tworzy lokalnych stanów dla TrendChart, ComparisonChart, ShareChart, CorrelationChart ani ForecastChart.

## Kontrakt stanu

- Kanoniczne stany 15.08 to `ready`, `loading`, `empty`, `noData`, `partial`, `stale`, `delayed`, `blocked`, `error` i `unavailable`.
- Legacy aliasy `processing`, `conflict` i `providerError` są dozwolone wyłącznie dla kompatybilności publicznego runtime i muszą przejść przez `normalizeAnalyticsDataState()`.
- Stany renderowalne (`ready`, `partial`, `stale`, `delayed`) mogą pokazywać wykres z widocznym statusem.
- Stany nierenderowalne nie pokazują fikcyjnej geometrii ani wartości zero.
- Zmiana motywu, języka lub viewportu nie zmienia semantyki stanu.

## Interakcje i klawiatura

15.08 nie jest ownerem tooltipów, hover, selection, drill-down ani cross-filteringu. Te zachowania przejmuje 15.09. Stany danych muszą jednak mieć dostępną nazwę, poprawny `aria-live` i akcję możliwą do uruchomienia z klawiatury, jeśli recovery istnieje.

## Responsywność

`ChartDataState` zachowuje stabilny układ w `ChartFrame` na desktop/tablet/mobile i przy zoom 200%. Renderowalne stany zachowują alternatywną tabelę danych.

## Dostępność

Minimum WCAG 2.2 AA: semantyka statusu, dostępna nazwa, focus-visible dla akcji, kontrast, reduced motion dla loadingu, live region dla zmian asynchronicznych, reflow oraz brak informacji zależnej wyłącznie od koloru.

## Storybook

- Title: `15 Wykresy i dane/Stany danych`.
- Story: `DataStatesStory`.
- Status: implemented, visible, review.
- Wymagane warianty: loading, empty, no data, partial data, stale data, delayed, blocked, error i unavailable.
- Wymagane środowiska: light/dark, desktop/tablet/mobile, zoom 200%, reduced motion.

## Testy i kryteria akceptacji

1. Wszystkie stany kanoniczne mają story i marker runtime.
2. `ChartFrame` konsumuje `ChartDataState`, zamiast tworzyć własny system.
3. `processing` jest jawnie traktowany jako legacy alias `loading`, a nie drugi stan kanoniczny.
4. Stany błędu i blokady mają recovery albo jednoznaczne zakończenie.
5. Mobile i zoom 200% nie tracą informacji ani akcji.
6. Walidacja `pnpm check:analytics-system` potwierdza ownerstwo 15.08.
