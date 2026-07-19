# Klienci

PAPADATA

Klienci

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M08
- Wiersz 3: Numer modułu; 08 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Klienci” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: klienci w zakresie niezbędnym do analityki

Dokument 3: dane organizacyjne/sprzedażowe i gotowość lokalna

Dokument 4: dane klientów w integracjach D2C tylko w niezbędnym zakresie

Dokument 7: minimalizacja, pseudonimizacja, retencja, eksport i usunięcie

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
- Wiersz 2: M08-E01…; ekrany i widoki
- Wiersz 3: M08-P01…; przepływy użytkownika
- Wiersz 4: M08-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M08-K01…; komponenty i wzorce UI
- Wiersz 6: M08-R01…; ryzyka UX
- Wiersz 7: M08-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Dane klientów mogą być pobierane wyłącznie w zakresie niezbędnym do zatwierdzonej analityki. • Pseudonimizacja nie jest anonimizacją, a izolacja tenantów jest krytyczna. • Uprawnienie do widoku KPI nie oznacza automatycznie prawa do danych identyfikujących klienta. • Retencja, eksport i usuwanie danych muszą respektować zależności, backup i wymagania prawne. • Dokumentacja nie ustanawia kompletnego modelu Customer 360 ani reguł łączenia tożsamości między źródłami.

Tabela:
- Wiersz 1: Założenia • P0/P1 preferuje analitykę zagregowaną i pseudonimizowane identyfikatory. • Customer detail jest dostępny tylko dla uzasadnionych ról; domyślnie ukrywa PII. • Segmenty są analityczne i nie są automatycznie synchronizowane do narzędzi marketingowych.

Tabela:
- Wiersz 1: Rekomendacje • Zaprojektować moduł od agregatów i kohort, nie od książki adresowej. • Każde ujawnienie PII ma pokazywać cel, zakres i wymagać capability; dostęp powinien być audytowany. • Identity resolution traktować jako osobny, wysokiego ryzyka proces z dowodami i możliwością pozostawienia nierozstrzygniętego. • Nie projektować automatycznego audience export przed rozstrzygnięciem podstaw prawnych i dostawców.

## 1.1. Konsekwencje dla projektu

Moduł „Klienci” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Właściciel biznesowy; Ocena zachowań i wartości grup klientów.; Segmenty, kohorty, decyzje.
- Wiersz 3: CRM/E-commerce Manager; Analiza powrotów i zakupów.; Segmentacja i działania.
- Wiersz 4: Analityk; Definicje klienta, kohort i jakości.; Drill-down i porównania.
- Wiersz 5: Privacy/Security Owner; Kontrola PII i praw danych.; Retencja, eksport, usunięcie.
- Wiersz 6: Support/Data Steward; Konflikty tożsamości w kontrolowanym zakresie.; Manual review.

## 2.2. Pozycja modułu w produkcie

Moduł M08 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: klienci w zakresie niezbędnym do analityki

Dokument 3: dane organizacyjne/sprzedażowe i gotowość lokalna

Dokument 4: dane klientów w integracjach D2C tylko w niezbędnym zakresie

