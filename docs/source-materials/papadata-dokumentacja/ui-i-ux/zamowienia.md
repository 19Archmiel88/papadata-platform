# Zamówienia

PAPADATA

Zamówienia

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M06
- Wiersz 3: Numer modułu; 06 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Zamówienia” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: problem niespójnych zamówień, anulowań, zwrotów i refundów

Dokument 3: model kanoniczny, jeden fakt raz, brak danych nie jest zerem

Dokument 4: zakres WooCommerce, Shopify, BaseLinker i Allegro

Dokument 5: pierwszy pion D2C i KPI Orders Count/Gross Revenue

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
- Wiersz 2: M06-E01…; ekrany i widoki
- Wiersz 3: M06-P01…; przepływy użytkownika
- Wiersz 4: M06-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M06-K01…; komponenty i wzorce UI
- Wiersz 6: M06-R01…; ryzyka UX
- Wiersz 7: M06-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Zamówienia są podstawowym obiektem pierwszego pionu i źródłem Orders Count oraz Gross Revenue. • Ten sam fakt biznesowy może występować w wielu źródłach; do KPI trafia jeden wkład kanoniczny, z zachowaniem lineage. • Anulowanie, zwrot i refund są odrębnymi zdarzeniami; brak wartości nie jest automatycznie zerem. • Gotowość zamówień jest oceniana dla źródła, okresu, datasetu i KPI. • Marketplace/OMS zwiększa ryzyko source overlap i podwójnego liczenia.

Tabela:
- Wiersz 1: Założenia • Lista zamówień jest widokiem analitycznym read-only; modyfikacje statusów odbywają się w systemie źródłowym. • Domyślnie prezentowany jest rekord kanoniczny z możliwością zejścia do rekordów źródłowych. • PII klienta jest minimalizowane i widoczne wyłącznie, gdy jest niezbędne i użytkownik ma capability.

Tabela:
- Wiersz 1: Rekomendacje • Oddzielić status biznesowy zamówienia od statusu synchronizacji i integralności. • Na liście pokazywać pola kanoniczne; różnice źródeł przenieść do panelu lineage. • Timeline zdarzeń ma rozróżniać zamówienie, płatność, anulowanie, zwrot i refund. • Nie pozwalać użytkownikowi sumować partial datasetu bez jawnego komunikatu wpływu.

## 1.1. Konsekwencje dla projektu

Moduł „Zamówienia” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: E-commerce Manager; Kontrola sprzedaży i wyjątków.; Lista, detail, statusy, działania.
- Wiersz 3: Analityk; Weryfikacja KPI i rekordów.; Filtry, drill-down, lineage.
- Wiersz 4: Data Steward; Konflikty i duplikaty.; Manual review, source authority.
- Wiersz 5: Support/Operations; Diagnoza konkretnych rekordów.; Runy, mapping, reprocessing.
- Wiersz 6: Użytkownik tylko do odczytu; Konsumpcja zatwierdzonych wyników.; Ograniczony detail bez PII.

## 2.2. Pozycja modułu w produkcie

Moduł M06 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: problem niespójnych zamówień, anulowań, zwrotów i refundów

Dokument 3: model kanoniczny, jeden fakt raz, brak danych nie jest zerem

Dokument 4: zakres WooCommerce, Shopify, BaseLinker i Allegro

