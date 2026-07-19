# Macierz dostępu UI API i operacji

PAPADATA | SEC-03 | Macierz dostępu UI, API i operacji

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

1

## PAPADATA

Macierz dostępu UI, API i operacji

Role, capabilities, data scope, approval, eksport i audyt

Kod dokumentu

## SEC-03

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

PAPADATA | SEC-03 | Macierz dostępu UI, API i operacji

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

Zasady macierzy



Każda wartość ALLOW oznacza wymaganie autoryzacji backendowej, nie wyłącznie widoczność UI.



Dostęp jest dodatkowo ograniczony data scope, statusem zasobu, entitlement i polityką tenanta.



Approval nie zastępuje capability; reauth nie zastępuje membershipu.



Deny jest domyślny dla roli niewymienionej.

Obszar

Odczyt

Modyfikacja

Approval

Usunięcie

Eksport

Udostępnianie

Brak dostępu

Dashboard

## O,A,AN,M,V

## A,AN

wg akcji

-

export.aggregate

share przez raport

## B,OPS

Analityka/KPI

## O,A,AN,M,V

## AN

override/akcja

-

aggregate/detail

raport

## B,OPS

Integracje

O,A; AN status

## O,A

scope/disconnect

## O,A

konfiguracja bez sekretów

-

## V,B

AI Assistant

O,A,AN,M,V wg policy

konfiguracja A

actions

historia wg retencji

analiza/raport

kontrolowany raport

## B,OPS

AI Actions

O,A,AN,M wg capability

propose

risk-based

cancel

evidence

-

## V,B

Raporty

O,A,AN,M,V wg grant

autor/A

publikacja high-risk

autor/A

report export

internal/external

## B,OPS

Eksporty

własne + admin/auditor

create

high-risk

cancel/revoke

download po recheck

-

bez capability

PAPADATA | SEC-03 | Macierz dostępu UI, API i operacji

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

3

Obszar

Odczyt

Modyfikacja

Approval

Usunięcie

Eksport

Udostępnianie

Brak dostępu

Użytkownicy

## O,A,AUD

## O,A

privileged

remove

audit only

-

## AN,M,V,B

Role/capabilities

## O,A,AUD

O,A scope

privileged

deactivate

audit evidence

-

## AN,M,V,B

Workspace settings

## O,A

## O,A

critical changes

deactivate

config export

-

## AN,M,V,B

Billing

## O,B

## O,B

cancel/ownership

-

invoices

imienne

## AN,M,V,OPS

Audit log

O,AUD; A z cap.

-

-

-

restricted

-

## AN,M,V,B

Zaproszenia

## O,A,AUD

## O,A

privileged role

revoke

audit only

-

## AN,M,V,B

Security policy

O,AUD read

O/security admin

fresh MFA

-

evidence

-

pozostali

Support JIT

## O,A,AUD

request/approve

wg policy

revoke

evidence

-

bez JIT

Retencja/usuwanie

## O,AUD

O/lifecycle admin

legal hold/high impact

execute

deletion report

-

pozostali

Macierz ekran - capability - API - audit

Ekran/flow

Capability

## API

Audit event

Stany krytyczne

App shell

workspace.read

GET /session-context

## SESSION_CONTEXT_ACCESSED;

## WORKSPACE_SWITCHED

forbidden, expired, suspended

Dashboard

metric.read

GET /workspaces/{id}/overview

DASHBOARD_VIEWED (opcjonalnie

agregowane)

partial, stale, no_data

KPI detail

metric.read + data scope

GET /metrics/{code}

## METRIC_EVIDENCE_OPENED

definition_changed, forbidden

Integrations catalog

integration.read/connect

GET /providers; POST /connections

## INTEGRATION_CONNECT_STARTED

provider_disabled

Connection detail

integration.manage

GET/PATCH /connections/{id}

## INTEGRATION_SCOPE_CHANGED

reauth, limited

Sync history

integration.sync

POST /sync-jobs; GET /operations

## SYNC_STARTED/RETRIED

DLQ, rate_limit

AI assistant

ai.use

POST /assistant/analyses

## AI_ANALYSIS_REQUESTED/

## COMPLETED

blocked, insufficient

AI action review

ai.action.propose/action.approve

POST /actions/{id}/approvals

## ACTION_APPROVED/REJECTED

expired, target_changed

Export history

export.*

POST/GET /exports

## EXPORT_REQUESTED/DOWNLOADED

awaiting_approval, expired

Report sharing

report.share.*

POST /reports/{id}/grants

## REPORT_SHARED/OPENED/REVOKED

email_mismatch, usage_limit

PAPADATA | SEC-03 | Macierz dostępu UI, API i operacji

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

4

Ekran/flow

Capability

## API

Audit event

Stany krytyczne

Users

membership.manage

GET/POST/PATCH /memberships

## MEMBERSHIP_CHANGED

last_owner, conflict

Roles

role.assign/capability.assign

GET/PATCH /roles

## ROLE_ASSIGNMENT_CHANGED

fresh_mfa_required

Sessions

security.manage_sessions

GET/DELETE /sessions

## SESSION_REVOKED

current_session

Audit

audit.read/export

GET /audit-events

## AUDIT_VIEWED/EXPORTED

restricted_filter

Support JIT

support.jit.*

POST /support-access

## SUPPORT_JIT_*

expired, no_approver

Retention

data.lifecycle.*

POST /deletion-requests

## DELETION_*

legal_hold, dependency

Reguły potwierdzeń

Klasa ryzyka

Potwierdzenie

Reauth

Approval

Dual approval

## R0

nie

nie

nie

nie

## R1

tak

nie

nie

nie

## R2

tak

tak

nie lub wg policy

nie

## R3

tak

tak

tak

opcjonalnie wg policy

## R4

tak

tak

tak

tak albo blokada

Obowiązkowe deny tests

Test

Oczekiwany wynik

Cross-workspace IDOR

Prawidłowy ID obcego workspace nie zwraca danych

Role-only bypass

Zmiana roli w tokenie klienta nie nadaje capability

Entitlement bypass

Plan produktu nie nadaje dostępu do danych

Approval bypass

Approval bez aktualnej capability jest nieważny

Stale session

Odebranie membershipu blokuje następną operację

Export URL reuse

URL nie działa po expiry, revoke lub utracie capability

PAPADATA | SEC-03 | Macierz dostępu UI, API i operacji

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

5

Test

Oczekiwany wynik

External share enumeration

Nie ujawnia istnienia raportu ani odbiorcy

AI tool bypass

Prompt nie może wymusić niedozwolonego tool call

Support outside grant

JIT token nie działa poza workspace, czasem i zakresem

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
