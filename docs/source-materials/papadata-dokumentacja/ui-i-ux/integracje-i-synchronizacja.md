# Integracje i synchronizacja

PAPADATA

Integracje i synchronizacja

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M10
- Wiersz 3: Numer modułu; 10 z 15
- Wiersz 4: Wersja; 2.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Integracje i synchronizacja” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Storybook jest kontraktem stanów produkcyjnych. Każdy moduł należący do MVP ma stories dla happy path, loading, empty, no data, partial, stale, processing, success, validation error, permission denied, provider error, recoverable error, terminal error, cancellation i recovery. Nie wolno tworzyć martwych ekranów, atrap funkcji ani przycisków bez kontraktu akcji. Funkcja zależna od integracji jest aktywna tylko dla providerów z katalogu MVP.

## Podstawa źródłowa

Dokument 3: connection, data layers, readiness i reprocessing

Dokument 4: pełny kontrakt integracji, statusy, bramy, sync/backfill/reconnect

Dokument 5: connect do pierwszej wartości

Dokument 7: sekrety write-only, tenant isolation i audyt

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
- Wiersz 2: M10-E01…; ekrany i widoki
- Wiersz 3: M10-P01…; przepływy użytkownika
- Wiersz 4: M10-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M10-K01…; komponenty i wzorce UI
- Wiersz 6: M10-R01…; ryzyka UX
- Wiersz 7: M10-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Integracja nie ma jednego płaskiego statusu; katalog, adapter, środowisko, connect, sync, normalizacja, integralność, KPI, monitoring i recovery są odrębne. • Connect nie oznacza danych, a dane nie oznaczają gotowego KPI. • Awaria jednego providera powinna degradować tylko zależny zakres. • Sekrety są write-only, a connect/reconnect muszą respektować capability, tenant i scope. • Podniesienie gotowości integracji wymaga dowodu: testu, logu, sync, rekoncyliacji, recovery lub runbooka.

Tabela:
- Wiersz 1: Założenia • UI klienta pokazuje skrócony status biznesowy, a szczegóły techniczne są w rozwijanym Inspectorze. • Operations Console pokazuje pełne wymiary, runy, koszty i recovery. • Połączenie ma jeden workspace, provider i external account mapping; relacje wielu kont wymagają jawnej konfiguracji.

Tabela:
- Wiersz 1: Rekomendacje • Rozdzielić katalog providerów, kreator connection, szczegóły integracji i historię operacji. • Po sukcesie auth komunikować „sprawdzamy dane”, nie „integracja gotowa”. • Każdy problem ma wpływ biznesowy, zakres historycznie wiarygodny i next action. • Odłączenie wymaga analizy tokenu, nowych sync, danych historycznych, KPI, retencji i usunięcia.

## 1.1. Konsekwencje dla projektu

Moduł „Integracje i synchronizacja” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Administrator integracji; Połączenie i utrzymanie źródeł.; Connect, reconnect, scope, disconnect.
- Wiersz 3: Analityk; Ocena wpływu integracji na dane/KPI.; Status, freshness, run history.
- Wiersz 4: Data Steward; Integralność i source overlap.; Quality, authority, review.
- Wiersz 5: Operations Owner; Retry, recovery, reprocessing, runbook.; Pełne runy i koszty.
- Wiersz 6: Właściciel biznesowy; Zrozumienie wpływu bez detali technicznych.; Status biznesowy i ETA/owner.

## 2.2. Pozycja modułu w produkcie

Moduł M10 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 3: connection, data layers, readiness i reprocessing

Dokument 4: pełny kontrakt integracji, statusy, bramy, sync/backfill/reconnect

Dokument 5: connect do pierwszej wartości

