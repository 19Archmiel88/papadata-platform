# Ograniczenia AI bezpieczeństwo danych uprawnienia i audyt

Ograniczenia AI, bezpieczeństwo danych, uprawnienia i audyt

AI-14
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-14
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

Zapewnić tenant-safe retrieval, kontrolę dostępu, minimalizację danych i pełną rozliczalność AI.

## Model decyzji dostępowej

AccessDecision = Session + AuthStrength + Tenant/Workspace + Membership + Capabilities + DataScope + Entitlements + ResourceState + PolicyVersion.

Autoryzacja jest wykonywana serwerowo przed retrieval i ponownie przed działaniem.

## Kontrole P0

Izolacja tenantów w danych, cache i logach.

MFA dla ról uprzywilejowanych.

JIT access dla operacji wewnętrznych.

Brak sekretów i zbędnych danych osobowych w promptach.

Allowlist narzędzi oraz approval dla działań.

Retencja i usuwanie rozmów/evidence.

Testy prompt injection, exfiltration, cross-tenant i policy bypass.

## Audyt AI

Zapis referencji wejściowych, modelu, prompt template, policy, tools, evidence IDs, output, confidence, refusal, decyzji użytkownika i rezultatu działania.

Możliwość odtworzenia podstawy odpowiedzi bez ujawnienia danych nieuprawnionej osobie.

## Luki

Brak threat modelu, testów cross-tenant, polityki retencji AI, listy dostawców modeli i katalogu approval.

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
