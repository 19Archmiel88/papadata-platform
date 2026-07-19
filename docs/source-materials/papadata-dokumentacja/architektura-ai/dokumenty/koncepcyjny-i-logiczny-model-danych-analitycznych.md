# Koncepcyjny i logiczny model danych analitycznych

Koncepcyjny i logiczny model danych analitycznych

AI-04
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-04
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

Zdefiniować jednostki, relacje, granice tenantów, warstwy i wersjonowanie.

## Warstwy

Source: rekordy niezmienione z czasem pobrania i identyfikatorem źródła.

Normalized: ujednolicony schemat niezależny od providera.

Canonical: rekord po deduplikacji, source authority i rozstrzygnięciu konfliktów.

Analytical datasets: widoki pod konkretne pytania i KPI.

Metric snapshots: wersjonowane wyniki z kontekstem obliczenia.

Decision layer: insighty, rekomendacje, decyzje, działania i wyniki.

## Jednostki

Tenant, Workspace, User, Membership, Role, Capability, Provider, Connection, SyncJob, Checkpoint, SourceRecord, CanonicalOrder, OrderLine, Product, CustomerRef, Dataset, ReadinessAssessment, DataIssue, MetricDefinition, MetricSnapshot, Insight, Recommendation, Decision, Action, Outcome, AIThread, AIRun, AuditEvent.

## Reguły modelowania

Każda encja tenantowa ma tenantId. Każda encja należąca do workspace ma tenantId i workspaceId; dziedziczenie zakresu może być pomocnicze, ale nie zastępuje jawnych identyfikatorów w kontraktach zasobów.

External ID zawsze występuje z provider_id i connection_id.

Mapowania, reguły jakości, KPI i modele AI są wersjonowane.

Reprocessing nie usuwa śladu poprzednich wyników.

## Minimalny model MVP

Workspace, Membership, Provider, Connection, SyncJob, SourceOrder, NormalizedOrder, CanonicalOrder, DataIssue, DatasetReadiness, MetricDefinition, MetricSnapshot, Insight, Recommendation, Decision, AuditEvent.

## Luki

Brak słownika statusów zamówień/zwrotów, reguł overlap i decyzji walutowych.

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
