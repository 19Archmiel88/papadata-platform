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

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Cel i decyzja docelowa

„Stany danych” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

## Stan obecny


## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | ready | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | partial | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | stale | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | no data | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | conflict | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | provider error | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | processing | wymagany wariant lub stan | test Storybook + test interakcji |
| 8 | unavailable | wymagany wariant lub stan | test Storybook + test interakcji |

## Mapowanie nazw laboratoryjnych

Nazwy kanoniczne pozostają bez zmian. 05.03 może używać uproszczonych etykiet laboratoryjnych, ale musi mapować je na słownik dokumentacyjny oraz, osobno, na identyfikator techniczny używany przez właściwy kontrakt:

| Etykieta w 05.03 | Nazwa kanoniczna | Identyfikator techniczny, jeśli występuje w kontrakcie |
| --- | --- | --- |
| ready | ready | `ready` |
| loading | processing | `processing` |
| empty | no data | `noData` |
| partial | partial | `partial` |
| stale | stale | `stale` |
| error | konkretna przyczyna | zależny od kontraktu, np. `sourceError`, `unavailable` albo `conflict` |

Etykieta error jest skrótem laboratoryjnym i nie jest stanem kanonicznym. Nie mapuje się globalnie ani wyłącznie na jeden identyfikator techniczny. Przykład w 05.03 musi wskazać konkretną przyczynę kanoniczną, np. provider error, unavailable albo conflict, oraz identyfikator techniczny tylko wtedy, gdy przewiduje go właściwy kontrakt. `sourceError` może wystąpić wyłącznie jako identyfikator techniczny, nie jako nowy kanoniczny stan dokumentacyjny.

## Anatomia

```text
stany-danych
├── semantic root
├── header or accessible label
├── primary content
├── status / validation region
├── primary action
└── optional secondary actions or metadata
```

## Komponenty składowe

- PageHeader
- DataStatusBanner
- InlineNotice
- Button
- EvidencePanel
- RecommendationCard
- DecisionCard

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

## Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.

## Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

## Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

## Dostępność

Minimum WCAG 2.2 AA: semantyka, dostępna nazwa, focus-visible, target size, kontrast, reduced motion, live region dla wyników asynchronicznych, reflow i brak informacji zależnej wyłącznie od koloru.

## Storybook

- Title: `15 Wykresy i wizualizacje danych/Stany danych`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

## Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.
