# Katalog wykresów i wizualizacji decyzyjnych

Katalog wykresów i wizualizacji decyzyjnych

AI-08
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-08
- Wiersz 3: Wersja; 1.0
- Wiersz 4: Data; 18 lipca 2026
- Wiersz 5: Status; Projekt docelowy - do zatwierdzenia
- Wiersz 6: Zakres; Dane, analityka, insighty, automatyzacje i bezpieczne AI

## Konwencja

Tabela:
- Wiersz 1: Klasa; Znaczenie
- Wiersz 2: FAKT; Wynika z dokumentacji źródłowej.
- Wiersz 3: ZAŁOŻENIE; Przyjęte roboczo i wymaga potwierdzenia.
- Wiersz 4: REKOMENDACJA; Proponowany sposób realizacji.
- Wiersz 5: LUKA / KONFLIKT; Brak, niespójność lub decyzja blokująca.

## Cel

Każda wizualizacja wspiera decyzję i ma jawne dane wejściowe, metryki, wymiary, interakcje, stany oraz ryzyka UX.

## Kontrakt wizualizacji

Decision question, input datasets, metrics, dimensions, okres, comparison, filtry, interakcje, drill-down, readiness, empty/partial/error, interpretacja, ryzyka i accessibility.

## Zasady UX

Nie interpolować luk w szeregu czasowym.

Nie porównywać okresów o różnej kompletności bez ostrzeżenia.

Oznaczać zmiany definicji KPI na osi czasu.

Tooltip: definicja, wartość, okres, status i źródło.

Kolor nie może być jedynym nośnikiem statusu.

## Katalog wizualizacji

Tabela:
- Wiersz 1: ID; Typ; Pytanie decyzyjne; Dane; Priorytet
- Wiersz 2: VIZ-01; Karta KPI; Czy wynik rośnie i czy można mu ufać?; wartość, delta, okres, readiness, freshness; MVP
- Wiersz 3: VIZ-02; Trend; Kiedy nastąpiła zmiana?; KPI w czasie, luki, zmiany definicji; MVP
- Wiersz 4: VIZ-03; Waterfall; Co pomniejsza sprzedaż?; gross, refunds, fees, ads, COGS; Etap 2
- Wiersz 5: VIZ-04; Jakość danych; Dlaczego dataset nie jest gotowy?; issue type, severity, source, age; MVP
- Wiersz 6: VIZ-05; Lejek; Gdzie odpada ruch?; sessions, views, cart, checkout, orders; Etap 2
- Wiersz 7: VIZ-06; Macierz priorytetów; Co wymaga decyzji?; impact, confidence, urgency, effort; Etap 2

## MVP

Karta KPI, trend, panel jakości/readiness i lista insightów.

Drill-down do źródła, definicji, danych składowych lub problemu jakości.

## Źródła dokumentacyjne

D1-D7: dokumentacja biznesowa, decyzje, kontrakt danych/KPI, integracje, pilotaż, komercjalizacja i bezpieczeństwo.

M01-M15: dokumentacja UI/UX oraz stanów produktowych.

A01-A15: architektura produktu, systemu, danych, integracji, uprawnień, bezpieczeństwa, AI, MVP i wdrożenia.

Dokument nie jest dowodem implementacji, gotowości produkcyjnej ani opinią prawną.

## Zatwierdzenia

Tabela:
- Wiersz 1: Rola; Osoba; Decyzja; Data
- Wiersz 2: Właściciel biznesowy
- Wiersz 3: Właściciel danych
- Wiersz 4: Architekt techniczny
- Wiersz 5: Bezpieczeństwo / prywatność
