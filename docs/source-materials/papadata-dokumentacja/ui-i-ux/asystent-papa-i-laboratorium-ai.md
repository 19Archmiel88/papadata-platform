# Asystent Papa i laboratorium AI

PAPADATA

Papa Asystent i Laboratorium AI

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M12
- Wiersz 3: Numer modułu; 12 z 15
- Wiersz 4: Wersja; 2.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Papa Asystent i Laboratorium AI” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Papa Asystent, Laboratorium AI oraz AI Actions należą do MVP. AI korzysta wyłącznie z danych dopuszczonych przez readiness i uprawnienia, zwraca evidence, ograniczenia i poziom pewności oraz potrafi odmówić. Działania istotne wymagają zatwierdzenia człowieka, ponownej walidacji targetu i danych, idempotencji, audytu oraz mechanizmu anulowania lub kompensacji, gdy jest to technicznie możliwe. Niedopuszczalne jest niekontrolowane autonomiczne wykonanie o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

Storybook jest kontraktem stanów produkcyjnych. Każdy moduł należący do MVP ma stories dla happy path, loading, empty, no data, partial, stale, processing, success, validation error, permission denied, provider error, recoverable error, terminal error, cancellation i recovery. Nie wolno tworzyć martwych ekranów, atrap funkcji ani przycisków bez kontraktu akcji. Funkcja zależna od integracji jest aktywna tylko dla providerów z katalogu MVP.

## Podstawa źródłowa

Dokument 1: AI jako wsparcie interpretacji i decyzji

Dokument 2: DEC-AI-001, DEC-AI-002, DEC-AI-003

Dokument 3: AI nie ustanawia kontraktu danych ani gotowości

Dokument 7: tenant-safe retrieval, human oversight, dostawcy i bramy AI

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
- Wiersz 2: M12-E01…; ekrany i widoki
- Wiersz 3: M12-P01…; przepływy użytkownika
- Wiersz 4: M12-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M12-K01…; komponenty i wzorce UI
- Wiersz 6: M12-R01…; ryzyka UX
- Wiersz 7: M12-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • AI nie jest źródłem prawdy: nie definiuje KPI, source authority, uprawnień, gotowości ani danych. • Retrieval, pamięć, kontekst, logi i wyniki AI muszą być izolowane per tenant. • Istotne działania wymagają kontroli człowieka; AI nie może wykonać ich samodzielnie. • AI może pracować tylko na danych dopuszczonych przez kontrakt gotowości i uprawnienia. • Uruchomienie AI na danych klientów wymaga odrębnej bramy bezpieczeństwa, prywatności i dostawców.

Tabela:
- Wiersz 1: Założenia • Pierwszy use case to kontekstowa interpretacja KPI, nie pusty czat. • Papa ma tryb panelu kontekstowego i pełne Laboratorium AI dla analizy wieloetapowej. • Pamięć rozmów jest wyłączona lub ograniczona do workspace do czasu zatwierdzenia polityki.

Tabela:
- Wiersz 1: Rekomendacje • Każda odpowiedź pokazuje aktywny workspace, okres, użyte KPI/datasets, ograniczenia i cytowalne dowody wewnętrzne. • Oddzielić obserwację, hipotezę, rekomendację, decyzję i wykonane działanie. • Nie używać generycznego confidence score; pokazywać jakość dowodów i brakujące dane. • Laboratorium AI ma umożliwiać porównanie wariantów, zapis analizy i przekazanie do decyzji, ale nie omija uprawnień.

## 1.1. Konsekwencje dla projektu

Moduł „Papa Asystent i Laboratorium AI” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Właściciel biznesowy; Wyjaśnienie wyniku i warianty decyzji.; Pytania, rekomendacje, approval.
- Wiersz 3: Analityk; Analiza hipotez i dowodów.; Context, sources, reproducibility.
- Wiersz 4: Data Steward; Ocena problemów danych wskazanych przez AI.; Lineage and quality.
- Wiersz 5: Administrator/Security Owner; Polityka AI, dostawcy i dostęp.; Enable/disable, retention, audit.
- Wiersz 6: Operations/AI Governance Owner; Monitoring kosztów, błędów i bram.; Models, incidents, evaluations.

## 2.2. Pozycja modułu w produkcie

Moduł M12 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: AI jako wsparcie interpretacji i decyzji

Dokument 2: DEC-AI-001, DEC-AI-002, DEC-AI-003

Dokument 3: AI nie ustanawia kontraktu danych ani gotowości

