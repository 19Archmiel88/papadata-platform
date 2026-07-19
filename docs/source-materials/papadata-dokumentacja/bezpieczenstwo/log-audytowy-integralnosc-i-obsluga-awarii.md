# Log audytowy integralność i obsługa awarii

PAPADATA | SEC-11 | Audit log, integralność i obsługa awarii

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Audit log, integralność i obsługa awarii

Append-only, tamper detection, niezależny backup, durable buffer i fail-closed

Kod dokumentu

## SEC-11

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

PAPADATA | SEC-11 | Audit log, integralność i obsługa awarii

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

Zasady

Fakt potwierdzony: Audit log jest podstawową funkcją MVP, odrębną od logów technicznych i obejmuje człowieka,

system, AI oraz Support.



Rekordów audytowych nie można edytować ani usuwać przez standardowe API aplikacji.



Dostęp do audytu wymaga osobnych capabilities i jest sam audytowany.



Audit zawiera minimalny diff lub hash, nie pełne sekrety i payloady.

Schemat AuditEvent

Pole

Wymaganie

eventId

Globalnie unikalny identyfikator

sequence/partition

Kolejność w logicznej partycji

timestamp/ingestedAt

Czas zdarzenia i utrwalenia

tenantId/workspaceId

Jawny scope

actorType/actorId

user, service, AI, support; stabilny identyfikator

impersonatedIdentity

Obowiązkowe dla impersonation

sessionId/authStrength

Sesja i siła uwierzytelnienia

actionCode

Stabilny, wersjonowany kod

targetType/targetId

Zasób działania

decision/result

allow/deny/success/failure/partial

beforeHash/afterHash

Minimalny diff lub hash

reason/rationale/ticket

Cel i uzasadnienie

PAPADATA | SEC-11 | Audit log, integralność i obsługa awarii

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Pole

Wymaganie

correlationId/causationId

Powiązanie request-job-event

policy/rule/model/prompt versions

Wersje decyzji i AI

riskClass/approvalIds

Klasa i zgody

dataClassification

Klasyfikacja dotkniętych danych

prevHash/eventHash

Łańcuch integralności

retentionClass

Klasa retencji

Integralność i wykrywanie manipulacji



Append-only storage i brak uprawnień UPDATE/DELETE dla aplikacji.



Hash chaining w partycjach o zdefiniowanej kolejności.



Okresowe podpisane checkpointy integralności.



Niezależny backup eventów i checkpointów.



Alarm przy luce w sequence, zmianie hash, opóźnieniu lub niezgodnej liczbie eventów.



Reconciliation między operacjami domenowymi a audit events.

Awaria audit logu

Typ operacji

Zachowanie

R3/R4 oraz operacje administracyjne krytyczne

Fail-closed po braku trwałego audit intent

Eksport high-risk

Fail-closed przed generowaniem lub wydaniem pliku

Support JIT/impersonation

Fail-closed

Zmiana roli/polityki

Fail-closed

Operacja R0/R1

Dopuszczalny durable buffer z gwarancją dostarczenia i

monitoringiem

Odczyty masowe

Agregowany audit/telemetria zgodnie z polityką, bez utraty zdarzeń

krytycznych

Durable buffer



Trwały przed potwierdzeniem operacji.



Zachowuje eventId, sequence, correlation i hash.



Retry z idempotentnym zapisaniem logicznym dokładnie raz.



Alert dla wieku najstarszego eventu i rozmiaru backlogu.



Brak eventu po terminie SLA powoduje incident.

Katalog zdarzeń krytycznych

Domena

Zdarzenia

Identity

login, MFA, recovery, token reuse, session revoke

PAPADATA | SEC-11 | Audit log, integralność i obsługa awarii

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Domena

Zdarzenia

## IAM

invitation, membership, role, capability, policy

Integrations

connect, scope, credential, sync, replay, disconnect

## AI

analysis, block, model/prompt change, action proposal i execution

Exports

request, approval, generation, download, revoke, expiry

Sharing

grant, open, deny, revoke, usage limit

Support

JIT request, approval, start, impersonation, revoke, expire

Data lifecycle

export request, delete, legal hold, restore, deletion replay

Billing

plan, payment, invoice, cancellation

Security

kill switch, incident, risk acceptance, audit export

Dostęp, wyszukiwanie i eksport



Filtry są ograniczone do zakresu tenanta i workspace zgodnie z rolą.



Eksport audytu wymaga audit.export, reauth i może wymagać approval.



Wynik eksportu podlega SEC-09 i ma własny audit.



Dane wrażliwe w audit UI są maskowane; dostęp do pełnych wartości wymaga dodatkowej capability lub jest

zabroniony.

Kryteria QA



Próba zmiany lub usunięcia eventu jest niemożliwa dla aplikacji.



Manipulacja rekordem lub luka sequence generuje alert.



Operacja R3 nie wykonuje się bez audit intent.



Event z durable buffer trafia do głównego storage z zachowaniem kolejności.



Impersonation zapisuje support actor i impersonated identity.



Audit export nie zawiera sekretów ani niedozwolonych danych.



Restore audit storage zachowuje integralność i checkpointy.

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