Dokument 7: minimalizacja, pseudonimizacja, retencja, eksport i usunięcie

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M08-E01
Przegląd klientów; Cel: Ocena liczby klientów, nowych/powracających i jakości identyfikacji.
Użytkownik: Biznes/analityk
Główna akcja: Otwórz segment lub kohortę; Treści: Counts, repeat purchase, revenue distribution, identity coverage, trust.
Dane: Wejście: pseudonymized customer-order data. Wyjście: analysis.
Komponenty: KPI strip; cohort preview; privacy banner; trust.; Stany: no data, partial identity, ready, restricted
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M08-E02
Segmenty klientów; Cel: Analiza grup według jawnych reguł.
Użytkownik: CRM Manager/analityk
Główna akcja: Otwórz segment; Treści: Definition, population, revenue/orders, period, refresh, exclusions, quality.
Dane: Wejście: segment rules. Wyjście: segment detail/action.
Komponenty: Segment table; rule summary; freshness; limitations.; Stany: draft, calculating, ready, partial, empty
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M08-E03
Szczegóły segmentu; Cel: Zrozumienie reguły, wyniku i możliwego działania.
Użytkownik: Manager
Główna akcja: Utwórz decyzję/action; Treści: Metrics, trend, comparison, inclusion/exclusion, evidence, privacy level.
Dane: Wejście: segmentId. Wyjście: observation/action.
Komponenty: Header; rule builder read view; chart; evidence.; Stany: ready, stale, definition changed, restricted
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M08-E04
Kohorty i retencja; Cel: Porównanie zachowania grup w czasie.
Użytkownik: Analityk
Główna akcja: Wybierz definicję kohorty; Treści: Cohort start, repeat orders, revenue, completeness, observation window.
Dane: Wejście: canonical orders + customer key. Wyjście: analysis.
Komponenty: Cohort matrix; definition drawer; trust.; Stany: insufficient window, partial, not comparable, ready
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M08-E05
Szczegóły klienta pseudonimizowanego; Cel: Wyjaśnienie wkładu pojedynczego podmiotu bez nadmiernego PII.
Użytkownik: Uprawniony analityk
Główna akcja: Otwórz historię zamówień; Treści: Pseudonymous ID, order history, source identities, consent/legal flags if in scope.
Dane: Wejście: customer key. Wyjście: issue/export request.
Komponenty: Privacy header; masked fields; timeline; lineage.; Stany: masked, revealed with capability, conflict, deletion pending
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M08-E06
Konflikty tożsamości; Cel: Obsługa niejednoznacznych powiązań klientów.
Użytkownik: Data Steward/Privacy Owner
Główna akcja: Rozstrzygnij lub pozostaw osobno; Treści: Source identifiers, match evidence, risk, affected analytics, decision.
Dane: Wejście: candidates. Wyjście: link/no-link rule.
Komponenty: Comparison; evidence; approval; impact.; Stany: exact, possible, ambiguous, rejected, resolved
Priorytet: P2
Podstawa: Rekomendacja; wysokie ryzyko.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M08-E07
Żądania prywatności klienta; Cel: Kontrolowany eksport/usunięcie danych osoby, jeśli wymagane.
Użytkownik: Privacy Owner
Główna akcja: Rozpocznij proces; Treści: Identity verification, scope, systems, retention exceptions, status, evidence.
Dane: Wejście: request. Wyjście: export/delete workflow.
Komponenty: Case timeline; checklist; approval; audit.; Stany: new, verifying, processing, partial, completed, rejected
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M08-E08
Analiza wpływu segmentu; Cel: Sprawdzenie skutków użycia segmentu w decyzji.
Użytkownik: CRM Manager/Privacy Owner
Główna akcja: Zatwierdź użycie; Treści: Purpose, population, sensitive attributes, destination, expiry, measurement.
Dane: Wejście: proposed use. Wyjście: decision/action.
Komponenty: Impact panel; purpose limitation; approval.; Stany: low risk, needs review, blocked, approved
Priorytet: P2
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M08-P01 — Kohorta do decyzji marketingowej

Punkt startowy: Gotowe dane klientów i zamówień.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open cohorts
- Wiersz 3: 2; Choose definition/window
- Wiersz 4: 3; Check identity coverage
- Wiersz 5: 4; Compare groups
- Wiersz 6: 5; Review privacy/limitations
- Wiersz 7: 6; Create observation
- Wiersz 8: 7; Decision/action and measure

Punkty decyzyjne:

Coverage sufficient?

Definition comparable?

Action uses PII?

Błędy i blokery:

Partial identity

Short observation window

No capability

Sukces: Decyzja oparta na jawnej kohorcie.

Ścieżki alternatywne:

Aggregate-only action

Further analysis

No action

## 4.2. M08-P02 — Dostęp do szczegółów klienta

Punkt startowy: Użytkownik próbuje otworzyć customer detail.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Server capability check
- Wiersz 3: 2; Show pseudonymous view
- Wiersz 4: 3; Request reveal if justified
- Wiersz 5: 4; Reauth/approval
- Wiersz 6: 5; Audit access
- Wiersz 7: 6; Auto-mask after scope ends