Dokument 7: sekrety write-only, tenant isolation i audyt

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M10-E01
Katalog źródeł; Cel: Wybór dostępnego providera bez sugerowania gotowości.
Użytkownik: Administrator integracji
Główna akcja: Rozpocznij połączenie; Treści: Provider, category, vertical, availability, stage, permissions, plan.
Dane: Wejście: catalog/entitlements. Wyjście: connect flow.
Komponenty: Provider tile; filters; availability label.; Stany: available, not in plan, preparation, deprecated, unavailable
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M10-E02
Kreator połączenia; Cel: Utworzenie connection w kontrolowanych krokach.
Użytkownik: Administrator integracji
Główna akcja: Połącz konto; Treści: Provider info, scopes, account selection, auth, data range, test, impact.
Dane: Wejście: OAuth/secret write-only. Wyjście: authenticated connection.
Komponenty: Stepper; scope summary; secret input; test.; Stany: waiting provider, denied, insufficient scope, config error, auth success
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M10-E03
Szczegóły integracji; Cel: Zrozumienie stanu i wykonanie next action.
Użytkownik: Admin/analityk
Główna akcja: Reconnect lub otwórz dane; Treści: Business status, auth, sync, freshness, datasets, KPI impact, history.
Dane: Wejście: connection + dimensions. Wyjście: action/detail.
Komponenty: Status summary; Inspector; Impact Banner; CTA.; Stany: active, stale, degraded, reauth, blocked, disconnected
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M10-E04
Historia synchronizacji; Cel: Diagnoza sync, backfill i retry.
Użytkownik: Admin/Operations
Główna akcja: Otwórz run; Treści: Run time, period, records, pages, result, retry, error, cost.
Dane: Wejście: sync runs. Wyjście: run detail/retry.
Komponenty: Runs table; progress; error class; cost.; Stany: queued, running, retrying, partial, failed, succeeded, cancelled
Priorytet: P0/P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M10-E05
Szczegóły runu; Cel: Wyjaśnienie przebiegu i wpływu konkretnej operacji.
Użytkownik: Operations/admin
Główna akcja: Ponów dozwolony zakres; Treści: Stages, endpoint, checkpoints, counts, errors, affected datasets/KPIs.
Dane: Wejście: runId. Wyjście: retry/recovery/escalation.
Komponenty: Stage timeline; logs summary; impact; evidence.; Stany: processing, stalled, partial, failed, recovered
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M10-E06
Konfiguracja zakresu danych; Cel: Zmiana obiektów, historii i częstotliwości.
Użytkownik: Administrator integracji
Główna akcja: Zapisz zakres; Treści: Datasets, scopes, historical window, schedule, cost/privacy impact.
Dane: Wejście: configuration. Wyjście: versioned config/re-auth need.
Komponenty: Form; impact analysis; permission notice.; Stany: draft, analyzing, needs reauth, applied, conflict
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M10-E07
Reconnect; Cel: Przywrócenie dostępu po wygaśnięciu lub zmianie scope.
Użytkownik: Administrator integracji
Główna akcja: Połącz ponownie; Treści: Reason, affected period, history availability, required account/admin, new scope.
Dane: Wejście: auth flow. Wyjście: token + validation + catch-up.
Komponenty: Guided reconnect; history note; test.; Stany: expired token, admin required, denied, success, catch-up
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M10-E08
Odłączenie źródła; Cel: Bezpieczne zatrzymanie integracji.
Użytkownik: Administrator/Owner
Główna akcja: Potwierdź odłączenie; Treści: Token revocation, future sync, historical data, KPI impact, retention/delete options.
Dane: Wejście: disconnect request. Wyjście: disabled connection/job.
Komponenty: Impact summary; reauth; confirmation; audit.; Stany: analyzing, blocked dependency, processing, completed, failed
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 10: M10-E09
Status providera i awarie; Cel: Komunikacja problemu zewnętrznego i lokalnego wpływu.
Użytkownik: Admin/biznes
Główna akcja: Sprawdź zakres wpływu; Treści: Provider incident, affected endpoints/accounts, last good data, history, next update.
Dane: Wejście: monitoring/incident. Wyjście: local status/action.
Komponenty: Incident banner; impact matrix; timeline.; Stany: investigating, monitoring, recovered, unresolved
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M10-P01 — Connect do pierwszych danych

Punkt startowy: Provider dostępny dla workspace.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open catalog
- Wiersz 3: 2; Review scopes
- Wiersz 4: 3; Authenticate
- Wiersz 5: 4; Select account
- Wiersz 6: 5; Set data scope
- Wiersz 7: 6; Test auth
- Wiersz 8: 7; Create connection
- Wiersz 9: 8; Initial sync
- Wiersz 10: 9; Validate data
- Wiersz 11: 10; Update readiness

Punkty decyzyjne:

Capability/entitlement?

Scope complete?

Data exists?

Quality acceptable?

Błędy i blokery:

OAuth cancelled

Misconfigured redirect

No data

Schema mismatch

Sukces: Authenticated connection and first validated dataset state.

Ścieżki alternatywne:

Reconnect

Limit scope

Operations support

## 4.2. M10-P02 — Token wygasł

