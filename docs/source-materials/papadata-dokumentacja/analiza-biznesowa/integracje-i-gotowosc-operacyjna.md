# PapaData — integracje i gotowość operacyjna

## Metryka dokumentu

Dokument: Integracje i gotowość operacyjna PapaData
Numer dokumentu: 4
Wersja: 2.0
Status: Finalny dokument operacyjno-integracyjny
Data obowiązywania: 18 lipca 2026 roku
Właściciel dokumentu: Artur Wiśniewski
Właściciel produktu: Artur Wiśniewski
Właściciel integracji: Artur Wiśniewski
Właściciel danych: Artur Wiśniewski
Właściciel operacyjny: Artur Wiśniewski
Właściciel bezpieczeństwa: Artur Wiśniewski
Model odpowiedzialności: jednoosobowe governance przejściowe
Charakter projektu: projekt tworzony od podstaw

Zakres dokumentu:

- model integracji PapaData;

- katalog strategicznych providerów;

- statusy integracji;

- bramy gotowości;

- wymagania dla connect, sync, backfill i reconnect;

- warunki pobierania i weryfikacji danych;

- powiązanie integracji z kontraktem danych i KPI;

- gotowość operacyjna;

- monitoring;

- retry i recovery;

- reprocessing;

- runbooki;

- Support;

- kryteria dopuszczenia integracji do pilotażu, sprzedaży i skalowania.

Poza zakresem:

- projekt ekranów;

- projekt komponentów;

- finalne komunikaty;

- szczegółowa implementacja API providerów;

- kod adapterów;

- wybór infrastruktury;

- szczegółowe procedury bezpieczeństwa;

- pełny kontrakt KPI;

- model cenowy;

- umowy z providerami;

- formalna dokumentacja SLA.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

## 1. Cel dokumentu

Dokument określa, kiedy integracja w PapaData może zostać uznana za gotową do określonego użycia biznesowego.

Celem dokumentu jest rozdzielenie pojęć, które nie mogą być traktowane jako równoważne:

provider istnieje w katalogu ≠ adapter jest zaplanowany ≠ adapter jest zaimplementowany ≠ środowisko jest skonfigurowane ≠ użytkownik może rozpocząć connect ≠ połączenie zostało zweryfikowane ≠ dane zostały pobrane ≠ dane zostały znormalizowane ≠ integralność danych została zweryfikowana ≠ KPI są gotowe ≠ integracja jest gotowa operacyjnie ≠ integracja została zweryfikowana produkcyjnie

Dokument opisuje wymagany model docelowy. Nie stanowi potwierdzenia, że jakakolwiek integracja, adapter, środowisko, synchronizacja, monitoring albo runbook zostały już wdrożone.

Zasada ta wynika z decyzji DEC-DOC-001.

## 2. Pozycja dokumentu w pakiecie

Dokument 4 jest źródłem prawdy dla:

- katalogu integracji;

- statusów integracji;

- bram gotowości;

- kryteriów dopuszczenia providera;

- warunków connect;

- warunków synchronizacji;

- warunków backfill;

- warunków weryfikacji danych;

- warunków gotowości operacyjnej;

- monitoringu integracji;

- recovery i retry;

- runbooków integracyjnych;

- zakresu odpowiedzialności Supportu i Operations.

Dokument 4 nie jest źródłem prawdy dla:

- statusu decyzji — źródłem jest Dokument 2;

- kontraktu danych, stanów i KPI — źródłem jest Dokument 3;

- szczegółowego procesu pilotażu — źródłem jest Dokument 5;

- cen, limitów i unit economics — źródłem jest Dokument 6;

- kontroli bezpieczeństwa, prywatności i AI — źródłem jest Dokument 7.

Najważniejsze decyzje powiązane:

- DEC-PRD-003 — etapowe uruchamianie produktu i integracji;

- DEC-PRD-004 — Shopify i Allegro direct nie są globalnymi blokerami pilotażu;

- DEC-INT-001 — katalog integracji nie definiuje zakresu wydania;

- DEC-INT-002 — wielowymiarowa gotowość integracji;

- DEC-INT-003 — lokalna degradacja awarii providera;

- DEC-OPS-001 — izolacja ciężkich workloadów;

- DEC-OPS-002 — manual review podlega pomiarowi;

- DEC-DAT-002 — jeden fakt biznesowy zasila KPI jeden raz;

- DEC-DAT-004 — source authority jest wersjonowane;

- DEC-DAT-007 — deduplikacja jest ograniczona do tenantu.

## 3. Zasady nadrzędne

### 3.1. Katalog nie oznacza gotowości

Provider może istnieć w katalogu, ale nie być dostępny dla użytkownika, pilotażu ani produkcji.

Obecność providera w katalogu oznacza jedynie, że został zidentyfikowany jako potencjalne źródło danych.

Zasada wynika z decyzji DEC-INT-001.

### 3.2. Gotowość integracji jest wielowymiarowa

Integracja nie posiada jednego globalnego statusu.

Gotowość musi być oceniana osobno co najmniej dla:

- katalogu;

- planowania adaptera;

- implementacji;

- konfiguracji środowiska;

- dostępności runtime;

- połączenia;

- pobierania danych;

- normalizacji;

- integralności danych;

- KPI;

- monitoringu;

- recovery;

- Supportu;

- gotowości produkcyjnej.

Zasada wynika z decyzji DEC-INT-002.

### 3.3. Connect nie oznacza danych

Poprawne uwierzytelnienie i utworzenie connection nie oznacza, że:

- dane zostały pobrane;

- dane są kompletne;

- dane są poprawne;

- dane zostały znormalizowane;

- dane mogą zasilać KPI;

- integracja jest gotowa operacyjnie.

### 3.4. Dane nie oznaczają KPI

Pobranie danych nie oznacza, że KPI może zostać obliczony.

KPI wymaga spełnienia kontraktu danych, gotowości, source authority, jakości, lineage i integralności, zgodnie z Dokumentem 3.

### 3.5. Awaria jednego providera nie blokuje niezależnych zakresów

Problem jednego źródła nie powinien automatycznie blokować:

- innych providerów;

- danych historycznych;

- niezależnych datasetów;

- niezależnych KPI;

- pionów, których problem nie dotyczy;

- procesu diagnostycznego.

Zasada wynika z decyzji DEC-INT-003.

### 3.6. Bramy są dowodowe

Podniesienie statusu integracji wymaga dowodu.

Dowodem może być:

- test;

- raport;

- log;

- wynik synchronizacji;

- wynik normalizacji;

- wynik rekoncyliacji;

- wynik testu recovery;

- zatwierdzony runbook;

- wynik testu bezpieczeństwa;

- formalna decyzja w rejestrze.

Brak dowodu oznacza brak podniesienia statusu.

### 3.7. Gotowość produkcyjna nie wynika z gotowości kodowej

Adapter może istnieć jako wymagany element docelowy, ale nie oznacza to automatycznie:

- poprawnej konfiguracji;

- dostępności dla użytkownika;

- działania z rzeczywistym kontem;

- poprawności danych;

- gotowości KPI;

- monitoringu;

- gotowości Supportu;

- gotowości produkcyjnej.

## 4. Zakres integracji strategicznych

### 4.1. Kategorie źródeł

PapaData obejmuje docelowo następujące kategorie źródeł:

1. źródła sprzedaży D2C;

1. źródła marketplace;

1. systemy pośredniczące i OMS;

