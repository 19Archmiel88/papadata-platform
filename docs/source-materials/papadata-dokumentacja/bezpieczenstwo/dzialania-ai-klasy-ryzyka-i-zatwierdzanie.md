# Działania AI klasy ryzyka i zatwierdzanie

PAPADATA | SEC-08 | AI Actions, klasy ryzyka i approval

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

AI Actions, klasy ryzyka i approval

Propozycja, zatwierdzenie, wykonanie, partial failure, retry i rollback

Kod dokumentu

## SEC-08

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

PAPADATA | SEC-08 | AI Actions, klasy ryzyka i approval

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

Zasada architektoniczna

Decyzja krytyczna: Model AI nie wykonuje operacji bezpośrednio. Każde działanie przechodzi przez

deterministyczny Action Service.

Klasy ryzyka

Klasa

Opis

Kontrola

Przykład

R0 - tylko odczyt

Brak zmiany danych lub systemu

zewnętrznego

Capability + data scope

Analiza KPI, pobranie definicji

R1 - niskie

Odwracalna zmiana lokalna o

ograniczonym skutku

Jawne potwierdzenie użytkownika

Utworzenie draftu raportu

R2 - średnie

Zmiana odwracalna, ale wpływająca na

workflow lub konfigurację

Potwierdzenie + fresh reauthentication

Utworzenie zadania, zmiana alertu

R3 - wysokie

Zmiana systemu zewnętrznego lub

danych o znaczącym wpływie

Capability + reauth + approval

Zmiana konfiguracji kampanii

R4 - krytyczne

Operacja nieodwracalna, masowa,

finansowa lub dotycząca

bezpieczeństwa

Dual approval albo blokada polityką

Masowe usunięcie, transfer ownership

Model obiektów

Encja

Znaczenie

Kluczowe pola

ActionProposal

Ustrukturyzowana propozycja

workspace, actor, actionType, target, before,

proposed, evidenceHash

RiskAssessment

Klasyfikacja i wymagania

riskClass, policyVersion, reasons,

PAPADATA | SEC-08 | AI Actions, klasy ryzyka i approval

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Encja

Znaczenie

Kluczowe pola

requiredApprovals

ApprovalRequest

Wniosek o zatwierdzenie

approvers, independence rule, expiry,

targetHash

Execution

Próba wykonania

idempotencyKey, expectedVersion, provider

operation, status

Compensation/Rollback

Operacja odwracająca

eligible, deadline, steps, riskClass

ActionResult

Końcowy rezultat

success/partial/failure, affected objects,

evidence

Przepływ

1.

AI lub użytkownik tworzy ActionProposal bez skutku zewnętrznego.

2.

Policy Engine ponownie sprawdza capability, data scope i dozwolony actionType.

3.

Risk Engine klasyfikuje operację na podstawie typu, zakresu, wartości, odwracalności i systemu docelowego.

4.

UI pokazuje podgląd before/after, zakres, skutki i evidence.

5.

System zbiera wymagane potwierdzenie, reauth i approval.

6.

Przed wykonaniem sprawdzany jest targetHash, expectedVersion i aktualny stan celu.

7.

Audit intent jest trwale zapisany; dla R3/R4 brak audytu oznacza fail-closed.

8.

Executor wykonuje operację idempotentnie.

9.

Wynik jest monitorowany; partial failure nie powoduje ponownego wykonania udanych elementów.

10. Użytkownik otrzymuje status, błąd, retry lub rollback.

Approval

Reguła

Wymaganie

Związek z celem

Approval zawiera targetHash i wygasa po zmianie celu

Związek z zakresem

Approval nie działa dla większego zakresu niż zatwierdzony

Związek z aktorem

Wskazuje wykonawcę lub klasę uprawnionych wykonawców

Czas

Ma datę ważności; brak bezterminowych approval

Niezależność

Dual approval wymaga dwóch różnych identity i zabrania self-double-

approval

Capability

Approver musi posiadać capability w momencie zatwierdzenia i

wykonania

Reauth

Fresh authentication musi być ważne w chwili wykonania

Revoke

Approval może być odwołane przed wykonaniem

Partial failure i retry



Każdy element batch posiada własny stable operation key.



Retry obejmuje wyłącznie elementy nieudane lub o nieznanym wyniku.



Nieznany wynik u providera wymaga reconciliation przed retry.



UI pokazuje liczbę sukcesów, błędów, obiektów nieznanych i elementów do ręcznego review.



Zmiana zakresu retry wymaga nowej klasyfikacji ryzyka.

PAPADATA | SEC-08 | AI Actions, klasy ryzyka i approval

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Rollback

Stan

Zachowanie

## ROLLBACK_NOT_SUPPORTED

Przed approval UI jasno informuje o nieodwracalności

## ROLLBACK_AVAILABLE

Zdefiniowana operacja kompensacyjna i termin

## ROLLBACK_REQUESTED

Ponowna autoryzacja i risk assessment

## ROLLBACK_RUNNING

Monitorowanie jak osobnej operacji

## ROLLBACK_SUCCEEDED

Audit i aktualizacja stanu

## ROLLBACK_PARTIAL/FAILED

Incident/review i jawny wpływ

Zdarzenia audytowe

Event

Minimalne dane

## AI_ACTION_PROPOSED

action type, evidence hash, model/prompt/policy versions

## AI_ACTION_RISK_CLASSIFIED

risk class, reasons, policy version

## AI_ACTION_APPROVAL_REQUESTED

required approvers, target hash, expiry

## AI_ACTION_APPROVED/REJECTED/REVOKED

actor, rationale, auth strength

## AI_ACTION_EXECUTION_STARTED

idempotency key, expected version, audit intent

## AI_ACTION_PARTIAL/FAILED/SUCCEEDED

affected objects, provider result refs

## AI_ACTION_ROLLBACK_*

original execution, compensation scope i result

Kryteria QA



Approval bez capability nie działa.



Ten sam użytkownik nie spełnia dual approval dwukrotnie.



Zmiana targetHash unieważnia approval.



Operacja R3 nie działa bez audit intent.



Retry nie powiela udanych skutków.



Cross-workspace target jest odrzucany.



Rollback ponownie sprawdza policy i stan zasobu.



Model nie może wywołać nieallowlisted action type.

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
