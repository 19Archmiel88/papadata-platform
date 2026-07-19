# PapaData — bezpieczeństwo, prywatność i AI Governance

## Metryka dokumentu

Dokument: Bezpieczeństwo, prywatność i AI Governance PapaData
Numer dokumentu: 7
Wersja: 2.0
Status: Finalny dokument kontrolny
Data obowiązywania: 18 lipca 2026 roku
Właściciel dokumentu: Artur Wiśniewski
Właściciel produktu: Artur Wiśniewski
Właściciel bezpieczeństwa: Artur Wiśniewski
Właściciel prywatności: Artur Wiśniewski
Właściciel AI Governance: Artur Wiśniewski
Właściciel ciągłości działania: Artur Wiśniewski
Właściciel incydentów: Artur Wiśniewski
Model odpowiedzialności: jednoosobowe governance przejściowe
Charakter projektu: projekt tworzony od podstaw

Zakres dokumentu:

- governance bezpieczeństwa i prywatności;

- niezależna weryfikacja specjalistyczna;

- klasyfikacja informacji i danych;

- zarządzanie tożsamością i dostępem;

- konta uprzywilejowane i MFA;

- izolacja tenantów;

- bezpieczeństwo integracji i sekretów;

- bezpieczeństwo danych;

- minimalizacja danych;

- zasady przetwarzania danych osobowych;

- retencja;

- eksport;

- usuwanie danych;

- backup i restore;

- ciągłość działania;

- zarządzanie incydentami;

- monitoring i audyt;

- zarządzanie dostawcami i podprocesorami;

- AI Governance;

- tenant-safe retrieval;

- human oversight;

- bramy dopuszczenia danych klientów;

- kryteria akceptacji bezpieczeństwa.

Poza zakresem:

- wybór konkretnych technologii;

- konfiguracja infrastruktury;

- szczegółowa architektura sieci;

- kod mechanizmów bezpieczeństwa;

- instrukcje administracyjne konkretnych dostawców;

- ostateczna interpretacja prawna;

- porada prawna lub podatkowa;

- projekt interfejsu;

- finalne komunikaty dla użytkowników;

- formalny certyfikat zgodności;

- gwarantowane SLA przed przeprowadzeniem odpowiednich testów.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Papa Asystent, Laboratorium AI oraz AI Actions należą do MVP. AI korzysta wyłącznie z danych dopuszczonych przez readiness i uprawnienia, zwraca evidence, ograniczenia i poziom pewności oraz potrafi odmówić. Działania istotne wymagają zatwierdzenia człowieka, ponownej walidacji targetu i danych, idempotencji, audytu oraz mechanizmu anulowania lub kompensacji, gdy jest to technicznie możliwe. Niedopuszczalne jest niekontrolowane autonomiczne wykonanie o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

## 1. Cel dokumentu

Dokument określa minimalne warunki bezpieczeństwa, prywatności, ciągłości działania i kontroli AI, które PapaData musi spełnić przed:

- przetwarzaniem rzeczywistych danych klientów;

- uruchomieniem płatnego pilotażu;

- dopuszczeniem zewnętrznych użytkowników;

- aktywacją produkcyjnych integracji;

- uruchomieniem rekomendacji AI na danych klientów;

- udostępnieniem pionu omnichannel;

- rozpoczęciem sprzedaży abonamentowej;

- przyjęciem zobowiązań SLA;

- skalowaniem liczby klientów;

- uruchomieniem self-service;

- uruchomieniem kanału partnerskiego.

Dokument ma ograniczać w szczególności ryzyka:

- dostępu między tenantami;

- przejęcia konta;

- nadmiernych uprawnień;

- wycieku tokenów i sekretów;

- błędnego przypisania danych do klienta;

- nieuprawnionego użycia danych;

- utraty danych;

- nieskutecznego usunięcia danych;

- przywrócenia wcześniej usuniętych danych;

- niekontrolowanego dostępu administracyjnego;

- utraty webhooków i zdarzeń;

- braku możliwości odtworzenia;

- niekontrolowanego wykorzystania danych przez AI;

- ujawnienia danych przez kontekst AI;

- wykonywania przez AI działań bez kontroli człowieka;

- braku przygotowania na incydent;

- niekontrolowanej zależności od dostawców.

Dokument opisuje wymagany stan docelowy. Nie potwierdza istnienia żadnego mechanizmu bezpieczeństwa, procedury, backupu, systemu audytowego ani funkcji AI.

Odwołanie: DEC-DOC-001.

## 2. Pozycja dokumentu w pakiecie

Dokument 7 jest źródłem prawdy dla:

- zasad bezpieczeństwa;

- zasad prywatności;

- kontroli dostępu;

- tenant isolation;

- zarządzania sekretami;

- klasyfikacji danych;

- retencji i usuwania;

- backupu i restore;

- incydentów;

- dostawców i podprocesorów;

- AI Governance;

- bram dopuszczenia danych produkcyjnych;

- wymagań niezależnej weryfikacji specjalistycznej.

Dokument 7 nie jest źródłem prawdy dla:

- statusu decyzji — źródłem jest Dokument 2;

- definicji danych i KPI — źródłem jest Dokument 3;

- statusu integracji — źródłem jest Dokument 4;

- przebiegu pilotażu — źródłem jest Dokument 5;

- cen, limitów handlowych i marży — źródłem jest Dokument 6.

Najważniejsze decyzje powiązane:

- DEC-GOV-002 — niezależna weryfikacja specjalistyczna;

- DEC-DAT-007 — deduplikacja ograniczona do tenantu;

- DEC-SEC-001 — wielowarstwowa izolacja tenantów;

- DEC-SEC-002 — MFA dla kont uprzywilejowanych;

- DEC-SEC-003 — backup wymaga rzeczywistego restore;

- DEC-SEC-004 — restore respektuje usunięcie danych;

- DEC-SEC-005 — pseudonimizacja nie jest anonimizacją;

- DEC-SEC-006 — procedura usunięcia przed pilotażem;

- DEC-SEC-007 — RTO i RPO jako parametry warunkowe;

- DEC-AI-001 — AI nie jest źródłem prawdy;

- DEC-AI-002 — tenant-safe retrieval;

- DEC-AI-003 — kontrola człowieka nad działaniami istotnymi.

## 3. Rozdzielenie obszarów odpowiedzialności

PapaData rozdziela pięć powiązanych, ale nierównoważnych obszarów:

1. bezpieczeństwo systemu;

1. prywatność i ochrona danych;

1. zgodność prawna;

1. bezpieczeństwo i governance AI;

1. ciągłość działania i gotowość operacyjna.

Spełnienie wymagań jednego obszaru nie oznacza automatycznie spełnienia pozostałych.

Przykłady:

- szyfrowanie danych nie przesądza o legalności ich przetwarzania;

- podpisana umowa nie potwierdza skuteczności izolacji tenantów;

- działający backup nie potwierdza możliwości restore;

- poprawny wynik AI nie potwierdza bezpieczeństwa kontekstu;

- zgodność techniczna nie zastępuje niezależnej interpretacji prawnej;

- brak incydentu nie jest dowodem skuteczności kontroli.

## 4. Governance i odpowiedzialność

### 4.1. Model przejściowy

Artur Wiśniewski pełni obecnie role:

- Product Ownera;

- Security Ownera;

- Privacy Ownera;

- Data Ownera;

- AI Governance Ownera;

- Incident Ownera;

- Business Continuity Ownera;

- właściciela decyzji.

Model jest świadomym rozwiązaniem przejściowym wynikającym z jednoosobowego charakteru projektu.

### 4.2. Ograniczenie samooceny

Artur Wiśniewski może:

- ustanawiać wymagania;

- przygotowywać kontrole;

- wykonywać testy wewnętrzne;

- podejmować decyzje o zakresie projektu.

Nie powinien być jedynym podmiotem zatwierdzającym obszary wymagające niezależnej wiedzy specjalistycznej.

### 4.3. Obowiązkowa niezależna weryfikacja

Niezależna weryfikacja jest wymagana przed odpowiednią bramą co najmniej dla:

- podstawy i modelu przetwarzania danych osobowych;

- dokumentów umownych i DPA;

- obowiązków informacyjnych;

- retencji i usuwania danych;

- transferów danych i dostawców;

- modelu tenant isolation;

- bezpieczeństwa dostępu produkcyjnego;

- testów penetracyjnych;

- używania AI na danych klientów;

- backupu i restore przed zobowiązaniami umownymi;

- RTO, RPO i SLA;

- obowiązków związanych z incydentami;

- sprzedaży, fakturowania i podatków.

Odwołanie: DEC-GOV-002.

### 4.4. Forma dowodu niezależnej weryfikacji

Dowodem może być:

- pisemna opinia;

- raport audytowy;

- raport testu penetracyjnego;

- zatwierdzony dokument prawny;

- raport testu restore;

- podpisany protokół;

- wpis w rejestrze ryzyk;

- formalna decyzja dopuszczająca.

## 5. Zasady nadrzędne

### 5.1. Zero domyślnego zaufania

Każde żądanie musi zostać ocenione w kontekście:

- tożsamości;

- sesji;

- tenanta;

- tenantId;

- workspace;

- membershipu;

- roli;

- capability;

- entitlement;

- zakresu danych;

- celu operacji;

- poziomu ryzyka;

- aktualnego stanu konta i połączenia.

Sama znajomość identyfikatora obiektu nie daje prawa dostępu.

### 5.2. Serwer jest źródłem decyzji bezpieczeństwa

Warstwa kliencka nie może samodzielnie ustalać:

- uprawnień;

- aktywnego tenantu;

- prawa do odczytu danych;

- prawa do eksportu;

- prawa do connect i reconnect;

- prawa do zmiany membershipu;

- prawa do usunięcia danych;

