# Rola produktowa asystenta AI

Rola produktowa asystenta AI

AI-11
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-11
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

Asystent AI wspiera analizę, wyjaśnianie, rekomendacje i kontrolowane działania w granicach danych, uprawnień i jakości.

## Dozwolone role

Wyjaśnianie KPI i stanu danych.

Podsumowanie zmian i anomalii z evidence packiem.

Porównanie segmentów lub okresów przy gotowych danych.

Rekomendacje z jawną pewnością.

Projekt decyzji lub działania do zatwierdzenia.

Odmowa przy niewystarczających danych lub uprawnieniach.

## Niedozwolone zachowania

Udawanie pewności lub tworzenie faktów.

Łączenie danych między workspace bez podstawy.

Ujawnianie danych poza capability i data scope.

Analiza danych niedostępnych przez błąd integracji.

Ryzykowne działanie bez approval.

Traktowanie danych atrybucyjnych jako transakcyjnych.

## Architektura odpowiedzi

Policy check -> readiness -> retrieval -> evidence -> analysis -> structured response -> human decision -> approved action -> audit.

AIRun zapisuje workspace, user, capability, data scope, input refs, model, prompt, policy, evidence, output, confidence, latency, cost i decyzję.

## MVP

Interpretacja 4 KPI, readiness, 1-3 insighty, rekomendacja i odmowa.

Bez autonomicznych zmian kampanii, budżetów lub konfiguracji.

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