Dokument 7: tenant-safe retrieval, human oversight, dostawcy i bramy AI

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M12-E01
Panel Papa w kontekście; Cel: Wyjaśnienie bieżącego KPI/ekranu bez utraty zadania.
Użytkownik: Biznes/analityk
Główna akcja: Zadaj pytanie lub utwórz analizę; Treści: Active context, prompt, used KPI, evidence, limitations, suggested next steps.
Dane: Wejście: page context + question. Wyjście: answer/observation.
Komponenty: Context header; conversation; evidence chips; action footer.; Stany: AI off, no ready data, generating, error, limited answer
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M12-E02
Laboratorium AI; Cel: Wieloetapowa analiza z kontrolą zakresu i dowodów.
Użytkownik: Analityk/biznes
Główna akcja: Uruchom analizę; Treści: Objective, datasets/KPI, period, assumptions, steps, variants, evidence, cost.
Dane: Wejście: controlled context. Wyjście: analysis artifact.
Komponenty: Workspace canvas; context builder; run timeline; results.; Stany: draft, validating, running, partial, failed, completed
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M12-E03
Szczegóły obserwacji AI; Cel: Ocena tezy i jej podstaw.
Użytkownik: Biznes/analityk
Główna akcja: Przyjmij, odrzuć lub analizuj; Treści: Observation, scope, evidence, limitations, alternative explanations, freshness.
Dane: Wejście: generated observation. Wyjście: reviewed state/decision.
Komponenty: Observation card; evidence drawer; review actions.; Stany: new, reviewed, rejected, expired, data changed
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M12-E04
Rekomendacja i warianty; Cel: Porównanie możliwych działań bez automatyzacji.
Użytkownik: Właściciel biznesowy
Główna akcja: Wybierz wariant; Treści: Options, expected impact, risk, effort, evidence, assumptions, measurement.
Dane: Wejście: observation + policy. Wyjście: decision/action.
Komponenty: Variant comparison; approval; baseline prompt.; Stany: needs data, ready for decision, approved, rejected
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M12-E05
Panel dowodów AI; Cel: Pokazanie, na czym oparto odpowiedź.
Użytkownik: Analityk
Główna akcja: Otwórz KPI/dataset; Treści: KPI versions, datasets, filters, periods, lineage, excerpts, missing data.
Dane: Wejście: provenance. Wyjście: navigation/reproducibility.
Komponenty: Evidence list; citations to internal objects; trust status.; Stany: complete, partial, inaccessible source, stale
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M12-E06
Wybór kontekstu AI; Cel: Świadome określenie zakresu analizy.
Użytkownik: Analityk
Główna akcja: Zatwierdź kontekst; Treści: Workspace, period, KPIs, datasets, exclusions, PII level, cost estimate.
Dane: Wejście: user selections + permissions. Wyjście: context snapshot.
Komponenty: Context picker; scope chips; privacy warning.; Stany: invalid, no access, too broad, ready
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M12-E07
Zatwierdzenie działania AI; Cel: Human oversight dla operacji o wpływie.
Użytkownik: Uprawniony owner/admin
Główna akcja: Zatwierdź/odrzuć; Treści: Proposed action, target system, data scope, impact, rollback, owner, reauth.
Dane: Wejście: action proposal. Wyjście: decision/execution job.
Komponenty: Approval dialog; reauth; audit; result.; Stany: requires admin, MFA, rejected, executing, executed, failed
Priorytet: P1/P1 low risk
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M12-E08
Historia i pamięć Papa; Cel: Kontrola rozmów, analiz i retencji.
Użytkownik: Użytkownik/admin
Główna akcja: Otwórz/usuń/eksportuj; Treści: Sessions, workspace, context, date, retention, shared/private state.
Dane: Wejście: history policy. Wyjście: access/export/delete.
Komponenty: History list; retention badge; privacy controls.; Stany: empty, restricted, expired, deletion pending
Priorytet: P1
Podstawa: Rekomendacja zależna od decyzji.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 10: M12-E09
Ustawienia AI i Governance; Cel: Kontrola dostępności, modeli, dostawców i use cases.
Użytkownik: Admin/AI Governance Owner
Główna akcja: Zmień politykę; Treści: Enabled use cases, models, data classes, retention, logging, cost limits, approvals.
Dane: Wejście: policy. Wyjście: versioned config.
Komponenty: Policy form; gate status; vendor info; audit.; Stany: disabled, pilot only, approved, blocked, superseded
Priorytet: P1 internal/admin
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M12-P01 — KPI do interpretacji Papa

Punkt startowy: Użytkownik otwiera gotowy/partial KPI.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open panel
- Wiersz 3: 2; Capture context snapshot
- Wiersz 4: 3; Check permission/readiness
- Wiersz 5: 4; Ask question
- Wiersz 6: 5; Retrieve tenant-safe evidence
- Wiersz 7: 6; Generate answer with limitations
- Wiersz 8: 7; Review evidence
- Wiersz 9: 8; Save observation or discard

