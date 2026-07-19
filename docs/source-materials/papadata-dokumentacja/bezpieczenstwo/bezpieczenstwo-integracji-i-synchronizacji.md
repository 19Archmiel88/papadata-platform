# Bezpieczeństwo integracji i synchronizacji

PAPADATA | SEC-06 | Bezpieczeństwo integracji i synchronizacji

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Bezpieczeństwo integracji i synchronizacji

Scopes, credentials, webhooki, sync, retry, recovery i retencja

Kod dokumentu

## SEC-06

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

PAPADATA | SEC-06 | Bezpieczeństwo integracji i synchronizacji

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

Zasada kompletności integracji MVP

Fakt potwierdzony: MVP może zawierać mały katalog providerów, ale każda wdrożona integracja musi działać

kompletnie end-to-end.

Przykładowy katalog może obejmować Shopify, Allegro i IdoSell albo inny zatwierdzony zestaw. Wybór konkretnych

providerów pozostaje decyzją wykonawczą.

Cykl życia integracji

Stan

Znaczenie

Dozwolone przejście

## NOT_CONNECTED

Brak aktywnego connection

## CONNECTING

## CONNECTING

OAuth/token exchange i walidacja scope

## ACTIVE, LIMITED_ACCESS, ERROR

## ACTIVE

Credential ważny; connection zweryfikowane

## SYNCING, REAUTH_REQUIRED, DISABLED

## SYNCING

Initial lub incremental sync

## ACTIVE, PARTIAL, ERROR, RETRY_WAIT

## LIMITED_ACCESS

Scope lub dostęp do danych ograniczony

## REAUTH_REQUIRED, ACTIVE, DISABLED

## REAUTH_REQUIRED

Credential wygasł/cofnięty lub scope

zmieniony

## CONNECTING, DISABLED

## RETRY_WAIT

Oczekiwanie zgodnie z retry budget

## SYNCING, ERROR

## ERROR

Błąd providera, kontraktu lub konfiguracji

## RETRY_WAIT, REAUTH_REQUIRED,

## DISABLED

## DISABLED

Wyłączone przez użytkownika lub politykę

## CONNECTING

PAPADATA | SEC-06 | Bezpieczeństwo integracji i synchronizacji

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Wymagania dla kompletnej integracji



Katalog providera z ownerem, zakresem danych i statusem gotowości.



Autoryzacja i reautoryzacja z jawnie wyświetlonym zakresem.



Minimalne, wersjonowane scopes powiązane z use case’ami.



Bezpieczne przechowywanie i rotacja credential.



Wybór konta, sklepu, kanału lub zasobu zewnętrznego.



Synchronizacja początkowa i przyrostowa.



Webhooki, jeśli provider je obsługuje.



Checkpoint, idempotencja, retry budget i DLQ.



Disconnect, revoke i reconnect bez utraty historii.



Monitoring, alerty i runbook provider outage.



Mapowanie danych, lineage i readiness.



Retencja i pełne usunięcie danych oraz sekretów.



Audit log wszystkich operacji administracyjnych i krytycznych.

Scopes

Reguła

Wymaganie

Minimalność

Żądany jest wyłącznie zakres niezbędny dla zatwierdzonego use case

Jawność

Użytkownik widzi zakres, cel i wpływ braku każdego scope

Wersjonowanie

Zmiana mapowania use case-scope tworzy nową wersję polityki

Scope diff

Reconnect pokazuje dodane i usunięte uprawnienia

Zwiększenie scope

Wymaga capability, reauth, potwierdzenia i audytu

Zmniejszenie scope

Aktualizuje readiness, wpływ na dane i KPI

Provider anomaly

Dane spoza zatwierdzonego scope są odrzucane lub

kwarantannowane

Credential lifecycle

Etap

Kontrole

Utworzenie

Secret Store, szyfrowanie, brak w logach i odpowiedziach API

Użycie

Dostęp tylko przez adapter/service identity z least privilege

Rotacja

Wersjonowanie, test nowego credential, bezpieczne wycofanie

starego

Wygasanie

Monitoring, REAUTH_REQUIRED i komunikacja wpływu

Revocation

Cofnięcie u providera, usunięcie lokalne, zamknięcie jobów

Incident

Natychmiastowa rotacja/revoke, alert i audit

Deletion

Usunięcie sekretu, cache, kopii i danych u podprocesora zgodnie z

polityką

PAPADATA | SEC-06 | Bezpieczeństwo integracji i synchronizacji

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Webhooki



Weryfikacja podpisu i identyfikacji connection przed przetworzeniem payloadu.



Weryfikacja timestampu oraz dopuszczalnego okna czasowego.



Deduplikacja event ID i ochrona przed replay.



Powiązanie providera, connection, tenant i workspace.



Kwarantanna dla błędu kontraktu lub nieznanego typu zdarzenia.



Brak pełnego payloadu w logach; tylko bezpieczne metadata i payloadRef.

Synchronizacja, retry i recovery

Klasa błędu

Retry

Stan

Akcja

## AUTH/REVOKED

nie automatycznie

## REAUTH_REQUIRED

reconnect

## RATE_LIMIT

retryAfter + jitter

## RETRY_WAIT

monitoring

## TRANSIENT/TIMEOUT

ograniczony budget

## RETRY_WAIT

automatyczny retry

## SCHEMA_MISMATCH

nie naprawiać retry

## ERROR/BLOCKED

DataIssue i adapter review

## PERMISSION/SCOPE

nie

## LIMITED_ACCESS

scope diff/reconnect

## VALIDATION_DATA

kwarantanna

## PARTIAL

review issue

## BUG/INVARIANT

nie agresywnie

## FAILED/DLQ

incident

Zdarzenia audytowe

Event

Dane

## INTEGRATION_CONNECT_STARTED/COMPLETED/FAILED

provider, account ref, scopes, actor, result

## INTEGRATION_SCOPE_CHANGED

before/after, reason, policy version

## INTEGRATION_REAUTH_REQUIRED/COMPLETED

cause, old/new scope, impact

## INTEGRATION_SYNC_STARTED/COMPLETED/PARTIAL/FAILED

job, range, checkpoint, counts

## INTEGRATION_REPLAY_REQUESTED

ticket, reason, affected range, approver

## INTEGRATION_DISCONNECTED

revocation result, retention action, active jobs

## INTEGRATION_CREDENTIAL_ROTATED

credential version, reason; bez sekretu

QA i brama MVP



Connect/reconnect/disconnect E2E dla każdego providera MVP.



Webhook signature, timestamp i replay tests.



Initial oraz incremental sync z checkpoint resume.



Rate limit, outage, schema drift i credential revoke.



Scope increase/decrease z wpływem na readiness.



Cross-workspace connection IDOR.



Usunięcie connection wraz z retencją i credential revoke.



Provider runbook przećwiczony przed produkcją.

PAPADATA | SEC-06 | Bezpieczeństwo integracji i synchronizacji

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
