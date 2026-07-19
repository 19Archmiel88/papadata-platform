# Jakość danych i integralność

PAPADATA

Jakość danych i integralność

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M11
- Wiersz 3: Numer modułu; 11 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Jakość danych i integralność” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 3: kontrakt danych, stanów, KPI, lineage, authority, canonicalization i reprocessing

Dokument 4: integralność integracji, monitoring i recovery

Dokument 5: jakość i integralność przed pierwszym KPI

Dokument 7: tenant isolation i audyt krytycznych decyzji

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
- Wiersz 2: M11-E01…; ekrany i widoki
- Wiersz 3: M11-P01…; przepływy użytkownika
- Wiersz 4: M11-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M11-K01…; komponenty i wzorce UI
- Wiersz 6: M11-R01…; ryzyka UX
- Wiersz 7: M11-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Brak danych nie jest zerem, jeden fakt zasila KPI raz, a gotowość jest lokalna. • Source authority, mapping, deduplikacja, progi jakości i KPI są wersjonowane. • Exact matching ma pierwszeństwo; fuzzy jest warunkowe i nie może działać między tenantami. • Konflikt może blokować jeden KPI lub pole bez blokowania niezależnego zakresu. • Zmiana reguły wpływającej na dane wymaga analizy wpływu, reprocessingu i audytu.

Tabela:
- Wiersz 1: Założenia • Centrum jakości jest dostępne klientowi w uproszczonym zakresie, a pełne operacje review/reprocessing znajdują się w Operations Console lub dla Data Stewarda. • Nie istnieje jeden nieprzezroczysty quality score; wymiary są pokazywane osobno. • Manual review jest mierzone czasowo i kosztowo jako część COGS.

Tabela:
- Wiersz 1: Rekomendacje • Pokazywać jakość per źródło, dataset, okres i KPI, nie jako globalne „dane dobre/złe”. • Każdy issue row ma klasę, zakres, wpływ, ownera, dowód i next action. • Source overlap, authority, konflikt i reprocessing są odrębnymi procesami. • Po naprawie status readiness rośnie dopiero po walidacji wyniku, nie po samym zamknięciu zadania.

## 1.1. Konsekwencje dla projektu

Moduł „Jakość danych i integralność” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Analityk; Zrozumienie zaufania i ograniczeń.; Quality center, dataset, lineage.
- Wiersz 3: Data Steward; Rozstrzyganie konfliktów i authority.; Manual review, impact, reprocess.
- Wiersz 4: Administrator integracji; Naprawa źródeł i sync.; Reconnect, scope, retry.
- Wiersz 5: Właściciel KPI; Ocena wpływu jakości na wynik.; Readiness rules and acceptance.
- Wiersz 6: Operations Owner; Recovery, reprocessing i koszty.; Runbooks and evidence.

## 2.2. Pozycja modułu w produkcie

Moduł M11 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 3: kontrakt danych, stanów, KPI, lineage, authority, canonicalization i reprocessing

Dokument 4: integralność integracji, monitoring i recovery

Dokument 5: jakość i integralność przed pierwszym KPI