Punkty decyzyjne:

Data allowed?

Partial acceptable?

Need deeper analysis?

Błędy i blokery:

AI disabled

No ready data

Provider/model error

Evidence inaccessible

Sukces: Reviewed answer tied to evidence.

Ścieżki alternatywne:

Manual analysis

Open Lab

Create data issue

## 4.2. M12-P02 — Rekomendacja do decyzji

Punkt startowy: Observation reviewed.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Generate options
- Wiersz 3: 2; Compare evidence/risk/effort
- Wiersz 4: 3; Human review
- Wiersz 5: 4; Choose approve/reject/defer
- Wiersz 6: 5; Create decision
- Wiersz 7: 6; Create action
- Wiersz 8: 7; Set baseline/measurement

Punkty decyzyjne:

High impact?

Extra approval?

External execution?

Błędy i blokery:

No owner

Data changed

Recommendation expired

Sukces: Human decision; AI remains advisory.

Ścieżki alternatywne:

Further analysis

No action

Data issue

## 4.3. M12-P03 — AI action approval

Punkt startowy: AI proposes permitted operation.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Policy check
- Wiersz 3: 2; Show exact operation and target
- Wiersz 4: 3; Impact/rollback
- Wiersz 5: 4; Capability + reauth/MFA
- Wiersz 6: 5; Human approve/reject
- Wiersz 7: 6; Execute job
- Wiersz 8: 7; Show outcome/audit

Punkty decyzyjne:

Use case allowed?

Reversible?

Second approval?

Błędy i blokery:

Permission denied

Job failed

Target changed

Sukces: Executed only after explicit approval, or rejected.

Ścieżki alternatywne:

Convert to manual task

Schedule review

Disable use case

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Papa Asystent i Laboratorium AI” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M12-F01 — Pytanie do Papa

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Question
• Active context
• Optional period/KPI selection
• Desired output
- Wiersz 3: Walidacje; • No hidden cross-workspace context
• Prompt length/unsafe content
• At least one allowed source
- Wiersz 4: Błędy; • No ready data
• Context expired
• AI unavailable
- Wiersz 5: Sukces; Answer with evidence/limitations.
- Wiersz 6: Zależności backendowe; Retrieval, model gateway, policy, cost metering.
- Wiersz 7: Ryzyka UX; User prompt is not permission to access unauthorized data.

## 6.2. M12-F02 — Konfiguracja analizy

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Objective
• KPIs/datasets
• Period
• Filters
• Assumptions
• Exclusions
• Budget/limit
- Wiersz 3: Walidacje; • Capability per source
• PII policy
• Scope bound
• Cost estimate
- Wiersz 4: Błędy; • Too broad
• Sensitive data blocked
• Incompatible KPI versions
- Wiersz 5: Sukces; Versioned context snapshot and run.
- Wiersz 6: Zależności backendowe; AI orchestration, retrieval, audit, cost.
- Wiersz 7: Ryzyka UX; Avoid silent context expansion.

