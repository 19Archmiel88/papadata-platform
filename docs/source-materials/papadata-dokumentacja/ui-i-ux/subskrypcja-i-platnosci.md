# Subskrypcja i płatności

PAPADATA

Subskrypcja i płatności

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M14
- Wiersz 3: Numer modułu; 14 z 15
- Wiersz 4: Wersja; 2.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Subskrypcja i płatności” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Billing, usage, entitlements, limity, status subskrypcji, dokumenty rozliczeniowe oraz self-service należą do MVP. Funkcje płatnicze działają end-to-end dla wybranego providera i metod płatności dopuszczonych do MVP. Nieobsługiwane metody lub rynki nie są prezentowane jako dostępne; wymagany proces ręczny jest jawnie opisanym fallbackiem operacyjnym, a nie atrapą ekranu.

Storybook jest kontraktem stanów produkcyjnych. Każdy moduł należący do MVP ma stories dla happy path, loading, empty, no data, partial, stale, processing, success, validation error, permission denied, provider error, recoverable error, terminal error, cancellation i recovery. Nie wolno tworzyć martwych ekranów, atrap funkcji ani przycisków bez kontraktu akcji. Funkcja zależna od integracji jest aktywna tylko dla providerów z katalogu MVP.

## Podstawa źródłowa

Dokument 6: model komercyjny, pilot, pricing, metering, limity, billing, dunning i offboarding

Dokument 3: zamówienia kanoniczne jako możliwa jednostka meteringu

Dokument 5: płatny pilotaż i decyzja abonamentowa

Dokument 7: bezpieczeństwo płatności, dostęp i lifecycle danych

Analizę wykonano w kontekście całego pakietu siedmiu dokumentów źródłowych PapaData oraz przekazanej syntezy UI/UX.

## Oznaczenia

Tabela:
- Wiersz 1: Typ; Znaczenie
- Wiersz 2: Fakt; Wynika bezpośrednio z dokumentacji źródłowej.
- Wiersz 3: Założenie; Potrzebne do zbudowania spójnego flow, lecz niewskazane jednoznacznie.
- Wiersz 4: Rekomendacja; Proponowana decyzja projektowa wynikająca z wymagań.
- Wiersz 5: Decyzja UI/UX do podjęcia; Brak rozstrzygnięcia wpływający na interfejs lub proces.

## Zasady numeracji

Tabela:
- Wiersz 1: Identyfikator; Zakres
- Wiersz 2: M14-E01…; ekrany i widoki
- Wiersz 3: M14-P01…; przepływy użytkownika
- Wiersz 4: M14-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M14-K01…; komponenty i wzorce UI
- Wiersz 6: M14-R01…; ryzyka UX
- Wiersz 7: M14-D01…; decyzje UI/UX do podjęcia

## Spis treści

1. Wnioski główne

2. Mapa produktu od strony UI/UX

3. Lista wymaganych ekranów

4. Flow użytkownika

5. Stany ekranów

6. Formularze i dane wejściowe

7. Komunikaty i mikrocopy

8. Komponenty i wzorce UI

9. Struktura Storybooka

10. Priorytet MVP

11. Ryzyka UX

12. Luki w dokumentacji

13. Rekomendowana kolejność projektowania

## 1. Wnioski główne

Tabela:
- Wiersz 1: Fakty z dokumentacji • PapaData ma stosować model hybrydowy: opłata bazowa za pion, pakiet użycia, rozszerzenia i opcjonalna opłata wdrożeniowa. • Pilotaż jest płatny, z konkretną ceną, walutą, terminem, zakresem i kryteriami. • Zamówienia kanoniczne mogą być jednostką meteringu, ale nie są samodzielną miarą wartości. • Brak płatności może ograniczać nowe sync, AI, reprocessing lub dodatkowy Support, lecz nie powinien powodować niekontrolowanego usunięcia danych. • Ceny, progi, operator płatności i finalny publiczny cennik wymagają walidacji.

Tabela:
- Wiersz 1: Założenia • P1 obsługuje faktury i płatności B2B; self-service i karta należą do MVP dla wybranego providera płatności; późniejsze są dodatkowe metody, rynki i providerzy. • Billing Administrator może zarządzać rozliczeniami bez dostępu do pełnych danych analitycznych. • Metering pokazuje dane potwierdzone, estymowane i niezmierzone jako odrębne stany.

