# Ruch na stronie i lejek sprzedażowy

PAPADATA

Ruch na stronie i lejek sprzedażowy

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M09
- Wiersz 3: Numer modułu; 09 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Ruch na stronie i lejek sprzedażowy” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: źródła ruchu i integracje analityczne

Dokument 3: dane marketingowe/analityczne i DEC-DAT-008

Dokument 4: GA4 - zdarzenia, sesje, użytkownicy, źródła ruchu i konwersje

Dokument 6: Marketing and Analytics jako rozszerzenie

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
- Wiersz 2: M09-E01…; ekrany i widoki
- Wiersz 3: M09-P01…; przepływy użytkownika
- Wiersz 4: M09-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M09-K01…; komponenty i wzorce UI
- Wiersz 6: M09-R01…; ryzyka UX
- Wiersz 7: M09-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • GA4 jest docelowym źródłem zdarzeń, sesji, użytkowników, źródeł ruchu, konwersji i parametrów kampanii. • Dane GA4 są analityczne i atrybucyjne; nie zastępują transakcyjnego przychodu ani zamówień. • Gotowość wymaga jawnej właściwości GA4, zakresu czasu, metryk, wymiarów i ograniczeń interpretacji konwersji. • Zmiana implementacji zdarzeń może przerwać porównywalność lejka. • Brak zdarzenia nie jest automatycznie zerem ani dowodem braku zachowania.

Tabela:
- Wiersz 1: Założenia • Pierwszy lejek e-commerce jest konfigurowalny, ale startuje od sesja/produkt/koszyk/checkout/zakup. • Zakup analityczny jest porównywany z zamówieniem transakcyjnym, a nie uznawany za to samo zdarzenie. • MVP modułu jest read-only i nie modyfikuje tagowania strony.

Tabela:
- Wiersz 1: Rekomendacje • Każdy lejek ma wersjonowaną definicję kroków, zakres urządzeń, filtrów i okno. • Pokazywać coverage zdarzeń i przerwy implementacyjne bez interpolacji. • Na każdym ekranie oddzielać konwersję analityczną od zamówienia kanonicznego. • Problemy tagowania prowadzić do konkretnej instrukcji diagnostycznej lub zadania, nie do fałszywego KPI.

## 1.1. Konsekwencje dla projektu

Moduł „Ruch na stronie i lejek sprzedażowy” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: E-commerce Manager; Ocena ruchu i utraty w lejku.; Analiza i działania.
- Wiersz 3: Marketing Manager; Jakość kanałów i kampanii.; Sources/medium/campaign.
- Wiersz 4: Analityk; Definicje zdarzeń i porównywalność.; Funnel, event coverage.
- Wiersz 5: Administrator integracji; Właściwość GA4 i synchronizacja.; Connect/scope/sync.
- Wiersz 6: Data Steward/Developer tracking; Diagnostyka eventów.; Mapping i zmiany schematu.

## 2.2. Pozycja modułu w produkcie

Moduł M09 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: źródła ruchu i integracje analityczne

Dokument 3: dane marketingowe/analityczne i DEC-DAT-008

Dokument 4: GA4 - zdarzenia, sesje, użytkownicy, źródła ruchu i konwersje