1. systemy reklamowe;

1. systemy analityczne;

1. źródła kosztowe i finansowe;

1. źródła przyszłych danych operacyjnych.

Niniejszy dokument nie zamyka katalogu przyszłych integracji. Każda nowa integracja wymaga osobnego rekordu i przejścia przez bramy gotowości.

### 4.2. Strategiczne integracje pierwszego zakresu

Pierwszy zakres produktu koncentruje się na następujących providerach:

Tabela:
- Wiersz 1: Provider; Kategoria; Główna rola biznesowa; Pion
- Wiersz 2: WooCommerce; D2C commerce; źródło zamówień i sprzedaży sklepu własnego; D2C
- Wiersz 3: Shopify; D2C commerce; źródło zamówień i sprzedaży sklepu własnego; D2C
- Wiersz 4: BaseLinker; OMS / pośrednik; źródło danych sprzedażowych i kanałów, w tym marketplace; marketplace / omnichannel
- Wiersz 5: Allegro; marketplace; źródło sprzedaży marketplace; marketplace
- Wiersz 6: Google Ads; reklama; koszt i wartość atrybucyjna kampanii; marketing
- Wiersz 7: Meta Ads; reklama; koszt i wartość atrybucyjna kampanii; marketing
- Wiersz 8: Google Analytics 4; analityka; zdarzenia analityczne i konwersje; analityka

Włączenie providera do strategicznego zakresu nie oznacza, że jest on warunkiem pierwszego pilotażu.

### 4.3. Integracje nie są uruchamiane jednocześnie

PapaData jest rozwijana etapowo.

Minimalny przypadek wartości wymaga:

jednego źródła sprzedażowego → jednego użytecznego datasetu → jednego wiarygodnego KPI → jednego interpretowalnego rezultatu

Zgodnie z decyzją DEC-PRD-004:

- Shopify i WooCommerce należą do katalogu MVP; brak gotowości jednego providera nie blokuje drugiego ani funkcji niezależnych;

- Allegro i BaseLinker należą do katalogu MVP; każdy jest udostępniany po własnych bramach, a nakładanie źródeł wymaga source authority i deduplikacji.

### 4.4. Pełny katalog integracji

Pełny katalog integracji powinien być prowadzony jako tabela kontrolna w niniejszym dokumencie lub w jego załączniku operacyjnym.

Katalog nie powinien być powielany w Dokumentach 1, 2, 3, 5, 6 ani 7.

Każdy rekord katalogowy musi posiadać:

- providerId;

- nazwę;

- kategorię;

- opis biznesowy;

- zakres danych;

- pion;

- status katalogowy;

- status implementacji;

- status środowiska;

- dostępność runtime;

- status weryfikacji;

- ownera;

- wymagane dowody;

- zależności;

- ryzyka;

- datę ostatniej oceny.

## 5. Model statusów integracji

### 5.1. Status katalogowy

Określa, czy provider znajduje się w katalogu PapaData.

Dozwolone wartości:

Tabela:
- Wiersz 1: Status; Znaczenie
- Wiersz 2: catalogued; provider znajduje się w katalogu
- Wiersz 3: hidden; provider istnieje, ale nie jest publicznie widoczny
- Wiersz 4: deprecated; provider jest wycofywany
- Wiersz 5: removed; provider został usunięty z aktywnego katalogu

Status katalogowy nie umożliwia connect.

### 5.2. Status implementacji

Określa stan adaptera jako wymaganego elementu produktu.

Dozwolone wartości:

Tabela:
- Wiersz 1: Status; Znaczenie
- Wiersz 2: notPlanned; adapter nie jest planowany w obecnym zakresie
- Wiersz 3: catalogOnly; istnieje wpis katalogowy, brak zatwierdzonego adaptera
- Wiersz 4: adapterPlanned; adapter został zatwierdzony do realizacji
- Wiersz 5: adapterInDevelopment; adapter jest rozwijany
- Wiersz 6: adapterImplemented; adapter istnieje jako wymagany element techniczny
- Wiersz 7: repositoryVerified; adapter przeszedł zatwierdzoną bramę repozytoryjną
- Wiersz 8: deprecated; adapter jest wycofywany

Status implementacji nie oznacza gotowości produkcyjnej.

### 5.3. Status środowiska

Określa gotowość konfiguracji niezbędnej do działania integracji.

Dozwolone wartości:

Tabela:
- Wiersz 1: Status; Znaczenie
- Wiersz 2: notAssessed; nie oceniono konfiguracji
- Wiersz 3: configurationRequired; konfiguracja jest wymagana i niepotwierdzona
- Wiersz 4: configured; konfiguracja została potwierdzona
- Wiersz 5: misconfigured; konfiguracja istnieje, ale jest niepoprawna
- Wiersz 6: notApplicable; globalna konfiguracja nie jest wymagana

Konfiguracja może obejmować:

- aplikację OAuth;

- redirect URI;

- client ID;

- client secret;

- developer token;

- webhook secret;

- certyfikat;

- dozwolone domeny;

- zmienne środowiskowe;

- Secret Store;

- kolejki;

- callbacki;

- uprawnienia API;

- limity dostępu.

### 5.4. Dostępność runtime

Określa, czy użytkownik albo proces może rozpocząć rzeczywistą operację.

Dozwolone wartości:

Tabela:
- Wiersz 1: Status; Znaczenie
- Wiersz 2: disabled; connect, test, sync i backfill są zablokowane
- Wiersz 3: gated; provider wymaga spełnienia określonego warunku
- Wiersz 4: connectable; można rozpocząć rzeczywiste połączenie
- Wiersz 5: temporarilyUnavailable; provider został czasowo wyłączony
- Wiersz 6: deprecated; nowe połączenia są niedostępne z powodu wycofywania

Dostępność runtime wymaga spełnienia warunków bezpieczeństwa, konfiguracji i zakresu produktu.

### 5.5. Status weryfikacji

Określa poziom potwierdzenia działania integracji.

Dozwolone wartości:

Tabela:
- Wiersz 1: Status; Znaczenie
- Wiersz 2: notVerified; brak wystarczającego dowodu
- Wiersz 3: connectionVerified; zweryfikowano rzeczywiste połączenie
- Wiersz 4: dataVerified; zweryfikowano pobieranie i normalizację danych
- Wiersz 5: dataIntegrityVerified; zweryfikowano lineage, canonicalization, deduplikację i konflikty
- Wiersz 6: kpiVerified; zweryfikowano KPI zasilane danymi z integracji
- Wiersz 7: operationallyReady; gotowe są monitoring, retry, recovery, Support i runbook
- Wiersz 8: productionVerified; potwierdzono działanie z rzeczywistym klientem w uzgodnionym zakresie

Status productionVerified nie jest nadawany na podstawie samego testu technicznego.

## 6. Bramy gotowości integracji

### Gate 0 — Catalogued

Provider posiada:

- stabilny identyfikator;

- nazwę;

- kategorię;

- opis biznesowy;

- wstępny zakres danych;

- właściciela katalogu;

- status dostępności.

Gate 0 nie umożliwia connect.

### Gate 1 — Adapter Approved

Adapter został zatwierdzony do realizacji.

Wymagane:

- uzasadnienie biznesowe;

- pion wartości;

- oczekiwane dane;

- decyzja o zakresie;

- priorytet;

- zależności;

- wstępna ocena ryzyka.

### Gate 2 — Adapter Implemented

