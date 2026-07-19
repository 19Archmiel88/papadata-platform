# Retencja usuwanie danych i rejestr usunięć

PAPADATA | SEC-13 | Retencja, usuwanie danych i deletion ledger

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Retencja, usuwanie danych i deletion

ledger

Baza, pliki, cache, indeksy, kolejki, eksporty, backupy, AI, providerzy i sekrety

Kod dokumentu

## SEC-13

Wersja

1.0

Status

Accepted - architektura docelowa; wymagane dowody

wdrożenia

Data obowiązywania

## 18 lipca 2026

Właściciel

Artur Wiśniewski

Zakres

PapaData MVP - pełna funkcjonalność, ograniczona liczba

integracji

Klasyfikacja

Wewnętrzna / projektowa

Zasada interpretacji: dokument ustanawia wymagania i kryteria akceptacji. Sam dokument nie potwierdza

implementacji, konfiguracji ani pozytywnego wyniku testów.

PAPADATA | SEC-13 | Retencja, usuwanie danych i deletion ledger

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

2

Podstawa i hierarchia źródeł

Dokument należy interpretować łącznie z centralnym rejestrem decyzji PapaData, kontraktem danych i KPI,

dokumentacją integracji, dokumentem bezpieczeństwa i AI Governance, architekturą techniczną oraz specyfikacjami

## UI/UX.

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

Ograniczenie: Dokumentacja nie jest dowodem wdrożenia. Każda kontrola wymaga osobnego dowodu

technicznego i testowego.

Zakres

Fakt potwierdzony: Klasy retencji i deletion ledger obowiązują od MVP i obejmują wszystkie warstwy oraz

dostawców.

Data inventory

Pole

Wymaganie

Data category/classification

Rodzaj i wrażliwość danych

Source/purpose

Źródło i zatwierdzony cel

Tenant/workspace

Zakres właściciela danych

System/location

DB, storage, cache, index, queue, provider

Recipients/subprocessors

Komu dane są przekazywane

Retention class

Okres i trigger

Deletion method

Sposób usunięcia lub anonimizacji

Legal hold

Podstawa, zakres i termin przeglądu

Evidence owner

Kto odpowiada za dowód wykonania

PAPADATA | SEC-13 | Retencja, usuwanie danych i deletion ledger

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Przykładowe klasy retencji do zatwierdzenia

Klasa

Przeznaczenie

Parametr wykonawczy

## R-TRANSIENT

Dane tymczasowe, cache, upload staging

Krótki okres godzin/dni

## R-EXPORT

Wygenerowane pliki eksportów

Zależny od klasy ryzyka

## R-AI

Prompt, output, embeddings i evidence

Osobny okres i provider deletion

## R-BUSINESS

Dane kanoniczne i raporty

Umowa i cel biznesowy

## R-AUDIT

Zdarzenia audytowe

Dłuższy okres i integralność

## R-BACKUP

Kopie zapasowe

Rotacja i deletion replay

## R-SECURITY

Incydenty i dowody bezpieczeństwa

Zależny od wymogów i ryzyka

Deletion ledger

Deletion ledger jest trwałym rejestrem obiektów lub zakresów, które muszą pozostać usunięte także po restore starszego

backupu.

Pole

Wymaganie

deletionId

Stabilny identyfikator

scope

tenant/workspace/zasób/data subject

requestedAt/effectiveAt

Czas żądania i obowiązywania

reason/legalBasis

Cel i podstawa

systems

Lista warstw i dostawców

status per system

## PENDING, RUNNING, VERIFIED, FAILED

backupCutoff

Backupy wymagające replay usunięcia

evidence

Hash/raport bez danych usuniętych

legalHold

Jawna blokada i zakres

Warstwy objęte usunięciem

Warstwa

Zakres

Baza danych

rekordy, projekcje, tabele pomocnicze, soft-delete queues

Pliki

source, reports, exports, attachments, temporary files

Cache

server, CDN, browser invalidation where applicable

Indeksy

search, vector, analytics materializations

Kolejki

pending messages, DLQ, replay stores

Logi

minimalizacja/redakcja; audyt może zachować metadane zgodnie z

policy

PAPADATA | SEC-13 | Retencja, usuwanie danych i deletion ledger

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Warstwa

Zakres

Eksporty

pliki, metadata, signed URLs i historia zgodnie z retencją

Backupy

deletion ledger i kontrolowane wygaśnięcie

## AI

prompts, outputs, memory, embeddings, caches, provider data

Providerzy

dane zewnętrzne przechowywane na zlecenie PapaData

Sekrety

credential versions, tokens, webhook secrets i kopie

Proces usunięcia

1.

Zweryfikuj tożsamość, capability, reauth i legal hold.

2.

Zamroź scope i utwórz deletion ledger.

3.

Zidentyfikuj zależności oraz aktywne joby, eksporty, granty i integracje.

4.

Zablokuj nowe zapisy do usuwanego zakresu.

5.

Wykonaj usunięcie w systemach podstawowych i zależnych.

6.

Cofnij credentials i granty.

7.

Zapisz wynik per system oraz retry dla błędów.

8.

Zweryfikuj brak danych i przygotuj raport bez ujawniania treści.

9.

Po restore ponownie zastosuj deletion ledger przed otwarciem środowiska.

Backup i restore



Backup nie jest dowodem odtwarzalności; wymagany jest rzeczywisty test restore.



Restore odbywa się w izolowanym środowisku do czasu reapplication deletion ledger.



RTO/RPO są parametrami warunkowymi do zatwierdzenia na podstawie testów.



Raport restore wskazuje zakres, czas, utracone okno, błędy i wynik usunięć.

Audit

Event

Dane

## DELETION_REQUESTED

scope, requester, purpose, classification

## DELETION_APPROVED/BLOCKED

approval/legal hold, reason

## DELETION_STARTED/SYSTEM_COMPLETED/SYSTEM_FAILED

system, counts, evidence ref

## DELETION_VERIFIED

verification method, report hash

## DELETION_REPLAYED_AFTER_RESTORE

backup, ledger range, result

## RETENTION_POLICY_CHANGED

before/after, owner, effective date

## QA



Usunięcie obejmuje DB, storage, cache, index, queue i eksport.



Provider AI/integracji otrzymuje wymagane żądanie usunięcia.



Restore nie przywraca dostępnych danych z deletion ledger.



Legal hold blokuje wyłącznie właściwy zakres i jest audytowany.



Błąd jednego systemu pozostawia proces w FAILED/PARTIAL, nie w SUCCESS.



Raport usunięcia nie zawiera usuniętych danych.

PAPADATA | SEC-13 | Retencja, usuwanie danych i deletion ledger

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

5

Zasady zarządzania dokumentem



Zmiana wymagania bezpieczeństwa wymaga wersji dokumentu, analizy wpływu i aktualizacji powiązanych

kontraktów.



Zmiana granicy danych, modelu ról, poziomu ryzyka lub approval wymaga decyzji architektonicznej.



Każde wymaganie P0 musi posiadać właściciela, implementację, test, wynik oraz odwołanie do dowodu.



Wyjątek od wymagania wymaga formalnej akceptacji ryzyka z terminem wygaśnięcia.



Dowody nie mogą być przechowywane wyłącznie w treści tego dokumentu.
