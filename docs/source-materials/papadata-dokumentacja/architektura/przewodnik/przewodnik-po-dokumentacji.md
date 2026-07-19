# Przewodnik po dokumentacji

PAPADATA

Przewodnik po dokumentacji architektonicznej

Struktura pakietu, źródła prawdy, oznaczenia i sposób użycia

Tabela:
- Wiersz 1: Kod dokumentu; A00
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Umożliwić zespołom korzystanie z jednego spójnego pakietu. [FAKT/ZAKRES]

Zakres: Indeks dokumentów, hierarchia źródeł, klasyfikacja treści i governance zmian. [FAKT/ZAKRES]

Poza zakresem: Nie zastępuje D2, ADR, OpenAPI, runbooków ani dowodów testów. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

## Podstawa źródłowa

Tabela:
- Wiersz 1: Kod; Dokument; Rola w architekturze
- Wiersz 2: D1; Dokumentacja produktu; Nadrzędna dokumentacja biznesowo-produktowa.
- Wiersz 3: D2; Rejestr decyzji i wymagań biznesowych; Jedyne źródło prawdy dla statusu i wersji decyzji.
- Wiersz 4: D3; Kontrakt danych, stanów i KPI; Źródło prawdy dla warstw danych, canonicalization, deduplikacji i readiness.
- Wiersz 5: D4; Integracje i gotowość operacyjna; Źródło prawdy dla providerów, bram, synchronizacji, retry i recovery.
- Wiersz 6: D5; Pierwszy pion produktowy i płatny pilotaż; Proces pierwszej mierzalnej wartości i kryteria pilotażu.
- Wiersz 7: D6; Model komercyjny i unit economics; Plany, limity, koszty, marża i bramy skalowania.
- Wiersz 8: D7; Bezpieczeństwo, Prywatność i AI Governance; Kontrole bezpieczeństwa, prywatności, ciągłości i AI.
- Wiersz 9: M01-M15; Specyfikacje architektury UI/UX; Ekrany, flow, stany, formularze, Storybook i priorytety.

Hierarchia: D2 ustala status decyzji; D3 semantykę danych/KPI; D4 gotowość integracji; D7 bezpieczeństwo i AI. M01-M15 opisują wymagania UI, ale nie dowodzą implementacji. [FAKT]

## Struktura pakietu

Tabela:
- Wiersz 1: Kod; Dokument; Przeznaczenie
- Wiersz 2: A00; Przewodnik; Sposób użycia i governance pakietu
- Wiersz 3: A01; Architektura produktu; Nadrzędna synteza w 15 sekcjach
- Wiersz 4: A02; Mapa domen; Granice odpowiedzialności
- Wiersz 5: A03; Architektura systemu; Moduły i topologia logiczna
- Wiersz 6: A04; Frontend i Storybook; Struktura aplikacji, fixtures, testy UI
- Wiersz 7: A05; Backend i API; Warstwy, komendy, joby i kontrakty
- Wiersz 8: A06; Model danych; Encje i relacje
- Wiersz 9: A07; Dane, jakość i KPI; Pipeline, lineage i readiness
- Wiersz 10: A08; Integracje; Connect, sync, retry i recovery
- Wiersz 11: A09; Identity i uprawnienia; Tenant, membership, capabilities
- Wiersz 12: A10; Bezpieczeństwo; Kontrole, privacy i audyt
- Wiersz 13: A11; AI; Evidence, governance i human oversight
- Wiersz 14: A12; Macierz UI/API; Ekran -> dane -> API -> role
- Wiersz 15: A13; Statusy i zdarzenia; Wspólne kontrakty systemowe
- Wiersz 16: A14; MVP; Zakres, odroczenia i bramy
- Wiersz 17: A15; Implementacja; Testy, CI/CD, operacje i go-live

## Klasyfikacja treści