Dokument 7: tenant isolation i audyt krytycznych decyzji

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M11-E01
Centrum jakości danych; Cel: Ocena, co jest użyteczne i co wymaga działania.
Użytkownik: Analityk/Data Steward
Główna akcja: Otwórz issue/dataset; Treści: Freshness, completeness, schema, integrity, conflicts, overlap, KPI impact.
Dane: Wejście: quality checks. Wyjście: issue/action.
Komponenty: Dimension summary; issue queue; impact map.; Stany: empty, loading, partial, ready, stale, invalid, blocked
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M11-E02
Szczegóły datasetu; Cel: Zakres, źródła, lineage i readiness datasetu.
Użytkownik: Analityk
Główna akcja: Otwórz lineage lub problem; Treści: Sources, period, records, contract version, mappings, checks, limitations.
Dane: Wejście: datasetId/period. Wyjście: evidence/issue.
Komponenty: Trust Header; lineage summary; checks table.; Stany: no data, normalizing, partial, ready, conflict
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M11-E03
Lineage danych; Cel: Śledzenie wyniku od KPI do rekordów i reguł.
Użytkownik: Analityk/Data Steward
Główna akcja: Rozwiń etap; Treści: Source -> normalized -> canonical -> KPI; versions, timestamps, jobs.
Dane: Wejście: object/KPI. Wyjście: evidence/navigation.
Komponenty: Graph/tree; version chips; stage details.; Stany: complete, missing stage, archived source, access restricted
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M11-E04
Source overlap; Cel: Ocena ryzyka podwójnego liczenia.
Użytkownik: Data Steward
Główna akcja: Rozwiąż overlap; Treści: Source pairs, periods, IDs, match evidence, overlap status, KPI impact.
Dane: Wejście: overlap detection. Wyjście: authority/dedup decision.
Komponenty: Matrix; candidate list; evidence.; Stany: not expected, possible, confirmed, controlled, unresolved
Priorytet: P0 marketplace
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M11-E05
Source authority; Cel: Ustalenie nadrzędności źródła dla obiektu/pola/KPI.
Użytkownik: Data Steward/KPI Owner
Główna akcja: Zapisz regułę; Treści: Scope, primary/secondary source, effective period, exceptions, reason, version.
Dane: Wejście: authority rule. Wyjście: draft/active version.
Komponenty: Rule form; conflict checker; impact analysis.; Stany: draft, approval, active, superseded, conflict
Priorytet: P0/P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M11-E06
Kolejka konfliktów; Cel: Priorytetyzacja konfliktów wpływających na wyniki.
Użytkownik: Data Steward
Główna akcja: Otwórz i rozstrzygnij; Treści: Group, difference, impact, evidence, suggested resolution, owner, SLA.
Dane: Wejście: conflicts. Wyjście: review decision.
Komponenty: Queue; filters; assignment; batch limited.; Stany: open, waiting, resolved, escalated, obsolete
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M11-E07
Szczegóły konfliktu / manual review; Cel: Audytowalna decyzja na podstawie dowodów.
Użytkownik: Data Steward
Główna akcja: Wybierz wartość/regułę; Treści: Competing values, lineage, match type, history, scope, reason, reprocess.
Dane: Wejście: conflict. Wyjście: review record.
Komponenty: Side-by-side; evidence; decision; approval.; Stany: no capability, data changed, saving, reprocessing
Priorytet: P0/P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M11-E08
Reprocessing; Cel: Kontrolowane przeliczenie zakresu po zmianie reguł.
Użytkownik: Operations/Data Steward
Główna akcja: Uruchom przeliczenie; Treści: Reason, scope, period, rule versions, affected KPI, cost, rollback/checkpoint.
Dane: Wejście: request. Wyjście: async job/result.
Komponenty: Impact preview; approval; async bar; result.; Stany: approval, queued, running, partial, failed, succeeded
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 10: M11-E09
Rekoncyliacja; Cel: Porównanie PapaData ze źródłem lub wersją referencyjną.
Użytkownik: Analityk/Operations
Główna akcja: Przejrzyj różnice; Treści: Counts, totals, IDs, tolerance, timing, source snapshot, conclusion.
Dane: Wejście: two scopes. Wyjście: pass/fail/issue.
Komponenty: Summary; difference table; evidence.; Stany: running, passed, failed tolerance, partial, unavailable
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M11-P01 — Issue do readiness

Punkt startowy: Check wykrywa problem.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Create issue
- Wiersz 3: 2; Classify scope/impact
- Wiersz 4: 3; Assign owner
- Wiersz 5: 4; Repair/review
- Wiersz 6: 5; Reprocess if needed
- Wiersz 7: 6; Run validation
- Wiersz 8: 7; Update local readiness
- Wiersz 9: 8; Notify dependents

Punkty decyzyjne:

Block or warn?

Manual decision?

Historical impact?

Błędy i blokery:

No owner

Repair failed

New conflict

Validation fail

Sukces: Readiness changed only with evidence.

Ścieżki alternatywne:

Keep partial

Escalate

Limit period

## 4.2. M11-P02 — Source overlap do deduplikacji

Punkt startowy: Potential overlap.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Compare source pairs
- Wiersz 3: 2; Exact key checks
- Wiersz 4: 3; Assess period/channel
- Wiersz 5: 4; Choose authority/dedup rule
- Wiersz 6: 5; Impact analysis
- Wiersz 7: 6; Approval
- Wiersz 8: 7; Reprocess
- Wiersz 9: 8; Reconcile

