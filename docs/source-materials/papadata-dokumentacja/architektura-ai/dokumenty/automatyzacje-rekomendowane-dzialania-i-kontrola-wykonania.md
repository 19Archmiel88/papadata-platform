# Automatyzacje rekomendowane działania i kontrola wykonania

Automatyzacje, rekomendowane działania i kontrola wykonania

AI-15
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-15
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

Zdefiniować automatyzacje operacyjne i biznesowe wraz z triggerami, ograniczeniami, approval, idempotencją i audytem.

## Klasy działań

Informacyjne: alert, podsumowanie, eskalacja.

Operacyjne bezpieczne: issue, retry w polityce, ocena readiness.

Kontrolowane: resync, reautoryzacja, zmiana konfiguracji.

Ryzykowne zewnętrzne: zmiana budżetu, kampanii lub ceny - poza MVP albo z approval.

## Kontrakt działania

Action ID, trigger, preconditions, capability, readiness gates, payload, idempotency key, approval, timeout, retry, rollback, audit i pomiar wyniku.

## Human-in-the-loop

AI przygotowuje draft. Użytkownik widzi zakres, przewidywany skutek, dane, ryzyka i możliwość anulowania. Approval tworzy executable action.

## Katalog automatyzacji

Tabela:
- Wiersz 1: ID; Nazwa; Trigger; Rezultat; Tryb; Priorytet
- Wiersz 2: AUT-01; Alert opóźnienia; DELAYED poza SLA; powiadomienie Owner/Admin; automatyczny; MVP
- Wiersz 3: AUT-02; DataIssue; naruszenie jakości; issue z dowodem i ownerem; automatyczny; MVP
- Wiersz 4: AUT-03; Rekomendacja; zmiana KPI i READY; draft rekomendacji; AI + człowiek; MVP
- Wiersz 5: AUT-04; Reautoryzacja; REAUTH_REQUIRED; zadanie dla Admin; kontrolowany; MVP
- Wiersz 6: AUT-05; Zmiana budżetu; zatwierdzona decyzja; wywołanie API reklamowego; approval; Etap 2
- Wiersz 7: AUT-06; Pełny resync; RESYNC_REQUIRED; idempotentny job; Admin approval; MVP

## Luki

Brak katalogu zewnętrznych write APIs, polityk rollback i decyzji o działaniach etapu 2.

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
