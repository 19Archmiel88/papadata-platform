# Wsparcie marketingowe decyzje i działania

PAPADATA

Wsparcie w marketingu, decyzje i działania

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M15
- Wiersz 3: Numer modułu; 15 z 15
- Wiersz 4: Wersja; 2.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Wsparcie w marketingu, decyzje i działania” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Papa Asystent, Laboratorium AI oraz AI Actions należą do MVP. AI korzysta wyłącznie z danych dopuszczonych przez readiness i uprawnienia, zwraca evidence, ograniczenia i poziom pewności oraz potrafi odmówić. Działania istotne wymagają zatwierdzenia człowieka, ponownej walidacji targetu i danych, idempotencji, audytu oraz mechanizmu anulowania lub kompensacji, gdy jest to technicznie możliwe. Niedopuszczalne jest niekontrolowane autonomiczne wykonanie o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

Storybook jest kontraktem stanów produkcyjnych. Każdy moduł należący do MVP ma stories dla happy path, loading, empty, no data, partial, stale, processing, success, validation error, permission denied, provider error, recoverable error, terminal error, cancellation i recovery. Nie wolno tworzyć martwych ekranów, atrap funkcji ani przycisków bez kontraktu akcji. Funkcja zależna od integracji jest aktywna tylko dla providerów z katalogu MVP.

## Podstawa źródłowa

Dokument 1: obserwacja/rekomendacja -> decyzja człowieka -> działanie -> pomiar

Dokument 3: gotowy KPI i ograniczenia jako podstawa decyzji

Dokument 5: decyzje, działania, baseline i pomiar rezultatu

Dokument 7: AI human oversight i audyt działań

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
- Wiersz 2: M15-E01…; ekrany i widoki
- Wiersz 3: M15-P01…; przepływy użytkownika
- Wiersz 4: M15-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M15-K01…; komponenty i wzorce UI
- Wiersz 6: M15-R01…; ryzyka UX
- Wiersz 7: M15-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • PapaData ma wspierać decyzje i pomiar efektu, a nie kończyć procesu na raporcie lub rekomendacji. • Możliwe decyzje obejmują działanie, brak działania, dalszą analizę, problem danych i odroczenie. • Każde działanie powinno mieć właściciela, termin, baseline, oczekiwany rezultat i okres pomiaru. • Pomiar może zakończyć się sukcesem, częściową poprawą, brakiem zmiany, wynikiem negatywnym, niejednoznacznym lub zablokowanym. • AI może proponować warianty, ale decyzja i istotne działanie pozostają pod kontrolą człowieka.

Tabela:
- Wiersz 1: Założenia • Moduł jest wspólnym command workflow dla marketingu, sprzedaży i operacji; nie jest osobnym narzędziem project management. • Pierwsze działania są wykonywane poza PapaData lub manualnie, a system utrzymuje plan i pomiar. • Obserwacja może pochodzić z reguły deterministycznej, analityka lub Papa, z jawnym pochodzeniem.

Tabela:
- Wiersz 1: Rekomendacje • Rozdzielić pojęcia: alert, obserwacja, rekomendacja, decyzja, działanie i wynik. • Każdy artefakt zachowuje link do KPI/dowodów z momentu utworzenia oraz aktualny stan danych. • Wspierać 'brak działania' jako prawidłową, uzasadnioną decyzję. • Dla marketingu udostępnić brief działania, ownera, kanał, target i measurement, bez automatycznej publikacji w MVP.

## 1.1. Konsekwencje dla projektu

Moduł „Wsparcie w marketingu, decyzje i działania” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Właściciel biznesowy; Podejmowanie decyzji i ocena wyniku.; Approve/no action/measure.
- Wiersz 3: Marketing/E-commerce Manager; Planowanie i realizacja działań.; Action brief, owner, due date.
- Wiersz 4: Analityk; Dowody, baseline i interpretacja.; Observation and measurement.
- Wiersz 5: Papa/AI; Warianty i wyjaśnienia w dozwolonym zakresie.; Advisory only.
- Wiersz 6: Pilot/Product Owner; Ocena wartości i procesu.; Pilot summary and learnings.