Punkty decyzyjne:

Confirmed same fact?

Exact match?

Fuzzy allowed?

Błędy i blokery:

Ambiguous

Cross-tenant

No stable ID

Sukces: One canonical contribution and retained lineage.

Ścieżki alternatywne:

Unresolved blocks dependent KPI

Manual sample review

## 4.3. M11-P03 — Manual review

Punkt startowy: Conflict assigned.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open values and evidence
- Wiersz 3: 2; Check latest state
- Wiersz 4: 3; Choose value/unresolved
- Wiersz 5: 4; Reason and scope
- Wiersz 6: 5; Optional rule creation
- Wiersz 7: 6; Impact/reprocess
- Wiersz 8: 7; Audit

Punkty decyzyjne:

Record changed?

Decision generalizable?

Second approval?

Błędy i blokery:

Stale view

No capability

Reprocess failed

Sukces: Decision recorded with outcome, not assumed success.

Ścieżki alternatywne:

Escalate

Leave unresolved

Narrow scope

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Jakość danych i integralność” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M11-F01 — Source authority

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Object/field/KPI
• Primary source
• Secondary sources
• Effective period
• Exceptions
• Reason
• Owner
• Reprocess scope
- Wiersz 3: Walidacje; • Same tenant
• No overlapping rule without priority
• Reason required
• Impact check
- Wiersz 4: Błędy; • Conflicting active rule
• Historical impact unknown
• No owner
- Wiersz 5: Sukces; Draft/approved active version.
- Wiersz 6: Zależności backendowe; Authority registry, lineage, reprocessing.
- Wiersz 7: Ryzyka UX; Simple setting can materially change results.

## 6.2. M11-F02 — Manual review

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Selected value/unresolved
• Reason
• Evidence
• Scope
• Create rule?
• Comment
• Reprocess decision
- Wiersz 3: Walidacje; • Capability
• Audit mandatory
• Warn on KPI/billing impact
• Current version check
- Wiersz 4: Błędy; • Data changed
• Cross-tenant
• Missing evidence
- Wiersz 5: Sukces; Review outcome and async follow-up.
- Wiersz 6: Zależności backendowe; Conflict service, audit, jobs.
- Wiersz 7: Ryzyka UX; Resolved is not necessarily business success.