Punkty decyzyjne:

PII necessary?

Role allowed?

Purpose recorded?

Błędy i blokery:

Denied

Session expired

Purpose invalid

Sukces: Minimum necessary data visible and audited.

Ścieżki alternatywne:

Stay masked

Create support/privacy case

## 4.3. M08-P03 — Żądanie usunięcia/eksportu

Punkt startowy: Zweryfikowane żądanie prywatności.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Verify identity and legal basis
- Wiersz 3: 2; Map data scope
- Wiersz 4: 3; Check retention exceptions
- Wiersz 5: 4; Approve
- Wiersz 6: 5; Async export/delete
- Wiersz 7: 6; Reconcile backups/restore policy
- Wiersz 8: 7; Provide evidence

Punkty decyzyjne:

Delete or restrict?

Exceptions?

Cross-system match reliable?

Błędy i blokery:

Identity ambiguous

Dependency conflict

Job partial

Sukces: Controlled outcome with audit and limitations.

Ścieżki alternatywne:

Request clarification

Partial completion with reason

Escalate expert

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Klienci” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M08-F01 — Definicja segmentu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Name
• Purpose
• Rules
• Period
• Refresh
• Exclusions
• Owner
• Expiry
- Wiersz 3: Walidacje; • Only allowed fields
• Minimum population threshold if required
• Versioned definition
- Wiersz 4: Błędy; • No data
• Sensitive field blocked
• Rule conflict
- Wiersz 5: Sukces; Versioned segment.
- Wiersz 6: Zależności backendowe; Segmentation engine, permissions, audit.
- Wiersz 7: Ryzyka UX; Segment must not silently become an activation audience.

## 6.2. M08-F02 — Uzasadnienie ujawnienia PII

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Purpose
• Customer scope
• Fields
• Duration
• Case/decision link
- Wiersz 3: Walidacje; • Capability
• Minimum fields
• Expiry required
• Reauth
- Wiersz 4: Błędy; • Purpose not allowed
• Scope too broad
• Approval missing
- Wiersz 5: Sukces; Temporary audited reveal.
- Wiersz 6: Zależności backendowe; Access service, audit, masking.
- Wiersz 7: Ryzyka UX; Avoid normalizing routine use of PII.

