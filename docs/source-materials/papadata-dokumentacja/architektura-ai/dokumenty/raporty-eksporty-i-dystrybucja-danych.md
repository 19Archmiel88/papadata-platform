# Raporty eksporty i dystrybucja danych

Raporty, eksporty i dystrybucja danych

AI-16
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-16
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

Zapewnić raportowanie bez utraty definicji, kontekstu jakości, źródeł i uprawnień.

## Typy raportów

Kondycja biznesu: KPI, porównania, insighty i decyzje.

Jakość danych: readiness, problemy, SLA i naprawy.

Integracje: statusy, synchronizacje, retry i reautoryzacje.

Audyt AI: użycie, odmowy, rekomendacje, approvals i koszty.

Outcomes: decyzje, działania i zmierzony efekt.

## Eksport

CSV/XLSX dla tabel, PDF dla raportu decyzyjnego, API dla integracji.

Każdy eksport zawiera workspace, okres, filtry, timezone, currency, version, generated_at, freshness i quality.

Prawo eksportu jest odrębne od prawa odczytu interaktywnego.

## Dystrybucja

Raport cykliczny działa tylko dla zapisanej, zweryfikowanej konfiguracji.

Odbiorca jest sprawdzany w momencie generacji.

Linki wygasają, a pobrania są audytowane.

## MVP

Ręczny PDF Command Center i CSV wybranych KPI/snapshotów.

Harmonogramy i rozbudowane eksporty w etapie 2.

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