## 2.2. Pozycja modułu w produkcie

Moduł M15 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: obserwacja/rekomendacja -> decyzja człowieka -> działanie -> pomiar

Dokument 3: gotowy KPI i ograniczenia jako podstawa decyzji

Dokument 5: decyzje, działania, baseline i pomiar rezultatu

Dokument 7: AI human oversight i audyt działań

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M15-E01
Centrum decyzji i działań; Cel: Zebranie obserwacji, decyzji, zadań i pomiarów.
Użytkownik: Biznes/manager
Główna akcja: Otwórz element wymagający uwagi; Treści: Queues by stage, owner, due date, KPI, channel, measurement status.
Dane: Wejście: observations/decisions/actions. Wyjście: workflow transition.
Komponenty: Stage tabs; attention list; filters; summary.; Stany: empty, loading, overdue, blocked, no access
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M15-E02
Szczegóły obserwacji; Cel: Ocena faktu lub wzorca przed rekomendacją.
Użytkownik: Analityk/biznes
Główna akcja: Przejrzyj lub utwórz decyzję; Treści: Statement, scope, KPI, evidence, limitations, origin, alternatives.
Dane: Wejście: observation. Wyjście: reviewed/rejected/decision.
Komponenty: Observation header; Evidence Drawer; comments.; Stany: new, reviewed, rejected, expired, data changed
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M15-E03
Szczegóły rekomendacji; Cel: Porównanie sugerowanych wariantów.
Użytkownik: Biznes/manager
Główna akcja: Wybierz wariant lub odrzuć; Treści: Recommendation, options, impact, effort, risk, evidence, measurement.
Dane: Wejście: recommendation. Wyjście: decision.
Komponenty: Variant table; approval; limitation panel.; Stany: draft, needs data, ready, approved, rejected
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M15-E04
Rejestr decyzji klienta; Cel: Audytowalne decyzje powiązane z wynikami.
Użytkownik: Właściciel biznesowy
Główna akcja: Zapisz decyzję; Treści: KPI/observation, decision type, reason, owner, date, constraints, action link.
Dane: Wejście: decision form. Wyjście: immutable/versioned record.
Komponenty: Decision table; filters; detail; history.; Stany: draft, approved, deferred, no action, superseded
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M15-E05
Brief działania marketingowego; Cel: Przełożenie decyzji na wykonawczy plan.
Użytkownik: Marketing Manager
Główna akcja: Przypisz i uruchom; Treści: Channel, target, message/hypothesis, scope, owner, due, expected result, dependencies.
Dane: Wejście: decision. Wyjście: action.
Komponenty: Structured brief; dependencies; checklist.; Stany: planned, ready, in progress, blocked, cancelled
Priorytet: P0/P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M15-E06
Szczegóły działania; Cel: Kontrola realizacji i zmian.
Użytkownik: Owner/manager
Główna akcja: Aktualizuj status; Treści: Decision link, owner, dates, tasks, external execution note, baseline, target.
Dane: Wejście: action updates. Wyjście: state and evidence.
Komponenty: Timeline; status; attachments/links; audit.; Stany: planned, in progress, blocked, completed, cancelled
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M15-E07
Pomiar rezultatu; Cel: Ocena efektu działania względem baseline.
Użytkownik: Biznes/analityk
Główna akcja: Zapisz wniosek; Treści: Baseline, measurement period, current KPI, comparison, confounders, conclusion.
Dane: Wejście: action + new KPI. Wyjście: outcome record.
Komponenty: Before/after; trust headers; confounders; conclusion.; Stany: waiting period, no data, partial, achieved, negative, inconclusive
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M15-E08
Biblioteka działań i eksperymentów; Cel: Ponowne użycie sprawdzonych szablonów bez automatycznego kopiowania wniosków.
Użytkownik: Manager/analityk
Główna akcja: Utwórz na podstawie; Treści: Action type, context, previous outcomes, prerequisites, risks, template.
Dane: Wejście: completed actions. Wyjście: new draft.
Komponenty: Template cards; outcome distribution; context warning.; Stany: empty, insufficient evidence, available, deprecated
Priorytet: P2
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 10: M15-E09
Podsumowanie efektów marketingowych; Cel: Łączenie decyzji i działań z wynikami biznesowymi.
Użytkownik: Owner/Pilot Owner
Główna akcja: Otwórz wynik lub eksport; Treści: Decisions, actions, completion, measured outcomes, spend, value, data quality.
Dane: Wejście: workflow metrics. Wyjście: pilot/period summary.
Komponenty: Outcome dashboard; not generic KPI tiles; evidence links.; Stany: partial period, no measured actions, ready
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 11: M15-E10
Wsparcie i konsultacja PapaData; Cel: Utworzenie sprawy wymagającej analizy człowieka.
Użytkownik: Klient
Główna akcja: Wyślij sprawę; Treści: Business question, scope, evidence, urgency, support access request if needed.
Dane: Wejście: support case. Wyjście: assigned case.
Komponenty: Case form; status; comments; access consent.; Stany: draft, submitted, waiting customer, in analysis, resolved
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M15-P01 — Obserwacja do decyzji

