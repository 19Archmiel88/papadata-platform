# Mapa źródeł danych i integracji

Mapa źródeł danych i integracji

AI-02
Wersja 1.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-02
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

Zdefiniować źródła, autorytet, zakres, synchronizację, świeżość, ograniczenia i gotowość operacyjną.

## Katalog źródeł

Tabela:
- Wiersz 1: Domena; Provider; Zakres; Priorytet; Status
- Wiersz 2: D2C; WooCommerce; zamówienia, zwroty, produkty, klienci; MVP-kandydat; potwierdzony katalogowo
- Wiersz 3: D2C; Shopify; zamówienia, zwroty, produkty, klienci; MVP-kandydat; potwierdzony katalogowo
- Wiersz 4: Marketplace; Allegro; zamówienia, opłaty, produkty; Etap 2 / alternatywa; potwierdzony katalogowo
- Wiersz 5: Aggregator; BaseLinker; zamówienia wielokanałowe; Etap 2; potwierdzony katalogowo
- Wiersz 6: Ads; Google Ads; koszt, kampanie, konwersje; Etap 2; potwierdzony katalogowo
- Wiersz 7: Ads; Meta Ads; koszt, kampanie, konwersje; Etap 2; potwierdzony katalogowo
- Wiersz 8: Traffic; GA4; sesje, źródła, lejek; Etap 2; potwierdzony katalogowo

## Stany integracji

Oddzielić status katalogowy, adaptera, środowiska, połączenia, synchronizacji, danych, KPI i gotowości operacyjnej.

CONNECTED nie oznacza kompletności danych ani gotowości KPI.

## Rekomendowany rejestr

Source ID, workspace, provider, environment, owner, obiekty, auth, harmonogram, checkpoint, SLA, runtime, data status, KPI status, retencja i klasyfikacja.

## Luki

Brak zatwierdzonych mapowań pól i realnych SLA/limitów API.

Brak source authority dla konfliktów sklep-marketplace-agregator.

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