Dokument 5: pierwszy pion D2C i KPI Orders Count/Gross Revenue

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M06-E01
Przegląd zamówień; Cel: Ocena wolumenu, przychodu, anulowań i refundów.
Użytkownik: E-commerce Manager
Główna akcja: Otwórz KPI lub listę; Treści: Orders Count, Gross Revenue, cancellations, refunds, completeness, period.
Dane: Wejście: orders dataset/KPI. Wyjście: analysis.
Komponenty: KPI strip; trend; Trust Header; issue banner.; Stany: no data, partial, ready, stale, conflict
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M06-E02
Lista zamówień; Cel: Przegląd rekordów kanonicznych i wyjątków.
Użytkownik: Manager/analityk
Główna akcja: Otwórz zamówienie; Treści: ID kanoniczne, external IDs, źródło, data, status, wartość, refund, quality.
Dane: Wejście: canonical orders. Wyjście: detail/export.
Komponenty: Tabela; filters; column chooser; status chips.; Stany: loading, empty, partial rows, no access, error
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M06-E03
Szczegóły zamówienia; Cel: Zrozumienie rekordu, źródeł i zdarzeń.
Użytkownik: Analityk/Data Steward
Główna akcja: Otwórz lineage lub zgłoś problem; Treści: Dane kanoniczne, pozycje, płatności, status timeline, refunds, sources, limitations.
Dane: Wejście: canonicalOrderId. Wyjście: issue/review.
Komponenty: Header; event timeline; items table; Evidence Drawer.; Stany: ready, conflict, duplicate suspected, partial, deleted source
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M06-E04
Oś statusów i refundów; Cel: Oddzielenie zdarzeń wpływających na KPI.
Użytkownik: Manager/analityk
Główna akcja: Przejrzyj zdarzenie; Treści: Order created/paid/cancelled/returned/refunded; timestamps, source, amount.
Dane: Wejście: events. Wyjście: event detail.
Komponenty: Timeline; event badges; source tooltip.; Stany: missing timestamp, conflicting status, partial refund, late event
Priorytet: P0
Podstawa: Rekomendacja z kontraktu.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M06-E05
Porównanie źródeł zamówienia; Cel: Pokazanie overlap i różnic bez podwójnego liczenia.
Użytkownik: Data Steward
Główna akcja: Rozstrzygnij lub eskaluj; Treści: Values per source, exact match keys, authority, differences, impact.
Dane: Wejście: source records. Wyjście: manual review/rule.
Komponenty: Side-by-side diff; match evidence; impact.; Stany: exact match, possible overlap, confirmed duplicate, unresolved
Priorytet: P0 marketplace
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M06-E06
Rekoncyliacja okresu; Cel: Ocena zgodności liczby i wartości między źródłem a PapaData.
Użytkownik: Analityk/Operations
Główna akcja: Uruchom/otwórz rekoncyliację; Treści: Counts, totals, missing IDs, extra IDs, timing, tolerance, result.
Dane: Wejście: source snapshot + canonical. Wyjście: reconciliation result.
Komponenty: Summary; difference table; drill-down.; Stany: queued, running, partial, failed, passed, failed tolerance
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M06-E07
Eksport zamówień; Cel: Kontrolowany eksport dozwolonego zakresu.
Użytkownik: Analityk z capability
Główna akcja: Wygeneruj eksport; Treści: Scope, period, columns, purpose, recipient, expiry.
Dane: Wejście: export request. Wyjście: async file/link.
Komponenty: Export wizard; impact; async bar.; Stany: processing, ready, expired link, revoked, failed
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M06-E08
Problem zamówienia; Cel: Zgłoszenie błędu danych bez modyfikacji źródła.
Użytkownik: Manager/analityk
Główna akcja: Zgłoś problem; Treści: Record, issue type, evidence, impact, owner, expected resolution.
Dane: Wejście: issue. Wyjście: data issue/support case.
Komponenty: Issue form; evidence; status timeline.; Stany: draft, open, waiting, resolved, rejected
Priorytet: P0/P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M06-P01 — KPI do rekordu źródłowego

Punkt startowy: Użytkownik widzi zmianę Orders Count/Gross Revenue.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Otwórz KPI
- Wiersz 3: 2; Wybierz breakdown
- Wiersz 4: 3; Przejdź do listy
- Wiersz 5: 4; Otwórz order detail
- Wiersz 6: 5; Evidence/lineage
- Wiersz 7: 6; Zapisz observation lub issue

Punkty decyzyjne:

KPI ready?

PII access?

Konflikt wpływa na KPI?

Błędy i blokery:

Partial period

No capability

Record missing

Sukces: Wyjaśniony wkład zamówienia do KPI.

Ścieżki alternatywne:

Eksport

Data Steward review

Return to KPI

## 4.2. M06-P02 — Konflikt/duplikat zamówienia

