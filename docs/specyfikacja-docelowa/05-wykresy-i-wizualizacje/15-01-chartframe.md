---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-8B85AF5FD2D0
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# ChartFrame

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.01 |
| Nazwa polska | ChartFrame |
| Nazwa techniczna | chartframe |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i wizualizacje danych — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Cel i decyzja docelowa

„ChartFrame” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

## Stan obecny


## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | nagłówek | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | pytanie biznesowe | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | status | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | akcje | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | metadane | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | źródła | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | świeżość danych | wymagany wariant lub stan | test Storybook + test interakcji |
| 8 | wykres | wymagany wariant lub stan | test Storybook + test interakcji |
| 9 | legenda | wymagany wariant lub stan | test Storybook + test interakcji |
| 10 | adnotacje | wymagany wariant lub stan | test Storybook + test interakcji |
| 11 | narracyjne podsumowanie | wymagany wariant lub stan | test Storybook + test interakcji |
| 12 | tabela alternatywna | wymagany wariant lub stan | test Storybook + test interakcji |
| 13 | akcja Papa Asystenta. | wymagany wariant lub stan | test Storybook + test interakcji |

## Kontrakt docelowy i techniczny

Dokumentacja opisuje pełny kontrakt docelowy ChartFrame. Obecny kontrakt TypeScript jest węższy i obejmuje przede wszystkim `title`, `subtitle`, `series`, `unit`, `dateRangeLabel`, `legendPosition` i `dataTableLabel`. Brakujących pól docelowych nie wolno traktować jako istniejącej implementacji; wymagają późniejszej synchronizacji kontraktów technicznych i komponentu.

## Anatomia

```text
chartframe
├── semantic root
├── title or business question
├── context description
├── data status and freshness
├── date range and period comparison
├── metric selector
├── source or channel selector
├── main visualization
├── axes and scale
├── legend
├── annotations
├── tooltip model
├── narrative summary
├── actions
├── alternative data table
└── Papa explanation action
```

## Komponenty składowe

- PageHeader
- DataStatusBanner
- InlineNotice
- Button
- FilterBar
- DataTable
- Pagination
- DetailPanel
- ShareChart
- ComparisonChart
- EvidencePanel
- RecommendationCard
- DecisionCard

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

## Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.
- ChartFrame używa kanonicznych stanów danych z `15-08-stany-danych.md`. Etykiety laboratoryjne mapują się na nazwy kanoniczne następująco: loading → processing, empty → no data, partial → partial, stale → stale, error → konkretna przyczyna, np. provider error, unavailable albo conflict. Identyfikatory techniczne, np. `noData` albo `sourceError`, są zapisywane osobno i wyłącznie wtedy, gdy występują we właściwym kontrakcie.
- Nagłówek, kontekst, status, metadane, filtry i geometria powierzchni pozostają stabilne między stanami. Region legendy i region tabeli alternatywnej nie mogą powodować przypadkowego skoku geometrii, ale ich treść oraz dostępność zależą od konkretnego stanu.
- Nie wolno pokazywać legendy ani tabeli alternatywnej w sposób sugerujący dostępne dane, kiedy danych nie ma. W stanie niedostępności region może zawierać komunikat zastępczy, być nieaktywny albo zachować zarezerwowane miejsce zgodnie z kontraktem widoku.

## Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

## Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

## Dostępność

Minimum WCAG 2.2 AA: semantyka, dostępna nazwa, focus-visible, target size, kontrast, reduced motion, live region dla wyników asynchronicznych, reflow i brak informacji zależnej wyłącznie od koloru.

## Storybook

- Title: `15 Wykresy i wizualizacje danych/ChartFrame`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Pełna story komponentu pokazuje katalog wariantów ChartFrame; 05.03 pokazuje jeden reprezentatywny pełny ChartFrame.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

## Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.