Adapter jest wymaganym elementem docelowym umożliwiającym komunikację z providerem.

Wymagane:

- zakres operacji;

- obsługa autoryzacji;

- obsługa podstawowych błędów;

- mapowanie endpointów;

- logowanie zdarzeń;

- brak ekspozycji sekretów.

Gate 2 nie oznacza gotowości danych.

### Gate 3 — Environment Configured

Środowisko wymagane do działania integracji jest skonfigurowane.

Wymagane:

- konfiguracja aplikacji providera;

- poprawne sekrety;

- poprawne redirect URI;

- poprawne uprawnienia;

- konfiguracja kolejek lub callbacków, jeśli wymagane;

- test konfiguracji;

- zgodność z wymaganiami bezpieczeństwa.

### Gate 4 — Runtime Connectable

Użytkownik lub proces może rozpocząć rzeczywisty connect.

Wymagane:

- spełnione Gate 2 i Gate 3;

- zatwierdzony zakres autoryzacji;

- obsługa błędów connect;

- obsługa odrzucenia zgody;

- obsługa wygasłej sesji;

- mechanizm zapisu connection;

- audyt zdarzenia connect.

### Gate 5 — Connection Verified

Zweryfikowano rzeczywiste połączenie.

Wymagane:

- poprawne uwierzytelnienie;

- potwierdzenie konta zewnętrznego;

- potwierdzenie zakresu uprawnień;

- test odświeżenia tokenu, jeśli dotyczy;

- test reconnect;

- obsługa invalid credentials;

- audyt wyniku.

### Gate 6 — Data Verified

Zweryfikowano pobieranie i normalizację danych.

Wymagane:

- pobranie danych z rzeczywistego albo zaakceptowanego testowego źródła;

- poprawna identyfikacja rekordów;

- podstawowa walidacja schematu;

- normalizacja typów;

- obsługa paginacji;

- obsługa limitów API;

- obsługa zakresu czasu;

- podstawowy test kompletności.

Gate 6 nie oznacza, że KPI są gotowe.

### Gate 7 — Data Integrity Verified

Zweryfikowano integralność danych.

Wymagane:

- lineage;

- identyfikatory kanoniczne;

- ocena source overlap;

- source authority, jeśli wymagane;

- canonicalization;

- deduplikacja, jeśli wymagana;

- kontrola konfliktów;

- brak niekontrolowanego podwójnego wkładu do KPI;

- test reprocessingu zależnego zakresu.

Gate 7 jest wymagana przed pionem omnichannel.

### Gate 8 — KPI Verified

Zweryfikowano co najmniej jeden KPI zasilany danymi z integracji.

Wymagane:

- zatwierdzony kontrakt KPI;

- gotowy dataset;

- określony zakres czasu;

- określona waluta;

- określony status mapping;

- lineage KPI;

- jawne ograniczenia;

- test braku podwójnego liczenia;

- wynik możliwy do interpretacji biznesowej.

### Gate 9 — Operationally Ready

Integracja jest gotowa do utrzymywania operacyjnego w danym zakresie.

Wymagane:

- monitoring;

- alerty;

- retry;

- recovery;

- runbook;

- obsługa błędów providera;

- procedura reconnect;

- procedura manual intervention;

- znany zakres Supportu;

- mierzenie kosztu obsługi;

- właściciel operacyjny;

- kryteria eskalacji.

### Gate 10 — Production Verified

Integracja została zweryfikowana z rzeczywistym klientem w określonym zakresie.

Wymagane:

- rzeczywiste dane klienta;

- spełnione wymagania bezpieczeństwa;

- spełnione wymagania prywatności;

- test procesu end-to-end;

- co najmniej jeden użyteczny wynik biznesowy;

- dowód monitoringu;

- dowód recovery albo runbooku;

- raport z pilotażu lub wdrożenia;

- akceptacja właściciela.

## 7. Zasady dopuszczenia integracji

### 7.1. Dopuszczenie do katalogu

Wymagane: Gate 0.

Provider może być widoczny jako planowany albo katalogowy, ale nie może być przedstawiany jako gotowy do połączenia.

### 7.2. Dopuszczenie do prac produktowych

Wymagane: Gate 1.

Provider może być planowany w backlogu, analizowany i opisany jako część przyszłego zakresu.

### 7.3. Dopuszczenie do connect

Wymagane co najmniej:

- Gate 2;

- Gate 3;

- Gate 4;

- podstawowa kontrola bezpieczeństwa;

- zatwierdzony zakres danych.

### 7.4. Dopuszczenie do pilotażu danych

Wymagane co najmniej:

- Gate 5;

- Gate 6;

- wymagania bezpieczeństwa przypisane do danych klienta;

- podstawa przetwarzania danych;

- określony zakres danych.

### 7.5. Dopuszczenie do KPI

Wymagane:

- Gate 6;

- Gate 7, jeżeli istnieje source overlap;

- zatwierdzony kontrakt KPI z Dokumentu 3;

- spełnione kryteria jakości i readiness.

### 7.6. Dopuszczenie do płatnego pilotażu

Wymagane:

- integracja spełnia bramy wymagane dla danego pionu;

- istnieje co najmniej jeden gotowy dataset;

- istnieje co najmniej jeden gotowy KPI;

- znane są ograniczenia;

- istnieje runbook minimalny;

- istnieje plan Supportu;

- spełnione są wymagania Dokumentu 5 i Dokumentu 7.

### 7.7. Dopuszczenie do produkcyjnej sprzedaży

Wymagane:

- Gate 9;

- Gate 10;

- spełnienie kontroli bezpieczeństwa i prywatności;

- powtarzalny onboarding;

- monitoring;

- recovery;

- pomiar kosztu;

- zatwierdzony model wsparcia.

### 7.8. Dopuszczenie do skalowania

Wymagane:

- powtarzalny proces integracyjny;

- Cost Observability;

- znane koszty onboardingu;

- znane koszty utrzymania providera;

- ograniczona liczba manualnych interwencji;

- stabilne runbooki;

- potwierdzona marża albo decyzja o kontrolowanym ryzyku.

## 8. Rekord integracji

Każda integracja musi posiadać rekord o następującej strukturze:

Tabela:
- Wiersz 1: Pole; Znaczenie
- Wiersz 2: providerId; stabilny identyfikator providera
- Wiersz 3: providerName; nazwa providera
- Wiersz 4: category; kategoria źródła
- Wiersz 5: vertical; powiązany pion wartości
- Wiersz 6: businessPurpose; cel biznesowy integracji
- Wiersz 7: dataScope; zakres danych
- Wiersz 8: sensitiveData; czy integracja obejmuje dane wrażliwe lub podwyższonego ryzyka
- Wiersz 9: catalogStatus; status katalogowy
- Wiersz 10: implementationStatus; status implementacji
- Wiersz 11: environmentStatus; status środowiska
- Wiersz 12: runtimeAvailability; dostępność runtime
- Wiersz 13: verificationStatus; status weryfikacji
- Wiersz 14: requiredGatesForPilot; bramy wymagane do pilotażu
- Wiersz 15: requiredGatesForProduction; bramy wymagane do produkcji
- Wiersz 16: sourceOverlapRisk; ryzyko nakładania źródeł
- Wiersz 17: dataOwner; właściciel danych
- Wiersz 18: integrationOwner; właściciel integracji
- Wiersz 19: operationalOwner; właściciel operacyjny
- Wiersz 20: securityOwner; właściciel bezpieczeństwa
- Wiersz 21: dependencies; zależności
- Wiersz 22: knownLimitations; znane ograniczenia
- Wiersz 23: evidence; dowody
- Wiersz 24: lastReviewDate; data ostatniej oceny
- Wiersz 25: nextReviewTrigger; warunek ponownej oceny

