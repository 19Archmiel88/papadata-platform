# Wymagania bezpieczeństwa backendu i API

PAPADATA | SEC-14 | Wymagania bezpieczeństwa backendu i API

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Wymagania bezpieczeństwa backendu i API

Policy Enforcement Point, kontrakty, joby, idempotencja, błędy i audyt

Kod dokumentu

## SEC-14

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

PAPADATA | SEC-14 | Wymagania bezpieczeństwa backendu i API

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

Zasady warstw

Warstwa

Odpowiedzialność

Nie może

Transport/BFF

Auth context, validation, DTO, rate limit

Zawierać reguł domenowych ani ufać

workspace z klienta

Application

Orkiestracja use case, transaction, policy,

audit

Omijać Policy Enforcement Point

Domain

Inwarianty, state transitions, risk semantics

Zależeć od frameworka, providera lub UI

Infrastructure

DB, queue, secrets, storage, external clients

Przeciekać typami vendorów do domeny

Projection

Read models dla ekranów

Być źródłem prawdy dla mutacji

Worker

Joby, checkpoint, progress, retry

Omijać policy, scope, approval i audit

Policy Enforcement Point



Jedna współdzielona biblioteka lub usługa oceniająca AccessDecision.



Każda komenda, query, job, export, share, AI retrieval i tool call korzysta z tego samego kontraktu.



Decyzja zwraca allow/deny, reasonCode, effectiveScope, obligations, riskClass i policyVersion.



Obligations mogą obejmować reauth, approval, masking, rate limit, watermark lub audit fail-closed.

Standard żądania i odpowiedzi

Element

Wymaganie

CorrelationId

Generowany lub walidowany na wejściu, zwracany klientowi

PAPADATA | SEC-14 | Wymagania bezpieczeństwa backendu i API

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Element

Wymaganie

SessionContext

Tożsamość, tenant, workspace, membership i siła uwierzytelnienia

ExpectedVersion/ETag

Obowiązkowe dla mutacji konkurencyjnych

Idempotency-Key

Obowiązkowe dla jobów, eksportów i działań zewnętrznych

Response metadata

workspaceId, contractVersion, readiness, limitations

Error

code, safe message, impact, nextActions, retryable, correlationId

Pagination

Cursor i stabilne sortowanie; bez zgadywalnych offsetów przy

wrażliwych danych

Walidacja komendy

1.

Sesja i aktualna siła uwierzytelnienia.

2.

Tenant i workspace status.

3.

Membership, capability i data scope.

4.

Entitlement i limity.

5.

Stan zasobu, expectedVersion i zależności.

6.

Risk class, reauth i approval.

7.

Idempotency fingerprint.

8.

Audit intent i correlation.

Joby i asynchroniczność

Pole

Wymaganie

jobId/operationId

Stabilny identyfikator

tenantId/workspaceId

Obowiązkowy scope

actor/policy snapshot

Kto zainicjował i na jakiej podstawie

type/version

Wersjonowany kontrakt

inputRef

Minimalny payload; brak sekretów i zbędnych danych

status

## QUEUED/RUNNING/RETRY_WAIT/SUCCEEDED/PARTIAL/

## FAILED/CANCELLED/DLQ

checkpoint/progress

Wznowienie i prezentacja UI

attempt/maxAttempts

Ograniczony retry budget

errorClass/retryable

Jawna decyzja retry

resultRef

Odwołanie do wyniku objęte autoryzacją

Transactional outbox i eventy



Write model i outbox event są zapisywane w jednej transakcji.



Event zawiera minimalne dane i nie zawiera sekretów.



Consumer jest idempotentny i zachowuje workspace scope.



Schema eventu jest wersjonowana i kompatybilna wstecz.

PAPADATA | SEC-14 | Wymagania bezpieczeństwa backendu i API

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4



Manual replay z DLQ wymaga capability, reason i audytu.

Rate limiting i abuse protection

Zakres

Przykładowy klucz

Login/recovery

IP + identity hint + device risk

API user

identity + tenant + workspace

Export

workspace + user + export class

## AI

tenant + workspace + user + use case + cost

Integrations

provider + connection + tenant

Report sharing

grant + IP/device + recipient verification

Audit search

actor + workspace + query complexity

Sekrety i logowanie



Sekrety są write-only i pobierane wyłącznie przez uprawnioną service identity.



Logi nie zawierają tokenów, pełnych promptów z danymi wrażliwymi ani pełnych payloadów.



Błędy zewnętrzne są mapowane na bezpieczne klasy bez ujawniania konfiguracji.



Correlation umożliwia diagnozę bez pokazywania klientowi wewnętrznych stack traces.

Minimalny katalog endpointów

Endpoint

Capability

Błędy

Audit

GET /session-context

workspace.read

401/403/423

## SESSION_CONTEXT_ACCESSED

POST /invitations

membership.invite

403/409/422

## INVITATION_CREATED

POST /invitations/{token}/accept

token policy

409/410/422

## INVITATION_ACCEPTED

GET/DELETE /sessions

self/security.manage_sessions

403/404

## SESSION_REVOKED

POST /connections

integration.connect

403/409/422/503

## CONNECT_STARTED

POST /connections/{id}/sync-jobs

integration.sync

403/409/429

## SYNC_STARTED

POST /assistant/analyses

ai.use

403/409/422/429

## AI_ANALYSIS_REQUESTED

POST /actions/{id}/approvals

action.approve

403/409/410

## ACTION_APPROVED

POST /actions/{id}/execute

action.execute

403/409/410/422

## ACTION_EXECUTION_STARTED

POST /exports

export.*

403/409/422/429

## EXPORT_REQUESTED

POST /reports/{id}/grants

report.share.*

403/409/422

## REPORT_GRANT_CREATED

GET /audit-events

audit.read

403/422

## AUDIT_VIEWED

POST /support-access

support.jit.request

403/409/422

## SUPPORT_JIT_REQUESTED

POST /deletion-requests

data.lifecycle.delete

403/409/422

## DELETION_REQUESTED

PAPADATA | SEC-14 | Wymagania bezpieczeństwa backendu i API

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

5

Definition of Done endpointu



Allow i deny tests dla każdej roli.



Cross-tenant i cross-workspace test.



Walidacja data scope.



Idempotency/concurrency test dla mutacji.



Audit success, failure i deny.



Rate limit i abuse test.



Bezpieczne błędy i brak sekretów w logach.



Kontrakt OpenAPI i fixture Storybooka.

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