- prawa do ręcznego rozstrzygnięcia konfliktu;

- prawa do działań uprzywilejowanych.

### 5.3. Izolacja tenantów jest wymogiem krytycznym

Żadne dane, procesy, wyniki ani zasoby jednego klienta nie mogą być dostępne albo przypisane do innego klienta.

Odwołanie: DEC-SEC-001.

### 5.4. Najmniejsze niezbędne uprawnienia

Użytkownik, proces, integracja i dostawca otrzymują wyłącznie zakres niezbędny do realizacji zatwierdzonego celu.

### 5.5. Minimalizacja danych

PapaData pobiera i przechowuje tylko dane niezbędne do:

- realizacji integracji;

- identyfikacji faktów biznesowych;

- obliczania zatwierdzonych KPI;

- deduplikacji;

- audytu;

- obsługi incydentów;

- wykonania zobowiązań umownych;

- wykonania wymogów prawnych.

### 5.6. Bezpieczna degradacja

Awaria jednego elementu nie powinna automatycznie blokować niezależnych:

- źródeł;

- danych historycznych;

- KPI;

- procesów bezpieczeństwa;

- eksportów wynikających ze zobowiązania;

- informacji o problemie;

- procesów usuwania danych.

### 5.7. Krytyczna operacja wymaga dowodu

Dowodem może być:

- test;

- log audytowy;

- raport;

- zatwierdzony runbook;

- wynik restore;

- wynik testu izolacji;

- opinia ekspercka;

- formalna decyzja.

### 5.8. Brak kontroli oznacza brak dopuszczenia

Jeżeli dla krytycznego ryzyka nie istnieje kontrola albo dowód jej skuteczności, zakres nie może zostać dopuszczony do danych produkcyjnych.

## 6. Zakres ochrony

### 6.1. Aktywa biznesowe

Ochronie podlegają:

- dane klientów;

- dane sprzedażowe;

- dane marketingowe;

- dane finansowe;

- KPI;

- insighty;

- rekomendacje;

- decyzje;

- konfiguracje;

- informacje rozliczeniowe;

- informacje o integracjach;

- dokumenty handlowe;

- reputacja PapaData.

### 6.2. Aktywa tożsamości i dostępu

- konta użytkowników;

- konta uprzywilejowane;

- członkostwa;

- role;

- capabilities;

- sesje;

- tokeny odzyskiwania;

- zaproszenia;

- dane MFA;

- mechanizmy awaryjnego dostępu.

### 6.3. Aktywa integracyjne

- tokeny OAuth;

- API keys;

- client secrets;

- webhook secrets;

- certyfikaty;

- connection;

- identyfikatory kont zewnętrznych;

- konfiguracje callbacków;

- zakresy uprawnień providerów.

### 6.4. Aktywa danych

- source data;

- raw normalized data;

- canonical data;

- duplicate groups;

- source authority;

- konflikty;

- KPI snapshots;

- lineage;

- audyt;

- dane billingowe;

- dane wykorzystywane przez AI;

- eksporty;

- backupy.

### 6.5. Aktywa operacyjne

- repozytoria;

- procesy wdrożeniowe;

- środowiska;

- storage;

- bazy danych;

- kolejki;

- cache;

- logi;

- monitoring;

- konta dostawców;

- runbooki;

- dane incydentowe.

## 7. Klasyfikacja informacji

### 7.1. Publiczne

Informacje przeznaczone do publicznego udostępnienia.

Przykłady:

- publiczne opisy produktu;

- publiczna dokumentacja;

- ogólne informacje o dostępności.

### 7.2. Wewnętrzne

Informacje przeznaczone do użytku wewnętrznego.

Przykłady:

- plany produktu;

- dokumentacja robocza;

- niekrytyczne procedury;

- analizy biznesowe.

### 7.3. Poufne

Informacje, których ujawnienie może zaszkodzić klientowi albo PapaData.

Przykłady:

- dane sprzedażowe;

- dane finansowe;

- dane kampanii;

- konfiguracje integracji;

- umowy;

- raporty kosztowe;

- niepubliczne KPI.

### 7.4. Ściśle poufne

Informacje wymagające najwyższego poziomu kontroli.

Przykłady:

- sekrety;

- tokeny;

- dane uwierzytelniające;

- dane osobowe wysokiego ryzyka;

- klucze;

- wyniki testów bezpieczeństwa;

- szczegóły podatności;

- dane incydentowe;

- mechanizmy awaryjnego dostępu.

### 7.5. Zasady klasyfikacji

Każda kategoria danych powinna posiadać:

- właściciela;

- cel;

- podstawę przetwarzania;

- dozwolone użycie;

- dozwolonych odbiorców;

- wymagane zabezpieczenia;

- zasady retencji;

- procedurę usunięcia;

- ograniczenia eksportu;

- zasady audytu.

## 8. Zarządzanie tożsamością

### 8.1. Unikalna tożsamość

Każdy użytkownik powinien korzystać z własnej tożsamości.

Współdzielone konta użytkowników nie powinny być stosowane do normalnej pracy.

### 8.2. Cykl życia konta

Cykl obejmuje:

- utworzenie;

- aktywację;

- uwierzytelnienie;

- przypisanie do tenanta;

- nadanie membershipu;

- zmianę roli;

- zawieszenie;

- odebranie dostępu;

- usunięcie albo anonimizację zgodnie z polityką;

- zachowanie niezbędnego audytu.

### 8.3. Zaproszenia

Zaproszenie powinno być:

- przypisane do konkretnego tenanta;

- przypisane do konkretnego adresata;

- ograniczone czasowo;

- możliwe do unieważnienia;

- jednorazowe;

- audytowane.

### 8.4. Odzyskiwanie dostępu

Proces odzyskiwania nie może umożliwiać:

- przejęcia konta;

- obejścia MFA;

- zmiany tenantu;

- podniesienia uprawnień;

- ujawnienia, czy nieuprawniona osoba posiada konto.

### 8.5. Usunięcie dostępu

Dostęp musi zostać odebrany po:

- zakończeniu współpracy;

- usunięciu membershipu;

- zmianie odpowiedzialności;

- wykryciu ryzyka;

- żądaniu uprawnionego administratora;

- zakończeniu pilotażu, jeśli dalszy dostęp nie jest wymagany.

## 9. Autoryzacja

### 9.1. Wielowymiarowa decyzja

Autoryzacja uwzględnia co najmniej:

- użytkownika;

- tenant;

- workspace;

- membership;

- capability;

- entitlement;

- obiekt;

- operację;

- cel;

- aktualny stan zasobu.

### 9.2. Role i capabilities

Rola grupuje odpowiedzialności.

Capability określa konkretną możliwość, na przykład:

- odczyt danych;

- connect;

- reconnect;

- eksport;

- zarządzanie użytkownikami;

- zarządzanie billingiem;

- manual review;

- usuwanie danych;

- wykonywanie działań uprzywilejowanych.

### 9.3. Entitlement i uprawnienie

Entitlement handlowe nie zastępuje uprawnienia bezpieczeństwa.

Posiadanie zakupionego pakietu nie oznacza, że każdy użytkownik może wykonywać wszystkie operacje objęte pakietem.

### 9.4. Zmiana kontekstu tenantu

Zmiana tenanta albo workspace musi wymagać ponownej walidacji dostępu.

Kontekst poprzedniego tenantu nie może zostać użyty do kolejnego żądania.

### 9.5. Odmowa dostępu

Odmowa powinna być audytowana w zakresie potrzebnym do bezpieczeństwa, bez ujawniania nieuprawnionej osobie szczegółów obiektu.

## 10. Konta uprzywilejowane i MFA

### 10.1. Zakres kont uprzywilejowanych

Za uprzywilejowane uznaje się konta umożliwiające między innymi:

- dostęp administracyjny;

- zmianę uprawnień;

- dostęp do danych wielu tenantów;

- zmianę konfiguracji bezpieczeństwa;

- zarządzanie sekretami;

- dostęp do backupów;

- uruchamianie dużego reprocessingu;

- dostęp do danych incydentowych;

- zarządzanie środowiskiem.

### 10.2. Obowiązkowe MFA

MFA jest obowiązkowe dla kont uprzywilejowanych przed dopuszczeniem danych produkcyjnych.

Odwołanie: DEC-SEC-002.

### 10.3. Ograniczenie codziennego użycia

Konto uprzywilejowane nie powinno być używane do zwykłych działań, jeżeli możliwe jest użycie konta o mniejszym zakresie.

### 10.4. Dostęp awaryjny

Mechanizm awaryjny może zostać użyty wyłącznie:

- w uzasadnionej sytuacji;

- przez uprawnioną osobę;

- z pełnym audytem;

- na ograniczony czas;

- z obowiązkowym przeglądem po zdarzeniu.

### 10.5. Utrata urządzenia lub czynnika MFA

Powinna skutkować:

- zablokowaniem odpowiedniego czynnika;

- oceną ryzyka sesji;

- ponowną weryfikacją tożsamości;

- audytem;

- ewentualnym unieważnieniem aktywnych sesji.

## 11. Sesje

Sesja powinna posiadać:

- identyfikator;

- użytkownika;

- tenant;

- czas utworzenia;

- czas ostatniej aktywności;

- czas wygaśnięcia;

- zakres uwierzytelnienia;

- informację o MFA;

- możliwość unieważnienia;

- audyt zdarzeń krytycznych.

Sesja powinna zostać ponownie zweryfikowana przed działaniami podwyższonego ryzyka, takimi jak:

- zmiana zabezpieczeń;

- usunięcie danych;

- eksport dużego zakresu;

- zmiana uprawnień;

- zarządzanie billingiem;

- dostęp awaryjny.

## 12. Izolacja tenantów

### 12.1. Zakres izolacji

Izolacja obejmuje:

- użytkowników;

