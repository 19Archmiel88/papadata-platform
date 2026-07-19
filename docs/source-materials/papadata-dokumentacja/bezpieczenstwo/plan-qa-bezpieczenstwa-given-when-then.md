# Plan QA bezpieczeństwa Given When Then

PAPADATA | SEC-16 | Plan QA bezpieczeństwa Given/When/Then

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

1

## PAPADATA

Plan QA bezpieczeństwa Given/When/Then

Scenariusze P0 dla identity, izolacji, integracji, AI, eksportów, audytu i retencji

Kod dokumentu

## SEC-16

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

PAPADATA | SEC-16 | Plan QA bezpieczeństwa Given/When/Then

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

Zasady wykonania



Każdy test ma stabilny identyfikator, właściciela, środowisko, dane, wynik i link do dowodu.



Testy bezpieczeństwa używają danych syntetycznych i co najmniej dwóch tenantów oraz trzech workspace.



Każdy endpoint ma allow/deny, cross-workspace i revoked-session test.



Wynik FAILED dla testu P0 blokuje odpowiedni zakres MVP.

## ID

Given

When

Then

Audit

## AUTH-001

Użytkownik ma poprawne hasło i

wymagane MFA

Loguje się i potwierdza MFA

Powstaje sesja z prawidłowym

authStrength

## LOGIN_SUCCEEDED

## AUTH-002

MFA jest wymagane przez tenant

policy

Użytkownik bez MFA próbuje wejść do

danych

Dostęp tylko do konfiguracji MFA

## MFA_POLICY_BLOCKED

## AUTH-003

Refresh token został użyty i obrócony

Stary token jest użyty ponownie

Rodzina sesji jest unieważniona i powstaje

alert

## TOKEN_REUSE_DETECTED

## AUTH-004

Użytkownik ma kilka sesji

Zamyka jedną sesję

Tylko wybrana sesja traci dostęp

## SESSION_REVOKED

## AUTH-005

Admin odbiera capability

Użytkownik wykonuje kolejną operację

Operacja jest odrzucona bez ponownego

## IAM_ACCESS_DENIED

PAPADATA | SEC-16 | Plan QA bezpieczeństwa Given/When/Then

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

3

## ID

Given

When

Then

Audit

logowania

## INV-001

Zaproszenie jest aktywne i email-bound

Właściwy użytkownik je akceptuje

Membership powstaje raz

## INVITATION_ACCEPTED

## INV-002

Zaproszenie zostało użyte

Token jest używany ponownie

Brak drugiego membershipu

## INVITATION_REUSE_DENIED

## INV-003

Zaproszenie dotyczy adresu A

Użytkownik B próbuje je przyjąć

Odmowa bez ujawnienia adresu A

## INVITATION_EMAIL_MISMATCH

## IAM-001

Istnieje jeden Tenant Owner

Próbuje usunąć siebie

Operacja jest blokowana

## LAST_OWNER_GUARD

## IAM-002

Approver ma approval, ale utracił capability

Próbuje zatwierdzić

Approval jest odrzucone

## APPROVAL_DENIED

## TEN-001

Użytkownik ma dostęp tylko do W1

Czyta prawidłowy ID zasobu W2

Brak danych i neutralna odmowa

## CROSS_WORKSPACE_DENIED

## TEN-002

Trwa request W1

Użytkownik przełącza się na W2

Spóźniona odpowiedź W1 nie jest

renderowana

## WORKSPACE_SWITCHED

## TEN-003

Job należy do W1

Użytkownik W2 odczytuje operationId

Brak statusu i resultRef

## CROSS_WORKSPACE_DENIED

## TEN-004

Plik eksportu należy do W1

Użytkownik W2 używa signed URL

Brak pobrania

## EXPORT_DOWNLOAD_DENIED

## INT-001

Provider jest dostępny i user ma capability

Kończy OAuth z minimal scopes

Connection ACTIVE; scope zapisany

## CONNECT_COMPLETED

## INT-002

Webhook ma błędny podpis

Jest wysłany do endpointu

Brak przetwarzania payloadu

## WEBHOOK_REJECTED

## INT-003

Event webhook został przetworzony

Ten sam event wraca

Brak podwójnego skutku

## WEBHOOK_DUPLICATE_IGNORED

## INT-004

Provider zwraca rate limit

Sync trwa

Job przechodzi do RETRY_WAIT z

retryAfter

## SYNC_RETRY_SCHEDULED

## INT-005

Scope po reconnect jest mniejszy

Reconnect kończy się

Readiness/KPI pokazują ograniczenie

## INTEGRATION_SCOPE_CHANGED

## INT-006

Credential został cofnięty

Monitoring wykrywa błąd

Connection REAUTH_REQUIRED; historia

zachowana

## REAUTH_REQUIRED

## AI-001

KPI ma READY i user ma scope

Pyta o trend

Odpowiedź ma facts, evidence i limitations

## AI_ANALYSIS_COMPLETED

## AI-002

Dane są INVALID

User prosi o pewną rekomendację

Stan INSUFFICIENT_DATA

## AI_ANALYSIS_REFUSED

## AI-003

Prompt zawiera ID danych W2

Retrieval działa w W1

Dane W2 nie są pobrane

## AI_POLICY_BLOCKED

## AI-004

Dane zawierają instrukcję dla modelu

Model analizuje dokument

Instrukcja nie zmienia tool/policy

## AI_INJECTION_BLOCKED

## AI-005

Zmienił się evidence snapshot

User otwiera rekomendację

Rekomendacja EXPIRED

