# Kampanie płatne

PAPADATA

Kampanie płatne

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M05
- Wiersz 3: Numer modułu; 05 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Kampanie płatne” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: integracje marketingowe i rozdzielenie danych

Dokument 3: DEC-DAT-008 i dane marketingowe

Dokument 4: Google Ads, Meta Ads, Advertising Spend i atrybucja

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
- Wiersz 2: M05-E01…; ekrany i widoki
- Wiersz 3: M05-P01…; przepływy użytkownika
- Wiersz 4: M05-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M05-K01…; komponenty i wzorce UI
- Wiersz 6: M05-R01…; ryzyka UX
- Wiersz 7: M05-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Google Ads i Meta Ads są docelowymi źródłami kosztu, kampanii, kliknięć, wyświetleń, konwersji i wartości atrybucyjnej. • Wartość konwersji z platform reklamowych nie zastępuje przychodu transakcyjnego. • Gotowość wymaga jawnego konta, waluty, okresu, modelu konwersji, źródła i ograniczeń atrybucji. • Obecność providera w katalogu nie oznacza dostępności ani gotowości produkcyjnej. • AI nie definiuje ROAS ani nie wykonuje istotnych zmian budżetu bez kontroli człowieka.

Tabela:
- Wiersz 1: Założenia • MVP kampanii jest read-only i nie publikuje zmian do providerów. • Advertising Spend jest pierwszym deterministycznym KPI; ROAS zawsze wskazuje model mianownika. • Hierarchia pracy: konto -> kampania -> grupa/zestaw -> reklama.

Tabela:
- Wiersz 1: Rekomendacje • Pokazywać koszt, konwersje atrybucyjne i przychód transakcyjny obok siebie, lecz nie sumować ich bez etykiety modelu. • Porównanie platform używa znormalizowanych metryk i zachowuje terminologię providera w szczegółach. • Rekomendacja budżetowa pokazuje dowody, ograniczenia, zakres i wymaga decyzji człowieka. • Nie projektować edytora kampanii w P0; najpierw potwierdzić jakość i wartość analityczną.

## 1.1. Konsekwencje dla projektu

Moduł „Kampanie płatne” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Performance Marketing Manager; Ocena kosztu i wyniku.; Analiza i plan działania.
- Wiersz 3: Właściciel biznesowy; Wpływ marketingu na sprzedaż.; Decyzje budżetowe.
- Wiersz 4: Analityk; Modele atrybucji i porównywalność.; Źródła i definicje.
- Wiersz 5: Administrator integracji; Konta Google/Meta.; Connect, scope, sync.
- Wiersz 6: Data Steward; Braki i mapowanie.; Jakość i reprocessing.

## 2.2. Pozycja modułu w produkcie

Moduł M05 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: integracje marketingowe i rozdzielenie danych

Dokument 3: DEC-DAT-008 i dane marketingowe

Dokument 4: Google Ads, Meta Ads, Advertising Spend i atrybucja