Na obecnym etapie właścicielem każdego z powyższych obszarów jest Artur Wiśniewski.

## 9. Katalog strategicznych providerów

### 9.1. WooCommerce

Kategoria: D2C commerce
Pion: D2C
Cel biznesowy: pobieranie danych sprzedażowych sklepu własnego.

Zakres danych docelowych:

- zamówienia;

- pozycje zamówień;

- statusy;

- produkty;

- warianty;

- klienci w zakresie niezbędnym do analityki;

- refundy;

- kupony i rabaty;

- podatki;

- dostawy.

Minimalny warunek wartości:

- orders dataset;

- liczba zamówień;

- Gross Revenue;

- jawny status refundów;

- gotowość danych.

Ryzyka:

- różne konfiguracje sklepów;

- wtyczki modyfikujące statusy;

- niestandardowe pola;

- różne waluty;

- opóźnienia lub błędy API;

- niespójne dane historyczne.

### 9.2. Shopify

Kategoria: D2C commerce
Pion: D2C
Cel biznesowy: pobieranie danych sprzedażowych sklepu własnego.

Zakres danych docelowych:

- zamówienia;

- pozycje zamówień;

- produkty;

- warianty;

- refundy;

- zwroty;

- płatności;

- rabaty;

- podatki;

- koszty dostawy.

Minimalny warunek wartości:

- orders dataset;

- Gross Revenue;

- podstawowa obsługa refundów;

- gotowość KPI.

Status biznesowy:

Shopify jest integracją MVP i musi przejść pełne bramy gotowości przed udostępnieniem. Jego awaria lub opóźnienie nie obniża statusu WooCommerce ani funkcji niezależnych.

Odwołanie: DEC-PRD-004.

### 9.3. BaseLinker

Kategoria: OMS / system pośredniczący
Pion: marketplace / omnichannel
Cel biznesowy: pobieranie danych sprzedażowych i kanałowych z systemu pośredniczącego.

Zakres danych docelowych:

- zamówienia;

- kanał sprzedaży;

- statusy;

- produkty;

- warianty;

- oferty;

- dane marketplace, jeżeli dostępne;

- refundy i zwroty, jeżeli dostępne;

- identyfikatory zewnętrzne;

- dane potrzebne do wykrycia overlap.

Minimalny warunek wartości:

- identyfikacja kanału;

- orders dataset;

- Gross Revenue;

- jawne ograniczenia dotyczące opłat i marży;

- source lineage.

Ryzyka:

- BaseLinker może zawierać dane pochodzące z wielu kanałów;

- kanał Allegro musi być jednoznaczny;

- dane mogą nakładać się z integracją direct;

- część informacji marketplace może być niepełna.

### 9.4. Allegro

Kategoria: marketplace
Pion: marketplace
Cel biznesowy: pobieranie danych sprzedaży marketplace bezpośrednio z Allegro.

Zakres danych docelowych:

- zamówienia;

- pozycje zamówień;

- oferty;

- statusy;

- refundy;

- zwroty;

- opłaty, jeśli dostępne;

- identyfikatory transakcyjne;

- dane potrzebne do source authority.

Minimalny warunek wartości:

- identyfikacja sprzedaży Allegro;

- orders dataset;

- Gross Revenue;

- jawna gotowość opłat;

- ograniczenia marży, jeśli opłat brakuje.

Status biznesowy:

Allegro jest integracją MVP i przechodzi własne bramy. BaseLinker pozostaje niezależną integracją MVP; nakładanie danych jest obsługiwane przez source authority, lineage i deduplikację.

Odwołanie: DEC-PRD-004.

### 9.5. Google Ads

Kategoria: reklama
Pion: marketing i analityka
Cel biznesowy: pobieranie kosztów, kampanii i wartości atrybucyjnych.

Zakres danych docelowych:

- kampanie;

- grupy reklam;

- reklamy;

- koszt;

- kliknięcia;

- wyświetlenia;

- konwersje;

- wartość konwersji;

- waluta;

- zakres czasu.

Zasada:

Dane Google Ads nie zastępują przychodu transakcyjnego.

Odwołanie: DEC-DAT-008.

### 9.6. Meta Ads

Kategoria: reklama
Pion: marketing i analityka
Cel biznesowy: pobieranie kosztów, kampanii i wartości atrybucyjnych.

Zakres danych docelowych:

- kampanie;

- zestawy reklam;

- reklamy;

- koszt;

- kliknięcia;

- wyświetlenia;

- konwersje;

- wartość konwersji;

- waluta;

- zakres czasu.

Zasada:

Dane Meta Ads nie zastępują przychodu transakcyjnego.

Odwołanie: DEC-DAT-008.

### 9.7. Google Analytics 4

Kategoria: analityka
Pion: analityka
Cel biznesowy: pobieranie danych o zdarzeniach, sesjach i konwersjach analitycznych.

Zakres danych docelowych:

- zdarzenia;

- sesje;

- użytkownicy;

- źródła ruchu;

- konwersje;

- wartość konwersji;

- parametry kampanii;

- zakres czasu.

Zasada:

Dane GA4 mają charakter analityczny i atrybucyjny. Nie zastępują automatycznie przychodu transakcyjnego.

Odwołanie: DEC-DAT-008.

## 10. Source overlap w integracjach

### 10.1. Definicja operacyjna

Source overlap występuje wtedy, gdy dwa albo więcej źródeł może dostarczać dane o tym samym fakcie biznesowym.

Najważniejsze przypadki:

- Allegro direct + BaseLinker;

- Shopify direct + BaseLinker;

- WooCommerce direct + system pośredniczący;

- dane transakcyjne + dane analityczne;

- wiele connection tego samego providera obejmujących ten sam zakres.

### 10.2. Obowiązek oceny overlap

Każda integracja, która może nakładać się z inną, wymaga oceny:

- pary źródeł;

- typu obiektu;

- zakresu dat;

- identyfikatorów;

- pól wspólnych;

- potencjalnego podwójnego wkładu;

- wymaganej polityki source authority;

- wymaganej deduplikacji;

- wpływu na KPI.

### 10.3. Overlap jako brama

Nieoceniony albo nierozwiązany overlap blokuje:

- KPI, które mogłyby zostać zasilone wielokrotnie;

- pion omnichannel;

- łączenie danych z obu źródeł;

- deklarację pełnej gotowości danych wieloźródłowych.

Nie musi blokować:

- niezależnego użycia pojedynczego źródła;

- danych historycznych z jednego źródła;

- KPI, których overlap nie dotyczy.

### 10.4. Wymagane rozstrzygnięcie

Rozstrzygnięcie overlap wymaga:

- polityki source authority;

- reguły deduplikacji;

- testu false merge i false split, jeżeli dotyczy;

- jawnego lineage;

- opisu ograniczeń;

- reprocessingu zależnych KPI, jeżeli zmieniła się reguła.

## 11. Connect

### 11.1. Cel procesu connect

Connect umożliwia powiązanie workspace z kontem zewnętrznego providera.

Connect nie jest celem biznesowym samym w sobie. Jest warunkiem pozyskania danych, ale nie dowodem ich jakości ani gotowości.

