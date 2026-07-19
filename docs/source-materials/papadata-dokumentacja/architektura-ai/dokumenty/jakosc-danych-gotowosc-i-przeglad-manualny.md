# Jakość danych gotowość i przegląd manualny

Jakość danych, readiness i manual review

AI-10
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-10
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

Przekształcić jakość danych w operacyjny system gotowości datasetów, KPI i decyzji.

## Model oceny

Reguła jakości ma scope, severity, threshold, owner, remediation, wersję i wpływ na dataset/KPI.

ReadinessAssessment agreguje wyniki dla datasetu, okresu i celu.

DataIssue przechowuje dowód, liczbę rekordów, przykład, wpływ i naprawę.

## Manual review

Stosowany dla konfliktów autorytetu, niejednoznacznych dopasowań, brakujących mapowań i wyjątków biznesowych.

Decyzja manualna zapisuje actor, timestamp, poprzedni i nowy stan, uzasadnienie i policy version.

## Bramy publikacji

KPI blokowany przy krytycznym błędzie schematu, integralności, waluty, duplikacji lub reconciliation.

AI nie analizuje niedostępnych danych ani nie omija readiness.

## Reguły jakości

Tabela:
- Wiersz 1: ID; Reguła; Pytanie; Miara; Wpływ; Priorytet
- Wiersz 2: Q-01; Schema validity; Czy rekord ma pola i typy?; % poprawnych; blokująca; MVP
- Wiersz 3: Q-02; Uniqueness; Czy ID są unikalne?; duplikaty/rekordy; blokująca; MVP
- Wiersz 4: Q-03; Completeness; Czy pola KPI są obecne?; % kompletności; blokująca/alert; MVP
- Wiersz 5: Q-04; Freshness; Czy dane są w SLA?; age latest watermark; alert/blokada; MVP
- Wiersz 6: Q-05; Volume anomaly; Czy wolumen odbiega?; reguła procentowa; alert; Etap 2
- Wiersz 7: Q-06; Reconciliation; Czy sumy zgadzają się?; różnica kwot/liczb; blokująca; MVP
- Wiersz 8: Q-07; Referential integrity; Czy relacje są kompletne?; liczba osieroconych; blokująca; MVP
- Wiersz 9: Q-08; Currency/timezone; Czy interpretacja jest poprawna?; nieobsługiwane rekordy; blokująca; MVP

## Luki

Brak progów per źródło i KPI oraz benchmarków wolumenu i SLA świeżości.

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