Dokument 6: Marketing and Analytics jako rozszerzenie

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M09-E01
Przegląd ruchu; Cel: Ocena sesji, użytkowników, kanałów i jakości danych.
Użytkownik: Manager/analityk
Główna akcja: Otwórz kanał lub lejek; Treści: Sessions, users, source/medium, conversions analytical, coverage, trust.
Dane: Wejście: GA4 dataset. Wyjście: analysis.
Komponenty: KPI strip; trend; channel table; trust.; Stany: no connection, partial, ready, stale, schema change
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M09-E02
Lejek sprzedażowy; Cel: Pokazanie przejść i utraty między wersjonowanymi krokami.
Użytkownik: E-commerce Manager
Główna akcja: Otwórz krok; Treści: Steps, counts, conversion rates, drop-off, coverage, event definition.
Dane: Wejście: events + funnel definition. Wyjście: observation.
Komponenty: Funnel visualization; step detail; definition drawer.; Stany: empty, partial step, not comparable, ready
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M09-E03
Źródła i kanały ruchu; Cel: Porównanie source/medium/campaign z jawną semantyką.
Użytkownik: Marketing Manager
Główna akcja: Filtruj kanał; Treści: Sessions, engaged sessions if defined, analytical conversions, revenue reference.
Dane: Wejście: acquisition dimensions. Wyjście: analysis.
Komponenty: Table; grouping; UTM quality; attribution banner.; Stany: unknown source, missing UTM, partial, ready
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M09-E04
Szczegóły kroku lejka; Cel: Wyjaśnienie definicji i jakości pojedynczego kroku.
Użytkownik: Analityk
Główna akcja: Przejrzyj zdarzenia; Treści: Event names, parameters, counts, devices, pages, missing data, changes.
Dane: Wejście: step/event config. Wyjście: issue/change request.
Komponenty: Definition panel; trend; sample metadata; issue list.; Stany: event missing, parameter missing, duplicated, changed
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M09-E05
Porównanie zakupów GA4 i zamówień; Cel: Ocena rozbieżności analytical purchase vs canonical orders.
Użytkownik: Analityk/biznes
Główna akcja: Otwórz różnice; Treści: Counts, values, timing, attribution, unmatched ranges, limitations.
Dane: Wejście: GA4 purchase + orders. Wyjście: reconciliation insight.
Komponenty: Comparison chart; difference table; explanation.; Stany: no commerce, no GA4 purchase, partial, mismatch
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M09-E06
Jakość implementacji zdarzeń; Cel: Ocena coverage, duplikacji i zmian trackingowych.
Użytkownik: Analityk/tracking owner
Główna akcja: Utwórz zadanie naprawcze; Treści: Event inventory, expected/observed, parameters, last seen, break date, impact.
Dane: Wejście: event quality. Wyjście: issue/action.
Komponenty: Event quality table; impact banner; owner.; Stany: healthy, warning, missing, duplicated, schema drift
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M09-E07
Strony wejścia i ścieżki; Cel: Analiza landing pages i przejść bez udawania pełnej ścieżki klienta.
Użytkownik: Marketing/E-commerce Manager
Główna akcja: Otwórz stronę; Treści: Landing page, sessions, next steps, conversions analytical, coverage.
Dane: Wejście: page/event data. Wyjście: observation.
Komponenty: Table; path preview; filter; trust.; Stany: privacy threshold, partial, unknown page, ready
Priorytet: P2
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M09-E08
Definicje lejków; Cel: Zarządzanie wersjonowanymi definicjami kroków.
Użytkownik: Analityk/admin
Główna akcja: Zapisz wersję; Treści: Name, purpose, steps, event/condition, order, filters, effective date.
Dane: Wejście: definition. Wyjście: draft/active version.
Komponenty: Builder; validation; impact analysis; history.; Stany: draft, invalid, review, active, superseded
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M09-P01 — Lejek do działania

Punkt startowy: Gotowe zdarzenia i definicja.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open funnel
- Wiersz 3: 2; Check coverage/definition
- Wiersz 4: 3; Select drop-off
- Wiersz 5: 4; Breakdown by channel/device/page
- Wiersz 6: 5; Compare with orders
- Wiersz 7: 6; Create observation
- Wiersz 8: 7; Decision/action/measure

Punkty decyzyjne:

Comparable period?

Drop due to tracking?

Enough volume?

Błędy i blokery:

Event missing

Schema changed

Small sample

No orders

Sukces: Action based on interpretowalnym lejku.

Ścieżki alternatywne:

Tracking fix

Further analysis

No action

## 4.2. M09-P02 — Zmiana definicji lejka

Punkt startowy: Potrzeba nowego kroku/reguły.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Create draft version
- Wiersz 3: 2; Select events/conditions
- Wiersz 4: 3; Validate sequence
- Wiersz 5: 4; Impact analysis
- Wiersz 6: 5; Review
- Wiersz 7: 6; Activate from date
- Wiersz 8: 7; Annotate charts

