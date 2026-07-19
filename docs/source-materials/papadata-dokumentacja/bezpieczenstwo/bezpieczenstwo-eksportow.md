# Bezpieczeństwo eksportów

PAPADATA | SEC-09 | Bezpieczeństwo eksportów

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Bezpieczeństwo eksportów

Klasyfikacja, approval, asynchroniczne pliki, pobieranie, wygaśnięcie i historia

Kod dokumentu

## SEC-09

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

PAPADATA | SEC-09 | Bezpieczeństwo eksportów

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

Zakres MVP



Eksport danych zagregowanych.



Eksport danych szczegółowych.



Eksport raportów.



Asynchroniczne generowanie plików.



Status, anulowanie, wygaśnięcie, błędy i historia.



Ponowne uwierzytelnienie i approval dla eksportów wysokiego ryzyka.

Klasy ryzyka eksportu

Klasa

Przykład

Kontrole

## E0

Mały raport zagregowany bez danych

osobowych

export.aggregate, audit

## E1

Raport biznesowy z poufnymi KPI

reauth wg polityki, krótka retencja

## E2

Dane szczegółowe transakcji

export.detail, reauth, risk review

## E3

Dane klientów lub duży wolumen

approval, watermark/metadata, limity, alert

## E4

Pełny eksport lifecycle lub dane szczególnie

wrażliwe

dual approval lub wyspecjalizowany proces

Cykl życia eksportu

Stan

Znaczenie

Dozwolone akcje

## REQUESTED

Żądanie zapisane

klasyfikacja ryzyka

PAPADATA | SEC-09 | Bezpieczeństwo eksportów

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Stan

Znaczenie

Dozwolone akcje

## AWAITING_REAUTH

Wymagane fresh auth

reauth/cancel

## AWAITING_APPROVAL

Wymagane approval

approve/reject/cancel

## QUEUED

Gotowy do generowania

cancel

## GENERATING

Asynchroniczna generacja

cancel jeśli bezpieczne

## READY

Plik dostępny do czasu expiry

download/revoke

## PARTIAL

Plik niekompletny z jawnym zakresem

review/retry/cancel

## FAILED

Błąd generowania

retry zgodnie z idempotencją

## CANCELLED

Anulowane

brak download

## EXPIRED

Plik usunięty lub niedostępny

nowy eksport

## REVOKED

Dostęp odebrany przed expiry

brak download

Autoryzacja generowania i pobierania



Żądanie eksportu zapisuje zamrożony query/specification i data scope.



Generator wykonuje query w kontekście workspace i policy snapshot, ale wynik może zostać pobrany tylko po

bieżącej kontroli dostępu.



Signed URL ma krótki czas życia, jest związany z exportId i nie ujawnia ścieżki storage.



Utrata membershipu, capability, revoke lub expiry blokuje pobranie wcześniej wygenerowanego pliku.



Pobranie wysokiego ryzyka może wymagać ponownej reautoryzacji niezależnie od generowania.

Przechowywanie plików

Obszar

Wymaganie

Storage path

tenant/workspace/export prefix i metadata

Encryption

Szyfrowanie at rest i in transit

Filename

Bez danych osobowych i sekretów

Content disposition

Wymuszone pobranie; brak inline dla niebezpiecznych typów

Malware/content scanning

Dla plików wejściowych i generowanych z elementów zewnętrznych

Retention

Klasa zależna od ryzyka; automatyczne usunięcie

Backups

Eksporty krótkotrwałe domyślnie wyłączone z długiej retencji backup

Deletion

Storage, metadata, cache, CDN i signed URL invalidation

Historia i audyt

Event

Dane

## EXPORT_REQUESTED

actor, workspace, type, scope summary, risk class

## EXPORT_REAUTH_COMPLETED

auth strength, session

PAPADATA | SEC-09 | Bezpieczeństwo eksportów

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Event

Dane

## EXPORT_APPROVED/REJECTED

approver, rationale, target hash

## EXPORT_GENERATION_STARTED/COMPLETED/PARTIAL/

## FAILED

job, counts, file hash

## EXPORT_DOWNLOADED

actor, recipient context, IP/device risk metadata

## EXPORT_CANCELLED/REVOKED/EXPIRED/DELETED

reason, actor/system, timestamps

## QA



Użytkownik z odczytem bez export capability nie generuje pliku przez API.



Eksport szczegółowy nie zawiera pól poza data scope.



Download URL nie działa po expiry, revoke i utracie membershipu.



Retry nie generuje wielu rozliczonych eksportów dla tego samego idempotency key.



Anulowanie usuwa niedokończone artefakty.



Plik jest usuwany ze storage, cache i CDN zgodnie z retencją.



Cross-workspace exportId jest odrzucany.

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