Punkt startowy: Nowa obserwacja z KPI/reguły/AI.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Review origin/evidence
- Wiersz 3: 2; Check readiness and limitations
- Wiersz 4: 3; Add alternatives
- Wiersz 5: 4; Choose decision type
- Wiersz 6: 5; Record reason
- Wiersz 7: 6; If action: create brief
- Wiersz 8: 7; If no action/defer: set revisit condition

Punkty decyzyjne:

Data sufficient?

AI or deterministic origin?

Owner authorized?

Błędy i blokery:

Data changed

No owner

KPI blocked

Sukces: Audytowalna decyzja albo świadome odroczenie.

Ścieżki alternatywne:

Data issue

Further analysis

Reject observation

## 4.2. M15-P02 — Działanie marketingowe do wyniku

Punkt startowy: Decision requires execution.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Create structured brief
- Wiersz 3: 2; Assign owner/due date
- Wiersz 4: 3; Capture baseline
- Wiersz 5: 4; Execute externally/internal
- Wiersz 6: 5; Update status/evidence
- Wiersz 7: 6; Wait measurement window
- Wiersz 8: 7; Fetch new KPI
- Wiersz 9: 8; Assess confounders
- Wiersz 10: 9; Record conclusion

Punkty decyzyjne:

Execution confirmed?

Period complete?

Comparable KPI?

Błędy i blokery:

External action not verified

No new data

Definition changed

Campaign cancelled

Sukces: Measured outcome with conclusion.

Ścieżki alternatywne:

Extend window

Repeat experiment

Close inconclusive

## 4.3. M15-P03 — Support-assisted decision

Punkt startowy: Client needs expert help.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Create case
- Wiersz 3: 2; Define business scope
- Wiersz 4: 3; Attach/link internal evidence
- Wiersz 5: 4; Assess need for temporary support access
- Wiersz 6: 5; Grant scoped/time-bound if approved
- Wiersz 7: 6; Analysis and recommendation
- Wiersz 8: 7; Client decision
- Wiersz 9: 8; Revoke access
- Wiersz 10: 9; Measure if action

Punkty decyzyjne:

Can resolve without access?

Sensitive scope?

Human expert required?

Błędy i blokery:

No consent

Insufficient evidence

Case overdue

Sukces: Resolved case with decision and auditable access.

Ścieżki alternatywne:

Screen-share

Narrow scope

