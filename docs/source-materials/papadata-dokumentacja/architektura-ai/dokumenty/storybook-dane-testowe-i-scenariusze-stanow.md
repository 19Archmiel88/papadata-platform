# Storybook dane testowe i scenariusze stanów

Storybook, mock data i scenariusze stanów

AI-17
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-17
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

Storybook dokumentuje kontrakty komponentów oraz wszystkie stany danych, integracji, uprawnień i odpowiedzi AI.

## Scenariusze obowiązkowe

READY, NO_DATA, INGESTING, PROCESSING, PARTIAL, DELAYED, INVALID, RESYNC_REQUIRED, BLOCKED, REAUTH_REQUIRED.

Brak uprawnień, ograniczony data scope i wygasła sesja.

Zmiana definicji KPI, konflikt źródeł i manual review.

AI: loading, streaming, ready, low confidence, refusal, unavailable, approval required i action failed.

## Mock data

Fixture zawiera workspace, dataset, KPI, readiness, quality issues, freshness, lineage i permissions.

Mocki nie zawierają prawdziwych danych klientów ani sekretów.

Fixtures są wersjonowane i mapowane do acceptance testów.

## Kontrakt scenariusza

Scenario ID, komponent/proces, preconditions, role/capabilities, data state, expected content, allowed actions, inaccessible behavior, audit i priority.

## MVP

Pełne pokrycie Command Center, integracji, data quality, KPI, insightu, odpowiedzi AI i approval/refusal.

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