## 6.3. M11-F03 — Reprocessing

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Reason
• Dataset/KPI scope
• Period
• Rule versions
• Priority
• Cost acknowledgement
• Approval
- Wiersz 3: Walidacje; • Bounded scope
• Dependencies
• Idempotency
• Capability/reauth
- Wiersz 4: Błędy; • Too broad
• Conflicting job
• No checkpoint
• Cost limit
- Wiersz 5: Sukces; Queued job with result and reconciliation.
- Wiersz 6: Zależności backendowe; Job orchestration, metering, audit.
- Wiersz 7: Ryzyka UX; Do not hide partial failure behind success toast.

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
- Wiersz 2: No data; Brak potwierdzonej wartości. Nie zastępujemy jej zerem.
- Wiersz 3: Partial; Dataset obejmuje 94% oczekiwanego zakresu; zobacz brakujące dni.
- Wiersz 4: Conflict; Dwa źródła podają różne wartości. Konflikt blokuje tylko zależne KPI.
- Wiersz 5: Overlap; Te źródła mogą opisywać te same zamówienia. Agregacja jest wstrzymana dla wspólnego zakresu.
- Wiersz 6: Authority impact; Zmiana źródła nadrzędnego może zmienić historyczne KPI.
- Wiersz 7: Review stale; Dane zmieniły się od otwarcia sprawy. Przejrzyj aktualne wartości.
- Wiersz 8: Reprocessing; Przeliczanie trwa. Możesz opuścić stronę; wynik pojawi się w pasku operacji.
- Wiersz 9: Validation failed; Naprawa została wykonana, ale walidacja nadal nie pozwala podnieść gotowości.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M11-K01; Nagłówek Zaufania; Readiness, freshness, completeness, integrity.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M11-K02; Wymiar jakości; Named dimension with value, evidence and threshold.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M11-K03; Wiersz problemu danych; Class, scope, impact, owner, action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M11-K04; Przegląd pochodzenia danych; Stages, versions, timestamps, sources.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M11-K05; Macierz nakładania źródeł; Source pairs, period, match state.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M11-K06; Karta reguły nadrzędności źródła; Scope, source, period, version, reason.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M11-K07; Porównanie konfliktu; Competing values and evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M11-K08; Analiza wpływu; Affected records/KPIs/billing/periods.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M11-K09; Pasek reprocessingu; Stage, scope, cost, outcome.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 11: M11-K10; Podsumowanie rekoncyliacji; Tolerance and differences.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Jakość/Centrum
- Wiersz 3: Folder; Jakość/Zbiór_danych
- Wiersz 4: Folder; Jakość/Pochodzenie_danych
- Wiersz 5: Folder; Integralność/Nakładanie_źródeł
- Wiersz 6: Folder; Integralność/Nadrzędność_źródła
- Wiersz 7: Folder; Integralność/Konflikty
- Wiersz 8: Folder; Integralność/Przegląd_ręczny
- Wiersz 9: Folder; Operacje/Ponowne_przetwarzanie
- Wiersz 10: Folder; Operacje/Rekoncyliacja
- Wiersz 11: Historia; Centrum/Brak_danych
- Wiersz 12: Historia; Centrum/Częściowe
- Wiersz 13: Historia; Zbiór_danych/Oczekuje_na_normalizację
- Wiersz 14: Historia; Pochodzenie_danych/Brak_etapu
- Wiersz 15: Historia; Nakładanie_źródeł/Potwierdzony
- Wiersz 16: Historia; Nadrzędność_źródła/Konflikt_reguł
- Wiersz 17: Historia; Przegląd/Dane_zmienione
- Wiersz 18: Historia; Ponowne_przetwarzanie/Częściowe_niepowodzenie
- Wiersz 19: Historia; Rekoncyliacja/Poza_tolerancją
- Wiersz 20: Wariant; D2C
- Wiersz 21: Wariant; Platforma_handlowa
- Wiersz 22: Wariant; Jedno_źródło
- Wiersz 23: Wariant; Wiele_źródeł
- Wiersz 24: Wariant; Tylko_odczyt
- Wiersz 25: Wariant; Opiekun_danych
- Wiersz 26: Wariant; Operacje
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
- Wiersz 2: P0; Quality center, dataset, lineage summary, overlap, authority basics, conflict queue/manual review.
- Wiersz 3: P1; Full lineage viewer, impact analysis, reprocessing, reconciliation, customer-facing history.
- Wiersz 4: P2; Controlled fuzzy matching, advanced anomaly detection and bulk operations.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M11-R01; One quality score; Hides dimensions.; Separate dimensions.
- Wiersz 3: M11-R02; Resolved=success; False interpretation.; Outcome and readiness evidence.
- Wiersz 4: M11-R03; Global block; Unnecessary downtime.; Local impact.
- Wiersz 5: M11-R04; Authority as simple toggle; Silent KPI changes.; Version/impact/approval.
- Wiersz 6: M11-R05; Fuzzy before exact; Wrong merges.; Exact first.
- Wiersz 7: M11-R06; Manual review cost invisible; Unprofitable service.; Measure time and cost.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M11-D01; Quality thresholds; Luka; Per source/dataset/KPI.; State calculation.
- Wiersz 3: M11-D02; Customer-facing technical detail; Decyzja UI/UX do podjęcia; Which checks and logs.; Progressive disclosure.
- Wiersz 4: M11-D03; Authority approval; Decyzja UI/UX do podjęcia; Roles and second approval.; Critical changes.
- Wiersz 5: M11-D04; Fuzzy rules; Decyzja later; Algorithms/thresholds.; P2.
- Wiersz 6: M11-D05; Reprocessing limits; Luka; Scope, cost, priority, rollback.; Operations UX.
- Wiersz 7: M11-D06; Reconciliation reference; Luka; Source snapshots/tolerances.; Pass/fail.
- Wiersz 8: M11-D07; Issue SLA; Luka; Owner/priority/escalation.; Queue management.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Finalize state/quality contracts.

Design Trust Header and issue row.

Design quality center and dataset.

Add lineage and overlap.

Design authority and manual review with impact.

Add reprocessing/reconciliation.

Validate local readiness transitions.

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
