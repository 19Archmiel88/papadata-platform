# Rejestr ryzyk bezpieczeństwa

PAPADATA | SEC-17 | Rejestr ryzyk bezpieczeństwa

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

1

## PAPADATA

Rejestr ryzyk bezpieczeństwa

Wpływ, prawdopodobieństwo, priorytet, kontrola i blocker MVP

Kod dokumentu

## SEC-17

Wersja

1.0

Status

Accepted - architektura docelowa; wymagane dowody wdrożenia

Data obowiązywania

## 18 lipca 2026

Właściciel

Artur Wiśniewski

Zakres

PapaData MVP - pełna funkcjonalność, ograniczona liczba integracji

Klasyfikacja

Wewnętrzna / projektowa

Zasada interpretacji: dokument ustanawia wymagania i kryteria akceptacji. Sam dokument nie potwierdza implementacji, konfiguracji ani pozytywnego wyniku

testów.

PAPADATA | SEC-17 | Rejestr ryzyk bezpieczeństwa

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

2

Podstawa i hierarchia źródeł

Dokument należy interpretować łącznie z centralnym rejestrem decyzji PapaData, kontraktem danych i KPI, dokumentacją integracji, dokumentem bezpieczeństwa i AI

Governance, architekturą techniczną oraz specyfikacjami UI/UX.

Kod

Źródło prawdy

## D2

Status, wersja i obowiązywanie decyzji

## D3

Semantyka danych, canonicalization, readiness i KPI

## D4

Providerzy, connection, synchronizacja, retry i recovery

## D7

Bezpieczeństwo, prywatność, ciągłość i AI Governance

## A01-A15

Architektura techniczna, API, role, AI, macierze i plan wdrożenia

## M01-M15

Ekrany, flow, stany UI, formularze i Storybook

Korekta MVP 2026-07-18

Pełna funkcjonalność w ograniczonym katalogu integracji i wariantów

Fakt potwierdzony: Wszystkie decyzje skorygowanego modelu MVP mają status Accepted i obowiązują od MVP.

Ograniczenie: Dokumentacja nie jest dowodem wdrożenia. Każda kontrola wymaga osobnego dowodu technicznego i testowego.

## ID

Ryzyko

Wpływ

Prawdop.

Priorytet

Działanie

Blokuje MVP

## RSK-001

Dostęp cross-workspace

Krytyczny

Wysokie

## P0

PEP, DB scope, testy IDOR

Tak

## RSK-002

Nieaktualna sesja po zmianie

uprawnień

Wysoki

Średnie

## P0

session revoke i membership

version

Tak

## RSK-003

Refresh token reuse

Wysoki

Średnie

## P0

rotation, family revoke, alert

Tak

## RSK-004

Przejęcie zaproszenia

Wysoki

Średnie

## P0

one-time, email binding, expiry

Tak

## RSK-005

Usunięcie ostatniego Ownera

Wysoki

Średnie

## P0

last-owner guard i transfer

Tak

## RSK-006

Entitlement użyty jako

permission

Wysoki

Średnie

## P0

oddzielna policy capability

Tak

## RSK-007

Wyciek sekretów integracji

Krytyczny

Średnie

## P0

Secret Store, masking,

rotation

Tak

## RSK-008

Webhook spoof/replay

Wysoki

Średnie

## P0

signature, timestamp, dedupe

Tak

## RSK-009

Duplicate sync/action

Wysoki

Średnie

## P0

idempotency, checkpoint,

reconciliation

Tak

PAPADATA | SEC-17 | Rejestr ryzyk bezpieczeństwa

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

3

## ID

Ryzyko

Wpływ

Prawdop.

Priorytet

Działanie

Blokuje MVP

## RSK-010

Nadmierne scopes providera

Wysoki

Średnie

## P0

minimal scopes, versioning,

diff

Tak

## RSK-011

AI cross-workspace retrieval

Krytyczny

Średnie

## P0

policy before retrieval i eval

Tak

## RSK-012

Prompt injection

Wysoki

Wysokie

## P0

instruction/data separation,

allowlist

Tak dla AI

## RSK-013

AI hallucination bez evidence

Wysoki

Średnie

## P0

structured output, validator,

refusal

Tak dla AI

## RSK-014

AI excessive agency

Krytyczny

Średnie

## P0

Action Service i risk approvals

Tak

## RSK-015

Błędna klasyfikacja risk action

Wysoki

Średnie

## P0

