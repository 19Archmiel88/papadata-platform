# Katalog stanów danych integracji KPI i AI

Katalog stanów danych, integracji, KPI i AI

AI-09
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-09
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

Ujednolicić semantykę stanów w API, backendzie, analityce, AI i Storybooku.

## Zasady

Stan jest określany osobno dla connection, sync job, dataset, KPI, insight i AI run.

READY dotyczy konkretnego celu i wersji, nie jest globalnym certyfikatem.

Każda zmiana stanu ma przyczynę, timestamp, actor/system, policy version i audit event.

## Przejścia krytyczne

NO_DATA -> INGESTING -> PROCESSING -> READY.

Każdy stan może przejść do PARTIAL, DELAYED, INVALID lub BLOCKED.

READY -> RESYNC_REQUIRED po zmianie mapowania, zakresu, polityki lub utracie checkpointu.

AI READY tylko gdy KPI i evidence pack są gotowe i dostępne dla użytkownika.

## Katalog stanów

Tabela:
- Wiersz 1: Stan; Znaczenie; Zachowanie produktu; Priorytet
- Wiersz 2: NO_DATA; Brak danych; Nie pokazuj 0; wskaż brak źródła; MVP
- Wiersz 3: INGESTING; Pierwsze pobieranie; Pokaż proces i oczekiwany zakres; MVP
- Wiersz 4: PARTIAL; Dane niekompletne; Pokaż braki i wpływ; MVP
- Wiersz 5: DELAYED; Świeżość poza SLA; Ostrzeżenie i ostatni sukces; MVP
- Wiersz 6: INVALID; Błąd krytyczny; Zablokuj zależne KPI; MVP
- Wiersz 7: PROCESSING; Transformacja; Nie publikuj wyniku jako finalnego; MVP
- Wiersz 8: READY; Warunki spełnione; Publikacja z lineage; MVP
- Wiersz 9: RESYNC_REQUIRED; Wymagany resync; Akcja administratora i audyt; MVP
- Wiersz 10: BLOCKED; Brak warunku/uprawnienia; Pokaż ownera i następny krok; MVP
- Wiersz 11: REAUTH_REQUIRED; Token wygasł; Reautoryzacja przez uprawnioną rolę; MVP

## Luki

Brak formalnej tabeli dozwolonych przejść, ownerów, timeoutów i mapowania API/UI.

Brak progów DELAYED i automatycznej eskalacji.

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
