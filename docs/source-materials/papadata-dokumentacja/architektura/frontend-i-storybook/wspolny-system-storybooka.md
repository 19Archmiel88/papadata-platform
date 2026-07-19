# Wspólny system Storybooka

PAPADATA

System wspólny Storybooka

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M02
- Wiersz 3: Numer modułu; 02 z 15
- Wiersz 4: Wersja; 2.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „System wspólny Storybooka” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Storybook jest kontraktem stanów produkcyjnych. Każdy moduł należący do MVP ma stories dla happy path, loading, empty, no data, partial, stale, processing, success, validation error, permission denied, provider error, recoverable error, terminal error, cancellation i recovery. Nie wolno tworzyć martwych ekranów, atrap funkcji ani przycisków bez kontraktu akcji. Funkcja zależna od integracji jest aktywna tylko dla providerów z katalogu MVP.

## Podstawa źródłowa

Dokument 2: centralny rejestr decyzji i stabilne identyfikatory

Dokument 3: wielowymiarowe stany danych, KPI i integralności

Dokument 4: statusy integracji, bramy i lokalna degradacja

Dokument 7: bezpieczeństwo, tenant isolation i human oversight

Synteza UI/UX: Storybook pokazuje pełne flow i stany

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
- Wiersz 2: M02-E01…; ekrany i widoki
- Wiersz 3: M02-P01…; przepływy użytkownika
- Wiersz 4: M02-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M02-K01…; komponenty i wzorce UI
- Wiersz 6: M02-R01…; ryzyka UX
- Wiersz 7: M02-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • PapaData wymaga wspólnego języka stanów: phase, access, readiness, problem, outcome, timing, integrity, business impact i next action. • Kolor nie może być jedynym nośnikiem statusu, a partial nie może wyglądać jak ready. • Komponenty muszą wyjaśniać konsekwencję biznesową, nie tylko kod techniczny. • Dokumentacja opisuje stan docelowy; Storybook musi oddzielać zaakceptowany wzorzec od dowodu implementacji. • Light/dark, klawiatura, focus, długie polskie teksty i stany brzegowe są wymaganiami systemowymi.

Tabela:
- Wiersz 1: Założenia • Storybook jest źródłem prawdy dla wzorców UI, ale nie zastępuje kontraktów domenowych. • Każdy komponent ma polską nazwę biznesową, stabilny kod i ownera domenowego. • Pełne flow korzystają z syntetycznych fixture i mocków zgodnych z kontraktem API.

Tabela:
- Wiersz 1: Rekomendacje • Organizować Storybook według wzorców i procesów, nie według technicznych katalogów frameworka. • Każda historia ma metadane: tenant, rola, stan danych, uprawnienie, wpływ, next action, źródło kontraktu i status implementacji. • Wymagać wariantów: jasny/ciemny, desktop/mobile, keyboard, długi tekst, błąd, loading, brak dostępu. • Dokumentować pełne ścieżki: zaproszenie-KPI, reconnect, konflikt, decyzja, dunning i usunięcie.

## 1.1. Konsekwencje dla projektu

Moduł „System wspólny Storybooka” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Projektant produktu; Spójny język wzorców i stanów.; Definicje, treści, kompletne flow.
- Wiersz 3: Frontend developer; Jednoznaczne API komponentu.; Props, tokeny, przykłady, async states.
- Wiersz 4: QA; Pokrycie przypadków granicznych.; Scenariusze, a11y, visual regression.
- Wiersz 5: Product Owner; Zgodność z decyzjami i MVP.; Status wzorca, priorytet, luki.
- Wiersz 6: Właściciel domenowy; Zgodność semantyczna.; Akceptacja reguł użycia.

## 2.2. Pozycja modułu w produkcie

Moduł M02 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 2: centralny rejestr decyzji i stabilne identyfikatory

Dokument 3: wielowymiarowe stany danych, KPI i integralności

Dokument 4: statusy integracji, bramy i lokalna degradacja

Dokument 7: bezpieczeństwo, tenant isolation i human oversight