versioned risk policy i review

Tak

## RSK-016

Approval po zmianie targetu

Wysoki

Średnie

## P0

targetHash, expiry,

revalidation

Tak

## RSK-017

Partial failure powiela skutki

Wysoki

Średnie

## P0

per-item idempotency i

reconciliation

Tak

## RSK-018

Rollback powoduje dalszą

szkodę

Wysoki

Niskie/Średnie

## P0

testowana kompensacja i

policy

Dla action

## RSK-019

Eksport poza data scope

Krytyczny

Średnie

## P0

frozen query, PEP, review

Tak

## RSK-020

URL eksportu po revoke

Wysoki

Średnie

## P0

short URL, download recheck

Tak

## RSK-021

Wycieki przez external share

Krytyczny

Średnie

## P0

ReportGrant, expiry, recipient

binding

Tak

## RSK-022

Token share w bazie/logu

Wysoki

Średnie

## P0

hash tokenu, redaction

Tak

## RSK-023

Grant nadal działa po zmianie

raportu

Wysoki

Średnie

## P0

invalidation/policy recheck

Tak

## RSK-024

Manipulacja audit logiem

Krytyczny

Niskie/Średnie

## P0

append-only, hash chain,

checkpoint

Tak

## RSK-025

Utrata eventów audytowych

Wysoki

Średnie

## P0

durable buffer, reconciliation

Tak

## RSK-026

Fail-open przy awarii audytu

Krytyczny

Średnie

## P0

fail-closed dla R3/R4

Tak

## RSK-027

Nadużycie Supportu

Krytyczny

Średnie

## P0

JIT, purpose, expiry, audit

Tak

## RSK-028

Niejawne impersonation

Wysoki

Średnie

## P0

oznaczenie i actor chain

Tak

## RSK-029

Restore przywraca usunięte

dane

Krytyczny

Średnie

## P0

deletion ledger replay

Tak

PAPADATA | SEC-17 | Rejestr ryzyk bezpieczeństwa

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

4

## ID

Ryzyko

Wpływ

Prawdop.

Priorytet

Działanie

Blokuje MVP

## RSK-030

Niepełne usunięcie danych

AI/provider

Wysoki

Średnie

## P0

inventory i provider deletion

Tak

## RSK-031

Legal hold blokuje nadmiar

danych

Średni

Średnie

## P1

precyzyjny scope i review

Nie, jeśli kontrolowane

## RSK-032

Nieograniczony koszt AI

Wysoki

Wysokie

## P0

budżety, limity, kill switch

Tak dla AI

## RSK-033

Model drift

Wysoki

Średnie

## P0

pinned config, evals, canary

Tak dla zmiany modelu

## RSK-034

Jednoosobowe governance

Wysoki

Wysokie

## P1

niezależny review i sign-off

Produkcję

## RSK-035

Brak rzeczywistego restore

test

Krytyczny

Średnie

## P0

cykliczny restore exercise

Tak

## RSK-036

Supply chain compromise

Krytyczny

Niskie/Średnie

## P0

SCA, SBOM, signatures,

protected CI

Tak

## RSK-037

Logi zawierają dane/sekrety

Wysoki

Średnie

## P0

sanitization i tests

Tak

## RSK-038

Brak monitoringu kill switch

Wysoki

Średnie

## P0

health checks i testy

wyłączenia

Tak

Model zarządzania ryzykiem



Każde ryzyko posiada ownera, termin, stan, kontrolę, test i residual risk.



Akceptacja ryzyka P0 wymaga niezależnej weryfikacji i daty wygaśnięcia.



Ryzyko powiązane z funkcją może blokować wyłącznie tę funkcję, jeśli granice i kill switch są skuteczne.



Brak kontroli albo dowodu dla ryzyka krytycznego oznacza brak dopuszczenia do danych produkcyjnych.

Zasady zarządzania dokumentem



Zmiana wymagania bezpieczeństwa wymaga wersji dokumentu, analizy wpływu i aktualizacji powiązanych kontraktów.



Zmiana granicy danych, modelu ról, poziomu ryzyka lub approval wymaga decyzji architektonicznej.



Każde wymaganie P0 musi posiadać właściciela, implementację, test, wynik oraz odwołanie do dowodu.



Wyjątek od wymagania wymaga formalnej akceptacji ryzyka z terminem wygaśnięcia.



Dowody nie mogą być przechowywane wyłącznie w treści tego dokumentu.