- membershipy;

- workspace;

- connection;

- dane źródłowe;

- dane znormalizowane;

- dane kanoniczne;

- duplicate groups;

- konflikty;

- source authority;

- KPI;

- rekomendacje;

- procesy AI;

- joby;

- kolejki;

- cache;

- wyszukiwanie;

- logi;

- telemetry;

- eksporty;

- backupy logiczne;

- Support;

- billing.

### 12.2. Sama kolumna tenantId nie wystarcza

Izolacja powinna być wielowarstwowa i uwzględniać:

- identyfikację kontekstu;

- autoryzację;

- filtrację danych;

- ograniczenie procesów asynchronicznych;

- testy negatywne;

- kontrolę cache;

- kontrolę logów;

- kontrolę eksportów;

- kontrolę AI retrieval;

- kontrolę Supportu.

Odwołanie: DEC-SEC-001.

### 12.3. Procesy asynchroniczne

Każdy job i komunikat powinien jednoznacznie wskazywać:

- tenant;

- workspace;

- cel;

- zakres danych;

- właściciela procesu;

- identyfikator operacji.

Proces nie może domyślać się tenantu na podstawie niepewnego kontekstu.

### 12.4. Cache

Cache nie może zwrócić danych innego tenantu wskutek:

- niepełnego klucza;

- ponownego użycia identyfikatora;

- braku kontekstu;

- błędnej invalidacji.

### 12.5. Logi i telemetry

Logi nie powinny ujawniać danych jednego klienta osobie analizującej problem innego klienta.

Dostęp do logów musi być kontrolowany i audytowany.

### 12.6. Deduplikacja

Deduplikacja nie może działać między tenantami.

Odwołanie: DEC-DAT-007.

### 12.7. Test izolacji

Przed danymi produkcyjnymi wymagane są testy obejmujące co najmniej:

- odczyt obcego obiektu;

- zapis do obcego obiektu;

- odgadnięcie identyfikatora;

- zmianę tenantId;

- zmianę workspace;

- dostęp przez job;

- dostęp przez eksport;

- dostęp przez cache;

- dostęp przez AI;

- dostęp Supportu;

- dostęp po odebraniu membershipu.

### 12.8. Krytyczność naruszenia

Podejrzenie dostępu między tenantami jest zdarzeniem krytycznym.

Wymaga:

- natychmiastowego ograniczenia zakresu;

- zabezpieczenia dowodów;

- analizy wpływu;

- uruchomienia procesu incydentowego;

- ponownego dopuszczenia dopiero po potwierdzeniu naprawy.

## 13. Bezpieczeństwo integracji

### 13.1. Minimalny zakres uprawnień

Integracja powinna żądać wyłącznie uprawnień potrzebnych do zatwierdzonego zakresu.

### 13.2. Tokeny i sekrety

Tokeny, API keys i sekrety:

- nie mogą być ujawniane po zapisaniu;

- nie mogą trafiać do URL;

- nie mogą trafiać do logów;

- nie mogą trafiać do telemetry;

- nie mogą trafiać do eksportów;

- nie mogą trafiać do narzędzi AI;

- muszą być przechowywane w wydzielonym mechanizmie;

- muszą być możliwe do unieważnienia albo rotacji.

### 13.3. OAuth

Proces OAuth powinien kontrolować:

- providera;

- redirect URI;

- state;

- zakres;

- tenant;

- workspace;

- użytkownika inicjującego;

- wynik;

- wygaśnięcie;

- ponowne połączenie;

- odwołanie zgody.

### 13.4. Webhooki

Webhook powinien podlegać:

- weryfikacji źródła;

- weryfikacji podpisu lub sekretu, jeśli dostępny;

- kontroli idempotencji;

- kontroli tenantów;

- ochronie przed replay;

- kontroli duplikatów;

- audytowi;

- ograniczeniu rozmiaru i częstotliwości.

### 13.5. Zmiana uprawnień providera

Zmiana zakresu integracji wymaga:

- oceny celu;

- oceny prywatności;

- aktualizacji dokumentacji;

- ponownej zgody, jeżeli jest wymagana;

- analizy wpływu;

- aktualizacji threat modelu.

### 13.6. Odłączenie integracji

Odłączenie powinno określać:

- unieważnienie tokenu;

- zatrzymanie nowych synchronizacji;

- los danych historycznych;

- wpływ na KPI;

- wpływ na retencję;

- wymagane usunięcie;

- audyt.

## 14. Zarządzanie sekretami

### 14.1. Zasada write-only

Sekret po zapisaniu nie powinien być ponownie zwracany w pełnej postaci.

### 14.2. Zakres sekretów

Za sekrety uznaje się między innymi:

- hasła;

- tokeny;

- klucze API;

- client secrets;

- webhook secrets;

- klucze prywatne;

- klucze szyfrujące;

- dane awaryjnego dostępu.

### 14.3. Dostęp do sekretów

Dostęp powinien być:

- ograniczony;

- uzasadniony;

- audytowany;

- możliwie krótkotrwały;

- oddzielony od zwykłego dostępu do aplikacji.

### 14.4. Rotacja

Rotacja jest wymagana po:

- podejrzeniu ujawnienia;

- odejściu osoby posiadającej dostęp;

- zmianie dostawcy;

- incydencie;

- błędnej publikacji;

- zakończeniu użycia;

- zmianie ryzyka.

### 14.5. Sekret ujawniony

Ujawniony sekret należy traktować jako przejęty.

Samo usunięcie sekretu z widocznego miejsca nie jest wystarczające bez jego unieważnienia albo rotacji.

## 15. Bezpieczeństwo danych

### 15.1. Dane w transmisji

Dane powinny być chronione w czasie przesyłania między:

- użytkownikiem i PapaData;

- PapaData i providerem;

- usługami;

- storage;

- narzędziami zewnętrznymi.

### 15.2. Dane przechowywane

Zakres ochrony danych przechowywanych powinien odpowiadać:

- klasyfikacji;

- ryzyku;

- dostępowi;

- retencji;

- sposobowi użycia;

- możliwości odtworzenia.

### 15.3. Dane produkcyjne w środowiskach nieprodukcyjnych

Dane produkcyjne klientów nie powinny być kopiowane do środowisk testowych lub deweloperskich bez:

- zatwierdzonego celu;

- minimalizacji;

- odpowiedniego zabezpieczenia;

- ograniczenia dostępu;

- retencji;

- audytu;

- wymaganej podstawy prawnej.

Preferowane jest używanie danych syntetycznych albo odpowiednio przygotowanych zbiorów testowych.

### 15.4. Eksport

Eksport powinien posiadać:

- uprawnionego odbiorcę;

- zakres;

- cel;

- tenant;

- czas utworzenia;

- termin dostępności;

- zabezpieczenie;

- audyt;

- możliwość unieważnienia.

### 15.5. Dane w logach

Logi nie powinny zawierać pełnych:

- sekretów;

- tokenów;

- danych uwierzytelniających;

- danych osobowych, jeśli nie są niezbędne;

- payloadów źródłowych bez uzasadnienia;

- danych finansowych bez uzasadnienia.

## 16. Prywatność i role stron

### 16.1. Ustalenie roli PapaData

Przed przetwarzaniem danych klienta należy określić dla konkretnego zakresu:

- rolę klienta;

- rolę PapaData;

- cel przetwarzania;

- kategorie danych;

- kategorie osób;

- odbiorców;

- dostawców;

- okres retencji;

- zasady usunięcia;

- wymagane dokumenty.

### 16.2. Brak automatycznego założenia

Nie należy zakładać jednej roli prawnej dla wszystkich procesów bez analizy konkretnego celu.

### 16.3. Niezależna weryfikacja

Model ról, umowa powierzenia, obowiązki informacyjne i podstawy przetwarzania wymagają niezależnego potwierdzenia prawnego przed pierwszym pilotażem na danych osobowych.

### 16.4. Rejestr przepływów danych

Dla każdego procesu należy móc ustalić:

- skąd dane pochodzą;

- dokąd trafiają;

- jaki jest cel;

- kto ma dostęp;

- jak długo są przechowywane;

- czy są przekazywane dostawcy;

- czy są używane przez AI;

- jak są usuwane.

## 17. Minimalizacja danych

### 17.1. Ocena przed pobraniem

Przed dodaniem nowego pola lub typu danych należy określić:

- konkretny cel;

- powiązany proces;

- powiązany KPI;

- wymagany okres;

- ryzyko;

- konieczność przechowywania;

- możliwość użycia danych mniej szczegółowych.

### 17.2. Dane klientów końcowych

PapaData nie powinna pobierać danych osób kupujących, jeśli nie są potrzebne do zatwierdzonego celu.

Przykładowo pełne dane kontaktowe nie powinny być pobierane wyłącznie dlatego, że provider je udostępnia.

### 17.3. Dane AI

Dane przekazywane do AI powinny być ograniczone do minimum niezbędnego do wykonania zatwierdzonego zadania.

## 18. Pseudonimizacja i anonimizacja

### 18.1. Pseudonimizacja

Pseudonimizacja ogranicza bezpośrednią identyfikowalność, ale nie oznacza automatycznie, że dane przestają wymagać ochrony.

Odwołanie: DEC-SEC-005.

### 18.2. Anonimizacja

Dane mogą być traktowane jako anonimowe wyłącznie po niezależnej ocenie, że ponowna identyfikacja nie jest rozsądnie możliwa w konkretnym kontekście.

### 18.3. Zakaz marketingowego nadużycia

PapaData nie powinna określać danych jako anonimowe tylko dlatego, że usunięto imię, e-mail albo pojedynczy identyfikator.

## 19. Prawa osób i obsługa żądań

PapaData musi posiadać proces umożliwiający wsparcie klienta w realizacji uzasadnionych żądań dotyczących danych.

