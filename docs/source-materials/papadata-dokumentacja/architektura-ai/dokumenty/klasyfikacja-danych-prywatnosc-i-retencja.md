# Klasyfikacja danych prywatność i retencja

Klasyfikacja danych, prywatność i retencja

AI-03
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-03
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

Ustanowić klasyfikację informacji, minimalizację, dostęp, retencję, eksport i usuwanie.

## Klasy danych

Publiczne; wewnętrzne; poufne biznesowe; dane osobowe; sekrety; dowody audytowe.

## Zasady

Minimalizacja danych i pseudonimizacja identyfikatorów klientów.

Sekrety nie trafiają do logów, promptów, eksportów ani Storybooka.

Retencja raw, canonical, KPI, audit i AI jest definiowana oddzielnie.

## Rekomendowany model retencji

Raw payload: krótka retencja operacyjna potrzebna do reprocessingu.

Canonical: zgodnie z umową i potrzebami raportowymi.

Metric snapshots i audit: długoterminowo dla trendów i rozliczalności.

Secrets: wyłącznie menedżer sekretów, rotacja i usunięcie po odłączeniu.

## Luki

Brak inwentarza danych osobowych, podstaw prawnych, okresów retencji, DSAR/usunięcia i listy podprocesorów.

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