## 6.3. M08-F03 — Privacy request

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Request type
• Verified identity
• Scope
• Legal basis/reference
• Deadline
• Owner
- Wiersz 3: Walidacje; • No action before verification
• Retention exceptions explicit
• Tenant-scoped matching
- Wiersz 4: Błędy; • Ambiguous identity
• Missing proof
• Conflicting obligations
- Wiersz 5: Sukces; Case with controlled workflow.
- Wiersz 6: Zależności backendowe; Privacy case service, export/delete, backup policy.
- Wiersz 7: Ryzyka UX; Do not promise immediate deletion when backups/retention apply.

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
- Wiersz 2: Privacy default; Pokazujemy dane pseudonimizowane, ponieważ identyfikacja osoby nie jest potrzebna do tej analizy.
- Wiersz 3: Partial identity; 32% zamówień nie ma stabilnego klucza klienta; retencja kohortowa jest częściowa.
- Wiersz 4: Reveal denied; Nie masz uprawnienia do ujawnienia danych identyfikujących klienta.
- Wiersz 5: Purpose; Podaj cel i zakres. Dostęp do PII będzie czasowy i audytowany.
- Wiersz 6: Ambiguous match; Dwa profile mogą dotyczyć tej samej osoby, ale dowody są niewystarczające.
- Wiersz 7: Segment expiry; Segment wygasł, ponieważ jego definicja lub cel wymaga ponownej oceny.
- Wiersz 8: Delete processing; Usuwanie trwa. Zakres backupów i wyjątków retencji jest obsługiwany zgodnie z procedurą.
- Wiersz 9: No automatic activation; Segment zapisano w PapaData. Nie został wysłany do platformy marketingowej.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M08-K01; Nagłówek prywatności; Poziom identyfikacji, purpose, capability, audit.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M08-K02; Karta segmentu; Definition, population, freshness, quality.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M08-K03; Macierz kohort; Retention/repeat with incomplete data markers.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M08-K04; Maskowane pole; Default hidden, controlled reveal.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M08-K05; Panel dowodów tożsamości; Source identifiers and match evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M08-K06; Oś sprawy prywatności; Verification, processing, outcome.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M08-K07; Baner ograniczenia celu; Allowed use and expiry.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M08-K08; Podsumowanie reguły segmentu; Human-readable versioned rules.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M08-K09; Wskaźnik pokrycia tożsamości; Share of orders with stable customer key.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Klienci/Przegląd
- Wiersz 3: Folder; Klienci/Segmenty
- Wiersz 4: Folder; Klienci/Kohorty
- Wiersz 5: Folder; Klienci/Szczegóły_pseudonimizowane
- Wiersz 6: Folder; Klienci/Konflikty_tożsamości
- Wiersz 7: Folder; Klienci/Prywatność
- Wiersz 8: Folder; Klienci/Analiza_wpływu
- Wiersz 9: Historia; Przegląd/Częściowa_identyfikacja
- Wiersz 10: Historia; Segment/Pusty
- Wiersz 11: Historia; Segment/Wygasły
- Wiersz 12: Historia; Kohorty/Krótki_okres
- Wiersz 13: Historia; Szczegóły/Maskowane
- Wiersz 14: Historia; Szczegóły/Czasowe_ujawnienie
- Wiersz 15: Historia; Prywatność/Usuwanie_w_toku
- Wiersz 16: Historia; Przepływy/Segment_do_decyzji
- Wiersz 17: Wariant; Bez_danych_osobowych
- Wiersz 18: Wariant; Uprawniony_danych_osobowych
- Wiersz 19: Wariant; D2C
- Wiersz 20: Wariant; Wiele_źródeł
- Wiersz 21: Wariant; Mała_populacja
- Wiersz 22: Wariant; Tylko_odczyt
- Wiersz 23: Wariant; Wygasła_sesja
- Wiersz 24: Wariant; Długi_okres

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
- Wiersz 2: P0; Brak osobnego modułu; minimalizacja danych klienta w orders.
- Wiersz 3: P1; Aggregated overview, segments, cohorts, pseudonymous detail, privacy cases.
- Wiersz 4: P2; Identity resolution, activation impact and controlled audience exports.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M08-R01; Customer 360 bez podstawy; Excessive data collection.; Start from aggregates/minimization.
- Wiersz 3: M08-R02; PII by default; Privacy breach.; Mask and capability gate.
- Wiersz 4: M08-R03; Pseudonymized=anonymous; False compliance.; Explicit classification.
- Wiersz 5: M08-R04; Identity auto-merge; Wrong person and decisions.; Evidence + human review.
- Wiersz 6: M08-R05; Segment auto-export; Uncontrolled processing.; Separate approval/activation.
- Wiersz 7: M08-R06; Deletion promise too simple; Legal/backup conflict.; Procedure and evidence.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M08-D01; Customer canonical key; Luka; Fields and matching rules.; Cohorts/detail.
- Wiersz 3: M08-D02; PII catalogue; Decyzja bezpieczeństwa; Fields/classes per source.; Access and retention.
- Wiersz 4: M08-D03; Legal basis/purpose model; Wymaga eksperta; Allowed analytics/activation.; Privacy UX.
- Wiersz 5: M08-D04; Segment definitions; Luka; Initial business segments.; P1 value.
- Wiersz 6: M08-D05; Minimum population; Decyzja UI/UX do podjęcia; Thresholds for privacy/statistics.; Small groups.
- Wiersz 7: M08-D06; Retention periods; Luka; Per category and request.; Deletion.
- Wiersz 8: M08-D07; Audience activation; Decyzja późniejsza; Destinations and approval.; P2 scope.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Classify customer data and capabilities.

Define pseudonymous customer key and coverage.

Design aggregate overview and cohorts.

Design segments with versioned rules.

Design masked detail and reveal flow.

Design privacy cases.

Only then identity resolution and activation.

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