Punkty decyzyjne:

Historical reprocess?

Old/new comparable?

Owner approval?

Błędy i blokery:

Missing event

Overlapping versions

No data

Sukces: Active version with visible boundary.

Ścieżki alternatywne:

Future-only version

Reject

Keep old

## 4.3. M09-P03 — GA4 outage/schema drift

Punkt startowy: Event quality alert.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Identify affected events/period
- Wiersz 3: 2; Map impact to funnel/KPI
- Wiersz 4: 3; Notify owner
- Wiersz 5: 4; Fix integration/tracking externally
- Wiersz 6: 5; Resume data
- Wiersz 7: 6; Validate
- Wiersz 8: 7; Update readiness

Punkty decyzyjne:

History recoverable?

Backfill possible?

Partial result useful?

Błędy i blokery:

No backfill

Duplicate events

Permission missing

Sukces: Recovered or clearly bounded dataset.

Ścieżki alternatywne:

Exclude period

Show partial

Escalate

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Ruch na stronie i lejek sprzedażowy” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M09-F01 — Definicja lejka

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Name
• Purpose
• Steps
• Event/condition
• Filters
• Window
• Effective date
• Owner
- Wiersz 3: Walidacje; • At least 2 steps
• Unique order
• Events exist or explicit planned
• Version required
- Wiersz 4: Błędy; • Circular/duplicate step
• Missing event
• Overlap
- Wiersz 5: Sukces; Draft/active version.
- Wiersz 6: Zależności backendowe; Funnel engine, event catalog, versioning.
- Wiersz 7: Ryzyka UX; Changing definition breaks comparison.

## 6.2. M09-F02 — Filtry ruchu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Period
• Device
• Country if allowed
• Source/medium
• Campaign
• Landing page
• Data quality
- Wiersz 3: Walidacje; • Privacy thresholds
• Comparable dimensions
• No PII
- Wiersz 4: Błędy; • Threshold hides data
• Unknown source
• Range unavailable
- Wiersz 5: Sukces; Jawny analytical scope.
- Wiersz 6: Zależności backendowe; GA4 query, thresholds, permissions.
- Wiersz 7: Ryzyka UX; Filters may create tiny privacy-sensitive groups.

