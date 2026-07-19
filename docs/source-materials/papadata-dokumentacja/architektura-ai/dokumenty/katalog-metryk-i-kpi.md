# Katalog metryk i KPI

Katalog metryk i KPI

AI-05
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-05
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

Ustanowić wersjonowane kontrakty metryk: znaczenie, źródła, warunki gotowości, obliczenie i ryzyka.

## Pola obowiązkowe

Cel, definicja, pytanie biznesowe, źródło i autorytet, formuła, jednostka, okno, częstotliwość, segmentacje, interpretacja, ryzyka, stany, progi jakości, owner, approver, wersja, testy i priorytet.

## Zasady

Snapshot wskazuje wersję definicji i datasetu, okres, timezone, currency, filtry, freshness, quality i lineage.

Zmiana definicji nie przelicza historii bez oznaczenia.

Wartość 0 tylko po potwierdzeniu kompletności; inaczej stan NO_DATA/PARTIAL/INVALID.

## Katalog KPI

Tabela:
- Wiersz 1: ID; Nazwa; Pytanie; Definicja skrócona; Priorytet
- Wiersz 2: KPI-01; Order Count; Ile zamówień spełnia definicję?; Unikalne canonical_order_id po filtrze statusów; MVP
- Wiersz 3: KPI-02; Gross Revenue; Jaka jest sprzedaż brutto?; Suma zaakceptowanych zamówień; MVP
- Wiersz 4: KPI-03; Refund Value; Jaka wartość została zwrócona?; Suma zaksięgowanych zwrotów; MVP
- Wiersz 5: KPI-04; Net Revenue; Jaki jest przychód po zwrotach?; Gross Revenue - Refund Value; MVP
- Wiersz 6: KPI-05; Marketplace Fees; Ile kosztują opłaty?; Suma opłat platformowych; Etap 2
- Wiersz 7: KPI-06; Ad Spend; Ile wydano na reklamę?; Suma kosztów reklamowych; Etap 2
- Wiersz 8: KPI-07; ROAS; Jaki zwrot deklaruje platforma?; Attributed Value / Ad Spend; Etap 2
- Wiersz 9: KPI-08; Contribution Margin; Ile zostaje po kosztach zmiennych?; Net Revenue - fees - ads - COGS; Później

## MVP

Order Count, Gross Revenue, Refund Value i Net Revenue.

## Luki

Brak właścicieli, test vectors, progów jakości, waluty raportowej i zasad FX.

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