Punkt startowy: Monitoring wykrywa auth error.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Classify error
- Wiersz 3: 2; Map impact
- Wiersz 4: 3; Notify owner
- Wiersz 5: 4; Reconnect
- Wiersz 6: 5; Validate scope
- Wiersz 7: 6; Catch-up sync
- Wiersz 8: 7; Quality validation
- Wiersz 9: 8; Restore readiness

Punkty decyzyjne:

History remains valid?

Admin required?

Backfill available?

Błędy i blokery:

No admin

Provider denial

Rate limit

Catch-up partial

Sukces: New data resumes or limitation remains explicit.

Ścieżki alternatywne:

Continue history

Support case

Manual data window

## 4.3. M10-P03 — Disconnect

Punkt startowy: Użytkownik requests disconnect.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Impact analysis
- Wiersz 3: 2; Show data/KPI consequences
- Wiersz 4: 3; Choose historical retention/delete path
- Wiersz 5: 4; Reauth
- Wiersz 6: 5; Revoke token
- Wiersz 7: 6; Stop future jobs
- Wiersz 8: 7; Update status
- Wiersz 9: 8; Audit

Punkty decyzyjne:

Dependencies?

Immediate delete allowed?

Open jobs?

Błędy i blokery:

Revocation failed

Delete conflict

No capability

Sukces: Connection disabled with documented data lifecycle.

Ścieżki alternatywne:

Cancel

Schedule later

Escalate privacy

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Integracje i synchronizacja” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M10-F01 — Kreator connection

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Provider
• External account
• OAuth/secret
• Scopes
• Datasets
• History
• Frequency
- Wiersz 3: Walidacje; • Correct workspace
• Capability/entitlement
• Required scopes
• Secret never redisplayed
• Account mapping unique
- Wiersz 4: Błędy; • Invalid credentials
• Expired token
• Insufficient scope
• Admin required
• Provider unavailable
- Wiersz 5: Sukces; Auth success then data verification.
- Wiersz 6: Zależności backendowe; OAuth callback, secret store, connection service, audit.
- Wiersz 7: Ryzyka UX; Sukces auth nie może być pokazany jako gotowość KPI.

## 6.2. M10-F02 — Zakres synchronizacji

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Objects/datasets
• History start
• Frequency
• Timezone
• Optional webhook
- Wiersz 3: Walidacje; • Provider limits
• Cost/privacy impact
• Reauth when scopes change
• Versioning
- Wiersz 4: Błędy; • Unsupported object
• Too much history
• Schedule conflict
- Wiersz 5: Sukces; Versioned config and planned sync.
- Wiersz 6: Zależności backendowe; Scheduler, provider limits, metering.
- Wiersz 7: Ryzyka UX; User must see cost and data impact.