Synteza UI/UX: Storybook pokazuje pełne flow i stany

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M02-E01
Strona startowa Storybooka; Cel: Wyjaśnienie zakresu, wersji i zasad.
Użytkownik: Zespół produktu
Główna akcja: Przejdź do wzorca; Treści: Mapa folderów, wersja, status, zmiany, legenda oznaczeń.
Dane: Wejście: manifest. Wyjście: nawigacja i status.
Komponenty: Panel wersji; mapa modułów; legenda.; Stany: domyślny, brak stories, błąd builda, niezgodna wersja
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M02-E02
Podstawy wizualne; Cel: Prezentacja tokenów i zasad bez finalnych layoutów.
Użytkownik: Projektant i frontend
Główna akcja: Skopiuj token; Treści: Typografia, spacing, semantyczne kolory, focus, elevation, motion, motywy.
Dane: Wejście: tokeny. Wyjście: przykłady i kontrast.
Komponenty: Próbki; tabela kontrastu; sandbox motywu.; Stany: jasny, ciemny, wysoki kontrast, brak tokenu
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M02-E03
System statusów; Cel: Semantyka statusów i agregacja do języka biznesowego.
Użytkownik: Projektant, frontend, QA
Główna akcja: Wybierz wymiar i wariant; Treści: Phase, access, readiness, problem, outcome, timing, integrity, impact, action.
Dane: Wejście: model statusu. Wyjście: badge/banner/panel/row.
Komponenty: Status główny; Impact Banner; Inspector; Next Action.; Stany: compact, inline, banner, panel, row, konflikt
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M02-E04
Katalog zaufania do danych; Cel: Wspólny sposób prezentacji gotowości, lineage i ograniczeń.
Użytkownik: Zespół produktu
Główna akcja: Otwórz wariant; Treści: Trust Header, Evidence Drawer, Missing Data, Partial KPI, Lineage.
Dane: Wejście: kontrakt danych. Wyjście: prezentacja.
Komponenty: Args; fixture; panel źródła; ostrzeżenia.; Stany: ready, partial, stale, conflict, blocked, empty
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M02-E05
Katalog bezpieczeństwa; Cel: Prezentacja dostępu, reauth, MFA, approval, eksportu i usunięcia.
Użytkownik: Frontend, QA, Security Owner
Główna akcja: Uruchom scenariusz; Treści: Permission Denied, Reauthentication, Human Approval, Support Access, Delete.
Dane: Wejście: capabilities i ryzyko. Wyjście: akcja/odmowa.
Komponenty: Dialogi; potwierdzenia; audyt.; Stany: brak dostępu, MFA, sesja, odrzucone, wykonane
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M02-E06
Historie pełnych flow; Cel: Walidacja procesu między ekranami i stanami.
Użytkownik: Cały zespół
Główna akcja: Uruchom flow; Treści: Scenariusz, mock API, decyzje, błędy, rezultat.
Dane: Wejście: rola i fixture. Wyjście: interaktywny proces.
Komponenty: Stepper; role switch; event log; reset.; Stany: happy path, błąd, retry, permission, session break
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M02-E07
Laboratorium dostępności; Cel: Sprawdzenie focus, klawiatury, kontrastu i komunikatów.
Użytkownik: QA i frontend
Główna akcja: Uruchom test; Treści: Focus tree, aria labels, błędy formularzy, reduced motion, zoom.
Dane: Wejście: story. Wyjście: raport.
Komponenty: A11y panel; keyboard mode; zoom.; Stany: bez błędów, warning, blocker
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M02-E08
Rejestr zmian komponentu; Cel: Traceability decyzji, kontraktu i wersji.
Użytkownik: PO i developer
Główna akcja: Przejrzyj zmianę; Treści: Wersja, powód, decyzja, breaking change, migracja, owner.
Dane: Wejście: changelog. Wyjście: wersja i migracja.
Komponenty: Tabela zmian; diff; link do decyzji.; Stany: draft, review, accepted, deprecated
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M02-P01 — Dodanie nowego wzorca

Punkt startowy: Zatwierdzone wymaganie lub powtarzalny problem UI.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Powiązanie z decyzją
- Wiersz 3: 2; Polska nazwa i API
- Wiersz 4: 3; Stany obowiązkowe
- Wiersz 5: 4; Light/dark i a11y
- Wiersz 6: 5; Story użycia i anti-pattern
- Wiersz 7: 6; Review
- Wiersz 8: 7; Publikacja

Punkty decyzyjne:

Wspólny czy lokalny?

Pełne stany?

Breaking change?

Błędy i blokery:

Brak kontraktu

Niespójne nazwy

Brak error/permission

A11y blocker

Sukces: Opublikowany wzorzec z traceability.

Ścieżki alternatywne:

Wzorzec lokalny

Odrzucenie duplikatu

## 4.2. M02-P02 — Walidacja pełnego flow

Punkt startowy: Istnieje story wieloekranowe.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Wybór roli/workspace
- Wiersz 3: 2; Dane scenariusza
- Wiersz 4: 3; Happy path
- Wiersz 5: 4; Wstrzyknięcie błędu
- Wiersz 6: 5; Ocena komunikatu/action
- Wiersz 7: 6; Powrót i audyt

Punkty decyzyjne:

Problem lokalny czy globalny?