Dokument 6: Marketing and Analytics jako rozszerzenie

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M05-E01
Przegląd kampanii; Cel: Ocena kosztu, wyniku i jakości.
Użytkownik: Performance Manager
Główna akcja: Otwórz kampanię lub uwagę; Treści: Spend, impressions, clicks, attributed value, transakcyjny reference revenue, data status.
Dane: Wejście: ads + commerce. Wyjście: analiza/decision.
Komponenty: KPI strip; trend; Trust Header; attribution banner.; Stany: no connection, partial, ready, stale, conflict
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M05-E02
Lista kampanii; Cel: Porównanie kampanii wspólnymi metrykami.
Użytkownik: Performance Manager
Główna akcja: Filtruj/sortuj; Treści: Provider, konto, kampania, status, spend, clicks, conversions, model, okres.
Dane: Wejście: campaign dataset. Wyjście: detail/export.
Komponenty: Tabela; filters; columns; provider badge.; Stany: loading, empty, partial rows, no access, error
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M05-E03
Szczegóły kampanii; Cel: Interpretacja wyniku w pełnym kontekście.
Użytkownik: Manager i analityk
Główna akcja: Utwórz obserwację; Treści: Trend, breakdown, budżet, grupy/reklamy, atrybucja, źródła, ograniczenia.
Dane: Wejście: campaignId/period. Wyjście: observation.
Komponenty: Chart; breakdown; Evidence Drawer; notes.; Stany: ready, partial, stale, rename, no history
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M05-E04
Atrybucja i sprzedaż; Cel: Wyjaśnienie różnicy platforma vs transakcje.
Użytkownik: Analityk i biznes
Główna akcja: Wybierz model; Treści: Attributed value per provider, Gross Revenue, windows, models, scope.
Dane: Wejście: ads + commerce. Wyjście: interpretation.
Komponenty: Comparison chart; model selector; warning.; Stany: not comparable, no commerce, no attribution, partial
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M05-E05
Budżet i wydatki; Cel: Kontrola spend i tempa.
Użytkownik: Performance Manager
Główna akcja: Przejrzyj odchylenie; Treści: Daily spend, source budget if available, pacing, currency, forecast as recommendation.
Dane: Wejście: cost data. Wyjście: observation/action.
Komponenty: Trend; threshold; currency; next action.; Stany: no budget, partial spend, currencies, delay
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M05-E06
Diagnostyka kampanii; Cel: Problem integracji -> konkretne metryki.
Użytkownik: Admin integracji/Data Steward
Główna akcja: Napraw/reconnect; Treści: Scope, last sync, missing days, accounts, currency, blocked metrics.
Dane: Wejście: integration/quality events. Wyjście: repair flow.
Komponenty: Issue list; impact map; reconnect; runs.; Stany: reauth, outage, partial endpoint, schema mismatch
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M05-E07
Rekomendacja kampanii; Cel: Ocena wariantu bez automatycznego wykonania.
Użytkownik: Manager i biznes
Główna akcja: Zatwierdź/odrzuć; Treści: Teza, kampanie, dowody, założenia, ryzyko, target, measurement.
Dane: Wejście: KPI/AI. Wyjście: decision/action.
Komponenty: Recommendation panel; evidence; approval.; Stany: new, needs data, rejected, approved, expired
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M05-E08
Porównanie platform; Cel: Google vs Meta bez utraty semantyki.
Użytkownik: Performance Manager
Główna akcja: Porównaj; Treści: Spend, clicks, impressions, provider conversions, definitions, differences.
Dane: Wejście: normalized data. Wyjście: observation/export.
Komponenty: Comparison table; provider notes.; Stany: one missing, currencies, date mismatch
Priorytet: P2
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M05-P01 — Kampania do decyzji budżetowej

Punkt startowy: Dane ads gotowe.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Przegląd
- Wiersz 3: 2; Wybór odchylenia
- Wiersz 4: 3; Spend i provider metrics
- Wiersz 5: 4; Porównanie z transakcjami
- Wiersz 6: 5; Dowody
- Wiersz 7: 6; Decyzja/action
- Wiersz 8: 7; Baseline/measurement

Punkty decyzyjne:

Porównywalne?

Atrybucja?

External execution?

Błędy i blokery:

No commerce

Partial spend

Attribution model changed

Inactive campaign

Sukces: Decyzja bez mieszania modeli.

Ścieżki alternatywne:

Dalsza analiza

No action

Data issue

## 4.2. M05-P02 — Reconnect konta

Punkt startowy: Token/scope wygasł.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Local alert
- Wiersz 3: 2; Impact
- Wiersz 4: 3; Reconnect
- Wiersz 5: 4; Test auth/scope
- Wiersz 6: 5; Backfill
- Wiersz 7: 6; Validation
- Wiersz 8: 7; Readiness update

Punkty decyzyjne:

History available?

Scope full?

Backfill possible?

Błędy i blokery:

Provider denial

No admin

Rate limit