## 6.3. M10-F03 — Disconnect

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Reason
• Stop date
• Historical data choice
• Delete request link
• Acknowledgement
- Wiersz 3: Walidacje; • Owner/capability
• Dependencies checked
• Reauth
• Retention rules
- Wiersz 4: Błędy; • Active critical process
• Legal hold
• Token revocation error
- Wiersz 5: Sukces; Disabled connection or controlled pending state.
- Wiersz 6: Zależności backendowe; Provider revoke, jobs, data lifecycle, audit.
- Wiersz 7: Ryzyka UX; Do not promise deletion if only sync is stopped.

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
- Wiersz 2: Auth success; Konto zostało uwierzytelnione. Rozpoczynamy sprawdzanie zakresu i pierwsze pobranie danych.
- Wiersz 3: Connect not ready; Połączenie działa, ale dane i KPI nie są jeszcze gotowe.
- Wiersz 4: Reconnect; Dostęp wygasł. Dane historyczne są dostępne; wyniki po 16 lipca mogą być nieaktualne.
- Wiersz 5: Provider outage; Provider nie odpowiada. Problem dotyczy nowych danych z tego źródła; inne moduły działają.
- Wiersz 6: Partial sync; Synchronizacja pobrała część okresu. Sprawdź zakres i retry.
- Wiersz 7: Scope missing; Brakuje uprawnienia do refundów. Orders Count jest gotowy, KPI refundów jest zablokowany.
- Wiersz 8: Disconnect; Odłączenie zatrzyma nowe synchronizacje. Dane historyczne pozostaną zgodnie z wybraną polityką.
- Wiersz 9: Secret; Ze względów bezpieczeństwa zapisany sekret nie jest ponownie wyświetlany.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M10-K01; Kafelek dostawcy; Availability, vertical, permissions, stage.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M10-K02; Kreator połączenia; Auth, account, scope, test, summary.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M10-K03; Podsumowanie statusu integracji; Business status, impact, next action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M10-K04; Inspektor statusów; Catalog/implementation/environment/auth/sync/data/KPI/ops.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M10-K05; Wiersz przebiegu; Period, records, outcome, retry, cost.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M10-K06; Oś etapów przebiegu; Fetch/normalize/validate/canonicalize.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M10-K07; Baner wpływu integracji; Last good data and affected KPIs.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M10-K08; Pole sekretu tylko do zapisu; No readback, replace flow.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M10-K09; Analiza wpływu odłączenia; Token, jobs, history, KPI, retention.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Integracje/Katalog
- Wiersz 3: Folder; Integracje/Kreator_połączenia
- Wiersz 4: Folder; Integracje/Szczegóły
- Wiersz 5: Folder; Integracje/Historia_synchronizacji
- Wiersz 6: Folder; Integracje/Przebieg
- Wiersz 7: Folder; Integracje/Zakres
- Wiersz 8: Folder; Integracje/Ponowne_połączenie
- Wiersz 9: Folder; Integracje/Odłączenie
- Wiersz 10: Folder; Integracje/Awaria_providera
- Wiersz 11: Historia; Katalog/Niedostępny_w_planie
- Wiersz 12: Historia; Połączenie/OAuth_odrzucony
- Wiersz 13: Historia; Połączenie/Uwierzytelnione_bez_danych
- Wiersz 14: Historia; Szczegóły/Ponowne_uwierzytelnienie_required
- Wiersz 15: Historia; Synchronizacja/Częściowy
- Wiersz 16: Historia; Przebieg/Ponawianie
- Wiersz 17: Historia; Odłączenie/Blokujące_zależności
- Wiersz 18: Historia; Awaria/Lokalna_degradacja
- Wiersz 19: Wariant; WooCommerce
- Wiersz 20: Wariant; Shopify
- Wiersz 21: Wariant; BaseLinker
- Wiersz 22: Wariant; Allegro
- Wiersz 23: Wariant; Google_Ads
- Wiersz 24: Wariant; Meta_Ads
- Wiersz 25: Wariant; GA4
- Wiersz 26: Wariant; Wygasła_sesja

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
- Wiersz 2: P0; Catalog, connect/reconnect, integration detail, initial sync/backfill, basic history and business impact.
- Wiersz 3: P1; Scope config, detailed runs, disconnect, provider incident, costs and recovery tooling.
- Wiersz 4: P2; Additional provider-specific automation and enterprise variants after operational proof; scheduling, webhooks and self-service required by MVP integrations are included in MVP.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M10-R01; One status 'connected'; False readiness.; Multidimensional status.
- Wiersz 3: M10-R02; Technical jargon to business; Cognitive overload.; Business summary + inspector.
- Wiersz 4: M10-R03; Secret readback; Security breach.; Write-only replace flow.
- Wiersz 5: M10-R04; Provider outage blocks all; Unnecessary downtime.; Local degradation.
- Wiersz 6: M10-R05; Retry duplicates data; Integrity/cost.; Idempotency and run evidence.
- Wiersz 7: M10-R06; Disconnect=delete; Wrong expectation.; Separate lifecycle decisions.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M10-D01; Provider-specific fields; Luka; OAuth/scopes/errors per provider.; Connect UI.
- Wiersz 3: M10-D02; Readiness aggregation; Decyzja UI/UX do podjęcia; Business status mapping.; Summary.
- Wiersz 4: M10-D03; Sync schedules; Luka; Default/allowed frequency.; Config/cost.
- Wiersz 5: M10-D04; History/backfill limits; Luka; Per provider.; Wizard.
- Wiersz 6: M10-D05; Disconnect retention; Decision + legal; Data lifecycle options.; Confirmation.
- Wiersz 7: M10-D06; Customer vs Operations detail; Decyzja UI/UX do podjęcia; Which dimensions visible.; Progressive disclosure.
- Wiersz 8: M10-D07; Incident update cadence; Luka; Status/notifications/owner.; Outage UX.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Model provider/connection/status dimensions.

Design catalog and connect success semantics.

Design integration detail + impact.

Design sync history and run detail.

Add reconnect and local degradation.

Add scope/disconnect impact.

Validate per provider and Operations.

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