Tabela:
- Wiersz 1: Rekomendacje • Oddzielić plan/entitlements, rzeczywiste użycie, prognozę, fakturę i status płatności. • Każda jednostka użycia ma źródło, okres, wersję cennika i status rekoncyliacji. • Dunning ma jasno pokazać kwotę, termin, ograniczone funkcje i zachowane prawa dostępu do danych/faktur. • Anulowanie subskrypcji prowadzić przez offboarding: eksport, disconnect, retencja i usunięcie, nie tylko przycisk.

## 1.1. Konsekwencje dla projektu

Moduł „Subskrypcja i płatności” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Billing Administrator; Kontrola planu, użycia, faktur i płatności.; Billing screens.
- Wiersz 3: Właściciel biznesowy; Ocena wartości, kosztu i kontynuacji.; Upgrade/renew/cancel decision.
- Wiersz 4: Administrator workspace; Wpływ limitów na funkcje.; Usage and restrictions.
- Wiersz 5: Commercial Owner PapaData; Cena, korekty, rabaty, pilot->subscription.; Operations billing.
- Wiersz 6: Finance/Support; Faktury, payment issues, corrections.; Cases and audit.

## 2.2. Pozycja modułu w produkcie

Moduł M14 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 6: model komercyjny, pilot, pricing, metering, limity, billing, dunning i offboarding

Dokument 3: zamówienia kanoniczne jako możliwa jednostka meteringu

Dokument 5: płatny pilotaż i decyzja abonamentowa

Dokument 7: bezpieczeństwo płatności, dostęp i lifecycle danych

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M14-E01
Przegląd subskrypcji; Cel: Zrozumienie planu, statusu, zakresu i następnego rozliczenia.
Użytkownik: Billing Admin/Owner
Główna akcja: Otwórz plan lub fakturę; Treści: Plan/vertical, status, period, price components, entitlements, renewal, payment state.
Dane: Wejście: subscription. Wyjście: view/change request.
Komponenty: Plan summary; entitlement list; payment banner.; Stany: pilot, active, trial not assumed, past due, cancelled, ending
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M14-E02
Użycie i limity; Cel: Kontrola meteringu, limitów i prognozy.
Użytkownik: Billing Admin/Admin workspace
Główna akcja: Przejrzyj źródło użycia; Treści: Canonical orders, sources, history, AI, support, reprocessing; included/used/forecast.
Dane: Wejście: metering events. Wyjście: alert/change request.
Komponenty: Usage meters; source breakdown; reconciliation status.; Stany: unmeasured, estimated, partial, reconciled, over limit
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M14-E03
Szczegóły planu i rozszerzeń; Cel: Wyjaśnienie zakresu pionu i add-onów.
Użytkownik: Owner/Billing Admin
Główna akcja: Poproś o zmianę; Treści: Base vertical, users, sources, volume, frequency, support, AI, custom scope.
Dane: Wejście: plan catalog/contract. Wyjście: quote/change request.
Komponenty: Entitlement table; comparison; effective date.; Stany: available, not eligible, quote required, pending change
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M14-E04
Faktury; Cel: Lista i status dokumentów rozliczeniowych.
Użytkownik: Billing Admin
Główna akcja: Otwórz/pobierz fakturę; Treści: Number, period, issue/due date, amount, currency, tax, status, corrections.
Dane: Wejście: invoices. Wyjście: invoice file/case.
Komponenty: Table; status; download; correction link.; Stany: empty, issued, paid, overdue, corrected, cancelled
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M14-E05
Szczegóły faktury; Cel: Wyjaśnienie pozycji i podstawy naliczenia.
Użytkownik: Billing Admin
Główna akcja: Zapłać lub zgłoś problem; Treści: Base fee, add-ons, usage units, rate version, taxes, credits, payment status.
Dane: Wejście: invoice + billing events. Wyjście: payment/case.
Komponenty: Line items; usage evidence; payment CTA.; Stany: loading, discrepancy, payment processing, paid, failed
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M14-E06
Metoda płatności; Cel: Zarządzanie dozwolonym sposobem płatności.
Użytkownik: Billing Admin
Główna akcja: Dodaj/zmień metodę; Treści: Method type, billing data, mandate/status, provider-hosted fields.
Dane: Wejście: payment provider. Wyjście: tokenized method.
Komponenty: Hosted form; security note; verification.; Stany: not configured, verifying, active, failed, expired
Priorytet: P1/P2
Podstawa: Zależne od decyzji operatora.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M14-E07
Zaległa płatność; Cel: Wyjaśnienie długu i bezpiecznego ograniczenia funkcji.
Użytkownik: Billing Admin/Owner
Główna akcja: Ureguluj lub skontaktuj się; Treści: Amount, due date, days overdue, restricted functions, retained access, timeline.
Dane: Wejście: dunning state. Wyjście: payment/case.
Komponenty: Impact banner; invoice link; recovery timeline.; Stany: reminder, past due, restricted, payment processing, restored
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M14-E08
Korekty, refundy i spory; Cel: Audytowalna obsługa rozbieżności billingowych.
Użytkownik: Billing Admin/Finance
Główna akcja: Zgłoś/rozpatrz korektę; Treści: Reason, before/after, evidence, owner, customer/revenue impact, status.
Dane: Wejście: case. Wyjście: credit/correction/denial.
Komponenty: Case form; evidence; timeline; approval.; Stany: draft, review, approved, rejected, applied
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 10: M14-E09
Zmiana/anulowanie subskrypcji; Cel: Kontrolowany upgrade/downgrade/offboarding.
Użytkownik: Owner/Billing Admin
Główna akcja: Zatwierdź zmianę; Treści: New scope, effective date, proration decision, feature/data impact, export, retention.
Dane: Wejście: change request. Wyjście: scheduled change/offboarding.
Komponenty: Impact summary; approval; checklist.; Stany: quote, pending approval, scheduled, processing, completed
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 11: M14-E10
Podsumowanie pilotażu i oferta abonamentu; Cel: Przejście od zmierzonej wartości i kosztu do decyzji komercyjnej.
Użytkownik: Owner/Pilot Owner
Główna akcja: Akceptuj/odrzuć ofertę; Treści: Pilot results, costs, value, proposed plan, price, limits, conditions.
Dane: Wejście: pilot summary + commercial model. Wyjście: subscription decision.
Komponenty: Summary; evidence; offer; decision.; Stany: not ready, offered, negotiating, accepted, rejected, expired
Priorytet: P0/P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M14-P01 — Pilot do abonamentu