Proces powinien umożliwiać:

- identyfikację właściwego tenantu;

- ustalenie zakresu danych;

- wyszukanie danych;

- eksport;

- sprostowanie, jeśli dotyczy;

- ograniczenie;

- usunięcie;

- potwierdzenie wykonania;

- zachowanie odpowiedniego audytu.

Wykonanie żądania nie może prowadzić do ujawnienia danych innej osoby albo innego tenantu.

Szczegółowe terminy i obowiązki wymagają potwierdzenia prawnego.

## 20. Retencja danych

### 20.1. Zasada nadrzędna

Każda kategoria danych musi posiadać zdefiniowany okres albo zdarzenie kończące retencję przed rozpoczęciem produkcyjnego przetwarzania.

Brak zatwierdzonej reguły retencji blokuje pobieranie danej kategorii na potrzeby pilotażu.

### 20.2. Retencja zależna od celu

Retencja może zależeć od:

- aktywnego pilotażu;

- aktywnej umowy;

- obowiązku prawnego;

- potrzeby audytu;

- obsługi sporu;

- potrzeby restore;

- zakończenia integracji;

- żądania usunięcia.

### 20.3. Kategorie wymagające osobnych reguł

Osobne reguły powinny istnieć dla:

- danych źródłowych;

- danych znormalizowanych;

- danych kanonicznych;

- KPI;

- logów operacyjnych;

- logów bezpieczeństwa;

- sekretów;

- eksportów;

- backupów;

- danych billingowych;

- danych incydentowych;

- kontekstu AI;

- danych testowych.

### 20.4. Brak jednej globalnej retencji

Jedna wartość retencji dla wszystkich danych jest niedopuszczalna bez analizy celu i ryzyka.

### 20.5. Retencja w pilotażu

Karta pilotażu musi zawierać:

- kategorie danych;

- czas albo zdarzenie kończące retencję;

- okres offboardingu;

- zasady eksportu;

- zasady usunięcia;

- zasady backupów;

- wyjątki prawne.

Jest to obowiązująca reguła, a nie pytanie otwarte.

## 21. Usuwanie danych

### 21.1. Procedura przed pilotażem

Przed pierwszym pilotażem musi istnieć zatwierdzona procedura usuwania danych.

Odwołanie: DEC-SEC-006.

### 21.2. Zakres usunięcia

Procedura powinna obejmować:

- dane aktywne;

- dane źródłowe;

- dane znormalizowane;

- dane kanoniczne;

- KPI;

- rekomendacje;

- dane AI;

- eksporty;

- cache;

- indeksy wyszukiwania;

- logi, jeżeli mogą zostać usunięte;

- dane u dostawców;

- backupy;

- tokeny;

- connection.

### 21.3. Tryby usunięcia

Należy rozróżniać:

- usunięcie pojedynczego rekordu;

- usunięcie kategorii danych;

- usunięcie connection;

- usunięcie workspace;

- usunięcie tenantu;

- usunięcie po zakończeniu współpracy;

- usunięcie wynikające z żądania;

- usunięcie awaryjne.

### 21.4. Dowód usunięcia

Dowód powinien wskazywać:

- zakres;

- tenant;

- datę;

- podstawę;

- osobę albo proces;

- systemy objęte;

- systemy pozostające w okresie retencji;

- status backupów;

- wyjątki;

- wynik.

### 21.5. Usunięcie a lineage

Usunięcie danych może ograniczać możliwość odtworzenia pełnego lineage.

Pozostawienie audytu wymaga odrębnej podstawy i minimalizacji.

### 21.6. Usunięcie a KPI

Usunięcie danych źródłowych może wymagać:

- ponownego obliczenia KPI;

- usunięcia KPI;

- oznaczenia wyniku historycznego;

- usunięcia rekomendacji zależnych.

## 22. Backup

### 22.1. Backup nie jest dowodem odtworzenia

Samo utworzenie kopii nie potwierdza możliwości przywrócenia danych.

Odwołanie: DEC-SEC-003.

### 22.2. Zakres planu backupu

Plan powinien określać:

- jakie dane są kopiowane;

- częstotliwość;

- miejsce przechowywania;

- zakres szyfrowania;

- dostęp;

- retencję;

- testy;

- właściciela;

- zależności;

- koszty;

- sposób usuwania.

### 22.3. Dane niewymagające backupu

Nie każda kategoria musi posiadać ten sam model backupu.

Dane możliwe do bezpiecznego odtworzenia z providera mogą mieć inną politykę niż:

- decyzje klienta;

- konfiguracje;

- źródła niedostępne historycznie;

- reguły source authority;

- dane audytowe.

### 22.4. Ochrona backupu

Backup podlega:

- izolacji tenantów;

- kontroli dostępu;

- retencji;

- audytowi;

- ochronie przed nieautoryzowaną zmianą;

- zasadom usuwania.

## 23. Restore

### 23.1. Test restore

Przed przetwarzaniem danych produkcyjnych klienta musi zostać wykonany rzeczywisty test restore w zakresie adekwatnym do pilotażu.

### 23.2. Zakres testu

Test powinien potwierdzić:

- dostępność kopii;

- możliwość odczytu;

- kompletność;

- integralność;

- poprawne przypisanie tenantów;

- możliwość odtworzenia konfiguracji;

- możliwość odtworzenia danych;

- czas operacji;

- problemy;

- koszt.

### 23.3. Reconciliation po restore

Po odtworzeniu należy sprawdzić:

- brak danych obcego tenantu;

- spójność connection;

- spójność lineage;

- spójność source authority;

- spójność KPI;

- usunięcia wykonane przed backupem;

- usunięcia wykonane po utworzeniu backupu;

- tokeny i sekrety;

- zależne systemy.

### 23.4. Restore nie może przywracać usuniętych danych bez kontroli

Proces odtworzenia musi respektować rejestr usunięć.

Odwołanie: DEC-SEC-004.

### 23.5. Wynik testu

Test kończy się:

- sukcesem;

- sukcesem warunkowym;

- niepowodzeniem;

- blokadą bramy.

Niepowodzenie restore blokuje deklarowanie gotowości ciągłości działania.

## 24. RTO i RPO

### 24.1. Status parametrów

RTO i RPO są decyzją warunkową.

Odwołanie: DEC-SEC-007.

### 24.2. Obowiązująca reguła dla pilotażu

Przed rozpoczęciem każdego pilotażu należy określić wewnętrzne cele odtworzeniowe odpowiednie dla:

- danych;

- krytyczności procesu;

- możliwości ponownego pobrania danych;

- kosztu odtworzenia;

- zobowiązań wobec klienta.

Wartości te muszą zostać wpisane do karty pilotażu.

### 24.3. Brak automatycznego SLA

Cele wewnętrzne:

- służą planowaniu operacyjnemu;

- nie są automatycznie gwarancją umowną;

- wymagają testu;

- wymagają pomiaru;

- wymagają oceny kosztu.

### 24.4. Warunek przyjęcia zobowiązania

PapaData nie może przyjąć umownego RTO, RPO albo SLA bez:

- rzeczywistego testu restore;

- pomiarów operacyjnych;

- analizy zależności;

- analizy kosztu;

- niezależnej weryfikacji;

- formalnej decyzji.

## 25. Ciągłość działania

### 25.1. Zakres

Plan ciągłości powinien obejmować:

- awarię providera;

- awarię danych;

- utratę dostępu;

- awarię storage;

- awarię procesu synchronizacji;

- awarię AI;

- awarię dostawcy infrastruktury;

- utratę sekretu;

- utratę urządzenia właściciela;

- niedostępność Artura Wiśniewskiego;

- incydent bezpieczeństwa;

- utratę repozytorium;

- utratę dokumentacji operacyjnej.

### 25.2. Ryzyko jednoosobowej działalności

Jednoosobowy charakter projektu tworzy ryzyko braku osoby zdolnej do:

- obsługi incydentu;

- odtworzenia dostępu;

- wykonania restore;

- kontaktu z klientem;

- podjęcia decyzji awaryjnej.

Przed skalowaniem wymagane jest ograniczenie tego ryzyka przez:

- dokumentację;

- zabezpieczony dostęp awaryjny;

- runbooki;

- zewnętrzne wsparcie;

- przekazanie niezbędnej wiedzy wybranej osobie albo podmiotowi.

### 25.3. Tryb degradacji

Tryb degradacji powinien zachowywać w miarę możliwości:

- dostęp do historycznych danych;

- informację o świeżości;

- informację o problemie;

- możliwość eksportu wynikającego ze zobowiązań;

- procesy bezpieczeństwa;

- proces usuwania danych;

- kontakt operacyjny.

## 26. Threat model

### 26.1. Minimalny threat model przed pilotażem

Przed danymi produkcyjnymi wymagany jest minimalny threat model obejmujący:

- aktywa;

- aktorów;

- granice zaufania;

- przepływy danych;

- wejścia zewnętrzne;

- tenant isolation;

- integracje;

- sekrety;

- Support;

- AI;

- eksporty;

- backupy;

- proces usuwania;

- główne scenariusze nadużycia;

- kontrole;

- ryzyko rezydualne.

### 26.2. Zdarzenia wymagające aktualizacji

Threat model wymaga aktualizacji po:

- dodaniu integracji;

- dodaniu nowego typu danych;

- zmianie modelu tenant isolation;

- dodaniu AI;

- zmianie dostawcy;

- zmianie retencji;

- dodaniu self-service;

- dodaniu Supportu z dostępem do danych;

- dodaniu eksportu;

- uruchomieniu omnichannel;

- incydencie;

- istotnej zmianie architektury.

### 26.3. Brak threat modelu

Brak minimalnego threat modelu blokuje użycie danych produkcyjnych klienta.

## 27. Testy bezpieczeństwa

