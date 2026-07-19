# IAM role uprawnienia i zakres danych

PAPADATA | SEC-02 | IAM, role, capabilities i data scope

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

IAM, role, capabilities i data scope

Pełny model autoryzacji tenant-workspace-resource

Kod dokumentu

## SEC-02

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

PAPADATA | SEC-02 | IAM, role, capabilities i data scope

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

Cel i zasady

Celem dokumentu jest ustanowienie jednego, spójnego modelu dostępu dla UI, API, jobów, integracji, eksportów,

raportów, AI, Supportu i operacji administracyjnych.

Fakt potwierdzony: Role domyślne + capabilities + data scope obowiązują w MVP. Uproszczony RBAC nie jest

akceptowany jako rozwiązanie przejściowe.

Model encji IAM

Encja

Znaczenie

Kluczowe pola/inwarianty

Identity

Osoba lub konto techniczne

identityId, verifiedEmail, status, auth methods

Tenant

Granica handlowa i polityk

tenantId, owner, billing, securityPolicyVersion

Workspace

Granica danych i operacji

workspaceId, tenantId, status, classification

Membership

Relacja identity-workspace

role, capabilities, dataScope, status, validFrom/To

Role

Wersjonowany zestaw domyślnych capabilities

roleCode, version, privileged

Capability

Prawo do określonej operacji

code, resource type, risk ceiling

DataScope

Ograniczenie rekordów, domen, pól lub źródeł

domain, provider, object, field, condition

Entitlement

Prawo handlowe do funkcji lub limitu

plan, feature, quota; nie nadaje dostępu

ApprovalGrant

Zgoda na konkretną operację

targetHash, riskClass, approvers, expiry

PAPADATA | SEC-02 | IAM, role, capabilities i data scope

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Role domyślne

Rola

Widoczność

Dozwolone działania

Zakazy

Tenant Owner

Tenant i wszystkie przypisane

workspace

Własność, polityki tenanta, billing,

zatwierdzanie operacji krytycznych

Nie omija polityk, data scope, audytu

ani dual approval

Workspace Admin

Wskazany workspace

Użytkownicy, integracje, ustawienia,

raporty i operacje administracyjne

Brak automatycznego dostępu do

billingu, danych szczegółowych i

approval wysokiego ryzyka

Analyst

Dane i domeny wynikające z data

scope

Analizy, KPI, raporty, eksporty i AI

Brak zarządzania tożsamością,

politykami i billingiem

Marketing Operator

Dane marketingowe i przypisane

źródła

Analizy marketingowe i dozwolone

działania

Brak dostępu poza zakresem

marketingowym

Viewer

Przypisane dashboardy i raporty

Odczyt; eksport wyłącznie z osobną

capability

Brak mutacji i działań AI

Billing Admin

Billing tenanta

Plan, faktury i metody płatności

Brak danych analitycznych bez

osobnego membershipu

Auditor/Security

Audit log, polityki i dowody

Odczyt i kontrolowany eksport

dowodów

Brak modyfikacji danych biznesowych

Internal Support/Operations

Tylko zakres aktywnego grantu JIT

Diagnoza, kontrolowane impersonation

i operacje wsparcia

Brak stałego dostępu i brak dostępu

poza ticketem

Katalog capabilities MVP

Capability

Znaczenie

Zakres

tenant.read

Odczyt profilu tenanta

tenant

tenant.update

Zmiana profilu i ustawień tenanta

tenant

tenant.security_policy.manage

Zarządzanie politykami MFA, sesji i dostępu

tenant

workspace.read

Dostęp do workspace

workspace

workspace.update

Zmiana konfiguracji workspace

workspace

membership.invite

Tworzenie i zmiana zaproszeń

workspace/tenant

membership.manage

Zmiana i odebranie membershipu

workspace/tenant

role.assign

Przypisanie roli

workspace/tenant

capability.assign

Przypisanie dodatkowej capability

workspace/tenant

integration.read

Odczyt statusów integracji

workspace/provider

integration.connect

Połączenie providera

workspace/provider

integration.manage

Reconnect, disconnect i zmiana zakresów

workspace/provider

integration.sync

Uruchomienie sync/backfill/reprocess

workspace/provider

data.read.aggregate

Dane zagregowane

workspace/domain

data.read.detail

Dane szczegółowe

workspace/domain/field

data.issue.manage

Obsługa problemów jakości

workspace/domain

metric.read

Odczyt KPI

workspace/metric

PAPADATA | SEC-02 | IAM, role, capabilities i data scope

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Capability

Znaczenie

Zakres

report.create

Tworzenie raportów

workspace/domain

report.share.internal

Udostępnienie wewnętrzne

workspace/report

report.share.external

Udostępnienie zewnętrzne

workspace/report

export.aggregate

Eksport danych zagregowanych

workspace/domain

export.detail

Eksport danych szczegółowych

workspace/domain

ai.use

Korzystanie z asystenta

workspace/use_case