Punkt startowy: Pilotaż ma podsumowanie wartości i kosztu.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Review results
- Wiersz 3: 2; Check unit economics
- Wiersz 4: 3; Prepare concrete offer
- Wiersz 5: 4; Customer review
- Wiersz 6: 5; Negotiate within policy
- Wiersz 7: 6; Accept/reject
- Wiersz 8: 7; Create subscription
- Wiersz 9: 8; Set billing period/entitlements

Punkty decyzyjne:

Value confirmed?

Margin acceptable?

Security/ops ready?

Błędy i blokery:

No cost data

No useful result

Offer expired

Sukces: Active subscription or explicit end/extension.

Ścieżki alternatywne:

Extend pilot

Change scope

Offboard

## 4.2. M14-P02 — Zaległa płatność

Punkt startowy: Invoice overdue.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Reminder
- Wiersz 3: 2; Show amount/due date
- Wiersz 4: 3; Apply safe restriction according to policy
- Wiersz 5: 4; Maintain history/invoice access
- Wiersz 6: 5; Payment or case
- Wiersz 7: 6; Verify settlement
- Wiersz 8: 7; Restore new operations
- Wiersz 9: 8; Audit

Punkty decyzyjne:

Which features restricted?

Payment confirmed?

Dispute active?

Błędy i blokery:

Payment provider delay

Wrong invoice

No billing admin

Sukces: Access restored or controlled case.

Ścieżki alternatywne:

Payment plan/exception if approved

Manual reconciliation

## 4.3. M14-P03 — Anulowanie/offboarding