Partial endpoint

Sukces: Nowe dane lub jawne ograniczenie.

Ścieżki alternatywne:

History only

Operations escalation

Shorter period

## 4.3. M05-P03 — Papa do działania

Punkt startowy: Użytkownik pyta w kontekście kampanii.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Freeze scope/KPI
- Wiersz 3: 2; Tenant-safe retrieval
- Wiersz 4: 3; Variants with evidence
- Wiersz 5: 4; Limitations
- Wiersz 6: 5; Human decision
- Wiersz 7: 6; Create action
- Wiersz 8: 7; Measure

Punkty decyzyjne:

Ready data?

High-impact budget?

Extra approval?

Błędy i blokery:

AI off

No ready data

No evidence

Expired recommendation

Sukces: Zapisana decyzja, bez auto-write.

Ścieżki alternatywne:

Manual analysis

Reject

Save hypothesis

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Kampanie płatne” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M05-F01 — Filtry kampanii

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Provider
• Konto
• Okres
• Status
• Waluta
• Model konwersji
• Jakość
- Wiersz 3: Walidacje; • Date availability
• No currency sum without policy
• Attribution visible
- Wiersz 4: Błędy; • Not comparable
• Missing FX
• Stale data
- Wiersz 5: Sukces; Jawny zakres.
- Wiersz 6: Zależności backendowe; Campaign query, FX policy.
- Wiersz 7: Ryzyka UX; Filtr nie ukrywa warning.

## 6.2. M05-F02 — Definicja ROAS

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Mianownik: attributed/transakcyjny
• Licznik: spend
• Okres
• Window
• Waluta
• Scope
- Wiersz 3: Walidacje; • Nazwa z modelem
• Definicja i source required
• Comparable period
- Wiersz 4: Błędy; • No revenue
• No spend
• Model changed
- Wiersz 5: Sukces; Saved analysis view, nie globalny KPI bez governance.
- Wiersz 6: Zależności backendowe; KPI registry, attribution metadata.
- Wiersz 7: Ryzyka UX; Ryzyko konkurencyjnej definicji.