### 11.2. Warunki wejścia

Proces connect może zostać uruchomiony, jeżeli:

- provider jest dopuszczony do runtime;

- zakres autoryzacji jest zatwierdzony;

- konfiguracja środowiska jest potwierdzona;

- użytkownik posiada właściwą capability;

- znany jest cel połączenia;

- znany jest pion wartości;

- wymagania bezpieczeństwa dla sekretów są spełnione.

### 11.3. Dane wejściowe

Proces może wymagać:

- identyfikatora providera;

- workspace;

- zakresu danych;

- zgody użytkownika;

- konta zewnętrznego;

- uprawnień API;

- zakresu historii;

- waluty;

- strefy czasowej;

- nazwy sklepu lub konta;

- informacji o kanale sprzedaży.

### 11.4. Możliwe wyniki

Proces connect może zakończyć się wynikiem:

- succeeded;

- cancelled;

- expired;

- rejected;

- permissionDenied;

- requiresAdministrator;

- providerUnavailable;

- configurationError;

- supportRequired;

- failed.

Zakończenie procesu nie oznacza jeszcze gotowości danych.

### 11.5. Wymagania audytowe

Należy rejestrować:

- kto rozpoczął connect;

- dla którego workspace;

- z jakim providerem;

- jaki zakres autoryzacji zaakceptowano;

- kiedy proces rozpoczęto;

- jaki był wynik;

- jaki błąd wystąpił;

- czy utworzono connection;

- czy connection wymaga dalszej weryfikacji.

## 12. Reconnect i reauthentication

### 12.1. Przyczyny

Reconnect albo reauthentication mogą być wymagane, gdy:

- token wygasł;

- użytkownik cofnął zgodę;

- zakres uprawnień jest niewystarczający;

- provider zmienił wymagania;

- zmieniła się aplikacja OAuth;

- wykryto błąd bezpieczeństwa;

- konto zewnętrzne jest niedostępne;

- connection została ręcznie rozłączona.

### 12.2. Zasady

Reconnect:

- nie może usuwać historii bez jawnej decyzji;

- nie może tworzyć duplikatu connection bez kontroli;

- musi zachować lineage;

- musi wskazywać wpływ na synchronizację;

- musi wskazywać wpływ na świeżość danych;

- musi posiadać audyt.

### 12.3. Wpływ na dane

W czasie problemu z reconnect:

- dane historyczne mogą pozostać dostępne;

- nowe dane mogą być stale;

- część KPI może być stale;

- operacja reconnect może wymagać administratora;

- użytkownik bez odpowiedniej capability może widzieć dane, ale nie naprawiać connection.

## 13. Synchronizacja

### 13.1. Typy synchronizacji

PapaData powinna rozróżniać:

- initial sync;

- initial backfill;

- incremental sync;

- manual sync;

- scheduled sync;

- retry sync;

- recovery sync;

- reconciliation sync;

- reprocessing sync.

### 13.2. Initial sync

Initial sync potwierdza zdolność pobrania danych z providera.

Nie oznacza jeszcze:

- kompletności historii;

- gotowości datasetu;

- gotowości KPI;

- braku overlap;

- braku duplikatów.

### 13.3. Initial backfill

Initial backfill pobiera dane historyczne w określonym zakresie.

Wymaga:

- określonego okresu;

- określonego zakresu danych;

- limitów obciążenia;

- obsługi paginacji;

- obsługi rate limit;

- monitoringu postępu;

- możliwości wznowienia;

- informacji o brakach.

### 13.4. Incremental sync

Incremental sync pobiera zmiany po ostatniej poprawnej synchronizacji.

Wymaga:

- bezpiecznego punktu wznowienia;

- obsługi opóźnionych zdarzeń;

- obsługi korekt;

- obsługi usunięć, jeśli provider je zgłasza;

- kontroli kompletności.

### 13.5. Retry

Retry może być wykonane, gdy błąd jest uznany za przejściowy.

Retry wymaga:

- klasyfikacji błędu;

- limitu prób;

- odstępu między próbami;

- warunku przerwania;

- rejestracji kosztu;

- eskalacji po przekroczeniu limitu.

### 13.6. Synchronizacja a koszty

Każda synchronizacja może generować koszt:

- API;

- kolejek;

- przetwarzania;

- storage;

- normalizacji;

- deduplikacji;

- reprocessingu;

- Supportu.

Koszt musi być możliwy do pomiaru zgodnie z decyzją DEC-COM-002 i wymaganiami Dokumentu 6.

## 14. Webhooki i zdarzenia asynchroniczne

### 14.1. Zasady

Jeżeli provider wykorzystuje webhooki albo zdarzenia asynchroniczne, integracja musi uwzględniać:

- weryfikację źródła zdarzenia;

- podpis lub secret, jeśli dostępny;

- idempotencję;

- ponowienie;

- kolejność zdarzeń;

- duplikaty zdarzeń;

- opóźnione zdarzenia;

- utracone zdarzenia;

- replay;

- audyt.

### 14.2. Webhook nie zastępuje rekoncyliacji

Webhook może informować o zmianie, ale nie jest samodzielnym dowodem kompletności danych.

Integracja powinna posiadać mechanizm wykrycia brakujących zdarzeń albo okresowej rekoncyliacji.

### 14.3. Utrata webhooka

Utrata webhooka może skutkować:

- stale dataset;

- delayed sync;

- partial KPI;

- koniecznością recovery sync;

- koniecznością rekoncyliacji.

## 15. Normalizacja i przekazanie danych do kontraktu danych

### 15.1. Odpowiedzialność integracji

Warstwa integracji odpowiada za:

- pobranie danych;

- zachowanie metadanych źródła;

- podstawową walidację techniczną;

- normalizację techniczną;

- przekazanie danych do kontraktu danych;

- raportowanie błędów pobrania;

- raportowanie braków;

- zachowanie lineage technicznego.

### 15.2. Czego integracja nie rozstrzyga samodzielnie

Integracja nie powinna samodzielnie rozstrzygać:

- pełnego znaczenia biznesowego KPI;

- source authority;

- deduplikacji między źródłami;

- gotowości KPI;

- polityki marżowej;

- przydatności wyniku dla decyzji;

- prawa użytkownika do interpretacji danych.

Te obszary należą do Dokumentu 3 i Dokumentu 7.

### 15.3. Przekazanie do warstw danych

Każdy rekord przekazany do dalszego przetwarzania powinien posiadać:

- tenantId;

- workspaceId;

- providerId;

- connectionId;

- externalId;

- czas pobrania;

- zakres danych;

- wersję kontraktu providera;

- status pobrania;

- informację o błędach;

- źródłowy payload albo jego kontrolowany odpowiednik zgodny z retencją.

## 16. Monitoring integracji

### 16.1. Minimalny zakres monitoringu

Każda integracja dopuszczona do pilotażu powinna monitorować:

- status connection;

- wynik ostatniej synchronizacji;

- czas ostatniego sukcesu;

- czas ostatniego błędu;

- liczbę błędów;

- liczbę retry;

- opóźnienie;

- wolumen pobranych rekordów;

- wolumen odrzuconych rekordów;

- błędy schematu;

- rate limit;

- problemy autoryzacji;

- stale data;

- koszt przetwarzania.

### 16.2. Monitoring biznesowy

Monitoring techniczny musi być uzupełniony monitoringiem biznesowym:

- czy pobrano oczekiwane typy danych;

- czy dane obejmują właściwy okres;

- czy wolumen nie jest nietypowo niski;

- czy wolumen nie jest nietypowo wysoki;

- czy KPI zależne utrzymały readiness;

- czy source overlap nie zmienił statusu;

- czy pojawiły się konflikty.

### 16.3. Alerty

Alert powinien wskazywać:

- provider;

- tenant;

- workspace;

- connection;

- zakres;

- typ problemu;

- wpływ na dane;

- wpływ na KPI;

- pilność;

- właściciela działania;

- sugerowany next action.

Alert bez wpływu biznesowego jest mniej użyteczny niż alert powiązany z datasetem i KPI.

## 17. Klasyfikacja błędów integracyjnych

### 17.1. Błędy autoryzacji

Przykłady:

- expired token;

- revoked access;

- insufficient scope;

- invalid credentials;

- administrator required.

Wpływ:

- nowe dane mogą być stale;

- reconnect może być wymagany;

- dane historyczne mogą pozostać dostępne.

### 17.2. Błędy konfiguracji

Przykłady:

- błędny redirect URI;

- brak secretu;

- błędny client ID;

- niepoprawna konfiguracja webhooka;

- niepoprawne uprawnienia.

Wpływ:

- connect albo sync może być zablokowany;

- problem zwykle wymaga działania właściciela technicznego.

### 17.3. Błędy providera

Przykłady:

- provider unavailable;

- rate limit;

- timeout;

- błąd API;

- zmiana schematu;

- częściowa niedostępność endpointu.

Wpływ:

- retry;

- degraded mode;

- delayed sync;

- recovery sync.

### 17.4. Błędy danych

Przykłady:

- schema mismatch;

- missing required field;

- invalid date;

- invalid currency;

- unknown status;

- duplicate externalId;

- inconsistent totals.

Wpływ:

- partial dataset;

- manual review;

- reprocessing;

- blokada KPI.

### 17.5. Błędy integralności

Przykłady:

- unresolved overlap;

- conflict source authority;

- duplicate risk;

- false merge;

- false split;

- missing lineage.

Wpływ:

- blokada KPI;

- blokada omnichannel;

- konieczność decyzji danych.

### 17.6. Błędy bezpieczeństwa

Przykłady:

- podejrzenie naruszenia izolacji tenantów;

- sekret w logach;

- nieautoryzowany dostęp;

- nieprawidłowy zakres danych;

- niezgodność uprawnień.

Wpływ:

- natychmiastowa blokada zakresu;

- eskalacja zgodnie z Dokumentem 7;

- audyt;

- potencjalny incident response.

## 18. Recovery

### 18.1. Zasady recovery

Recovery ma przywrócić poprawny stan procesu bez utraty lineage i bez niejawnej zmiany znaczenia danych.

Recovery nie może:

- ukrywać błędu;

- usuwać danych audytowych;

- podwójnie naliczać rekordów;

- omijać source authority;

- pomijać deduplikacji;

- przywracać danych usuniętych zgodnie z procedurą;

- naruszać izolacji tenantów.

### 18.2. Typy recovery

- retry automatyczny;

- retry ręczny;

- reconnect;

- recovery sync;

- backfill uzupełniający;

- reprocessing;

- korekta mappingu;

- korekta source authority;

- korekta deduplikacji;

- eskalacja do Supportu;

- eskalacja do właściciela danych;

- eskalacja bezpieczeństwa.

### 18.3. Recovery a gotowość

W czasie recovery dane mogą mieć status:

- partial;

- stale;

- blocked;

- invalid;

- recovering.

KPI zależne nie mogą być oznaczone jako ready, jeżeli recovery dotyczy danych krytycznych dla ich wyniku.

### 18.4. Dowód recovery

Po recovery wymagany jest dowód:

- co było problemem;

- jaki zakres był dotknięty;

- jakie działanie wykonano;

- czy dane zostały uzupełnione;

- czy wystąpił reprocessing;

- które KPI się zmieniły;

- jaki był koszt;

- czy problem wymaga zmiany kontraktu.

## 19. Runbooki

### 19.1. Cel runbooka

Runbook określa, jak rozpoznać, obsłużyć i zamknąć określony typ problemu integracyjnego.

### 19.2. Minimalna struktura runbooka

Każdy runbook powinien zawierać:

- identyfikator;

- provider albo typ problemu;

- objawy;

- wpływ biznesowy;

- wpływ na dane;

- wpływ na KPI;

- warunki eskalacji;

- kroki diagnostyczne;

- kroki naprawcze;

- kryteria zakończenia;

- wymagane logi;

- wymagane dowody;

- właściciela;

- limit czasu;

- powiązane decyzje i wymagania.

### 19.3. Runbooki wymagane przed pilotażem

Przed płatnym pilotażem wymagane są co najmniej runbooki dla:

- utraty autoryzacji;

- błędu synchronizacji;

- stale data;

- błędu schematu;

- rate limit;

- braku danych;

- częściowego backfill;

- konfliktu danych;

- błędu deduplikacji, jeżeli dotyczy;

- problemu bezpieczeństwa.

### 19.4. Runbooki wymagane przed skalowaniem

Przed skalowaniem wymagane są dodatkowo runbooki dla:

- masowej awarii providera;

- utraty webhooków;

- dużego reprocessingu;

- degradacji wydajności;

- wzrostu manual review;

- błędnej wersji mappingu;

- zmiany API providera;

- incydentu wpływającego na wielu klientów.

## 20. Support i Operations

### 20.1. Zakres odpowiedzialności Supportu

Support powinien móc:

- rozpoznać problem integracyjny;

- ustalić dotknięty workspace;

- ustalić providera i connection;

- sprawdzić ostatni status synchronizacji;

- rozpoznać wpływ na dataset i KPI;

- wskazać następne działanie;

- uruchomić procedurę eskalacji;

- przekazać użytkownikowi znane ograniczenia.

Support nie powinien samodzielnie:

- zmieniać source authority;

- zmieniać formuły KPI;

- łączyć danych między tenantami;

- wykonywać działań poza uprawnieniami;

- ukrywać ograniczeń danych;

- usuwać danych bez procedury.

### 20.2. Zakres odpowiedzialności Operations

Operations odpowiada docelowo za:

- monitoring;

- alerting;

- retry policy;

- recovery;

- runbooki;

- eskalacje;

- pomiar kosztu;

- stabilność procesów;

- gotowość produkcyjną;

- raportowanie problemów.

Na obecnym etapie właścicielem operacyjnym jest Artur Wiśniewski.

### 20.3. Pomiar pracy operacyjnej

Należy mierzyć:

- liczbę zgłoszeń;

- czas diagnozy;

- czas naprawy;

- liczbę manualnych interwencji;

- liczbę retry;

- liczbę recovery sync;

- liczbę reprocessingów;

- koszt Supportu;

- koszt manual review;

- przyczynę problemu;

- provider;

- pion;

- wpływ na KPI.

Zasada wynika z decyzji DEC-OPS-002.

## 21. Ciężkie workloady

### 21.1. Zakres

Ciężkie workloady obejmują:

- initial backfill;

- duży reprocessing;

- deduplikację dużego wolumenu;

- fuzzy matching;

- rekoncyliację historyczną;

- agregacje historyczne;

- przeliczenie KPI po zmianie definicji;

- eksporty dużych danych.

### 21.2. Zasady kontroli