Punkt startowy: Owner requests cancellation.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Impact analysis
- Wiersz 3: 2; Confirm effective date
- Wiersz 4: 3; Offer export
- Wiersz 5: 4; Disconnect sources
- Wiersz 6: 5; Stop future billing/sync according to policy
- Wiersz 7: 6; Apply retention/delete process
- Wiersz 8: 7; Revoke access
- Wiersz 9: 8; Provide evidence

Punkty decyzyjne:

Immediate or end period?

Legal retention?

Open balance?

Błędy i blokery:

Export failed

Delete dependency

Dispute

Sukces: Controlled end without uncontrolled data loss.

Ścieżki alternatywne:

Downgrade

Pause if supported

Extend export window

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Subskrypcja i płatności” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
- Wiersz 5: Częściowe dane; Pokazać wyłącznie wiarygodny zakres, kompletność i listę braków.; Stan nie może wizualnie przypominać gotowego wyniku.
- Wiersz 6: Błąd; Klasa błędu, zakres, wpływ biznesowy, identyfikator i dostępna ścieżka naprawy.; Rozdzielić retry użytkownika, administratora i Supportu.
- Wiersz 7: Brak dostępu; Neutralna informacja bez ujawniania zawartości obiektu.; Wskazać wymaganą rolę lub administratora; autoryzacja po stronie serwera.
- Wiersz 8: Sukces; Potwierdzenie faktycznego rezultatu i następnego kroku.; Nie ograniczać sukcesu do znikającego toastu.
- Wiersz 9: Ostrzeżenie; Kontekst, zakres, wpływ na dane/KPI i możliwość rozwinięcia dowodów.; Kolor nie jest jedynym nośnikiem znaczenia.
- Wiersz 10: Wygasła sesja; Ponowne logowanie z zachowaniem bezpiecznego punktu powrotu.; Po zalogowaniu ponownie zweryfikować tenant, workspace i capability.
- Wiersz 11: Wygasły link; Link nie umożliwia dostępu; podać bezpieczny sposób wygenerowania nowego.; Nie ujawniać danych tenanta ani odbiorcy ponad minimum.
- Wiersz 12: Przetwarzanie; Widoczny etap, zakres, czas rozpoczęcia i możliwość opuszczenia ekranu.; Operacje asynchroniczne muszą być dostępne później w historii.
- Wiersz 13: Oczekiwanie na dane; Źródło oczekiwania, właściciel i kolejna kontrola.; Brak danych nie może być reprezentowany jako zero.
- Wiersz 14: Konflikt danych; Konkurencyjne wartości, dowody, wpływ i właściciel rozstrzygnięcia.; Blokada tylko dla zależnego zakresu/KPI.
- Wiersz 15: Nieukończona konfiguracja; Lista brakujących elementów i zależności.; Nie deklarować gotowości, dopóki wymagania nie są spełnione.
- Wiersz 16: Dane nieaktualne; Ostatni poprawny stan i zakres nadal wiarygodny.; Stale nie usuwa historii, ale wymaga wyraźnej daty aktualności.
- Wiersz 17: Wymaga administratora; Akcja jest widoczna, lecz niedostępna; podać wymaganą rolę.; Nie proponować obejścia uprawnień.
- Wiersz 18: Problem bezpieczeństwa; Bezpieczny komunikat klientowski i ograniczenie tylko właściwego zakresu.; Pełna diagnostyka wyłącznie dla uprawnionych osób.

## 5.1. Model statusu złożonego

Interfejs powinien syntetyzować stan z wymiarów: zakres, faza, dostęp, gotowość, problem, wynik, czas, integralność, wpływ biznesowy i następna akcja. Użytkownik widzi najpierw status biznesowy, następnie wpływ, a szczegóły techniczne dopiero po rozwinięciu.

## 6. Formularze i dane wejściowe

## 6.1. M14-F01 — Zmiana planu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Current plan
• Requested vertical/add-ons
• Effective date
• Reason
• Expected usage
• Approver
- Wiersz 3: Walidacje; • Eligibility
• Quote required
• Dependency and data impact
• Owner capability
- Wiersz 4: Błędy; • Unavailable addon
• Open overdue balance
• Ops not ready
- Wiersz 5: Sukces; Quote/request/scheduled change.
- Wiersz 6: Zależności backendowe; Subscription, entitlements, billing, operations.
- Wiersz 7: Ryzyka UX; Plan change must not grant security permissions.