### 27.1. Testy wymagane przed pilotażem

Co najmniej:

- test autoryzacji;

- test tenant isolation;

- test odebrania dostępu;

- test MFA kont uprzywilejowanych;

- test sekretów;

- test eksportu;

- test usunięcia;

- test backupu i restore;

- test audytu;

- test dostępu Supportu;

- test integracji;

- test negatywny danych obcego tenantu.

### 27.2. Testy przed produkcyjną sprzedażą

Dodatkowo:

- szerszy test penetracyjny;

- test obsługi incydentu;

- test ciągłości działania;

- test uprawnień uprzywilejowanych;

- test zależności i dostawców;

- test izolacji procesów asynchronicznych;

- test AI retrieval, jeśli dotyczy.

### 27.3. Test po zmianie

Zmiana krytycznej kontroli wymaga testu regresyjnego.

### 27.4. Niezależny test

Przed skalowaniem albo obsługą klientów o podwyższonym ryzyku wymagany jest test wykonany lub zweryfikowany niezależnie.

## 28. Zarządzanie podatnościami

Proces powinien obejmować:

- identyfikację;

- ocenę wpływu;

- priorytet;

- właściciela;

- termin naprawy;

- obejście tymczasowe;

- test naprawy;

- ocenę wpływu na klientów;

- decyzję o komunikacji;

- aktualizację threat modelu.

Podatność dotycząca:

- tenant isolation;

- uwierzytelnienia;

- sekretów;

- danych osobowych;

- backupu;

- AI retrieval

powinna być traktowana jako potencjalnie krytyczna.

## 29. Monitoring bezpieczeństwa

### 29.1. Minimalne zdarzenia monitorowane

- udane i nieudane logowania;

- zmiany MFA;

- odzyskiwanie dostępu;

- zmiany membershipu;

- zmiany uprawnień;

- działania uprzywilejowane;

- dostęp Supportu;

- connect i reconnect;

- dostęp do sekretów;

- eksport;

- usunięcie;

- restore;

- zmiany polityk danych;

- zmiany source authority;

- duże reprocessingi;

- użycie awaryjnego dostępu;

- problemy izolacji;

- zdarzenia AI wysokiego ryzyka.

### 29.2. Alert

Alert powinien zawierać:

- zdarzenie;

- czas;

- tenant;

- użytkownika lub proces;

- zasób;

- wpływ;

- poziom ryzyka;

- następne działanie;

- właściciela.

### 29.3. Monitoring nie może ujawniać sekretów

Dane monitoringu podlegają minimalizacji i kontroli dostępu.

## 30. Audyt

### 30.1. Operacje wymagające audytu

- zmiana uprawnień;

- zmiana membershipu;

- zmiana konfiguracji bezpieczeństwa;

- connect i reconnect;

- eksport;

- usunięcie danych;

- restore;

- dostęp uprzywilejowany;

- manual review wysokiego wpływu;

- zmiana source authority;

- zmiana kontraktu KPI;

- uruchomienie AI na danych klienta;

- działanie AI o istotnym wpływie;

- decyzja o incydencie.

### 30.2. Minimalny rekord audytowy

- identyfikator;

- czas;

- tenant;

- workspace;

- aktor;

- operacja;

- zasób;

- wynik;

- powód;

- zakres;

- poprzednia wartość, jeśli właściwa;

- nowa wartość, jeśli właściwa;

- korelacja z procesem.

### 30.3. Dostęp do audytu

Dostęp powinien być ograniczony do osób o uzasadnionej potrzebie.

### 30.4. Retencja audytu

Retencja musi wynikać z celu, ryzyka, zobowiązania i niezależnej oceny prawnej.

## 31. Dostęp Supportu

### 31.1. Zasada

Support nie posiada nieograniczonego, stałego dostępu do wszystkich danych klientów.

### 31.2. Warunki dostępu

Dostęp powinien być:

- uzasadniony zgłoszeniem;

- ograniczony do tenantu;

- ograniczony zakresem;

- ograniczony czasowo;

- audytowany;

- możliwy do odebrania;

- podlegający przeglądowi.

### 31.3. Działania zabronione

Support nie może samodzielnie:

- zmieniać source authority;

- zmieniać KPI;

- łączyć danych między tenantami;

- omijać autoryzacji;

- wyłączać audytu;

- pobierać danych do prywatnych narzędzi;

- używać danych w zewnętrznym AI bez zatwierdzenia;

- usuwać danych bez procedury.

### 31.4. Dostęp awaryjny Supportu

Wymaga:

- uzasadnienia;

- zatwierdzenia;

- ograniczenia czasu;

- pełnego audytu;

- przeglądu po zakończeniu.

## 32. Zarządzanie incydentami

### 32.1. Definicja incydentu

Incydentem może być zdarzenie wpływające na:

- poufność;

- integralność;

- dostępność;

- izolację tenantów;

- prywatność;

- ciągłość działania;

- poprawność KPI;

- bezpieczeństwo AI;

- zobowiązania wobec klienta.

### 32.2. Klasy wpływu

Incydent powinien zostać oceniony co najmniej pod względem:

- liczby tenantów;

- kategorii danych;

- czasu trwania;

- zakresu dostępu;

- możliwości wykorzystania danych;

- wpływu finansowego;

- wpływu na decyzje;

- możliwości odtworzenia;

- obowiązków komunikacyjnych.

### 32.3. Proces incydentowy

1. wykrycie;

1. rejestracja;

1. wstępna klasyfikacja;

1. ograniczenie wpływu;

1. zabezpieczenie dowodów;

1. ustalenie zakresu;

1. naprawa;

1. odtworzenie;

1. weryfikacja;

1. komunikacja;

1. analiza przyczyny;

1. działania korygujące;

1. zamknięcie;

1. aktualizacja ryzyk i dokumentacji.

### 32.4. Decyzja o komunikacji

Decyzja dotycząca komunikacji z klientem albo organem wymaga niezależnej oceny prawnej, jeżeli zdarzenie może tworzyć obowiązek formalny.

### 32.5. Dowody

Należy chronić:

- logi;

- konfiguracje;

- wersje;

- identyfikatory procesów;

- dane dostępu;

- zakres danych;

- działania wykonane podczas incydentu.

### 32.6. Post-incident review

Po incydencie należy ustalić:

- przyczynę;

- dlaczego kontrola nie zadziałała;

- zakres wpływu;

- koszt;

- działania naprawcze;

- właścicieli;

- terminy;

- potrzebę zmiany decyzji;

- potrzebę aktualizacji threat modelu.

## 33. Zarządzanie dostawcami

### 33.1. Rejestr dostawców

PapaData powinna posiadać rejestr dostawców mających dostęp do:

- danych klientów;

- danych osobowych;

- sekretów;

- infrastruktury;

- logów;

- AI context;

- backupów;

- danych billingowych.

### 33.2. Minimalna ocena dostawcy

Ocena obejmuje:

- cel;

- kategorie danych;

- lokalizację przetwarzania;

- dostęp;

- podwykonawców;

- retencję;

- usuwanie;

- bezpieczeństwo;

- obsługę incydentów;

- możliwość eksportu;

- możliwość zakończenia współpracy;

- zależność operacyjną;

- koszt.

### 33.3. Umowy i warunki

Przed przekazaniem danych dostawcy należy posiadać wymagane warunki umowne i prawne.

### 33.4. Zmiana dostawcy

Wymaga:

- analizy wpływu;

- aktualizacji przepływów danych;

- aktualizacji threat modelu;

- migracji;

- usunięcia danych u poprzedniego dostawcy;

- weryfikacji nowego dostawcy.

### 33.5. Dostawca krytyczny

Dostawca jest krytyczny, jeśli jego awaria albo naruszenie może:

- zablokować usługę;

- ujawnić dane;

- uniemożliwić restore;

- wpłynąć na wielu klientów;

- naruszyć zobowiązania.

Dla dostawcy krytycznego wymagany jest plan awaryjny albo jawnie zaakceptowane ryzyko.

## CZĘŚĆ II — AI GOVERNANCE

## 34. Zakres AI Governance

AI Governance obejmuje:

- wybór zastosowania;

- wybór modelu albo dostawcy;

- dane wejściowe;

- retrieval;

- kontekst;

- prompt;

- wynik;

- human oversight;

- audyt;

- bezpieczeństwo;

- prywatność;

- jakość;

- koszty;

- zmianę modelu;

- incydenty.

## 35. Dozwolone role AI

AI może wspierać:

- podsumowanie danych;

- interpretację zatwierdzonych KPI;

- identyfikację potencjalnych anomalii;

- formułowanie hipotez;

- przygotowanie wyjaśnienia;

- wskazanie możliwych działań;

- analizę dokumentacji;

- wsparcie obsługi.

AI nie jest źródłem:

- uprawnień;

- readiness;

- source authority;

- definicji KPI;

- stanu płatności;

- statusu bezpieczeństwa;

- prawnej interpretacji;

- wiążącej decyzji klienta.

Odwołanie: DEC-AI-001.

## 36. Niedozwolone użycia AI

Bez osobnej decyzji i kontroli AI nie może:

- zmieniać danych źródłowych;

- zmieniać uprawnień;

- usuwać danych;

- uruchamiać płatności;

- zmieniać source authority;

- zatwierdzać KPI;

- rozstrzygać dostępu;

- wykonywać działań prawnych;

- składać zobowiązań klientowi;

- podejmować autonomicznych działań finansowych;

- używać danych jednego tenantu w kontekście innego;

- trenować modeli na danych klientów bez osobnej podstawy i decyzji.

## 37. Dane wejściowe AI

AI może otrzymać tylko dane:

- niezbędne do celu;

- właściwego tenantu;

- zgodne z uprawnieniami;

- zgodne z entitlement;

- dopuszczone przez politykę prywatności;