Punkt startowy: System wykrywa overlap.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Create conflict
- Wiersz 3: 2; Show source records
- Wiersz 4: 3; Exact match evidence
- Wiersz 5: 4; Check source authority
- Wiersz 6: 5; Manual decision if needed
- Wiersz 7: 6; Reprocess affected scope
- Wiersz 8: 7; Recalculate KPI

Punkty decyzyjne:

Exact match?

Authority exists?

Fuzzy allowed?

Błędy i blokery:

Cross-tenant risk

Ambiguous match

No reviewer

Sukces: Jeden fakt zasila KPI i pozostaje audyt.

Ścieżki alternatywne:

Leave unresolved + block dependent KPI

Escalate expert

## 4.3. M06-P03 — Eksport zamówień

Punkt startowy: Użytkownik ma capability export.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Choose scope
- Wiersz 3: 2; Preview sensitivity
- Wiersz 4: 3; Purpose/recipient
- Wiersz 5: 4; Reauth if needed
- Wiersz 6: 5; Create async job
- Wiersz 7: 6; Notify
- Wiersz 8: 7; Download before expiry

Punkty decyzyjne:

Scope allowed?

PII required?

Size limit?

Błędy i blokery:

Session expired

Job failed

Link expired

Sukces: Kontrolowany eksport z audytem.

Ścieżki alternatywne:

Narrow scope

Regenerate

Revoke

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Zamówienia” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M06-F01 — Filtry zamówień

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Okres
• Źródło/kanał
• Status
• Refund state
• Value range
• Quality state
• Search ID
- Wiersz 3: Walidacje; • Timezone/reporting period
• Server-side access
• No hidden aggregation of partial
- Wiersz 4: Błędy; • Invalid date
• No source access
• Too broad query
- Wiersz 5: Sukces; Jawny zakres listy.
- Wiersz 6: Zależności backendowe; Orders query, permissions, pagination.
- Wiersz 7: Ryzyka UX; PII search must be restricted.

## 6.2. M06-F02 — Zgłoszenie problemu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Order ID
• Typ
• Opis
• Wpływ
• Dowód
• Owner
• Pilność
- Wiersz 3: Walidacje; • Order in current tenant
• No secrets in attachment
• Impact required
- Wiersz 4: Błędy; • Record changed
• Duplicate case
• No capability
- Wiersz 5: Sukces; Data issue/support case.
- Wiersz 6: Zależności backendowe; Issue service, audit, notifications.
- Wiersz 7: Ryzyka UX; User report is not source-of-truth correction.

