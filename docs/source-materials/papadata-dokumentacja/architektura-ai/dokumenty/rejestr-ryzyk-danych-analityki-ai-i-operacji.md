# Rejestr ryzyk danych analityki AI i operacji

Rejestr ryzyk danych, analityki, AI i operacji

AI-18
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-18
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

Zarządzać ryzykami poprzez właściciela, dowód kontroli, termin przeglądu i bramę release.

## Metoda

Wpływ, prawdopodobieństwo, wykrywalność, exposure, kontrola prewencyjna/detekcyjna, plan reakcji, owner, due date, evidence i residual risk.

Ryzyko P0 bez zaakceptowanej kontroli blokuje pilot.

## Kategorie

Dane i integracje; jakość i lineage; KPI; tenant/security/privacy; AI/model/prompt; operacje; koszty; compliance.

## Rejestr ryzyk

Tabela:
- Wiersz 1: ID; Ryzyko; Wpływ; Prawd.; Skutek; Kontrola; Priorytet
- Wiersz 2: R-01; Niejednoznaczny MVP; wysoki; wysokie; blokada kontraktów; zatwierdzić pion/provider; P0
- Wiersz 3: R-02; Fałszywa gotowość; wysoki; wysokie; błędne KPI; wielowymiarowy readiness; P0
- Wiersz 4: R-03; Cross-tenant leakage; krytyczny; średnie; incydent; server auth i testy; P0
- Wiersz 5: R-04; Niespójne KPI; wysoki; wysokie; utrata zaufania; versioned catalog; P0
- Wiersz 6: R-05; AI bez evidence; wysoki; średnie; błędne decyzje; structured response/refusal; P0
- Wiersz 7: R-06; Brak restore evidence; krytyczny; średnie; utrata danych; restore test i RTO/RPO; P0
- Wiersz 8: R-07; Koszt manualny; średni; wysokie; niska marża; pomiar COGS; MVP
- Wiersz 9: R-08; Częściowe okresy; średni; wysokie; mylące trendy; completeness gate; MVP

## Luki

Brak formalnych ownerów ryzyk i dowodów z testów restore, izolacji, usuwania danych oraz AI evals.

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