## 6.2. M14-F02 — Metoda płatności

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Provider-hosted payment fields
• Billing address
• Tax data if applicable
• Consent/mandate
- Wiersz 3: Walidacje; • No raw card storage in PapaData
• Provider verification
• Country/tax validation
- Wiersz 4: Błędy; • Verification failed
• Expired method
• 3DS/mandate issue
- Wiersz 5: Sukces; Tokenized active method.
- Wiersz 6: Zależności backendowe; Payment processor, billing profile, audit.
- Wiersz 7: Ryzyka UX; Final fields depend on operator and legal/tax review.

## 6.3. M14-F03 — Korekta billingowa

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Invoice/event
• Reason
• Amount before/after
• Evidence
• Owner
• Customer impact
- Wiersz 3: Walidacje; • No zero for unknown usage
• Approval threshold
• Audit and pricing version
- Wiersz 4: Błędy; • Metering unreconciled
• Duplicate correction
• Period closed
- Wiersz 5: Sukces; Credit/corrected invoice or rejection.
- Wiersz 6: Zależności backendowe; Billing engine, metering, finance workflow.
- Wiersz 7: Ryzyka UX; UI must distinguish estimate from final.

## 6.4. M14-F04 — Anulowanie

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Effective date
• Reason
• Export choice
• Source disconnect
• Retention/delete choice
• Acknowledgement
- Wiersz 3: Walidacje; • Owner capability
• Open invoices
• Data lifecycle checks
• Reauth
- Wiersz 4: Błędy; • Critical export pending
• Legal hold
• No successor owner
- Wiersz 5: Sukces; Scheduled offboarding.
- Wiersz 6: Zależności backendowe; Subscription, access, integrations, data lifecycle.
- Wiersz 7: Ryzyka UX; Cancellation does not mean immediate deletion.

## 6.5. Zasady wspólne formularzy

Walidacja klientowa wspiera użytkownika, lecz decyzja o dostępie i integralności jest serwerowa.

Błędy są przypisane do pola lub kroku; komunikat globalny zawiera wpływ i dalsze działanie.

Dane wrażliwe i sekrety są write-only i nie wracają w interfejsie.

Operacje istotne wymagają podsumowania wpływu, potwierdzenia, a w razie potrzeby reautoryzacji/MFA.

Po sukcesie interfejs pokazuje rezultat procesu i kolejny krok, nie tylko toast.

## 7. Komunikaty i mikrocopy

Mikrocopy odpowiada na cztery pytania: co się stało, czego dotyczy, jaki jest wpływ oraz kto i co powinien zrobić.

Tabela:
- Wiersz 1: Kontekst; Rekomendowany komunikat
- Wiersz 2: Usage partial; Użycie za ten okres jest częściowe; część zdarzeń nie została jeszcze zrekoncyliowana.
- Wiersz 3: Unknown cost; Koszt nie został zmierzony. Nie prezentujemy go jako 0.
- Wiersz 4: Overage forecast; Przy obecnym tempie przekroczysz pakiet około 26 lipca.
- Wiersz 5: Past due; Płatność jest opóźniona o 7 dni. Nowe synchronizacje są wstrzymane; dane historyczne i faktury pozostają dostępne.
- Wiersz 6: Payment processing; Płatność jest potwierdzana przez operatora. Ograniczenia zostaną zdjęte po weryfikacji.
- Wiersz 7: Entitlement; Plan umożliwia dodatkowe źródło, ale dostęp użytkownika nadal zależy od capabilities.
- Wiersz 8: Cancel; Anulowanie zatrzyma przyszłe usługi zgodnie z datą. Dane będą obsłużone w osobnym procesie retencji/usunięcia.
- Wiersz 9: Pilot offer; Oferta wynika z zakresu, zmierzonego użycia i kosztu pilotażu; nie potwierdza jeszcze gotowości wszystkich integracji.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M14-K01; Podsumowanie planu; Vertical, status, period, renewal, price.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M14-K02; Tabela uprawnień planu; Included scopes without security implication.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M14-K03; Miernik użycia; Included/used/forecast/status/evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M14-K04; Wiersz pomiaru użycia; Unit, quantity, source, pricing version, reconciliation.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M14-K05; Faktura i pozycje; Line items and usage evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M14-K06; Baner zaległej płatności; Amount, due, restrictions, next action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M14-K07; Sprawa korekty; Before/after, reason, evidence, owner.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M14-K08; Analiza wpływu planu; Features, data, sync, billing, effective date.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M14-K09; Lista kontrolna zakończenia współpracy; Export, disconnect, access, retention, evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