## 6.3. M06-F03 — Eksport zamówień

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Zakres
• Okres
• Kolumny
• Format
• Cel
• Odbiorca
• TTL
- Wiersz 3: Walidacje; • Capability
• PII minimization
• Size/format limits
• Reauth for sensitive
- Wiersz 4: Błędy; • Too large
• Forbidden fields
• Expired session
- Wiersz 5: Sukces; Async export with expiry.
- Wiersz 6: Zależności backendowe; Export service, storage, audit, revocation.
- Wiersz 7: Ryzyka UX; Link must not be reusable beyond policy.

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
- Wiersz 2: Partial orders; Lista obejmuje 94% potwierdzonych zamówień w tym okresie.
- Wiersz 3: No data; Brak potwierdzonych zamówień. Nie interpretujemy tego jako 0.
- Wiersz 4: Duplicate; Dwa źródła opisują prawdopodobnie to samo zamówienie; jeden wkład jest wstrzymany.
- Wiersz 5: Refund conflict; Źródła podają różne kwoty refundu. KPI marżowe jest zablokowane.
- Wiersz 6: Read-only; PapaData pokazuje dane analityczne. Status zamówienia zmień w systemie źródłowym.
- Wiersz 7: Late event; Refund dotarł po zamknięciu okresu i może zmienić wynik historyczny.
- Wiersz 8: Export; Eksport jest przygotowywany. Link będzie ważny przez określony czas.
- Wiersz 9: PII hidden; Dane klienta są ukryte, ponieważ nie są potrzebne do tego zadania.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M06-K01; Tabela zamówień kanonicznych; Canonical fields + quality state.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M06-K02; Nagłówek zamówienia; ID, source, status, amount, trust.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M06-K03; Oś zdarzeń zamówienia; Order/payment/cancel/return/refund.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M06-K04; Panel pochodzenia danych; Source records and transformations.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M06-K05; Porównanie źródeł; Field-level comparison and authority.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M06-K06; Znacznik wkładu do KPI; Included/excluded/blocked with reason.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M06-K07; Podsumowanie rekoncyliacji; Counts, totals, tolerance, result.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M06-K08; Kreator eksportu; Scope, sensitivity, expiry.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M06-K09; Wiersz problemu danych; Class, impact, owner, action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Zamówienia/Przegląd
- Wiersz 3: Folder; Zamówienia/Lista
- Wiersz 4: Folder; Zamówienia/Szczegóły
- Wiersz 5: Folder; Zamówienia/Oś_zdarzeń
- Wiersz 6: Folder; Zamówienia/Porównanie_źródeł
- Wiersz 7: Folder; Zamówienia/Rekoncyliacja
- Wiersz 8: Folder; Zamówienia/Eksport
- Wiersz 9: Historia; Przegląd/Dane_częściowe
- Wiersz 10: Historia; Lista/Pusty
- Wiersz 11: Historia; Szczegóły/Konflikt_refundu
- Wiersz 12: Historia; Oś/Częściowy_refund
- Wiersz 13: Historia; Źródła/Potwierdzony_duplikat
- Wiersz 14: Historia; Rekoncyliacja/Poza_tolerancją
- Wiersz 15: Historia; Eksport/Wygasły_link
- Wiersz 16: Historia; Przepływy/KPI_do_pochodzenia_danych
- Wiersz 17: Wariant; D2C
- Wiersz 18: Wariant; Platforma_handlowa
- Wiersz 19: Wariant; Jedno_źródło
- Wiersz 20: Wariant; Wiele_źródeł
- Wiersz 21: Wariant; Bez_danych_osobowych
- Wiersz 22: Wariant; Tylko_odczyt
- Wiersz 23: Wariant; Długi_okres
- Wiersz 24: Wariant; Wygasła_sesja

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
- Wiersz 2: P0; Overview, list, detail, event timeline, source evidence, Orders Count/Gross Revenue, cancellations/refunds.
- Wiersz 3: P1; Reconciliation, export, saved views, customer-facing issue tracking.
- Wiersz 4: P2; Advanced matching, bulk review, operational write-back only after governance.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M06-R01; Source order shown as canonical truth; Wrong KPI.; Canonical record + lineage.
- Wiersz 3: M06-R02; Cancel/refund/return merged; Wrong revenue/margin.; Separate event model.
- Wiersz 4: M06-R03; PII visible by default; Privacy risk.; Minimize and capability gate.
- Wiersz 5: M06-R04; Partial list summed as full; Wrong decisions.; Completeness and scope.
- Wiersz 6: M06-R05; Cross-source duplicate; Double counting.; Overlap detection and one contribution.
- Wiersz 7: M06-R06; Editing source status in PapaData; Divergence.; Read-only analytics in MVP.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M06-D01; Canonical order contract; Luka; Final fields and versions.; List/detail.
- Wiersz 3: M06-D02; Status mapping per provider; Luka; Business status rules.; Timeline/KPI.
- Wiersz 4: M06-D03; Refund vs return; Decyzja UI/UX do podjęcia; Presentation and impact.; Correct interpretation.
- Wiersz 5: M06-D04; PII scope; Decyzja bezpieczeństwa; Fields visible by role.; Privacy.
- Wiersz 6: M06-D05; Reconciliation tolerances; Luka; Thresholds per provider/period.; Pass/fail.
- Wiersz 7: M06-D06; Export formats/limits; Luka; CSV/XLSX/TTL/size.; Export flow.
- Wiersz 8: M06-D07; Late-arriving events; Decyzja UI/UX do podjęcia; Historical update communication.; Trust in trends.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Finalize canonical order and status mappings.

Design overview/list with trust.

Design detail + event timeline + lineage.

Add duplicate/conflict states.

Connect to KPI contribution and quality.

Add reconciliation/export.

Test D2C then marketplace overlap.

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