ai.action.propose

Tworzenie propozycji działania

workspace/action_type

action.approve

Zatwierdzanie działań

workspace/risk_class

action.execute

Wykonywanie zatwierdzonych działań

workspace/action_type

audit.read

Odczyt audit logu

tenant/workspace

audit.export

Eksport audit logu

tenant/workspace

billing.read

Odczyt billingu

tenant

billing.manage

Zmiana planu i płatności

tenant

support.jit.request

Wniosek o dostęp JIT

workspace

support.jit.approve

Zatwierdzenie dostępu JIT

workspace

support.impersonate

Kontrolowane impersonation

workspace/user

data.lifecycle.export

Eksport danych na żądanie

tenant/workspace

data.lifecycle.delete

Usunięcie danych

tenant/workspace

Data scope

Data scope jest oceniany niezależnie od capability. Użytkownik może posiadać data.read.detail, ale wyłącznie dla

przypisanej domeny, providera, jednostki organizacyjnej, pola albo segmentu.

Typ scope

Przykład

Wymaganie

Workspace

workspaceId=W1

Obowiązkowy dla każdego zasobu klienta

Domain

marketing, sales, customers

Ogranicza obszary danych

Provider

Allegro account A

Ogranicza źródło zewnętrzne

Object

campaignIds in set

Ogranicza konkretne obiekty

Field

bez danych identyfikujących klienta

Maskowanie lub brak pola

Time range

ostatnie 90 dni

Może ograniczać raporty i eksporty

Aggregation

tylko dane zagregowane

Zakazuje drill-down i eksportu szczegółowego

Algorytm decyzji dostępu

1.

Zweryfikuj tożsamość i status konta.

PAPADATA | SEC-02 | IAM, role, capabilities i data scope

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

5

2.

Zweryfikuj sesję, auth strength, reuse detection i wymaganie reauth.

3.

Zweryfikuj status tenanta i politykę tenantową.

4.

Zweryfikuj workspace status oraz aktywny membership.

5.

Wylicz efektywne capabilities z roli, grantów i jawnych deny.

6.

Zastosuj data scope do żądania i zasobu.

7.

Sprawdź entitlement oraz limity bez nadawania dodatkowych uprawnień.

8.

Sprawdź stan zasobu, jego wersję i zależności.

9.

Wyznacz risk class oraz wymagane approval.

10. Zapisz allow/deny decision z policy version i correlationId.

Operacje uprzywilejowane

Operacja

Wymagania

Transfer ownership

Tenant Owner, fresh MFA, last-owner guard, audit,

powiadomienie

Zmiana privileged role

role.assign, fresh MFA, expectedVersion, audyt i sesje do rewalidacji

Zmiana policy MFA/sesji

security policy capability, fresh MFA, audit intent, policy version

Eksport szczegółowy

export.detail, data scope, risk classification, reauth, opcjonalny

approval

External report share

report.share.external, data classification, expiry, recipient binding,

audit

JIT Support

ticket, cel, zakres, czas, approval, oznaczona sesja, automatyczne

wygaśnięcie

AI high-risk action

action capability, reauth, approval, target hash, idempotency, audit

Usunięcie danych

lifecycle capability, reauth, legal hold check, deletion plan i ledger

Cache i zmiany uprawnień



Cache policy musi zawierać identityId, tenantId, workspaceId, membershipVersion i policyVersion.



Zmiana membershipu, roli, capabilities, data scope lub polityki unieważnia cache i aktywne granty zależne.



Długie joby ponownie weryfikują uprawnienia przed skutkiem zewnętrznym.



Wcześniej wygenerowany eksport nie daje prawa do pobrania po utracie capability.

Zdarzenia audytowe

Zdarzenie

Minimalne dane

## IAM_INVITATION_CREATED/CHANGED/REVOKED

aktor, email hash, workspace, rola, expiry

## IAM_MEMBERSHIP_CHANGED

before/after role, capabilities, data scope, reason

## IAM_ROLE_CHANGED

role version, changed capabilities, approver

## IAM_ACCESS_DENIED

resource, action, reason code, policy version

## IAM_REAUTH_REQUIRED/SUCCEEDED/FAILED

operation, auth method, session

## IAM_OWNER_TRANSFERRED

old owner, new owner, approvals

## IAM_SESSION_REVOKED_BY_POLICY

reason, affected sessions, membership version

PAPADATA | SEC-02 | IAM, role, capabilities i data scope

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

6

Kryteria akceptacji MVP



Każdy endpoint posiada jawny capability mapping i deny test.



Każdy zasób posiada test cross-tenant i cross-workspace.



Zmiana uprawnień działa bez ponownego logowania użytkownika.



Viewer nie wykonuje mutacji przez bezpośrednie API.



Billing Admin nie odczytuje danych analitycznych bez osobnego membershipu.



AI retrieval i eksport używają tej samej policy co odczyt interaktywny.



Approval bez capability nie umożliwia działania.

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