## 6.3. M09-F03 — Zadanie naprawy trackingu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Event
• Problem
• Affected period
• Impact
• Owner
• Expected behavior
• Evidence
• Due date
- Wiersz 3: Walidacje; • Concrete event/parameter
• Impact required
• No production payload with PII
- Wiersz 4: Błędy; • Duplicate issue
• Owner missing
• Evidence unsafe
- Wiersz 5: Sukces; Action linked to quality issue.
- Wiersz 6: Zależności backendowe; Issue/action service, notifications.
- Wiersz 7: Ryzyka UX; PapaData cannot confirm external code fix without new evidence.

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
- Wiersz 2: GA4 nature; Konwersje GA4 są analityczne i nie zastępują zamówień transakcyjnych.
- Wiersz 3: Missing event; Zdarzenie add_to_cart nie pojawia się od 15 lipca; środkowa część lejka jest niekompletna.
- Wiersz 4: No zero; Brak zdarzeń nie jest potwierdzoną wartością 0.
- Wiersz 5: Definition changed; Definicja kroku „Checkout” zmieniła się 1 lipca; okresy nie są w pełni porównywalne.
- Wiersz 6: Purchase mismatch; GA4 zarejestrował 128 zakupów, a PapaData ma 121 zamówień kanonicznych. To różne modele zdarzeń.
- Wiersz 7: Unknown source; 24% sesji nie ma rozpoznanego source/medium.
- Wiersz 8: Privacy threshold; Dane dla tego filtra są ukryte z powodu zbyt małej grupy.
- Wiersz 9: Tracking action; Zadanie zapisano. Zmiana tagowania musi zostać wykonana poza PapaData.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M09-K01; Wizualizacja lejka; Steps, counts, rates, partial markers.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M09-K02; Szuflada definicji kroku; Event/conditions/version/source.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M09-K03; Wskaźnik pokrycia zdarzeń; Expected vs observed and last seen.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M09-K04; Baner atrybucji i analityki; GA4 is not transaction truth.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M09-K05; Tabela kanałów ruchu; Source/medium/campaign with quality.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M09-K06; Porównanie GA4 z zamówieniami; Separate streams and differences.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M09-K07; Wiersz problemu pomiaru; Event, period, impact, owner, action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M09-K08; Oś wersji definicji; Active boundaries and comparability.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M09-K09; Komunikat progu prywatności; Why data is hidden.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Ruch/Przegląd
- Wiersz 3: Folder; Ruch/Kanały
- Wiersz 4: Folder; Lejek/Widok
- Wiersz 5: Folder; Lejek/Szczegóły_kroku
- Wiersz 6: Folder; Lejek/Definicje
- Wiersz 7: Folder; Ruch/GA4_vs_zamówienia
- Wiersz 8: Folder; Ruch/Jakość_zdarzeń
- Wiersz 9: Folder; Ruch/Strony_wejścia
- Wiersz 10: Historia; Przegląd/Brak_integracji
- Wiersz 11: Historia; Lejek/Brak_kroku
- Wiersz 12: Historia; Lejek/Dane_częściowe
- Wiersz 13: Historia; Lejek/Zmiana_definicji
- Wiersz 14: Historia; Kanały/Nieznane_źródło
- Wiersz 15: Historia; Porównanie/Rozbieżność
- Wiersz 16: Historia; Jakość/Zmiana_schematu
- Wiersz 17: Historia; Przepływy/Spadek_do_działania
- Wiersz 18: Wariant; Komputer
- Wiersz 19: Wariant; Ruch_mobilny
- Wiersz 20: Wariant; Jedna_właściwość
- Wiersz 21: Wariant; Wiele_właściwości
- Wiersz 22: Wariant; Mała_próba
- Wiersz 23: Wariant; Bez_sprzedaży
- Wiersz 24: Wariant; Tylko_odczyt
- Wiersz 25: Wariant; Wygasła_sesja

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
- Wiersz 2: P0; Poza pierwszym MVP sprzedażowym.
- Wiersz 3: P1; GA4 overview, channel table, versioned funnel, event quality, GA4-vs-orders comparison.
- Wiersz 4: P2; Path exploration, advanced cohorts, predictive observations after validation.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M09-R01; GA4 purchase=order; Wrong revenue.; Separate comparison.
- Wiersz 3: M09-R02; Missing event=0; False dropoff.; Unknown/partial.
- Wiersz 4: M09-R03; Funnel definition changes silently; False trend.; Versions and annotations.
- Wiersz 5: M09-R04; Tiny segments; Privacy/statistical error.; Threshold notice.
- Wiersz 6: M09-R05; Path view implies identity; Overclaim.; Aggregate, no deterministic journey.
- Wiersz 7: M09-R06; PapaData edits tracking; Scope confusion.; Create external action only.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M09-D01; Initial funnel steps; Decyzja UI/UX do podjęcia; Events/conditions per platform.; P1 design.
- Wiersz 3: M09-D02; GA4 extraction granularity; Luka; Aggregates vs raw events.; Capabilities/cost/privacy.
- Wiersz 4: M09-D03; Privacy thresholds; Decyzja bezpieczeństwa; Minimum group sizes.; Filters.
- Wiersz 5: M09-D04; Attribution model; Luka; Source/medium/channel rules.; Comparisons.
- Wiersz 6: M09-D05; Schema change detection; Luka; Evidence and thresholds.; Quality states.
- Wiersz 7: M09-D06; Backfill possibilities; Luka; What GA4 can recover.; Recovery copy.
- Wiersz 8: M09-D07; Multiple properties; Decyzja UI/UX do podjęcia; Workspace mapping.; Context.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Define event catalog and initial funnel.

Design analytics banner and trust.

Build traffic overview/channel table.

Build versioned funnel and step detail.

Add event quality and schema changes.

Compare GA4 purchases with orders.

Then path exploration and advanced insights.

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