Tabela:
- Wiersz 1: Oznaczenie; Znaczenie; Sposób użycia
- Wiersz 2: FAKT; Wynika bezpośrednio z materiału źródłowego; Podstawa wymagań; nadal wymaga dowodu wdrożenia
- Wiersz 3: ZAŁOŻENIE; Uzupełnienie niezbędne do spójnego projektu; Musi zostać potwierdzone lub zastąpione decyzją
- Wiersz 4: REKOMENDACJA; Proponowane rozwiązanie; Wymaga ADR/decyzji
- Wiersz 5: LUKA; Brak danych lub niespójność; Owner, warianty, termin bramy
- Wiersz 6: BLOKER; Brak uniemożliwiający bezpieczny krok; Nie wolno obchodzić lokalną implementacją

## Governance zmian

Zmiana kierunku biznesowego lub statusu wymagania trafia do D2.

Zmiana techniczna o długotrwałym wpływie trafia do ADR.

Zmiana definicji danych/KPI wymaga wersji, impact analysis i decyzji o reprocessingu.

Zmiana uprawnień wymaga testów negatywnych i aktualizacji macierzy ról.

Zmiana procesu integracyjnego wymaga statusów, retry, runbooka i stories.

Zmiana AI use case wymaga oceny danych, ryzyka, kosztu, evidence i human oversight.

Status 'wdrożone' wymaga dowodów: testów, logów, konfiguracji i release decision.

## Fakty potwierdzone

[FAKT] PapaData jest projektowana od podstaw jako modułowa platforma analityczno-decyzyjna SaaS dla e-commerce.

[FAKT] Minimalny przepływ wartości to: jedno źródło sprzedażowe -> użyteczny dataset -> wiarygodny KPI -> interpretowalny rezultat.

[FAKT] Połączenie integracji nie jest równoznaczne z gotowością danych, KPI ani produkcji.

[FAKT] Dane źródłowe, znormalizowane, kanoniczne, gotowy dataset i gotowy KPI są odrębnymi poziomami.

[FAKT] Brak danych nie może być interpretowany automatycznie jako zero.

[FAKT] Jeden fakt biznesowy może zasilić KPI tylko raz, niezależnie od liczby źródeł.

[FAKT] Gotowość jest lokalna względem zakresu, okresu, workspace, waluty i definicji.

[FAKT] AI nie jest źródłem prawdy i nie ustanawia kontraktu danych, uprawnień ani gotowości.

[FAKT] Działania AI o istotnym wpływie wymagają zatwierdzenia człowieka i audytu.

[FAKT] Role wpływają na widoczność ekranów, danych, akcji i rekomendacji.

[FAKT] Storybook ma walidować pełne ekrany, flow, role i stany.

[FAKT] Jednoosobowe governance jest przejściowe; obszary wysokiego ryzyka wymagają niezależnej weryfikacji.

## Założenia robocze

[ZAŁOŻENIE] Pierwsze wydanie obsługuje jeden rynek operacyjny, przy zachowaniu pól na walutę i strefę czasową.

[ZAŁOŻENIE] Architektura rozpoczyna się jako modularny monolit z osobnymi workerami; granice domen są egzekwowane w kodzie i danych.

[ZAŁOŻENIE] Warstwa operacyjna i analityczna są rozdzielone logicznie.

[ZAŁOŻENIE] Integracja pilotażowa zostanie wybrana na podstawie danych klienta i dowodów gotowości.

[ZAŁOŻENIE] Frontend korzysta wyłącznie z BFF/API i nie łączy się bezpośrednio z bazą, providerem ani modelem AI.

[ZAŁOŻENIE] Operacje długotrwałe są asynchroniczne i zwracają operationId/jobId.

[ZAŁOŻENIE] Dostawcy chmury, identity, kolejki i modeli AI pozostają decyzjami wdrożeniowymi.

[ZAŁOŻENIE] Dane klientów są izolowane przez tenant/workspace oraz serwerową kontrolę zakresu.

## Zasady rekomendacji

[REKOMENDACJA] Rekomendacja wymaga zatwierdzenia w ADR lub rejestrze decyzji.

[REKOMENDACJA] Każda rekomendacja jest oceniana przez wartość, bezpieczeństwo, koszt utrzymania i testowalność.

[REKOMENDACJA] Złożoność niepotrzebna dla pierwszego przepływu wartości jest odraczana.

[REKOMENDACJA] Operacja krytyczna ma ownera, stan końcowy, audyt i recovery.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