## 8.1. Wzorce przekrojowe

Tabela:
- Wiersz 1: Wzorzec; Zastosowanie
- Wiersz 2: Nagłówek zaufania; Gotowość, świeżość, kompletność, integralność, walidacja i ograniczenia.
- Wiersz 3: Banner wpływu biznesowego; Tłumaczy problem techniczny na wpływ dla bieżącego zakresu.
- Wiersz 4: Pasek następnej akcji; Jedna dominująca akcja wynikająca ze stanu.
- Wiersz 5: Inspektor statusu; Rozwijane szczegóły fazy, dostępu, gotowości, problemu i integralności.
- Wiersz 6: Szuflada dowodów; Definicja, źródła, lineage, wersja i ograniczenia.
- Wiersz 7: Pasek operacji asynchronicznej; Etap, zakres, start i link do historii procesu.
- Wiersz 8: Wzorzec zatwierdzenia człowieka; Podgląd wpływu, odpowiedzialny, reautoryzacja, wynik i audyt.

## 8.2. Wykresy i hierarchia

Wykres pokazuje okres, porównanie, gotowość, przerwy w danych i zmianę definicji.

Nie interpolować brakujących okresów jako zera.

Wykres musi prowadzić do źródeł, ograniczeń albo decyzji.

Stosować separatory, warstwy, osadzone panele i command-center zamiast ciężkich, równorzędnych kart.

Przewidzieć jasny i ciemny motyw oraz nasycone, lecz nieneonowe kolory semantyczne.

## 9. Struktura Storybooka

Storybook ma prezentować kompletne scenariusze i stany, a nie tylko oderwane komponenty. Nazwy folderów, historii i wariantów pozostają po polsku.

Tabela:
- Wiersz 1: Typ; Polska nazwa w Storybooku
- Wiersz 2: Folder; Rozliczenia/Subskrypcja
- Wiersz 3: Folder; Rozliczenia/Użycie_i_limity
- Wiersz 4: Folder; Rozliczenia/Plany
- Wiersz 5: Folder; Rozliczenia/Faktury
- Wiersz 6: Folder; Rozliczenia/Płatności
- Wiersz 7: Folder; Rozliczenia/Zaległa_płatność
- Wiersz 8: Folder; Rozliczenia/Korekty
- Wiersz 9: Folder; Rozliczenia/Zmiana_i_anulowanie
- Wiersz 10: Folder; Rozliczenia/Pilotaż_do_abonamentu
- Wiersz 11: Historia; Subskrypcja/Pilotaż
- Wiersz 12: Historia; Użycie/Niezmierzone
- Wiersz 13: Historia; Użycie/Przekroczenie_prognozowane
- Wiersz 14: Historia; Faktura/Rozbieżność
- Wiersz 15: Historia; Płatność/Weryfikacja
- Wiersz 16: Historia; Zaległa_płatność/Bezpieczne_ograniczenie
- Wiersz 17: Historia; Korekta/Odrzucona
- Wiersz 18: Historia; Anulowanie/Retencja
- Wiersz 19: Historia; Przepływy/Pilotaż_do_abonamentu
- Wiersz 20: Wariant; Administrator_rozliczeń
- Wiersz 21: Wariant; Właściciel
- Wiersz 22: Wariant; Tylko_odczyt
- Wiersz 23: Wariant; PLN
- Wiersz 24: Wariant; Inna_waluta
- Wiersz 25: Wariant; Faktura_B2B
- Wiersz 26: Wariant; Brak_metody
- Wiersz 27: Wariant; Wygasła_sesja

## 9.1. Minimalny kontrakt historii

Kontekst roli, tenanta i workspace.

Dane wejściowe i stan domenowy.

Akcja użytkownika i spodziewana odpowiedź.