## 6.3. M05-F03 — Działanie marketingowe

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Kampania
• Typ
• Uzasadnienie
• Owner
• Termin
• Planowana zmiana
• Target
• Measurement period
- Wiersz 3: Walidacje; • Ready/accepted partial
• No auto publish P1
• Baseline required
- Wiersz 4: Błędy; • Campaign missing
• No access
• Baseline incomparable
- Wiersz 5: Sukces; Action do wykonania i pomiaru.
- Wiersz 6: Zależności backendowe; Decision/action service, snapshot.
- Wiersz 7: Ryzyka UX; Zapis nie zmienia providera.

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
- Wiersz 2: Atrybucja; Wartość konwersji z Google Ads jest atrybucyjna i nie zastępuje przychodu transakcyjnego.
- Wiersz 3: Porównywalność; Platformy używają różnych modeli i okien; porównanie jest orientacyjne.
- Wiersz 4: Partial spend; Koszt obejmuje 12 z 14 dni; pełny okres jest częściowy.
- Wiersz 5: Reconnect; Dostęp wygasł. Historia jest dostępna, nowe wyniki są nieaktualne.
- Wiersz 6: ROAS; ROAS transakcyjny używa przychodu z wybranego modelu i kosztu reklam.
- Wiersz 7: AI; Papa przygotował wariant; nie opublikował go w systemie reklamowym.
- Wiersz 8: Brak budżetu; Provider nie udostępnił potwierdzonego budżetu; pokazujemy spend.
- Wiersz 9: Waluty; Konta mają różne waluty. Wybierz politykę przeliczenia.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M05-K01; Baner atrybucji; Źródło i ograniczenia conversion value.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M05-K02; Tabela kampanii; Normalized columns + provider detail.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M05-K03; Atrybucja-transakcje; Dwa oddzielne strumienie.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M05-K04; Nagłówek Zaufania kampanii; Scope, freshness, completeness, currency.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M05-K05; Wykres wydatków i tempa; Przerwy danych i budget scope.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M05-K06; Panel dowodów; Source, account, metric, mapping, period.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M05-K07; Karta rekomendacji; Teza, evidence, risk, action, measure.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M05-K08; Wiersz problemu; Provider, scope, impact, next action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M05-K09; Etykieta modelu; Model i okno.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Kampanie/Przegląd
- Wiersz 3: Folder; Kampanie/Lista
- Wiersz 4: Folder; Kampanie/Szczegóły
- Wiersz 5: Folder; Kampanie/Atrybucja_i_sprzedaż
- Wiersz 6: Folder; Kampanie/Budżet
- Wiersz 7: Folder; Kampanie/Diagnostyka
- Wiersz 8: Folder; Kampanie/Rekomendacje
- Wiersz 9: Historia; Przegląd/Brak_integracji
- Wiersz 10: Historia; Przegląd/Dane_częściowe
- Wiersz 11: Historia; Lista/Różne_platformy
- Wiersz 12: Historia; Atrybucja/Nieporównywalne
- Wiersz 13: Historia; Budżet/Brak_budżetu
- Wiersz 14: Historia; Diagnostyka/Ponowne_uwierzytelnienie
- Wiersz 15: Historia; Rekomendacja/Wymaga_zatwierdzenia
- Wiersz 16: Historia; Przepływy/Analiza_do_pomiaru
- Wiersz 17: Wariant; Google_Ads
- Wiersz 18: Wariant; Meta_Ads
- Wiersz 19: Wariant; Jedna_platforma
- Wiersz 20: Wariant; Dwie_platformy
- Wiersz 21: Wariant; Różne_waluty
- Wiersz 22: Wariant; Długi_okres
- Wiersz 23: Wariant; Brak_sprzedaży
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
- Wiersz 2: P0; Poza pierwszym MVP commerce; przygotować kontrakty i komponenty.
- Wiersz 3: P1; Read-only: przegląd, lista, details, spend, attribution vs sales, diagnostics, decisions.
- Wiersz 4: P2; Zaawansowane porównania, prognozy i write-back z approval.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M05-R01; Atrybucja jako przychód; Błędna ocena.; Stały rozdział.
- Wiersz 3: M05-R02; Jedno ROAS bez modelu; Pozorna porównywalność.; Nazwa i evidence.
- Wiersz 4: M05-R03; Auto-optymalizacja za wcześnie; Ryzyko finansowe.; Read-only + approval.
- Wiersz 5: M05-R04; Platformy bez normalizacji; Błędne wnioski.; Wspólne metryki + notes.
- Wiersz 6: M05-R05; Interpolacja braków; Fałszywy trend.; Przerwy i partial.
- Wiersz 7: M05-R06; Rename rozrywa historię; Utrata lineage.; External ID.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M05-D01; KPI marketingowe; Luka; Spend, CPC, CPA, ROAS.; Wiarygodność.
- Wiersz 3: M05-D02; Atrybucja; Decyzja UI/UX do podjęcia; Provider vs wspólny model.; Porównania.
- Wiersz 4: M05-D03; Pierwszy provider; Decyzja produktowa; Google czy Meta.; P1.
- Wiersz 5: M05-D04; Waluty; Luka; FX policy i wersje.; Agregacja.
- Wiersz 6: M05-D05; Budżety; Luka; Dostępność i zaufanie.; Pacing.
- Wiersz 7: M05-D06; Write-back; Decyzja późniejsza; Zakres operacji.; Security/approval.
- Wiersz 8: M05-D07; Audience data; Luka; Czy są wyłączone.; Prywatność.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Zatwierdzić kontrakty spend/campaign.

Zaprojektować attribution banner i trust.

Zbudować one-provider overview/list.

Dodać detail i transaction comparison.

Dodać diagnostics.

Połączyć observation-decision-measurement.

Potem multi-platform i write-back.

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