Ciężkie workloady muszą posiadać:

- limit zasobów;

- kolejkę;

- priorytet;

- możliwość pauzy;

- możliwość wznowienia;

- monitoring postępu;

- koszt;

- wpływ na inne procesy;

- warunki przerwania;

- warunki eskalacji.

Zasada wynika z decyzji DEC-OPS-001.

### 21.3. Wpływ na klienta

Ciężki workload nie powinien niekontrolowanie wpływać na:

- logowanie;

- odczyt danych historycznych;

- podstawowe KPI;

- procesy bezpieczeństwa;

- procesy billingowe;

- procesy Supportu.

## 22. Gotowość operacyjna providera

Provider jest gotowy operacyjnie w określonym zakresie, jeżeli:

1. connect został zweryfikowany;

1. sync został zweryfikowany;

1. backfill został zweryfikowany, jeśli jest wymagany;

1. normalizacja została zweryfikowana;

1. lineage jest zachowane;

1. błędy są klasyfikowane;

1. retry posiada limity;

1. recovery posiada runbook;

1. monitoring jest zdefiniowany;

1. alerty posiadają właściciela;

1. Support zna zakres odpowiedzialności;

1. znany jest wpływ na KPI;

1. znane są ograniczenia;

1. koszt obsługi jest mierzony;

1. wymagania bezpieczeństwa są spełnione.

Gotowość operacyjna dotyczy konkretnego zakresu, a nie całego providera abstrakcyjnie.

## 23. Gotowość integracji do pionu D2C

Minimalna gotowość D2C wymaga:

- jednego kwalifikującego się źródła sprzedażowego;

- zweryfikowanego connection;

- pobrania rzeczywistych danych;

- normalizacji zamówień;

- status mapping;

- gotowego orders dataset;

- gotowego KPI Order Count;

- gotowego KPI Gross Revenue;

- jawnej obsługi refundów albo jawnego ograniczenia;

- monitoringu sync;

- podstawowego runbooka;

- spełnienia wymagań bezpieczeństwa dla danych klienta.

Shopify jest wymagany dla wydania katalogu MVP, lecz nie blokuje niezależnego działania WooCommerce podczas degradacji lub wdrażania etapowego.

## 24. Gotowość integracji do pionu marketplace

Minimalna gotowość marketplace wymaga:

- jednoznacznego kanału marketplace;

- zweryfikowanego źródła danych;

- pobrania rzeczywistych zamówień;

- normalizacji zamówień;

- status mapping;

- gotowego orders dataset;

- gotowego KPI Order Count;

- gotowego KPI Gross Revenue;

- jawnej obsługi anulowań, zwrotów i refundów;

- jawnej informacji o dostępności opłat;

- braku interpretacji braku opłat jako zera;

- oceny source overlap;

- monitoringu sync;

- podstawowego runbooka;

- spełnienia wymagań bezpieczeństwa dla danych klienta.

Allegro direct jest wymagane dla wydania katalogu MVP, lecz nie blokuje niezależnego działania BaseLinkera; konflikt danych wymaga source authority i reconciliation.

## 25. Gotowość integracji do omnichannel

Omnichannel wymaga wyższego poziomu gotowości niż pojedynczy pion.

Wymagane:

1. co najmniej dwa źródła sprzedażowe;

1. jawne source lineage;

1. ocena source overlap;

1. zatwierdzona source authority;

1. model kanonicznego zamówienia;

1. deduplikacja między źródłami;

1. pomiar false merge i false split;

1. kontrola konfliktów;

1. reprocessing po korekcie;

1. KPI wieloźródłowe z lineage;

1. monitoring kosztu deduplikacji;

1. manual review, jeśli wymagany;

1. runbook konfliktów;

1. runbook deduplikacji;

1. akceptacja właściciela.

Omnichannel nie powinien być używany jako pierwszy zakres pilotażowy.

## 26. Gotowość integracji marketingowych i analitycznych

### 26.1. Google Ads i Meta Ads

Gotowość wymaga:

- connection;

- pobrania kosztów;

- pobrania kampanii;

- waluty;

- zakresu czasu;

- źródła konta;

- normalizacji metryk;

- gotowości Advertising Spend;

- jawnego modelu konwersji;

- jawnego ograniczenia atrybucji.

### 26.2. GA4

Gotowość wymaga:

- connection;

- pobrania zdarzeń albo agregatów;

- zakresu czasu;

- właściwości GA4;

- metryk i wymiarów;

- informacji o modelu danych;

- jawnego ograniczenia interpretacji konwersji.

### 26.3. Rozdzielenie od commerce

Integracje marketingowe i analityczne nie mogą zastępować danych transakcyjnych.

ROAS oparty na wartości atrybucyjnej nie jest tym samym, co relacja rzeczywistego przychodu transakcyjnego do kosztu reklamy.

Odwołanie: DEC-DAT-008.

## 27. Wymagania bezpieczeństwa integracji

Dokument 4 określa wymagania operacyjne. Pełny kontrakt bezpieczeństwa znajduje się w Dokumencie 7.

Dla integracji obowiązują co najmniej następujące zasady bramowe:

- sekrety nie mogą trafiać do logów;

- tokeny nie mogą być zwracane po zapisaniu;

- scope musi być minimalny względem celu;

- dostęp do connect i reconnect wymaga capability;

- tenant musi być egzekwowany na każdym poziomie;

- dane z jednego tenantu nie mogą być używane do diagnostyki innego;

- Support nie może uzyskać dostępu poza kontrolowanym zakresem;

- incydent bezpieczeństwa blokuje odpowiedni zakres integracji.

Szczegółowe dowody i procedury należą do Dokumentu 7.

## 28. Retencja danych integracyjnych

Dane integracyjne powinny być przechowywane tylko w zakresie potrzebnym do:

- działania integracji;

- audytu;

- rozliczalności;

- diagnostyki;

- reprocessingu;

- spełnienia wymagań prawnych;

- obsługi klienta;

- odtworzenia poprawności KPI.

Retencja musi rozróżniać:

- sekrety;

- tokeny;

- payload źródłowy;

- dane znormalizowane;

- dane kanoniczne;

- logi;

- błędy;

- eksporty;

- backupy.

Szczegółowa polityka retencji należy do Dokumentu 7.

## 29. Cost Observability integracji

### 29.1. Zakres pomiaru

Integracje muszą umożliwiać pomiar kosztu:

- per provider;

- per connection;

- per workspace;

- per tenant;

- per dataset;

- per sync;

- per backfill;

- per retry;

- per reprocessing;

- per manual review;

- per Support case.

### 29.2. Minimalne metryki kosztowe

Należy mierzyć:

- liczbę wywołań API;

- czas przetwarzania;

- wolumen danych;

- liczbę rekordów;

- liczbę błędów;

- liczbę retry;

- czas obsługi ręcznej;

- wykorzystanie zasobów;

- koszt storage;

- koszt kolejek;

- koszt AI, jeżeli integracja zasila AI.

### 29.3. Znaczenie biznesowe

Brak Cost Observability nie blokuje kontrolowanego pilotażu, ale blokuje skalowanie.

Odwołanie: DEC-COM-002.

## 30. Kryteria wejścia do płatnego pilotażu

Integracja może zostać użyta w płatnym pilotażu, jeżeli:

1. posiada określony zakres biznesowy;

1. posiada określonego providera;

1. posiada określony pion;

