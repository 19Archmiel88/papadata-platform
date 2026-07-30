---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-LEGAL-003
updated_at: 2026-07-30T15:05:00+02:00
status: approved-template
---

# Polityka prywatności PapaData

> **Status dokumentu:** rozbudowany szablon wdrożeniowy. Przed publikacją lub podpisaniem należy uzupełnić wszystkie pola `[DO UZUPEŁNIENIA]`, zweryfikować zgodność z rzeczywistą architekturą, cennikiem i procesami oraz uzyskać zatwierdzenie prawnika, księgowości i — w odpowiednim zakresie — IOD/DPO. Dokument nie jest indywidualną opinią prawną.

## 1. Administrator i kontakt

Administratorem danych dotyczących konta, sprzedaży, bezpieczeństwa i własnej działalności PapaData jest `[SPÓŁKA, ADRES, NIP/KRS]`. Kontakt: `[EMAIL PRIVACY]`. Inspektor ochrony danych: `[DANE IOD LUB INFORMACJA, ŻE NIE WYZNACZONO]`.

W odniesieniu do danych e-commerce, klientów końcowych, kampanii i innych danych wprowadzanych przez Klienta do workspace, PapaData co do zasady działa jako podmiot przetwarzający na podstawie DPA, a Klient jako administrator. Konkretna rola zależy od celu i jest opisana w rejestrze czynności.

## 2. Kategorie danych

- dane konta i kontaktu: imię, nazwisko, e-mail, telefon, stanowisko;
- dane firmy: nazwa, NIP, REGON, KRS, adres, status VAT, źródłowa odpowiedź GUS/BIR;
- dane uwierzytelniania i bezpieczeństwa: identyfikatory, MFA, urządzenia, sesje, IP, logi audytowe;
- dane umowne i billingowe: Plan, płatności, token providera, faktury, KSeF, zgody;
- dane użycia: zdarzenia, funkcje, diagnostyka, telemetry i support;
- treść raportów, rozmów AI, evidence, approvals i działań;
- dane pozyskane z integracji zgodnie ze scopes Klienta.

PapaData nie zapisuje PAN ani CVV karty. Kod BLIK nie jest przechowywany po zakończeniu procesu poza technicznymi logami providera, jeżeli jest to konieczne i zgodne z jego dokumentacją.

## 3. Cele, podstawy i retencja

| Cel | Typowa podstawa | Kategorie | Retencja robocza |
|---|---|---|---|
| zawarcie i wykonanie umowy | art. 6 ust. 1 lit. b/f RODO zależnie od osoby | konto, firma, użycie | okres umowy + `[OKRES]` |
| billing, podatki, KSeF | obowiązek prawny / umowa | firma, faktury, płatności | okres ustawowy `[OKRES]` |
| bezpieczeństwo i audyt | uzasadniony interes / obowiązek | sesje, IP, logi | `[OKRES]` wg klasy logu |
| wsparcie i reklamacje | umowa / uzasadniony interes | kontakt, zgłoszenie | `[OKRES]` |
| komunikacja marketingowa | zgoda lub właściwa podstawa | kontakt, preferencje | do cofnięcia / sprzeciwu |
| rozwój i analityka produktu | uzasadniony interes / zgoda na cookies | telemetry | `[OKRES]` |
| AI i raporty | wykonanie umowy / polecenie Klienta | dane workspace, rozmowy | ustawienie Klienta + retencja |

Ostateczna tabela jest uzupełniana po ROPA i DPIA. Nie używa się zgody, gdy właściwą podstawą jest umowa lub obowiązek prawny.

## 4. Źródła danych

Dane pochodzą od osoby, administratora tenanta, zaproszenia, providerów OAuth, integracji, providera płatności, publicznych rejestrów GUS/BIR, KSeF oraz systemów bezpieczeństwa. Przy danych niepozyskanych bezpośrednio obowiązek informacyjny jest realizowany zgodnie z rolą i wyjątkami prawa.

## 5. Odbiorcy i podprocesorzy

Odbiorcami mogą być: hosting/chmura, e-mail/SMS, monitoring, support, płatności, księgowość, KSeF, dostawcy AI, narzędzia bezpieczeństwa i profesjonalni doradcy. Aktualna lista z nazwą, usługą, lokalizacją i mechanizmem transferu znajduje się w `06-lista-podprocesorow.md` oraz pod `[URL]`.

## 6. Transfery poza EOG

Transfer wymaga decyzji adekwatności, standardowych klauzul umownych lub innego mechanizmu. Dla istotnych dostawców przeprowadza się ocenę transferu i wprowadza środki uzupełniające. Lokalizacja danych i ograniczenia dostawcy są widoczne w rejestrze podprocesorów.

## 7. AI i zautomatyzowane decyzje

PapaData używa AI do analizy, wyjaśnień, rekomendacji i przygotowania zmian. Odpowiedzi zawierają evidence, ograniczenia i poziom pewności. Istotne AI Actions wymagają decyzji człowieka. PapaData nie podejmuje wobec osoby decyzji wywołującej skutek prawny lub podobnie istotny wyłącznie automatycznie bez odrębnej podstawy, informacji i zabezpieczeń.

Dane Klienta nie są używane do trenowania ogólnych modeli dostawcy bez osobnej, jawnej podstawy i konfiguracji. Politykę providera należy potwierdzić w Vendor Assessment i DPA.

## 8. Prawa osób

Osoba może żądać dostępu, kopii, sprostowania, usunięcia, ograniczenia, przenoszenia, wnieść sprzeciw, cofnąć zgodę i złożyć skargę do Prezesa UODO. Wniosek: `[EMAIL/FORMULARZ]`. Tożsamość jest weryfikowana proporcjonalnie. Gdy PapaData działa jako procesor, wniosek jest przekazywany Klientowi i obsługiwany według DPA.

## 9. Obowiązkowość danych

Dane oznaczone jako wymagane są potrzebne do założenia konta, bezpieczeństwa, rozliczenia lub integracji. Brak może uniemożliwić funkcję. Dane opcjonalne są wyraźnie oznaczone.

## 10. Bezpieczeństwo

Stosowane środki obejmują izolację tenantów, szyfrowanie, MFA, least privilege, audyt, zarządzanie sekretami, kopie, monitoring, testy i procedurę incydentową. Szczegóły, które można ujawnić, zawiera Security/TOM Addendum.

## 11. Retencja i usuwanie

Okresy wynikają z `13-polityka-retencji-i-usuwania.md`. Po rozwiązaniu umowy Klient ma okno eksportu `[DNI]`. Następnie dane są usuwane lub anonimizowane, z wyjątkiem kopii rotacyjnych, obowiązków podatkowych, roszczeń i audytu. Usunięcie jest propagowane do podprocesorów zgodnie z ich cyklem.

## 12. Cookies i aplikacja mobilna

Strona używa cookies koniecznych i — za zgodą — analitycznych/marketingowych. Aplikacja mobilna może używać bezpiecznego storage, identyfikatorów instalacji i push tokenów. Szczegóły są w Polityce cookies i Regulaminie mobile.

## 13. Zmiany

Polityka ma wersję i datę. Istotne zmiany są komunikowane. Archiwalne wersje są dostępne pod `[URL]`. Ostatnia aktualizacja: `[DATA]`.