## 6.3. M12-F03 — Approval działania

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Action type
• Target
• Scope
• Owner
• Reason
• Rollback
• Confirmation
- Wiersz 3: Walidacje; • Use case allowed
• Capability
• Reauth/MFA
• Idempotency
• Current target state
- Wiersz 4: Błędy; • Stale proposal
• Approval expired
• Target unavailable
- Wiersz 5: Sukces; Decision and job/outcome.
- Wiersz 6: Zależności backendowe; Action service, provider connector, audit.
- Wiersz 7: Ryzyka UX; Approval must not be a generic 'OK'.

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
- Wiersz 2: Role of AI; Papa interpretuje gotowe dane. Nie definiuje KPI ani nie zmienia danych źródłowych.
- Wiersz 3: Context; Odpowiedź dotyczy workspace D2C Polska, okresu 1-15 lipca i trzech wskazanych KPI.
- Wiersz 4: Partial evidence; Jedno z użytych KPI jest częściowe; wniosek nie obejmuje 16-17 lipca.
- Wiersz 5: No data; Papa nie może odpowiedzieć na podstawie potwierdzonych danych w tym zakresie.
- Wiersz 6: Generated; To propozycja wygenerowana przez AI. Nie została jeszcze zatwierdzona ani wykonana.
- Wiersz 7: Evidence changed; Dane źródłowe zmieniły się od wygenerowania odpowiedzi. Uruchom analizę ponownie.
- Wiersz 8: Approval; Sprawdź dokładny zakres i wpływ. Zatwierdzenie uruchomi operację w imieniu workspace.
- Wiersz 9: History; Rozmowa jest przechowywana zgodnie z polityką workspace; sprawdź termin retencji.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M12-K01; Nagłówek kontekstu Papa; Workspace, period, KPI, data state.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M12-K02; Etykieta dowodu; Internal object, version, readiness.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M12-K03; Panel ograniczeń; Missing data, assumptions, uncertainty sources.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M12-K04; Karta obserwacji; Claim, evidence, alternatives, status.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M12-K05; Porównanie wariantów; Impact, risk, effort, measurement.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M12-K06; Wybór kontekstu; Allowed datasets/KPIs and exclusions.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M12-K07; Oś przebiegu AI; Retrieval, reasoning stage, result without hidden chain.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M12-K08; Zatwierdzenie przez człowieka; Exact action, impact, reauth, outcome.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M12-K09; Znacznik polityki AI; Enabled use case, retention, model/vendor.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 11: M12-K10; Koszt użycia AI; Usage and limit in admin/operations context.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Papa/Panel_kontekstowy
- Wiersz 3: Folder; Papa/Laboratoriumoratorium
- Wiersz 4: Folder; Papa/Obserwacje
- Wiersz 5: Folder; Papa/Rekomendacje
- Wiersz 6: Folder; Papa/Dowody
- Wiersz 7: Folder; Papa/Kontekst
- Wiersz 8: Folder; Papa/Zatwierdzenia
- Wiersz 9: Folder; Papa/Historia
- Wiersz 10: Folder; Papa/Nadzór
- Wiersz 11: Historia; Panel/Brak_gotowych_danych
- Wiersz 12: Historia; Panel/Odpowiedź_z_ograniczeniami
- Wiersz 13: Historia; Laboratorium/Analiza_w_toku
- Wiersz 14: Historia; Obserwacja/Dane_zmienione
- Wiersz 15: Historia; Rekomendacja/Wymaga_decyzji
- Wiersz 16: Historia; Dowody/Źródło_niedostępne
- Wiersz 17: Historia; Zatwierdzenie/Wymaga_MFA
- Wiersz 18: Historia; Historia/Wygasła
- Wiersz 19: Historia; Przepływy/KPI_do_decyzji
- Wiersz 20: Wariant; AI_wyłączone
- Wiersz 21: Wariant; Tryb_pilotażowy
- Wiersz 22: Wariant; Tylko_odczyt
- Wiersz 23: Wariant; Dane_częściowe
- Wiersz 24: Wariant; Wysoki_koszt
- Wiersz 25: Wariant; Wrażliwe_dane_zablokowane
- Wiersz 26: Wariant; Błąd_dostawcy
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
- Wiersz 2: P0; Bez AI lub statyczne manual observations; governance first.
- Wiersz 3: P1; Contextual KPI interpretation, evidence panel, observations, Lab for approved use case, history policy.
- Wiersz 4: P1; Controlled actions/automation, broader use cases and advanced evaluation after gates.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M12-R01; Empty chat as product; No context/value.; Contextual panel first.
- Wiersz 3: M12-R02; AI as authority; Overtrust.; Evidence and role statement.
- Wiersz 4: M12-R03; Cross-tenant retrieval; Critical breach.; Tenant-safe retrieval and tests.
- Wiersz 5: M12-R04; Generic confidence score; False precision.; Evidence quality/limitations.
- Wiersz 6: M12-R05; Auto-action; Loss of control.; Human approval/reauth.
- Wiersz 7: M12-R06; Persistent memory unclear; Privacy risk.; Explicit policy and retention.
- Wiersz 8: M12-R07; Prompt expands access; Authorization bypass.; Server permission per source.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M12-D01; First AI use case; Decyzja UI/UX do podjęcia; Exact KPI/task after Gate S3.; P1 scope.
- Wiersz 3: M12-D02; Model/vendor; Decision/security; Provider, region, data terms.; Governance UX.
- Wiersz 4: M12-D03; Memory policy; Luka; Persistence, sharing, retention.; History.
- Wiersz 5: M12-D04; Evidence contract; Decyzja UI/UX do podjęcia; What sources/citations shown.; Trust.
- Wiersz 6: M12-D05; Uncertainty presentation; Luka; Evidence/limitations model.; Avoid confidence score.
- Wiersz 7: M12-D06; Cost limits; Luka; Per plan/workspace/user.; Usage UX.
- Wiersz 8: M12-D07; Action allowlist; Decision later; Low/high risk operations.; Approval P1.
- Wiersz 9: M12-D08; Evaluation metrics; Luka; Quality/safety/business value.; Gate evidence.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Approve first use case and governance gate.

Define context/evidence contract and tenant-safe retrieval.

Design contextual panel without empty chat.

Design observation/recommendation and human decision.

Design Lab with bounded context and cost.

Define history/memory controls.

Only then action approval and automation.

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