- spełniające wymagany readiness;

- posiadające lineage;

- pozbawione nierozwiązanych blokujących konfliktów.

### 37.1. Dane niedopuszczone

Do AI nie powinny trafiać:

- sekrety;

- tokeny;

- hasła;

- nieograniczone payloady źródłowe;

- dane obcego tenantu;

- dane bez celu;

- dane wyłączone przez klienta;

- dane o niezatwierdzonej podstawie;

- KPI invalid albo blocked.

## 38. Tenant-safe retrieval

### 38.1. Zasada

Retrieval, wyszukiwanie, pamięć, cache i kontekst AI muszą respektować granice tenantu.

Odwołanie: DEC-AI-002.

### 38.2. Kontrole

Mechanizm musi uwzględniać:

- tenantId;

- workspace;

- użytkownika;

- uprawnienia;

- cel;

- źródło danych;

- zakres czasu;

- klasyfikację;

- retencję.

### 38.3. Testy

Przed AI na danych produkcyjnych wymagane są testy:

- próby pobrania danych obcego tenantu;

- manipulacji identyfikatorem;

- kontekstu po zmianie workspace;

- cache;

- pamięci rozmowy;

- logów;

- narzędzi;

- indeksu wektorowego;

- eksportu wyniku;

- Supportu.

### 38.4. Brak pewności

Jeżeli nie można potwierdzić izolacji retrieval, AI nie może korzystać z danych produkcyjnych klientów.

## 39. Gotowość danych dla AI

AI może korzystać z:

- KPI ready;

- KPI partial, jeśli ograniczenie jest jawnie przekazane;

- danych posiadających wymagane lineage;

- danych o zatwierdzonym znaczeniu.

AI nie może przedstawiać:

- KPI partial jako pełnego;

- braku danych jako zera;

- danych atrybucyjnych jako transakcyjnych;

- hipotezy jako faktu;

- wyniku bez ograniczeń.

## 40. Human oversight

### 40.1. Działania istotne

Działania o istotnym wpływie finansowym, prawnym, operacyjnym, bezpieczeństwa albo dostępu wymagają kontroli człowieka.

Odwołanie: DEC-AI-003.

### 40.2. Forma kontroli

Kontrola może obejmować:

- zatwierdzenie przed wykonaniem;

- podwójne zatwierdzenie;

- ograniczenie zakresu;

- możliwość odrzucenia;

- możliwość korekty;

- audyt;

- możliwość cofnięcia.

### 40.3. Odpowiedzialność

AI nie jest właścicielem decyzji.

Właściciel decyzji musi być możliwy do wskazania.

## 41. Wyjaśnialność wyniku AI

Wynik powinien umożliwiać ustalenie:

- celu;

- użytych źródeł;

- użytych KPI;

- wersji KPI;

- okresu;

- readiness;

- ograniczeń;

- roli modelu;

- osoby zatwierdzającej;

- działań wykonanych na podstawie wyniku.

AI nie musi ujawniać technicznych szczegółów modelu, ale musi umożliwiać biznesowe zrozumienie podstawy rekomendacji.

## 42. Ocena jakości AI

Przed dopuszczeniem przypadku użycia należy ocenić:

- poprawność;

- zgodność z danymi;

- kompletność ograniczeń;

- ryzyko halucynacji;

- stabilność;

- bezpieczeństwo promptów;

- wpływ błędnej rekomendacji;

- koszt;

- możliwość kontroli;

- możliwość audytu.

### 42.1. Zbiór testowy

Ocena powinna wykorzystywać reprezentatywne przypadki obejmujące:

- dane kompletne;

- dane częściowe;

- brak danych;

- konflikt;

- niegotowy KPI;

- dane z kilku źródeł;

- pytania poza zakresem;

- próbę uzyskania obcych danych;

- próbę wywołania niedozwolonego działania.

## 43. Zmiana modelu AI

Zmiana modelu, dostawcy, promptu systemowego, retrieval albo zakresu danych wymaga:

- analizy wpływu;

- testu;

- oceny prywatności;

- oceny bezpieczeństwa;

- oceny jakości;

- oceny kosztu;

- aktualizacji dokumentacji;

- ponownego zatwierdzenia zakresu, jeśli zmiana jest istotna.

## 44. Dane klientów a trenowanie modeli

Domyślną regułą jest brak wykorzystywania danych klientów do trenowania wspólnego modelu PapaData lub modelu dostawcy poza zakresem niezbędnym do wykonania usługi.

Odstępstwo wymaga:

- osobnej decyzji;

- jednoznacznego celu;

- podstawy prawnej;

- warunków umownych;

- informacji dla klienta;

- możliwości kontroli;

- analizy ryzyka;

- niezależnej weryfikacji.

## 45. Logowanie procesów AI

Należy rejestrować w minimalnym niezbędnym zakresie:

- przypadek użycia;

- tenant;

- użytkownika;

- model;

- wersję;

- użyte źródła;

- readiness danych;

- wynik operacji;

- błąd;

- działanie człowieka;

- koszt.

Logowanie nie może prowadzić do niekontrolowanego przechowywania:

- pełnych promptów zawierających dane poufne;

- pełnych odpowiedzi zawierających dane osobowe;

- sekretów;

- danych innego tenantu.

## 46. Incydenty AI

Incydentem AI może być:

- ujawnienie danych;

- pobranie danych obcego tenantu;

- wykonanie niedozwolonego działania;

- przedstawienie niegotowego KPI jako pełnego;

- niekontrolowana halucynacja o wysokim wpływie;

- utrata kontroli człowieka;

- niezgodne wykorzystanie danych;

- nadmierny koszt;

- brak możliwości audytu.

Incydent AI podlega procesowi zarządzania incydentami.

## CZĘŚĆ III — BRAMY DOPUSZCZENIA

## 47. Gate S0 — projektowanie bez danych klientów

Zakres może być rozwijany przy użyciu:

- dokumentacji;

- danych syntetycznych;

- danych demonstracyjnych;

- danych własnych;

- kontrolowanych zbiorów testowych.

Wymagane:

- podstawowe zasady dostępu;

- brak sekretów w kodzie i dokumentacji;

- klasyfikacja danych;

- wstępny threat model.

Gate S0 nie umożliwia przetwarzania danych klientów.

## 48. Gate S1 — wewnętrzny test z danymi kontrolowanymi

Wymagane:

- tenant i workspace;

- podstawowa autoryzacja;

- podstawowa izolacja;

- bezpieczne sekrety;

- audyt krytycznych operacji;

- test usunięcia;

- plan backupu;

- klasyfikacja danych;

- kontrola dostawców.

Gate S1 nie oznacza gotowości do płatnego pilotażu.

## 49. Gate S2 — płatny pilotaż na danych klienta

Wymagane:

1. określone role stron;

1. zatwierdzony zakres danych;

1. podstawa przetwarzania;

1. minimalizacja danych;

1. wielowarstwowa izolacja tenantów;

1. MFA kont uprzywilejowanych;

1. zarządzanie sekretami;

1. minimalny threat model;

1. procedura incydentowa;

1. procedura usuwania danych;

1. określona retencja pilotażu;

1. plan backupu;

1. rzeczywisty test restore;

1. kontrolowany dostęp Supportu;

1. monitoring krytycznych zdarzeń;

1. niezależna weryfikacja prawna i bezpieczeństwa w wymaganym zakresie;

1. zatwierdzenie Artura Wiśniewskiego.

Brak któregokolwiek krytycznego elementu blokuje Gate S2.

## 50. Gate S3 — AI na danych klienta

Wymagane dodatkowo:

1. zatwierdzony przypadek użycia;

1. minimalizacja kontekstu;

1. tenant-safe retrieval;

1. zakaz sekretów w kontekście;

1. gotowość danych;

1. human oversight;

1. audyt;

1. ocena modelu;

1. ocena dostawcy;

1. zasady retencji promptów i wyników;

1. test danych obcego tenantu;

1. niezależna weryfikacja bezpieczeństwa i prywatności.

Gate S3 jest niezależna od dopuszczenia zwykłej analityki.

## 51. Gate S4 — sprzedaż abonamentowa

Wymagane dodatkowo:

- stabilne kontrole dostępu;

- powtarzalny onboarding;

- monitoring;

- gotowość incydentowa;

- kontrola dostawców;

- regularne testy backupu;

- runbooki;

- proces offboardingu;

- proces płatności;

- przegląd uprawnień;

- zatwierdzone warunki umowne;

- pomiar bezpieczeństwa i operacji.

## 52. Gate S5 — omnichannel

Wymagane dodatkowo:

- tenant-safe deduplikacja;

- source authority;

- izolacja ciężkich workloadów;

- test konfliktów;

- test reprocessingu;

- audyt manual review;

- kontrola dostępu do rozstrzygnięć;

- pomiar kosztu;

- test cross-source isolation.

## 53. Gate S6 — SLA i skalowanie

Wymagane dodatkowo:

- przetestowane RTO i RPO;

- zatwierdzony model ciągłości;

- niezależny test bezpieczeństwa;

- proces zarządzania podatnościami;

- regularny przegląd dostępów;

- plan zastępstwa dla jednoosobowego właściciela;

- stabilny proces incydentowy;

- kontrolowany Support;

- rejestr dostawców;

- powtarzalne testy restore;

- zdolność obsługi wielu incydentów;

- zatwierdzone ryzyko rezydualne.

## CZĘŚĆ IV — REJESTR KONTROLI

## 54. Kontrole governance