Escalate domain expert

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Wsparcie w marketingu, decyzje i działania” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M15-F01 — Obserwacja/rekomendacja

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Title
• Type/origin
• KPI/dataset
• Period
• Statement
• Evidence
• Limitations
• Owner
• Expiry
- Wiersz 3: Walidacje; • Source and version required
• No unsupported certainty
• Expiry if data can change
- Wiersz 4: Błędy; • KPI not ready
• Evidence inaccessible
• Duplicate observation
- Wiersz 5: Sukces; Draft/reviewed artifact.
- Wiersz 6: Zależności backendowe; Observation service, evidence snapshot, audit.
- Wiersz 7: Ryzyka UX; AI origin must remain visible.

## 6.2. M15-F02 — Decyzja

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Linked artifact
• Decision type
• Reason
• Owner
• Decision date
• Revisit condition
• Action required?
- Wiersz 3: Walidacje; • Reason required
• Capability
• No action/defer are valid
• Current evidence warning
- Wiersz 4: Błędy; • Artifact changed
• No owner
• Approval missing
- Wiersz 5: Sukces; Versioned decision record.
- Wiersz 6: Zależności backendowe; Decision service, snapshot, audit.
- Wiersz 7: Ryzyka UX; Do not force positive action.

## 6.3. M15-F03 — Brief działania

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Channel
• Target
• Hypothesis
• Scope
• Owner
• Due
• Dependencies
• Expected result
• Measurement KPI/period
- Wiersz 3: Walidacje; • Owner/due required
• Baseline available or explicitly missing
• External execution clear
- Wiersz 4: Błędy; • No baseline
• Dependency blocked
• Unallowed action
- Wiersz 5: Sukces; Planned action.
- Wiersz 6: Zależności backendowe; Action service, notifications, KPI snapshot.
- Wiersz 7: Ryzyka UX; Creating brief does not execute provider change.