## AI_RECOMMENDATION_EXPIRED

## ACT-001

Action R2 ma capability

Brak fresh auth

Execution nie startuje

## REAUTH_REQUIRED

## ACT-002

Action R3 ma potwierdzenie

Brak approval

Status oczekuje; brak skutku

## ACTION_APPROVAL_REQUIRED

## ACT-003

R4 wymaga dwóch approverów

Ta sama identity zatwierdza drugi raz

Drugie approval odrzucone

## DUAL_APPROVAL_DENIED

PAPADATA | SEC-16 | Plan QA bezpieczeństwa Given/When/Then

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

4

## ID

Given

When

Then

Audit

## ACT-004

Action został zatwierdzony dla targetHash

## A

Stan celu zmienia hash

Approval wygasa

## ACTION_TARGET_CHANGED

## ACT-005

Batch częściowo się nie udał

Uruchomiono retry

Powtórzone są wyłącznie błędne elementy

## ACTION_RETRY_STARTED

## ACT-006

Rollback jest dostępny

User go uruchamia

Ponowna policy i bezpieczna kompensacja

## ACTION_ROLLBACK_*

## EXP-001

User ma odczyt bez export capability

Wywołuje POST /exports

Odmowa backendu

## EXPORT_DENIED

## EXP-002

Eksport zawiera dane szczegółowe

Jest klasyfikowany

Wymaga reauth/approval wg policy

## EXPORT_AWAITING_APPROVAL

## EXP-003

Eksport wygasł

Stary URL jest użyty

Brak pobrania

## EXPORT_DOWNLOAD_DENIED

## EXP-004

User utracił membership po generacji

Próbuje pobrać READY

Odmowa

## EXPORT_DOWNLOAD_DENIED

## EXP-005

Generowanie zostało anulowane

Worker kończy etap

Artefakty nie są publikowane

## EXPORT_CANCELLED

## SHR-001

Grant jest email-bound do A

Odbiorca B otwiera link

Odmowa

## REPORT_EMAIL_MISMATCH

## SHR-002

Grant ma maxUses=5

Następuje szóste otwarcie

Atomowa blokada

## REPORT_USAGE_LIMIT

## SHR-003

Grant został odwołany

Token jest użyty

Brak raportu

## REPORT_OPEN_DENIED

## SHR-004

Grant ukrywa dane szczegółowe

Odbiorca używa API

Dane nie występują w payloadzie

## REPORT_OPENED

## AUD-001

Audit storage jest niedostępny

Startuje R3

Operacja fail-closed

## AUDIT_UNAVAILABLE_BLOCK

## AUD-002

Audit storage chwilowo niedostępny

Wykonano R1 z bufferem

Event jest dostarczony po recovery bez

duplikatu

## AUDIT_BUFFER_FLUSHED

## AUD-003

Rekord audytu został zmieniony

Uruchamia się verifier

Alarm integralności

## AUDIT_TAMPER_DETECTED

## SUP-001

JIT grant dotyczy W1

Support próbuje W2

Odmowa

## SUPPORT_ACCESS_DENIED

## SUP-002

JIT grant wygasa

Czas upływa

Sesja i signed URLs są unieważnione

## SUPPORT_JIT_EXPIRED

## SUP-003

Impersonation jest aktywne

Support wykonuje odczyt

Audit ma support i impersonated actor

## SUPPORT_DATA_ACCESSED

## SUP-004

Support próbuje zatwierdzić własne

działanie przez impersonation

Approval request

Odmowa

## APPROVAL_DENIED

## RET-001

Usunięcie obejmuje workspace

Workflow kończy się

DB, files, cache, indexes, queues i exports

usunięte

## DELETION_VERIFIED

## RET-002

Backup poprzedza usunięcie

Backup jest przywracany

Deletion ledger jest ponownie zastosowany

## DELETION_REPLAYED_AFTER_RESTO

## RE

## RET-003

Provider AI przechowuje dane

Retencja wygasa

Wysłano i zweryfikowano provider deletion

## PROVIDER_DATA_DELETED

PAPADATA | SEC-16 | Plan QA bezpieczeństwa Given/When/Then

Wersja 1.0

Dokument projektowy - nie stanowi dowodu wdrożenia

5

## ID

Given

When

Then

Audit

## RET-004

Aktywny legal hold obejmuje część danych

Startuje deletion

Tylko właściwy zakres jest blokowany

## DELETION_BLOCKED

## SEC-001

Sekret integracji istnieje

Odczyt API/logów

Sekret nie jest zwracany

## SECRET_ACCESS_REDACTED

## SEC-002

User manipuluje role/capability w kliencie

Wywołuje API

Backend używa własnej policy i odrzuca

## IAM_ACCESS_DENIED

## SEC-003

CSP/clickjacking test

Aplikacja jest osadzana w obcej domenie

Osadzenie jest blokowane

## SECURITY_HEADER_ENFORCED

## BCP-001

Środowisko produkcyjne utracone

Wykonywany jest restore

Osiągnięto zatwierdzone RTO/RPO i

deletion replay

## RESTORE_COMPLETED

Dowody testowe

Typ

Wymagane artefakty

Automated

Log CI, wersja kodu, environment, test data, wynik i trace

Manual

Protokół, osoba, data, kroki, zrzuty/logi i wynik

Security review

Zakres, metodologia, findings, retest i acceptance

Restore

Backup ID, zakres, czas, RTO/RPO, deletion replay i sign-off

AI eval

Dataset/version, model/prompt/policy, metryki i threshold

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
