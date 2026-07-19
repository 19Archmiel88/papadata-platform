# Katalog insightów i logika priorytetyzacji

Katalog insightów i logika priorytetyzacji

AI-07
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-07
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

Insight odpowiada na konkretne pytanie biznesowe i prowadzi do decyzji, nie tylko opisuje zmianę liczby.

## Pola obowiązkowe

Insight ID, pytanie, źródła, warunki uruchomienia, segment, okres, obserwacja, interpretacja, ważność, confidence, działanie, ograniczenia, ryzyka, audyt, owner, status i priorytet.

## Typy insightów

Zmiana wyniku; anomalia; ryzyko jakości; szansa; wyjaśnienie czynników; problem operacyjny.

## Przykład MVP

Pytanie: dlaczego Net Revenue spadł tydzień do tygodnia?

Warunki: KPI READY, minimum 14 dni historii i brak zmiany definicji.

Fakt: Net Revenue -12%, Gross Revenue -4%, Refund Value +38%.

Interpretacja: wzrost zwrotów odpowiada za większość różnicy, ale nie dowodzi przyczynowości.

Rekomendacja: rozwinąć analizę produktów w etapie 2.

Pewność: średnia z powodu braku pełnej segmentacji.

## Priorytetyzacja

Score = wpływ x pilność x confidence x actionability, z karą za niską świeżość, częściowość i koszt działania.

Insight o wysokim wpływie i niskiej jakości najpierw prowadzi do naprawy danych.

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