Wariant jasny i ciemny.

Obsługa klawiatury, fokusu i wysokiego kontrastu.

Stany: domyślny, ładowanie, pusty, częściowy, błąd, brak dostępu, sukces i wygasła sesja.

Pełny flow od punktu startowego do sukcesu oraz ścieżki błędu.

## 10. Priorytet MVP

Tabela:
- Wiersz 1: Priorytet; Zakres
- Wiersz 2: P0; Concrete paid pilot record and commercial decision, possibly operationally managed.
- Wiersz 3: P1; Subscription overview, usage, invoices, dunning, corrections, plan changes, offboarding.
- Wiersz 4: P2; Additional payment providers, markets, partner billing variants and enterprise procurement after validation.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M14-R01; Metering as value; Wrong incentives.; Separate usage from outcome.
- Wiersz 3: M14-R02; Unknown=0; Underestimated cost/invoice issue.; Unmeasured/estimated states.
- Wiersz 4: M14-R03; Past due deletes data; Trust/legal risk.; Safe feature restrictions.
- Wiersz 5: M14-R04; Plan grants access; Security flaw.; Entitlement separate from capability.
- Wiersz 6: M14-R05; Cancellation one click; Incomplete lifecycle.; Offboarding workflow.
- Wiersz 7: M14-R06; Final pricing too early; Unvalidated economics.; Quote/pilot validation.
- Wiersz 8: M14-R07; Raw payment data; Security/compliance.; Hosted tokenization.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M14-D01; Prices and thresholds; Conditional decision; Validate pilots.; Final UI values.
- Wiersz 3: M14-D02; Payment operator; Decision; Provider and methods.; Payment flow.
- Wiersz 4: M14-D03; Tax/VAT model; Requires expert; Invoice fields and treatment.; Billing UX.
- Wiersz 5: M14-D04; Metering contract; Luka; Units, events, reconciliation.; Usage/invoices.
- Wiersz 6: M14-D05; Dunning policy; Decision UI/UX; Days and restrictions.; Past due.
- Wiersz 7: M14-D06; Proration/refunds; Luka; Change timing and formulas.; Plan changes.
- Wiersz 8: M14-D07; Self-service scope; Decision later; When signup/purchase enabled.; P2.
- Wiersz 9: M14-D08; Invoice export/retention; Luka; Formats and access after offboarding.; Lifecycle.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Finalize commercial objects and metering event.

Design pilot offer and subscription summary.

Design usage with measured/estimated/unknown states.

Design invoices and discrepancy evidence.

Design dunning safe restrictions.

Design plan changes and offboarding.

Operator-specific payment and self-service are implemented in MVP for the selected provider; later stages add providers, markets and payment variants.

Zbudować kompletne scenariusze i stany w Storybooku, łącznie z błędami oraz brakiem dostępu.

Przeprowadzić przegląd spójności z powłoką produktu, systemem statusów, bezpieczeństwem i kontraktem danych.

Dopiero po zatwierdzeniu flow i stanów przejść do finalnej hierarchii wizualnej i layoutów.

## 13.1. Brama projektowa

Tabela:
- Wiersz 1: Warunek rozpoczęcia finalnych layoutów • Zatwierdzona mapa ról, uprawnień i kontekstu tenant/workspace. • Zatwierdzony katalog ekranów i identyfikatorów. • Przetestowany prototyp głównego flow wraz ze stanami częściowymi i błędami. • Rozstrzygnięte decyzje krytyczne albo jawnie przyjęte założenia warunkowe. • Spójność nazewnictwa komponentów i historii Storybooka w języku polskim.

## Rejestr źródeł wykorzystanych w analizie

Dokument 1 — Dokumentacja biznesowo-produktowa PapaData

Dokument 2 — Rejestr decyzji i wymagań biznesowych

Dokument 3 — Kontrakt danych, stanów i KPI

Dokument 4 — Integracje i gotowość operacyjna

Dokument 5 — Pierwszy pion produktowy i płatny pilotaż

Dokument 6 — Model komercyjny i unit economics

Dokument 7 — Bezpieczeństwo, prywatność i AI Governance

Synteza architektury UI/UX PapaData przekazana w materiale roboczym

Koniec dokumentu.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