Capability?

Stan po powrocie aktualny?

Błędy i blokery:

Stary tenant

Brak partial

Utrata formularza

Niejasny komunikat

Sukces: Zaakceptowany scenariusz i regresje.

Ścieżki alternatywne:

Wariant bez AI

Bez danych

Tylko odczyt

## 4.3. M02-P03 — Zmiana kontraktu komponentu

Punkt startowy: Nowa decyzja lub wersja domeny.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Lista zależności
- Wiersz 3: 2; Diff
- Wiersz 4: 3; Aktualizacja stories
- Wiersz 5: 4; Visual/a11y tests
- Wiersz 6: 5; Komunikat migracji
- Wiersz 7: 6; Publikacja

Punkty decyzyjne:

Breaking?

Okres dwóch wersji?

Błędy i blokery:

Mock/API mismatch

Nieaktualne flow

Sukces: Spójna wersja systemu.

Ścieżki alternatywne:

Okres przejściowy

Wycofanie starej wersji

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „System wspólny Storybooka” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M02-F01 — Konfiguracja wariantu story

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Rola
• Workspace fixture
• Readiness
• Integrity
• Access
• Problem
• Timing
• Motyw
• Viewport
- Wiersz 3: Walidacje; • Dozwolone kombinacje
• Brak PII/sekretów
• Polskie etykiety
• Stabilne enumy
- Wiersz 4: Błędy; • Ready + blocked
• Brak ownera
• Sekret w fixture
- Wiersz 5: Sukces; Powtarzalny scenariusz.
- Wiersz 6: Zależności backendowe; Mock contracts, schema validation.
- Wiersz 7: Ryzyka UX; Stan niemożliwy tylko jako test negatywny.

## 6.2. M02-F02 — Zgłoszenie regresji

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Story
• Wersja
• Viewport
• Motyw
• Kroki
• Oczekiwany wynik
• Dowód
• Priorytet
- Wiersz 3: Walidacje; • Story i wersja obowiązkowe
• Kroki odtwarzalne
• Brak danych klienta
- Wiersz 4: Błędy; • Brak reprodukcji
• Niedozwolony plik
• Nieznana wersja
- Wiersz 5: Sukces; Rekord z ownerem.
- Wiersz 6: Zależności backendowe; Tracker, artefakty testowe.
- Wiersz 7: Ryzyka UX; Nie wynosić danych produkcyjnych.

