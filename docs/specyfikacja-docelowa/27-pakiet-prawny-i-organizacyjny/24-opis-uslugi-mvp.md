---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-024
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Opis usługi i pełnego zakresu MVP

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Zasada nadrzędna

MVP obejmuje całą aplikację, wszystkie moduły, wszystkie usługi i wszystkie procesy end-to-end opisane w specyfikacji. Jedynym ograniczeniem funkcjonalnym jest katalog aktywnych integracji. Funkcja w MVP nie może być atrapą, martwym ekranem ani przyciskiem bez działania.

## 2. Integracje MVP

WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads i Google Analytics 4. Każda posiada auth/scopes, connect, initial/incremental sync, backfill, webhooki gdy wspierane, checkpointy, idempotencję, retry, rate limits, reconnect, disconnect, monitoring, audyt, recovery, runbook i testy.

## 3. Moduły

Auth i onboarding; AppShell; Centrum Dowodzenia; kampanie; zamówienia; produkty; klienci; ruch i lejek; jakość danych; integracje; pełny katalog 58 metryk i Metric Engine; raporty; Papa Asystent i Laboratorium AI; AI Actions; ustawienia, role i bezpieczeństwo; billing; faktury/KSeF; pomoc; aplikacja mobilna.

## 4. Billing MVP

Miesięczny i roczny cykl, karta, BLIK jednorazowy i powtarzalny, szybki i tradycyjny przelew, dostępne portfele providera, self-service, odnowienie, dunning, anulowanie, korekty, faktury i KSeF.

## 5. Stany jakościowe

Każdy proces ma loading, empty/no data, partial, stale, processing, success, validation error, permission denied, provider error, recoverable/terminal error, cancellation i recovery. Brak danych nie jest prezentowany jako zero.

## 6. Środowiska

Ten sam kod i kontrakty działają local, CI, development, staging i production GCP. Lokalnie usługi zarządzane są zastępowane równoważnymi adapterami: PostgreSQL, Redis, MinIO, lokalne kolejki, deterministyczny AI provider, mock GUS, payment i KSeF sandbox.

## 7. Dowód gotowości

Zakres odbioru obejmuje kod, testy unit/integration/E2E, Storybook, monitoring, runbook, security controls i dokumentację.
