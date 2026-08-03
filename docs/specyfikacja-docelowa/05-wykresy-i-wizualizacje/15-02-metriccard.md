---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-79995BCF3B69
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# MetricCard

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.02 |
| Nazwa polska | MetricCard |
| Nazwa techniczna | metriccard |
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

„MetricCard” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

## Stan obecny


## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | wartość | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | trend | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | porównanie | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | status danych | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | zmiana definicji | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | brak danych | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | częściowe dane | wymagany wariant lub stan | test Storybook + test interakcji |
| 8 | akcja wyjaśnienia przez Papa. | wymagany wariant lub stan | test Storybook + test interakcji |

## Warianty MetricCard

MetricCard nie ma jednej obowiązkowej rozbudowanej anatomii dla całego systemu. Wymagane warianty projektowe:

- podstawowy
- z trendem
- z celem
- z odchyleniem
- z mikrochartem
- alarmowy lub rekomendacyjny

Mikrochart, subtelne wypełnienie albo cień pod wykresem oraz graficzna strzałka kierunku należą do wariantu rozbudowanego. Nie są obowiązkowe dla każdego MetricCard.

Wariant Centrum Dowodzenia może zawierać: wartość, jednostkę, delta, okres porównawczy, cel lub plan, trend `up`, `down`, `flat` albo `unknown`, ikonę albo strzałkę kierunku, mikrochart, subtelne wypełnienie lub cień, źródło, zakres, świeżość, status danych oraz akcję szczegółów lub wyjaśnienia przez Papa.

Ten dokument opisuje zatwierdzony kontrakt docelowy. Obecny kontrakt TypeScript pozostaje węższy i wymaga późniejszej synchronizacji z implementacją oraz kontraktami technicznymi.

## Anatomia

```text
metriccard
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
- TextField
- Select
- Checkbox
- Dialog

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

- Title: `15 Wykresy i wizualizacje danych/MetricCard`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Pełna story komponentu pokazuje wszystkie warianty MetricCard; 05.03 pokazuje tylko reprezentatywne decyzje powierzchni.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

## Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.