## 6.3. M02-F03 — Metryka komponentu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Polska nazwa
• Kod
• Domena
• Owner
• Źródło kontraktu
• Status implementacji
• Dojrzałość
- Wiersz 3: Walidacje; • Unikalny kod
• Owner i źródło
• Status nie udaje wdrożenia
- Wiersz 4: Błędy; • Duplikat
• Brak traceability
• Nazwa niezgodna
- Wiersz 5: Sukces; Wpis w katalogu.
- Wiersz 6: Zależności backendowe; Manifest, repo, rejestr decyzji.
- Wiersz 7: Ryzyka UX; Akceptacja wzorca ≠ produkcja.

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
- Wiersz 2: Status implementacji; Wzorzec zaakceptowany. Implementacja produkcyjna nie została potwierdzona.
- Wiersz 3: Nieprawidłowy stan; Ta kombinacja nie występuje w kontrakcie domenowym; użyj jej tylko w teście negatywnym.
- Wiersz 4: Brak story błędu; Komponent nie ma wariantu błędu i nie jest gotowy do użycia.
- Wiersz 5: A11y blocker; Problem uniemożliwia obsługę klawiaturą. Publikacja jest zablokowana.
- Wiersz 6: Breaking change; Zmiana wymaga migracji zależnych modułów.
- Wiersz 7: Fixture; Dane testowe nie mogą zawierać sekretów ani danych klienta.
- Wiersz 8: Flow; Scenariusz pokazuje lokalną degradację zamiast blokady całego produktu.
- Wiersz 9: Długi tekst; Sprawdź pełny polski komunikat przy powiększeniu 200%.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M02-K01; Metryka historii; Źródło, owner, decyzja, status wzorca i wdrożenia.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M02-K02; Kontroler roli; Widok zgodny z capabilities.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M02-K03; Kontroler stanu; Phase/readiness/integrity/problem.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M02-K04; Panel danych testowych; Dane syntetyczne i pochodzenie.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M02-K05; Macierz wariantów; Motyw, viewport, keyboard, text, error.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M02-K06; Rejestr antywzorców; Niedozwolone użycia.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M02-K07; Raport dostępności; Problem, kryterium, poprawka.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M02-K08; Porównanie komponentu; Wersje i migracje.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M02-K09; Uruchamiacz przepływu; Rola, dane, błąd, checkpoint.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Podstawy
- Wiersz 3: Folder; Statusy
- Wiersz 4: Folder; Zaufanie_do_danych
- Wiersz 5: Folder; Integracje
- Wiersz 6: Folder; Analityka
- Wiersz 7: Folder; Decyzje_i_działania
- Wiersz 8: Folder; AI
- Wiersz 9: Folder; Bezpieczeństwo_i_administracja
- Wiersz 10: Folder; Rozliczenia
- Wiersz 11: Folder; Przepływy_kompletne
- Wiersz 12: Folder; Dostępność
- Wiersz 13: Folder; Wzorce_przestarzałe
- Wiersz 14: Historia; Statusy/Gotowość/Częściowe_dane
- Wiersz 15: Historia; Zaufanie_do_danych/Nagłówek_zaufania/Konflikt
- Wiersz 16: Historia; Integracje/Połączenie/Oczekuje_na_dane
- Wiersz 17: Historia; Bezpieczeństwo/Ponowne_uwierzytelnienie/Wygasła_sesja
- Wiersz 18: Historia; AI/Zatwierdzenie_człowieka/Odrzucone
- Wiersz 19: Historia; Rozliczenia/Zaległa_płatność/Bezpieczne_ograniczenie
- Wiersz 20: Historia; Przepływy_kompletne/Zaproszenie_do_KPI
- Wiersz 21: Historia; Przepływy_kompletne/KPI_do_pomiaru_rezultatu
- Wiersz 22: Wariant; Domyślny
- Wiersz 23: Wariant; Ładowanie
- Wiersz 24: Wariant; Pusty
- Wiersz 25: Wariant; Częściowe_dane
- Wiersz 26: Wariant; Błąd
- Wiersz 27: Wariant; Brak_dostępu
- Wiersz 28: Wariant; Sukces
- Wiersz 29: Wariant; Ostrzeżenie
- Wiersz 30: Wariant; Wygasła_sesja
- Wiersz 31: Wariant; Przetwarzanie
- Wiersz 32: Wariant; Konflikt_danych
- Wiersz 33: Wariant; Nieukończona_konfiguracja

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
- Wiersz 2: P0; Tokeny, light/dark, statusy, formularze, tabele, wykresy, data trust, security i pełne flow.
- Wiersz 3: P1; Visual regression, automatyczne a11y, changelog, fixtures i kontrakty API.
- Wiersz 4: P2; Portal partnerów, raporty pokrycia i telemetryka komponentów.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M02-R01; Katalog ładnych komponentów; Brak walidacji procesów.; Pełne flow z rolą i błędami.
- Wiersz 3: M02-R02; Angielskie nazwy; Niespójność z produktem.; Polskie nazwy + kod techniczny.
- Wiersz 4: M02-R03; Wzorzec mylony z wdrożeniem; Fałszywa gotowość.; Oddzielne statusy.
- Wiersz 5: M02-R04; Dane klienta w fixture; Ryzyko prywatności.; Dane syntetyczne i skan sekretów.
- Wiersz 6: M02-R05; Brak partial/error/access; Happy path only.; Blokada publikacji bez macierzy.
- Wiersz 7: M02-R06; Kolor bez semantyki; Niedostępność.; Tekst, ikona i token semantyczny.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M02-D01; Technologia Storybooka; Decyzja UI/UX do podjęcia; Wersja, repo i pipeline.; Automatyzacja.
- Wiersz 3: M02-D02; Poziom WCAG; Luka; Minimum AA i zakres.; Kryteria blockerów.
- Wiersz 4: M02-D03; Źródło tokenów; Decyzja UI/UX do podjęcia; Repo/Figma/generator.; Design-code sync.
- Wiersz 5: M02-D04; Schemat fixture; Decyzja UI/UX do podjęcia; Dane per domena i walidacja.; Bezpieczeństwo flow.
- Wiersz 6: M02-D05; Status implementacji; Luka; Enum i dowody przejścia.; Papierowa gotowość.
- Wiersz 7: M02-D06; Deprecjacja; Decyzja UI/UX do podjęcia; Okres wsparcia i migracja.; Skalowanie.
- Wiersz 8: M02-D07; E2E integration; Rekomendacja; Stories jako źródło testów.; Duplikacja.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Zatwierdzić słownik statusów, polskie nazwy i metrykę.

Zbudować foundations i motywy.

Zaprojektować statusy i data trust.

Dodać formularze, tabele, wykresy i async.

Zbudować security, AI approval i billing.

Połączyć w pełne flow pilotażu i recovery.

Uruchomić a11y, visual regression i deprecjację.

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
