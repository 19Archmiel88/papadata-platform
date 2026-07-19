# Kontrolowane udostępnianie raportów

PAPADATA | SEC-10 | Kontrolowane udostępnianie raportów

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Kontrolowane udostępnianie raportów

Odbiorcy wewnętrzni i zewnętrzni, tokeny, expiry, watermark i historia otwarć

Kod dokumentu

## SEC-10

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

PAPADATA | SEC-10 | Kontrolowane udostępnianie raportów

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

Zasada dostępu

Fakt potwierdzony: Udostępnianie raportów jest pełną funkcją MVP. Publiczny, anonimowy i bezterminowy link

bez kontroli pozostaje niedopuszczalny.

Dostęp zewnętrzny korzysta z osobnego obiektu ReportGrant i nie tworzy automatycznie Membership w workspace.

Typy grantów

Typ

Odbiorca

Kontrole

## INTERNAL_USER

Członek tenanta

identity binding, bieżące policy i data scope

## EXTERNAL_EMAIL

Imienny odbiorca zewnętrzny

email binding, verification, expiry, usage limit

## TOKEN_LINK

Odbiorca posiadający token

hash tokenu, expiry, opcjonalne hasło i limit

użyć

## EXTERNAL_ACCOUNT

Zweryfikowane konto gościa

identity, tenant policy, przypisany grant

Model ReportGrant

Pole

Wymaganie

grantId

Stabilny identyfikator

tenantId/workspaceId/reportId

Obowiązkowy scope

recipientType/recipientRef

Użytkownik, e-mail lub token

expiresAt

Obowiązkowe dla zewnętrznych grantów

PAPADATA | SEC-10 | Kontrolowane udostępnianie raportów

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Pole

Wymaganie

maxUses/useCount

Opcjonalny limit i atomowe naliczanie

passwordPolicy

Hash hasła; brak przechowywania jawnego

emailBinding

Opcjonalne lub wymagane wg klasy danych

detailVisibility

Pełne, zamaskowane albo wyłącznie zagregowane

exportAllowed

Jawna flaga; domyślnie false dla zewnętrznych

watermarkPolicy

Odbiorca, czas, grantId lub bezpieczny identyfikator

status

## ACTIVE, EXPIRED, REVOKED, BLOCKED

policySnapshot

Wersja polityki i klasyfikacji raportu

Tworzenie udostępnienia

1.

Zweryfikuj capability report.share.internal albo report.share.external.

2.

Zweryfikuj data scope autora i klasyfikację raportu.

3.

Wyznacz risk class odbiorcy i zawartości.

4.

Zablokuj pola szczegółowe albo eksport zgodnie z polityką.

5.

Ustaw obowiązkowy expiry i ewentualny maxUses.

6.

Wygeneruj token o wysokiej entropii; przechowuj wyłącznie hash.

7.

Zapisz audit intent i wyślij powiadomienie bez danych raportu.

8.

Przy każdym otwarciu ponownie sprawdź grant, raport i status workspace.

Invalidacja dostępu



Usunięcie raportu, workspace lub grantu natychmiast blokuje dostęp.



Zmiana klasyfikacji lub danych szczegółowych może wymagać automatycznego revoke i ponownego udostępnienia.



Utrata capability autora nie musi automatycznie odwoływać zatwierdzonego grantu, ale wymaga jawnej polityki;

domyślnie zewnętrzny grant jest ponownie oceniany.



Zmiana tenant policy może unieważnić wszystkie granty niespełniające nowych wymagań.

Watermark i ograniczenie danych

Kontrola

Wymaganie

Watermark

Identyfikuje odbiorcę/grant bez ujawniania nadmiarowych danych

Masking

Ukrywa dane szczegółowe i identyfikatory zgodnie z policy

Aggregation

Pozwala udostępnić tylko agregaty przy zakazie danych

szczegółowych

No export

UI i API blokują eksport; nie jest to jedyna ochrona przed

kopiowaniem

No indexing

Nagłówki i mechanizmy zapobiegające indeksowaniu

Content Security

Brak osadzania raportu w niezatwierdzonych domenach, jeśli nie jest

wymagane

PAPADATA | SEC-10 | Kontrolowane udostępnianie raportów

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Audit

Event

Dane

## REPORT_GRANT_CREATED/UPDATED

creator, recipient type, restrictions, expiry

## REPORT_GRANT_SENT

channel, recipient hash, status

## REPORT_OPENED

grant, recipient verification, use count, risk metadata

## REPORT_OPEN_DENIED

reason: expired, mismatch, limit, revoked

## REPORT_GRANT_REVOKED/EXPIRED/BLOCKED

actor/system, reason

## REPORT_EXTERNAL_EXPORT_ATTEMPTED

grant, allow/deny, policy

## QA



Token jest jednorazowo generowany i nie jest możliwy do odczytu z bazy.



Szóste otwarcie przy limicie pięciu jest blokowane atomowo.



E-mail mismatch nie ujawnia poprawnego odbiorcy.



Raport po revoke, expiry i deletion jest niedostępny.



Grant zewnętrzny nie umożliwia nawigacji po workspace.



Dane szczegółowe są zamaskowane także w API, nie tylko UI.



Export disabled blokuje endpoint eksportu.

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