## 6.4. M15-F04 — Pomiar rezultatu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Baseline
• Current result
• Period
• Confounders
• Conclusion
• Evidence
• Next decision
- Wiersz 3: Walidacje; • Comparable KPI/version
• Data readiness
• Conclusion supports inconclusive/blocked
- Wiersz 4: Błędy; • No data
• Changed definition
• Period incomplete
- Wiersz 5: Sukces; Outcome linked to action and pilot.
- Wiersz 6: Zależności backendowe; KPI service, evidence, audit.
- Wiersz 7: Ryzyka UX; Avoid causal claims beyond evidence.

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
- Wiersz 2: Observation origin; Obserwacja została utworzona przez regułę deterministyczną / analityka / Papa.
- Wiersz 3: Data changed; Dane zmieniły się od utworzenia obserwacji. Przejrzyj aktualny wynik przed decyzją.
- Wiersz 4: No action; Brak działania jest prawidłową decyzją. Zapisz uzasadnienie i warunek ponownej oceny.
- Wiersz 5: Action external; Działanie jest planem w PapaData. Wykonanie w systemie reklamowym musi zostać potwierdzone osobno.
- Wiersz 6: Waiting; Okres pomiaru jeszcze się nie zakończył. Najwcześniejsza ocena: 31 lipca.
- Wiersz 7: Inconclusive; Wynik jest niejednoznaczny z powodu częściowych danych i równoległej promocji.
- Wiersz 8: Negative; KPI pogorszył się względem baseline. Zapisz wniosek i decyzję następną.
- Wiersz 9: Support access; Aby przeanalizować sprawę, Support prosi o czasowy dostęp do wskazanego zakresu.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M15-K01; Kolejka procesu; Observation/decision/action/measurement stages.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M15-K02; Karta obserwacji; Origin, claim, evidence, limitations.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M15-K03; Porównanie rekomendacji; Options, impact, effort, risk.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M15-K04; Rekord decyzji; Type, reason, owner, evidence snapshot.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M15-K05; Brief działania; Channel, target, hypothesis, owner, due.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M15-K06; Oś wykonania; Planned/in progress/blocked/completed.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M15-K07; Porównanie przed i po z informacją o zaufaniu; Baseline and current with separate Trust Headers.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M15-K08; Panel czynników zakłócających; Confounders and causal caution.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M15-K09; Znacznik rezultatu; Achieved/partial/no change/negative/inconclusive/blocked.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 11: M15-K10; Sprawa wsparcia; Scope, status, access and resolution.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Decyzje/Centrum
- Wiersz 3: Folder; Decyzje/Obserwacje
- Wiersz 4: Folder; Decyzje/Rekomendacje
- Wiersz 5: Folder; Decyzje/Rejestr
- Wiersz 6: Folder; Działania/Brief
- Wiersz 7: Folder; Działania/Szczegóły
- Wiersz 8: Folder; Działania/Pomiar
- Wiersz 9: Folder; Działania/Biblioteka
- Wiersz 10: Folder; Wsparcie/Sprawa
- Wiersz 11: Historia; Centrum/Puste
- Wiersz 12: Historia; Obserwacja/Dane_zmienione
- Wiersz 13: Historia; Rekomendacja/Wymaga_danych
- Wiersz 14: Historia; Decyzja/Brak_działania
- Wiersz 15: Historia; Brief/Zablokowane_zależności
- Wiersz 16: Historia; Pomiar/Oczekuje_na_okres
- Wiersz 17: Historia; Pomiar/Niejednoznaczny
- Wiersz 18: Historia; Wsparcie/Dostęp_czasowy
- Wiersz 19: Historia; Przepływy/Obserwacja_do_wyniku
- Wiersz 20: Wariant; Marketing
- Wiersz 21: Wariant; Sprzedaż
- Wiersz 22: Wariant; Operacje
- Wiersz 23: Wariant; Źródło_AI
- Wiersz 24: Wariant; Źródło_analityk
- Wiersz 25: Wariant; Tylko_odczyt
- Wiersz 26: Wariant; Wygasła_sesja
- Wiersz 27: Wariant; Długi_okres

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
- Wiersz 2: P0; Observations, decision register, actions, baseline and result measurement for pilot.
- Wiersz 3: P1; Recommendations, marketing brief, workflow center, support cases and effect summary.
- Wiersz 4: P2; Action templates, experiments library, controlled automation and portfolio optimization.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M15-R01; Recommendation=end; No business outcome.; Decision/action/measurement required.
- Wiersz 3: M15-R02; AI origin hidden; Overtrust.; Visible provenance.
- Wiersz 4: M15-R03; No action discouraged; Biased decisions.; Valid explicit outcome.
- Wiersz 5: M15-R04; External execution assumed; False status.; Separate confirmation.
- Wiersz 6: M15-R05; Causal claim from correlation; Wrong learning.; Confounders and cautious conclusion.
- Wiersz 7: M15-R06; Baseline after action; Invalid measurement.; Capture before execution.
- Wiersz 8: M15-R07; Support access overbroad; Privacy risk.; JIT scoped/time-bound.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M15-D01; Alert/observation/recommendation definitions; Luka; Content/status contracts.; Workflow.
- Wiersz 3: M15-D02; Action taxonomy; Decyzja UI/UX do podjęcia; Marketing/sales/ops types.; Forms and reporting.
- Wiersz 4: M15-D03; External execution proof; Luka; Manual confirmation/API evidence.; Action state.
- Wiersz 5: M15-D04; Measurement windows; Luka; Per KPI/action.; Waiting state.
- Wiersz 6: M15-D05; Causal methodology; Requires analytical decision; How to phrase/compare.; Outcome UX.
- Wiersz 7: M15-D06; Notification/escalation; Luka; Due/overdue/owner.; Workflow center.
- Wiersz 8: M15-D07; Support SLA; Decision later; Response expectations.; Case UX.
- Wiersz 9: M15-D08; Experiment library criteria; P2 decision; Minimum evidence/reuse rules.; Avoid false generalization.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Define workflow objects and statuses.

Design observation + evidence provenance.

Design decision record including no-action/defer.

Design action brief and baseline capture.

Design measurement and confounders.

Connect support access/cases.

Only then templates and automation.

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
