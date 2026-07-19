# Zarządzanie AI i bezpieczeństwo asystenta

PAPADATA | SEC-07 | AI Governance i bezpieczeństwo Asystenta

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

AI Governance i bezpieczeństwo Asystenta

Tenant-safe retrieval, evidence, provider gateway, historia, koszt i retencja

Kod dokumentu

## SEC-07

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

PAPADATA | SEC-07 | AI Governance i bezpieczeństwo Asystenta

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

Zakres Asystenta AI w MVP

Fakt potwierdzony: Asystent AI jest pełną funkcją MVP. Ograniczenie dotyczy liczby providerów i modeli, a nie

podstawowych możliwości analitycznych.



Analiza KPI, trendów i anomalii.



Porównywanie okresów i segmentów w dozwolonym data scope.



Analiza możliwych przyczyn wraz z jawną niepewnością.



Tworzenie podsumowań i raportów.



Objaśnianie źródeł, definicji i sposobu obliczenia wyniku.



Praca na danych z dozwolonych integracji workspace.



Proponowanie i inicjowanie dozwolonych działań przez Action Service.



Historia analiz, limity kosztu i obsługa błędów oraz braku danych.

Przepływ analizy

1.

Użytkownik inicjuje analizę w jawnym kontekście workspace, ekranu, KPI lub raportu.

2.

Backend ocenia session, capability, data scope, entitlement, use case i klasyfikację danych.

3.

Retrieval pobiera tylko dozwolone snapshoty, definicje, lineage i data issues.

4.

Readiness gate odrzuca, ogranicza albo oznacza dane partial/stale.

5.

AI Gateway minimalizuje i redaguje kontekst, buduje evidence pack i budżet.

6.

Provider generuje structured output w określonym schemacie.

7.

Validator sprawdza format, evidence, narzędzia, policy i niedozwolone ujawnienia.

8.

UI rozdziela facts, inferences, recommendations, limitations i evidence.

9.

Propozycja działania trafia do SEC-08 Action Service.

10. AI run zapisuje model, prompt, policy, evidence hash, koszt, czas i wynik.

PAPADATA | SEC-07 | AI Governance i bezpieczeństwo Asystenta

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

AI Gateway

Funkcja

Wymaganie MVP

Routing

Jeden provider; abstrakcja umożliwia zmianę modelu/provider bez

przebudowy domen

Authorization

Policy przed retrieval i przed każdym tool call

Minimization

Tylko dane wymagane dla use case

Sensitive filtering

Klasyfikacja, redakcja i blokada niedozwolonych pól

Prompt versioning

System, developer i template prompts mają wersje

Model control

Allowlist modeli i konfiguracji; zmiana przez kontrolowany release

Cost

Budżet per tenant/workspace/user/use case

Limits

Rate, context, output, concurrency i dzienne limity

Retry/fallback

Bounded retry, circuit breaker, bezpieczna degradacja lub odmowa

Retention

Osobna klasa promptów, outputów, embeddings i evidence

Kill switch

Globalny, tenantowy, workspace i per use case

Kontrakt odpowiedzi

Sekcja

Wymaganie

facts

Twierdzenia bezpośrednio wspierane przez evidence

inferences

Jawne wnioski, poziom niepewności i alternatywne wyjaśnienia

recommendations

Wpływ, owner, odwracalność, expiry i wymagany review

limitations

Braki, partial, stale, scope i ograniczenia polityki

evidence

ID snapshotu/datasetu/definicji, czas, lineage i data classification

nextActions

Tylko allowlisted action types; bez wykonania bez Action Service

modelRun

Model, prompt, policy, validator, koszt i latency

Stany AI

Stan

Warunek

Zachowanie

## DISABLED

Policy, plan lub kill switch

Wyjaśnij warunek bez ujawniania danych

## INSUFFICIENT_DATA

Brak danych zgodnych z kontraktem

Odmowa pewnej odpowiedzi

## GENERATING

Retrieval/generation

Streaming z anulowaniem

## ANSWERED

Wynik zwalidowany

Rozdziel sekcje i evidence

## PARTIAL

Dane ograniczone, ale użyteczne

Jawne limitations

PAPADATA | SEC-07 | AI Governance i bezpieczeństwo Asystenta

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Stan

Warunek

Zachowanie

## NEEDS_REVIEW

Rekomendacja lub action

Owner, ryzyko i approval

## EXPIRED

Zmiana danych/policy lub termin

Wymuś ponowną analizę

## PROVIDER_ERROR

Błąd gateway/model

Bezpieczny retry/degradacja

## BLOCKED_BY_POLICY

Dane/use case/tool niedozwolony

Brak obejścia promptem

Historia i pamięć



Historia jest związana z tenantem, workspace, użytkownikiem i zakresem danych.



Otwarcie historycznego runu ponownie sprawdza dostęp do evidence.



Zmiana membershipu lub data scope może ukryć część historii.



Pamięć konwersacyjna nie przenosi danych między workspace.



Trwała pamięć musi mieć jawny cel, retencję, edycję i usunięcie.

Ryzyka i kontrole

Ryzyko

Kontrola

Prompt injection

oddzielenie instrukcji i danych, klasyfikacja, tool allowlist

Indirect injection

sanitization dokumentów i brak traktowania danych jako instrukcji

Cross-workspace retrieval

policy i filtr przed query; test z realnym obcym ID

Sensitive disclosure

minimization, redaction, output validator

Hallucination

structured output, evidence requirement, refusal

Excessive agency

Action Service, risk class, approval i revalidation

Unbounded cost

budżety, limity, circuit breaker i alerty

Model drift

pinned config, evals, canary i run metadata

Unsafe retention

retention class, deletion ledger i provider deletion

Ewaluacje MVP



Faithfulness i evidence coverage.



Refusal correctness dla no data, forbidden i invalid.



Cross-workspace retrieval.



Prompt injection i indirect prompt injection.



Sensitive data leakage.



Tool allowlist i Action Service bypass.



Koszt, latency i limit enforcement.



Model/prompt regression przed zmianą konfiguracji.



Usunięcie danych AI i historii zgodnie z retencją.

Zasady zarządzania dokumentem



Zmiana wymagania bezpieczeństwa wymaga wersji dokumentu, analizy wpływu i aktualizacji powiązanych

kontraktów.

PAPADATA | SEC-07 | AI Governance i bezpieczeństwo Asystenta

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

5



Zmiana granicy danych, modelu ról, poziomu ryzyka lub approval wymaga decyzji architektonicznej.



Każde wymaganie P0 musi posiadać właściciela, implementację, test, wynik oraz odwołanie do dowodu.



Wyjątek od wymagania wymaga formalnej akceptacji ryzyka z terminem wygaśnięcia.



Dowody nie mogą być przechowywane wyłącznie w treści tego dokumentu.