1. spełnia wymagane bramy dla danego pionu;

1. connection może zostać zweryfikowane;

1. dane mogą zostać pobrane;

1. lineage jest zachowane;

1. dane mogą zostać znormalizowane;

1. co najmniej jeden dataset może osiągnąć readiness;

1. co najmniej jeden KPI może zostać zweryfikowany;

1. source overlap został oceniony, jeśli dotyczy;

1. ograniczenia są jawne;

1. istnieje minimalny monitoring;

1. istnieje minimalny runbook;

1. Support wie, co robić w razie problemu;

1. spełniono wymagania bezpieczeństwa i prywatności;

1. znany jest koszt obsługi pilotażu albo sposób jego pomiaru.

## 31. Kryteria wyjścia z pilotażu integracyjnego

Pilotaż integracyjny jest zakończony pozytywnie, jeżeli:

1. connection zostało ustanowione albo poprawnie odrzucone z jasnym powodem;

1. dane zostały pobrane w uzgodnionym zakresie;

1. normalizacja zakończyła się wynikiem możliwym do audytu;

1. brakujące dane zostały odróżnione od zera;

1. source overlap został oceniony;

1. KPI zależne zostały sklasyfikowane jako ready, partial, empty, stale albo blocked;

1. użytkownik otrzymał interpretowalny wynik;

1. błędy zostały zarejestrowane;

1. koszt obsługi został zmierzony;

1. manual review został zmierzony, jeśli wystąpił;

1. wymagania bezpieczeństwa nie zostały naruszone;

1. powstał raport wniosków i zmian wymaganych przed skalowaniem.

## 32. Ryzyka integracyjne

### 32.1. Ryzyko fałszywej gotowości

Integracja może być uznana za gotową na podstawie samego connect.

Reakcja: wielowymiarowy model statusów i bramy dowodowe.

### 32.2. Ryzyko podwójnego liczenia

Dane z providera direct i pośrednika mogą opisywać ten sam fakt.

Reakcja: source overlap, source authority, deduplikacja i kontrakt danych.

### 32.3. Ryzyko ukrytego kosztu

Integracja może wymagać dużej liczby ręcznych interwencji.

Reakcja: pomiar manual review, Supportu, retry i reprocessingu.

### 32.4. Ryzyko zależności od providera

Zmiana API, limitów albo dostępności providera może ograniczyć działanie produktu.

Reakcja: monitoring, retry, recovery, runbooki i lokalna degradacja.

### 32.5. Ryzyko danych niekompletnych

Provider może nie dostarczać wszystkich danych potrzebnych do KPI.

Reakcja: gotowość lokalna, jawne ograniczenia i brak interpretacji braku jako zera.

### 32.6. Ryzyko bezpieczeństwa

Błędna obsługa tokenów, sekretów albo tenantów może naruszyć dane klientów.

Reakcja: wymagania Dokumentu 7 jako brama dopuszczenia.

### 32.7. Ryzyko zbyt szerokiego katalogu

Rozwijanie zbyt wielu integracji jednocześnie może obniżyć jakość i opóźnić pilotaż.

Reakcja: etapowe uruchamianie kompletnych pionów wartości.

## 33. Traceability decyzji i wymagań

Tabela:
- Wiersz 1: Obszar; Decyzje; Wymagania
- Wiersz 2: Katalog integracji; DEC-INT-001; REQ-INT-001
- Wiersz 3: Wielowymiarowa gotowość; DEC-INT-002; REQ-INT-002, REQ-INT-003
- Wiersz 4: Etapowe uruchamianie; DEC-PRD-003; REQ-BUS-002, REQ-BUS-003
- Wiersz 5: Shopify i Allegro direct; DEC-PRD-004; REQ-PIL-001, REQ-INT-003
- Wiersz 6: Lokalna degradacja; DEC-INT-003; REQ-INT-005
- Wiersz 7: Ciężkie workloady; DEC-OPS-001; REQ-OPS-001
- Wiersz 8: Manual review; DEC-OPS-002; REQ-OPS-002
- Wiersz 9: Source overlap; DEC-DAT-004, DEC-DAT-005; REQ-DAT-007, REQ-DAT-009
- Wiersz 10: Deduplikacja tenant-safe; DEC-DAT-007; REQ-SEC-001
- Wiersz 11: Cost Observability; DEC-COM-002; REQ-COM-004, REQ-COM-005

## 34. Zdarzenia wymagające ponownej oceny integracji

Ponowna ocena integracji jest wymagana, gdy:

- provider zmienia API;

- provider zmienia model autoryzacji;

- zmienia się zakres uprawnień;

- zmienia się schemat danych;

- pojawia się nowy typ danych;

- pojawia się nowy przypadek source overlap;

- zmienia się source authority;

- zmienia się status mapping;

- zmienia się model KPI;

- zmienia się koszt API;

- rośnie liczba błędów;

- rośnie liczba manual review;

- zmienia się zakres pilotażu;

- integracja ma zostać dopuszczona do produkcji;

- integracja ma zostać skalowana;

- wystąpi incydent bezpieczeństwa;

- klient zgłosi istotną rozbieżność danych.

## 35. Kryteria jakości dokumentu integracyjnego

Dokument spełnia swoją funkcję, jeżeli:

1. integracja nie posiada jednego płaskiego statusu;

1. katalog nie jest mylony z gotowością;

1. connect nie jest mylony z danymi;

1. dane nie są mylone z KPI;

1. każdy provider posiada bramy;

1. każda brama wymaga dowodu;

1. integracje mogą być uruchamiane etapowo;

1. Shopify i Allegro direct nie blokują globalnie pierwszego pilotażu;

1. source overlap jest kontrolowany;

1. gotowość operacyjna obejmuje monitoring i recovery;

1. Support ma określony zakres działania;

1. ciężkie workloady są kontrolowane;

1. koszt integracji jest mierzony;

1. bezpieczeństwo stanowi bramę dopuszczenia danych klienta;

1. dokument nie sugeruje istniejącej implementacji.

## 36. Dokumenty powiązane

1. Dokument 1 — Dokumentacja biznesowo-produktowa PapaData
1. Określa cel, wartość, segmenty, MVP i etapowość produktu.

1. Dokument 2 — Rejestr decyzji i wymagań biznesowych
1. Określa obowiązujące decyzje, statusy i wymagania przekrojowe.

1. Dokument 3 — Kontrakt danych, stanów i KPI
1. Określa dane, lineage, source authority, deduplikację, stany i gotowość KPI.

1. Dokument 5 — Pierwszy pion produktowy i płatny pilotaż
1. Wykorzystuje integracje w konkretnych procesach onboardingu, danych i pilotażu.

1. Dokument 6 — Model komercyjny i unit economics
1. Wykorzystuje koszty integracji, Supportu, reprocessingu i manual review.

1. Dokument 7 — Bezpieczeństwo, prywatność i AI Governance
1. Określa wymagania bezpieczeństwa, sekretów, tenant isolation, retencji i incydentów.

## 37. Zatwierdzenie dokumentu

Dokument ustanawia obowiązujący model integracji i gotowości operacyjnej PapaData.

Właściciel i osoba zatwierdzająca: Artur Wiśniewski
Data obowiązywania: 18 lipca 2026 roku
Wersja: 2.0

Dokument nie stanowi dowodu implementacji żadnej integracji. Każde podniesienie statusu providera wymaga dowodu przypisanego do właściwej bramy gotowości.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