Tabela:
- Wiersz 1: ID; Kontrola; Zakres; Dowód
- Wiersz 2: GOV-CTRL-001; Imienny właściciel bezpieczeństwa; wszystkie etapy; metryka dokumentu
- Wiersz 3: GOV-CTRL-002; Jednoosobowe governance oznaczone jako przejściowe; wszystkie etapy; Dokumenty 1, 2 i 7
- Wiersz 4: GOV-CTRL-003; Niezależna weryfikacja przed krytyczną bramą; pilotaż, produkcja, SLA; raport lub opinia
- Wiersz 5: GOV-CTRL-004; Rejestr ryzyk bezpieczeństwa; od Gate S1; aktualny rejestr
- Wiersz 6: GOV-CTRL-005; Formalne zatwierdzenie bramy; od Gate S2; wpis decyzyjny

## 55. Kontrole dostępu

Tabela:
- Wiersz 1: ID; Kontrola; Zakres; Dowód
- Wiersz 2: IAM-CTRL-001; Unikalna tożsamość użytkownika; wszyscy użytkownicy; test i audyt
- Wiersz 3: IAM-CTRL-002; Membership przypisany do tenantu; wszystkie konta; test dostępu
- Wiersz 4: IAM-CTRL-003; Serwerowa autoryzacja; wszystkie operacje; test negatywny
- Wiersz 5: IAM-CTRL-004; Najmniejsze uprawnienia; role i procesy; przegląd uprawnień
- Wiersz 6: IAM-CTRL-005; MFA kont uprzywilejowanych; przed Gate S2; test MFA
- Wiersz 7: IAM-CTRL-006; Unieważnienie sesji i dostępu; offboarding i incydent; test
- Wiersz 8: IAM-CTRL-007; Audyt działań uprzywilejowanych; konta uprzywilejowane; log audytowy

## 56. Kontrole tenant isolation

Tabela:
- Wiersz 1: ID; Kontrola; Zakres; Dowód
- Wiersz 2: TEN-CTRL-001; Tenant w każdym obiekcie klienta; dane i procesy; test
- Wiersz 3: TEN-CTRL-002; Kontrola tenantów w jobach; procesy asynchroniczne; test
- Wiersz 4: TEN-CTRL-003; Tenant-safe cache; cache; test negatywny
- Wiersz 5: TEN-CTRL-004; Tenant-safe eksport; eksporty; test
- Wiersz 6: TEN-CTRL-005; Tenant-safe Support; obsługa; audyt
- Wiersz 7: TEN-CTRL-006; Tenant-safe deduplikacja; integrity layer; test
- Wiersz 8: TEN-CTRL-007; Tenant-safe AI retrieval; AI; test izolacji
- Wiersz 9: TEN-CTRL-008; Brak cross-tenant logów dostępnych operacyjnie; logi; przegląd

## 57. Kontrole danych i prywatności

Tabela:
- Wiersz 1: ID; Kontrola; Zakres; Dowód
- Wiersz 2: PRIV-CTRL-001; Rejestr przepływów danych; wszystkie dane klientów; mapa przepływów
- Wiersz 3: PRIV-CTRL-002; Cel dla każdej kategorii danych; wszystkie dane; rejestr
- Wiersz 4: PRIV-CTRL-003; Minimalizacja; integracje i AI; przegląd pól
- Wiersz 5: PRIV-CTRL-004; Zatwierdzona retencja; przed Gate S2; karta pilotażu
- Wiersz 6: PRIV-CTRL-005; Procedura usunięcia; przed Gate S2; test i runbook
- Wiersz 7: PRIV-CTRL-006; Kontrola eksportu; eksporty; audyt
- Wiersz 8: PRIV-CTRL-007; Weryfikacja prawna; dane osobowe; opinia ekspercka
- Wiersz 9: PRIV-CTRL-008; Rejestr dostawców; podprocesorzy; rejestr

## 58. Kontrole backupu i ciągłości

Tabela:
- Wiersz 1: ID; Kontrola; Zakres; Dowód
- Wiersz 2: BCP-CTRL-001; Plan backupu; dane wymagające odtworzenia; zatwierdzony plan
- Wiersz 3: BCP-CTRL-002; Rzeczywisty test restore; przed Gate S2; raport
- Wiersz 4: BCP-CTRL-003; Reconciliation po restore; każdy test restore; raport
- Wiersz 5: BCP-CTRL-004; Respektowanie usunięć; restore; test
- Wiersz 6: BCP-CTRL-005; Wewnętrzne RTO i RPO w karcie pilotażu; każdy pilotaż; karta pilotażu
- Wiersz 7: BCP-CTRL-006; Plan ciągłości; przed skalowaniem; zatwierdzony plan
- Wiersz 8: BCP-CTRL-007; Plan zastępstwa właściciela; przed Gate S6; procedura

## 59. Kontrole AI

Tabela:
- Wiersz 1: ID; Kontrola; Zakres; Dowód
- Wiersz 2: AI-CTRL-001; Zatwierdzony przypadek użycia; każda funkcja AI; wpis decyzyjny
- Wiersz 3: AI-CTRL-002; Dane posiadają wymagany readiness; kontekst AI; test
- Wiersz 4: AI-CTRL-003; Tenant-safe retrieval; AI na danych klienta; test izolacji
- Wiersz 5: AI-CTRL-004; Human oversight; działania istotne; test procesu
- Wiersz 6: AI-CTRL-005; Brak sekretów w AI; wszystkie funkcje AI; test i audyt
- Wiersz 7: AI-CTRL-006; Ocena jakości; przed Gate S3; raport
- Wiersz 8: AI-CTRL-007; Ocena dostawcy; zewnętrzny model; rejestr dostawcy
- Wiersz 9: AI-CTRL-008; Kontrolowana retencja promptów i wyników; AI; polityka
- Wiersz 10: AI-CTRL-009; Brak trenowania bez osobnej decyzji; dane klientów; warunki umowne

## 60. Kontrole incydentowe

Tabela:
- Wiersz 1: ID; Kontrola; Zakres; Dowód
- Wiersz 2: INC-CTRL-001; Rejestr incydentów; od Gate S1; rejestr
- Wiersz 3: INC-CTRL-002; Klasyfikacja wpływu; każdy incydent; karta incydentu
- Wiersz 4: INC-CTRL-003; Runbook incydentowy; przed Gate S2; zatwierdzony runbook
- Wiersz 5: INC-CTRL-004; Zabezpieczenie dowodów; incydenty; protokół
- Wiersz 6: INC-CTRL-005; Niezależna ocena obowiązków komunikacyjnych; właściwe incydenty; opinia
- Wiersz 7: INC-CTRL-006; Post-incident review; incydenty istotne; raport
- Wiersz 8: INC-CTRL-007; Ponowne dopuszczenie po naprawie; zakres zablokowany; test i decyzja

## CZĘŚĆ V — MIARY I RYZYKA

## 61. KPI bezpieczeństwa i prywatności

### 61.1. Dostęp

- liczba nieudanych prób logowania;

- liczba zablokowanych działań;

- liczba kont bez wymaganego MFA;

- liczba nadmiernych uprawnień;

- czas odebrania dostępu;

- liczba użyć dostępu awaryjnego.

### 61.2. Izolacja tenantów

- liczba wykrytych naruszeń;

- liczba nieudanych testów;

- liczba błędów przypisania;

- liczba cross-tenant prób zablokowanych;

- czas naprawy.

### 61.3. Sekrety

- liczba ujawnionych sekretów;

- czas rotacji;

- liczba sekretów w logach;

- liczba nieużywanych aktywnych tokenów;

- liczba tokenów nieunieważnionych po odłączeniu.

### 61.4. Prywatność

- liczba kategorii bez zatwierdzonej retencji;

- liczba procesów bez mapy przepływów;

- liczba niezamkniętych żądań;

- czas wykonania usunięcia;

- liczba dostawców bez zatwierdzonej oceny.

### 61.5. Backup i restore

- skuteczność testów restore;

- rzeczywisty czas restore;

- zakres utraconych danych;

- liczba niezgodności po reconciliation;

- liczba przywróconych rekordów podlegających wcześniejszemu usunięciu.

### 61.6. Incydenty

- liczba incydentów;

- czas wykrycia;

- czas ograniczenia;

- czas zamknięcia;

- liczba tenantów;

- koszt;

- liczba powtórzeń tej samej przyczyny.

### 61.7. AI

- liczba wyników opartych na niegotowych danych;

- liczba prób cross-tenant retrieval;

- liczba interwencji człowieka;

- liczba odrzuconych rekomendacji;

- liczba incydentów AI;

- koszt per przypadek użycia;

- wynik testów jakości.

## 62. Główne ryzyka

### 62.1. Koncentracja odpowiedzialności

Ryzyko: ta sama osoba tworzy kontrolę, testuje ją i zatwierdza.

Reakcja: niezależna weryfikacja przed krytycznymi bramami.

### 62.2. Dostęp między tenantami

Ryzyko: ujawnienie danych innego klienta.

Reakcja: wielowarstwowa izolacja, testy negatywne, natychmiastowa blokada przy podejrzeniu.

### 62.3. Przejęcie konta uprzywilejowanego

Ryzyko: szeroki dostęp do systemu i danych.

Reakcja: MFA, najmniejsze uprawnienia, audyt, ograniczenie codziennego użycia.

### 62.4. Wycieki sekretów

Ryzyko: przejęcie integracji albo infrastruktury.

Reakcja: write-only, Secret Store, brak logowania, rotacja.

### 62.5. Nieskuteczne usunięcie

Ryzyko: dane pozostają w kopiach, eksportach albo systemach zależnych.

Reakcja: pełna procedura i dowód.

### 62.6. Restore przywracający usunięte dane

Ryzyko: naruszenie zobowiązań i prywatności.

Reakcja: rejestr usunięć i reconciliation.

### 62.7. Backup bez możliwości odtworzenia

Ryzyko: pozorna ciągłość działania.

Reakcja: rzeczywiste testy restore.

### 62.8. Nieprzygotowanie na incydent

Ryzyko: opóźniona reakcja, utrata dowodów i błędna komunikacja.

Reakcja: runbook, monitoring, rejestr i niezależna ocena prawna.

### 62.9. Nadmierny dostęp Supportu

Ryzyko: niekontrolowany dostęp do wielu klientów.

Reakcja: dostęp czasowy, zakresowy i audytowany.

### 62.10. Ujawnienie danych przez AI

Ryzyko: kontekst albo retrieval zawiera dane innego tenantu.

Reakcja: Gate S3 i tenant-safe retrieval.

### 62.11. AI wykorzystujące błędne dane

Ryzyko: rekomendacja oparta na partial, stale albo invalid KPI.

Reakcja: kontrola readiness i jawne ograniczenia.

### 62.12. Zależność od dostawcy

Ryzyko: dostawca zmienia warunki, traci dane albo przestaje świadczyć usługę.

Reakcja: rejestr dostawców, eksport, plan wyjścia i ocena krytyczności.

### 62.13. Niedostępność jednoosobowego właściciela

Ryzyko: brak reakcji na incydent albo brak możliwości restore.

Reakcja: plan zastępstwa przed skalowaniem.

## 63. Decyzje warunkowe dokumentu

### 63.1. RTO i RPO

Odwołanie: DEC-SEC-007
Status: warunkowa
Obowiązująca reguła: każdy pilotaż posiada wewnętrzne cele wpisane do karty pilotażu; nie stanowią one SLA
Warunek ponownej oceny: przed przyjęciem zobowiązania umownego
Wymagany rezultat: przetestowane i zatwierdzone RTO oraz RPO

### 63.2. Okresy retencji

Status: warunkowa
Obowiązująca reguła: przed pobraniem danych każda kategoria posiada okres albo zdarzenie kończące retencję; wartości są wpisywane do karty pilotażu i dokumentów umownych
Warunek ponownej oceny: po pierwszym pilotażu i przed abonamentem
Wymagany rezultat: zatwierdzony standard retencji per kategoria danych

### 63.3. Zakres przechowywania logów

Status: warunkowa
Obowiązująca reguła: logi przechowuje się tylko w zakresie niezbędnym do bezpieczeństwa, operacji i zobowiązań; okres jest ustalany per kategoria
Warunek ponownej oceny: po pomiarze potrzeb operacyjnych i ocenie prawnej
Wymagany rezultat: zatwierdzona macierz retencji logów

### 63.4. Zobowiązania SLA

Status: warunkowa
Obowiązująca reguła: PapaData nie oferuje gwarantowanego SLA przed wykonaniem testów i oceną kosztu
Warunek ponownej oceny: przed ofertą zawierającą SLA
Wymagany rezultat: zatwierdzone poziomy, wyłączenia i odpowiedzialność

### 63.5. AI na danych klientów

Status: warunkowa
Obowiązująca reguła: AI może zostać aktywowane dopiero po Gate S3
Warunek ponownej oceny: po testach jakości, tenant isolation i prywatności
Wymagany rezultat: osobna decyzja dopuszczająca konkretny przypadek użycia

## 64. Traceability decyzji i wymagań

Tabela:
- Wiersz 1: Obszar; Decyzje; Wymagania
- Wiersz 2: Niezależna kontrola; DEC-GOV-002; REQ-GOV-002
- Wiersz 3: Tenant isolation; DEC-SEC-001, DEC-DAT-007; REQ-SEC-001
- Wiersz 4: Autoryzacja serwerowa; DEC-SEC-001; REQ-SEC-002
- Wiersz 5: MFA; DEC-SEC-002; REQ-SEC-003
- Wiersz 6: Sekrety; DEC-SEC-001; REQ-SEC-004
- Wiersz 7: Threat model; DEC-GOV-002; REQ-SEC-005
- Wiersz 8: Backup i restore; DEC-SEC-003; REQ-SEC-006
- Wiersz 9: Usunięcia po restore; DEC-SEC-004; REQ-SEC-007
- Wiersz 10: Usuwanie danych; DEC-SEC-006; REQ-SEC-008
- Wiersz 11: Pseudonimizacja; DEC-SEC-005; REQ-SEC-009
- Wiersz 12: AI jako wsparcie; DEC-AI-001; REQ-AI-001
- Wiersz 13: Tenant-safe retrieval; DEC-AI-002; REQ-AI-002
- Wiersz 14: Human oversight; DEC-AI-003; REQ-AI-003
- Wiersz 15: Brama AI; DEC-PRD-005; REQ-AI-004
- Wiersz 16: RTO i RPO; DEC-SEC-007; BCP-CTRL-005

## 65. Kryteria dopuszczenia danych klienta

Dane rzeczywistego klienta mogą zostać dopuszczone, jeżeli:

1. określono cel;

1. określono rolę stron;

1. zatwierdzono zakres;

1. zastosowano minimalizację;

1. istnieje tenant i workspace;

1. autoryzacja działa po stronie zaufanej;

1. izolacja tenantów została przetestowana;

1. konta uprzywilejowane posiadają MFA;

1. sekrety są chronione;

1. istnieje threat model;

1. istnieje procedura incydentowa;

1. istnieje retencja;

1. istnieje procedura usunięcia;

1. istnieje plan backupu;

1. wykonano test restore;

1. restore respektuje usunięcia;

1. dostęp Supportu jest kontrolowany;

1. dostawcy zostali ocenieni;

1. wykonano wymaganą weryfikację niezależną;

1. Artur Wiśniewski zatwierdził bramę.

## 66. Kryteria dopuszczenia AI

AI może korzystać z danych klienta, jeżeli:

1. określono przypadek użycia;

1. określono cel;

1. określono dostawcę;

1. określono kategorie danych;

1. dane są minimalizowane;

1. retrieval jest tenant-safe;

1. readiness jest kontrolowany;

1. źródła i ograniczenia są dostępne;

1. sekrety nie trafiają do kontekstu;

1. istnieje human oversight;

1. wynik jest audytowalny;

1. retencja promptów i wyników jest określona;

1. dostawca został oceniony;

1. wykonano testy jakości;

1. wykonano testy izolacji;

1. wykonano niezależną ocenę bezpieczeństwa i prywatności;

1. wydano osobną decyzję dopuszczającą.

## 67. Kryteria gotowości do skalowania

Bezpieczeństwo i prywatność są gotowe do skalowania, jeżeli:

1. kontrole posiadają właścicieli;

1. testy są powtarzalne;

1. uprawnienia są regularnie przeglądane;

1. tenant isolation posiada niezależny dowód;

1. incydenty posiadają runbooki;

1. backup i restore są regularnie testowane;

1. RTO i RPO są zmierzone;

1. dostawcy są kontrolowani;

1. Support posiada ograniczony model dostępu;

1. AI posiada oddzielną bramę;

1. retencja i usuwanie są powtarzalne;

1. istnieje plan zastępstwa właściciela;

1. istnieje zdolność obsługi większej liczby tenantów;

1. znany jest koszt wymaganych kontroli;

1. ryzyko rezydualne zostało zatwierdzone.

## 68. Kryteria jakości dokumentu

Dokument spełnia swoją funkcję, jeżeli:

1. rozdziela bezpieczeństwo, prywatność, prawo, AI i ciągłość działania;

1. opisuje jednoosobowe governance jako przejściowe;

1. wskazuje niezależne bramy weryfikacji;

1. tenant isolation jest wymogiem bezwzględnym;

1. sama kolumna tenantId nie jest uznawana za wystarczającą;

1. MFA jest obowiązkowe dla kont uprzywilejowanych;

1. sekrety są write-only;

1. dane są minimalizowane;

1. pseudonimizacja nie jest utożsamiana z anonimizacją;

1. retencja jest określana per kategoria;

1. istnieje procedura usunięcia;

1. backup wymaga restore;

1. restore respektuje usunięcia;

1. RTO i RPO mają status warunkowy;

1. istnieje proces incydentowy;

1. dostawcy są oceniani;

1. AI nie jest źródłem prawdy;

1. retrieval AI jest tenant-safe;

1. działania istotne wymagają kontroli człowieka;

1. dokument nie sugeruje istniejącej implementacji.

## 69. Dokumenty powiązane

1. Dokument 1 — Dokumentacja biznesowo-produktowa PapaData
1. Określa wartość, zakres, MVP i nadrzędne bramy biznesowe.

1. Dokument 2 — Rejestr decyzji i wymagań biznesowych
1. Określa status i obowiązywanie decyzji bezpieczeństwa, prywatności i AI.

1. Dokument 3 — Kontrakt danych, stanów i KPI
1. Określa dane, lineage, readiness, source authority i zasady wykorzystania danych przez AI.

1. Dokument 4 — Integracje i gotowość operacyjna
1. Określa connect, synchronizację, recovery, monitoring i gotowość providerów.

1. Dokument 5 — Pierwszy pion produktowy i płatny pilotaż
1. Określa proces pilotażu i wykorzystuje bramy bezpieczeństwa jako warunki rozpoczęcia.

1. Dokument 6 — Model komercyjny i unit economics
1. Określa koszt kontroli, zobowiązania handlowe, płatności i bramy skalowania.

## 70. Zatwierdzenie dokumentu

Dokument ustanawia obowiązujący model bezpieczeństwa, prywatności i AI Governance PapaData.

Właściciel i osoba zatwierdzająca: Artur Wiśniewski
Data obowiązywania: 18 lipca 2026 roku
Wersja: 2.0

Dokument nie stanowi dowodu wdrożenia ani prawnej deklaracji zgodności.

Dopuszczenie danych klienta, produkcyjnej sprzedaży, wykorzystania AI, zobowiązań SLA albo skalowania wymaga spełnienia właściwych bram, przedstawienia wymaganych dowodów oraz niezależnej weryfikacji w obszarach wskazanych w dokumencie.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
