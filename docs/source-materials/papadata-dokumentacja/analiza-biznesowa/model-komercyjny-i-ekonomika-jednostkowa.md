# Model komercyjny i ekonomika jednostkowa

## Metryka dokumentu

Dokument: Model komercyjny i unit economics PapaData
Numer dokumentu: 6
Wersja: 1.0
Status: Finalny dokument biznesowo-finansowy
Data obowiązywania: 18 lipca 2026 roku
Właściciel dokumentu: Artur Wiśniewski
Właściciel biznesowy: Artur Wiśniewski
Właściciel komercyjny: Artur Wiśniewski
Właściciel finansowy: Artur Wiśniewski
Właściciel produktu: Artur Wiśniewski
Właściciel operacyjny: Artur Wiśniewski
Model odpowiedzialności: jednoosobowe governance przejściowe
Charakter projektu: projekt tworzony od podstaw

Zakres dokumentu:

- sposób generowania przychodu;

- model płatnego pilotażu;

- opakowanie wartości produktowej;

- zasady pricingu;

- jednostki rozliczeniowe;

- limity i overage;

- entitlements;

- koszty bezpośrednie;

- koszt onboardingu;

- koszt integracji;

- koszt danych, AI, Supportu i pracy ręcznej;

- marża jednostkowa;

- minimalna opłacalna cena;

- break-even;

- billing;

- płatności;

- dunning;

- refundy i chargebacki;

- retencja komercyjna;

- zakończenie współpracy;

- warunki przejścia z pilotażu na abonament;

- bramy komercyjne skalowania.

Poza zakresem:

- projekt interfejsu płatności;

- wybór konkretnego operatora płatniczego;

- szczegółowa konfiguracja systemu billingowego;

- finalny publiczny cennik;

- porada prawna lub podatkowa;

- ostateczna klasyfikacja VAT;

- szczegółowa architektura techniczna;

- szczegółowy kontrakt bezpieczeństwa;

- formuły KPI biznesowych niezwiązanych z ekonomiką jednostkową.

## 1. Cel dokumentu

Dokument określa, w jaki sposób PapaData ma:

- generować przychód;

- przekształcać wartość produktu w ofertę handlową;

- wyceniać płatne pilotaże;

- rozliczać użycie produktu;

- chronić marżę;

- mierzyć koszt pojedynczego klienta;

- kontrolować pracę ręczną;

- ograniczać niekontrolowane przekroczenia kosztów;

- podejmować decyzje o skalowaniu;

- zarządzać przejściem z pilotażu do abonamentu;

- obsługiwać zakończenie współpracy.

Dokument ma zapewnić odpowiedź na pytania:

1. Za co klient płaci?

1. Jaka część ceny dotyczy wartości, a jaka złożoności wdrożenia?

1. Jak rośnie cena wraz ze wzrostem użycia?

1. Jakie koszty generuje konkretny klient?

1. Jakie procesy mogą obniżyć marżę?

1. Kiedy pilotaż jest ekonomicznie uzasadniony?

1. Kiedy klient może przejść na abonament?

1. Kiedy PapaData może rozpocząć skalowanie?

1. Kiedy należy ograniczyć albo zakończyć nierentowny zakres?

Dokument opisuje wymagany model docelowy. Nie potwierdza istnienia systemu płatności, cennika, abonamentów, pakietów ani mechanizmu meteringu.

Odwołanie: DEC-DOC-001.

## 2. Pozycja dokumentu w pakiecie

Dokument 6 jest źródłem prawdy dla:

- modelu generowania przychodu;

- struktury opłat;

- zasad wyceny pilotażu;

- modelu pakietów;

- jednostek handlowych;

- jednostek meteringu;

- zasad limitów;

- zasad overage;

- kategorii COGS;

- modelu marży;

- Cost Observability;

- kryteriów rentowności;

- bram komercyjnego skalowania;

- zasad płatności i zakończenia współpracy.

Dokument 6 nie jest źródłem prawdy dla:

- statusu decyzji — źródłem jest Dokument 2;

- definicji danych i KPI — źródłem jest Dokument 3;

- gotowości integracji — źródłem jest Dokument 4;

- procesów pilotażu — źródłem jest Dokument 5;

- bezpieczeństwa, prywatności i retencji danych — źródłem jest Dokument 7.

Najważniejsze decyzje powiązane:

- DEC-PIL-001 — płatny model pilotażu;

- DEC-COM-001 — hybrydowy model komercyjny;

- DEC-COM-002 — Cost Observability jako brama skalowania;

- DEC-COM-003 — ceny i progi wymagają walidacji;

- DEC-COM-004 — pilotaż nie jest bezpłatnym testem;

- DEC-COM-005 — brak skalowania bez unit economics;

- DEC-DAT-009 — zamówienia kanoniczne mogą być jednostką meteringu;

- DEC-MKT-004 — progi kwalifikacji ICP wymagają walidacji;

- DEC-PRD-003 — etapowe uruchamianie produktu.

## 3. Zasady nadrzędne

### 3.1. Cena wynika jednocześnie z wartości i kosztu

Cena nie może być ustalana wyłącznie na podstawie kosztu technicznego.

Nie może również ignorować kosztu dostarczenia usługi.

Cena powinna uwzględniać:

- wartość problemu dla klienta;

- segment klienta;

- pion wartości;

- zakres danych;

- liczbę źródeł;

- wolumen;

- długość historii;

- częstotliwość synchronizacji;

- złożoność onboardingu;

- poziom Supportu;

- koszt przetwarzania;

- koszt integracji;

- koszt deduplikacji;

- koszt AI;

- wymagania bezpieczeństwa;

- wymagany poziom obsługi operacyjnej;

- ryzyko realizacyjne.

### 3.2. Pilotaż jest płatny

Każdy pilotaż posiada:

- konkretną cenę;

- walutę;

- termin płatności;

- zakres;

- czas trwania;

- ograniczenia;

- kryteria sukcesu;

- warunek dalszej współpracy.

Pilotaż nie może być automatycznie bezpłatny.

Odwołanie: DEC-PIL-001, DEC-COM-004.

### 3.3. GMV nie jest jedyną podstawą ceny

GMV może:

- pomagać oceniać skalę klienta;

- wspierać kwalifikację;

- przybliżać potencjalną wartość rozwiązania;

- wpływać na złożoność danych.

GMV nie odzwierciedla bezpośrednio:

- liczby źródeł;

- liczby przetworzonych rekordów;

- kosztu synchronizacji;

- kosztu AI;

- kosztu Supportu;

- kosztu pracy ręcznej;

- trudności integracji.

Cena oparta wyłącznie na GMV mogłaby być odbierana jako kara za wzrost klienta.

### 3.4. Klient płaci za pion wartości

Podstawową jednostką oferty jest pion rozwiązujący określony problem klienta.

Piony:

- D2C;

- marketplace;

- omnichannel.

Dodatkowe źródła, zakresy i usługi mogą rozszerzać cenę pionu.

### 3.5. Metering nie jest miarą sukcesu produktu

Jednostka technicznego użycia służy do:

- kontroli kosztu;

- limitów;

- rozliczeń;

- planowania pojemności.

Nie jest automatycznie North Star Metric.

Liczba przetworzonych zamówień kanonicznych może być jednostką meteringu, ale nie jest samodzielnym miernikiem wartości klienta.

Odwołanie: DEC-DAT-009.

### 3.6. Koszt pracy ręcznej jest częścią COGS

Do kosztu klienta należy wliczać między innymi:

- ręczny onboarding;

- ręczne mapowanie;

- manual review;

- diagnostykę;

- Support;

- rekoncyliację;

- ręczny reprocessing;

- poprawki danych;

- kontakt z providerem;

- analizę rozbieżności.

Brak ewidencji pracy ręcznej zaniża rzeczywisty koszt usługi.

### 3.7. Cost Observability zaczyna się od pierwszego pilotażu

Brak pełnych danych kosztowych nie blokuje pierwszego pilotażu.

Blokuje:

- skalowanie sprzedaży;

- publiczny self-service;

- szeroki kanał partnerski;

- finalny cennik;

- deklarowanie trwałej rentowności.

Odwołanie: DEC-COM-002.

### 3.8. Brak danych kosztowych nie jest zerem

Jeżeli koszt nie jest znany, należy oznaczyć go jako:

- niezmierzony;

- estymowany;

- częściowy;

- wymagający walidacji.

Nie wolno zastępować braku kosztu wartością zero.

## 4. Model generowania przychodu

PapaData stosuje model hybrydowy:

**opłata bazowa za pion wartości

- wliczony pakiet użycia

- opłata za dodatkowe źródła lub wolumen

- opcjonalna opłata wdrożeniowa

- opcjonalne rozszerzenia**

Odwołanie: DEC-COM-001.

### 4.1. Opłata bazowa

Opłata bazowa obejmuje dostęp do konkretnego pionu wartości w zatwierdzonym zakresie.

Może obejmować:

- jeden workspace;

- określoną liczbę użytkowników;

- określoną liczbę źródeł;

- podstawowy wolumen;

- podstawową historię;

- podstawowy zestaw KPI;

- standardową częstotliwość synchronizacji;

- podstawowy zakres Supportu.

### 4.2. Pakiet użycia

Pakiet użycia może obejmować:

- określoną liczbę przetworzonych zamówień kanonicznych;

- określoną liczbę aktywnych źródeł;

- określoną długość historii;

- określoną częstotliwość synchronizacji;

- określony poziom reprocessingu;

- określone użycie AI;

- określoną liczbę użytkowników albo workspace.

### 4.3. Opłata wdrożeniowa

Opłata wdrożeniowa może obejmować:

- kwalifikację danych;

- konfigurację;

- niestandardowe mapowanie;

- przygotowanie źródła;

- backfill;

- rekoncyliację;

- szkolenie;

- przygotowanie kontraktu KPI;

- prace związane z bezpieczeństwem;

- niestandardowe wymagania klienta.

Opłata wdrożeniowa powinna być stosowana, jeżeli onboarding wymaga pracy wykraczającej poza standardowy, powtarzalny proces.

### 4.4. Opłaty za rozszerzenia

Rozszerzenia mogą obejmować:

- dodatkowe źródła;

- dodatkowy pion;

- dłuższą historię;

- dodatkowe workspace;

- wyższą częstotliwość synchronizacji;

- większy wolumen;

- rozszerzony Support;

- niestandardowe KPI;

- dodatkowe wykorzystanie AI;

- niestandardowy kontrakt danych;

- wyższy poziom SLA po jego zatwierdzeniu;

- eksporty specjalne;

- dodatkowy reprocessing.

## 5. Opakowanie produktu

### 5.1. Pakiet D2C

Pakiet D2C obejmuje analizę sprzedaży prowadzonej przez własny sklep.

Podstawowy zakres może obejmować:

- jedno źródło D2C;

- zamówienia;

- liczbę zamówień;

- Gross Revenue;

- refundy w zakresie dostępności danych;

- podstawową gotowość danych;

- podstawowy zakres Supportu.

Możliwe rozszerzenia:

- drugi sklep;

- dodatkowa historia;

- Google Ads;

- Meta Ads;

- GA4;

- dodatkowe KPI;

- wykorzystanie AI.

### 5.2. Pakiet Marketplace

Pakiet Marketplace obejmuje analizę sprzedaży marketplace.

Podstawowy zakres może obejmować:

- Allegro direct albo BaseLinker z jednoznacznym kanałem;

- zamówienia;

- liczbę zamówień;

- Gross Revenue;

- zwroty i refundy w zakresie dostępności;

- informację o dostępności opłat;

- jawne ograniczenia marżowe.

Możliwe rozszerzenia:

- opłaty marketplace;

- dodatkowe konto marketplace;

- dodatkowy kanał;

- porównanie ofert;

- rozszerzone dane produktowe;

- marketing.

### 5.3. Pakiet Omnichannel

Pakiet Omnichannel obejmuje łączenie kilku źródeł sprzedaży.

Może być oferowany dopiero po potwierdzeniu:

- source overlap;

- source authority;

- canonicalization;

- deduplikacji;

- kontroli konfliktów;

- kosztu manual review;

- kosztu reprocessingu.

Omnichannel może posiadać wyższą cenę bazową z powodu:

- większej złożoności;

- większego ryzyka jakości;

- większego kosztu danych;

- większego kosztu utrzymania;

- potrzeby kontroli wieloźródłowej.

### 5.4. Marketing and Analytics

Rozszerzenie może obejmować:

- Google Ads;

- Meta Ads;

- GA4;

- Advertising Spend;

- wartości atrybucyjne;

- podstawowe KPI marketingowe.

Rozszerzenie nie zmienia danych atrybucyjnych w przychód transakcyjny.

## 6. Model płatnego pilotażu

### 6.1. Charakter pilotażu

Pilotaż jest ograniczonym, płatnym wdrożeniem służącym potwierdzeniu:

- jakości danych;

- wartości biznesowej;

- gotowości klienta do zapłaty;

- kosztu dostarczenia;

- potencjału dalszej współpracy.

### 6.2. Składniki ceny pilotażu

Cena pilotażu może składać się z:

1. opłaty przygotowawczej;

1. opłaty za realizację pilotażu;

1. opłaty za niestandardową integrację albo mapowanie;

1. opłaty za rozszerzony zakres danych;

1. opłaty za dodatkowy Support;

1. opłaty za dodatkowy okres lub przedłużenie.

### 6.3. Obowiązkowe parametry oferty pilotażowej

Każda oferta musi zawierać:

- cenę;

- walutę;

- informację, czy cena jest netto czy brutto;

- zasady VAT wymagające potwierdzenia;

- termin płatności;

- okres realizacji;

- zakres danych;

- integracje;

- KPI;

- limit pracy niestandardowej;

- zakres Supportu;

- warunki przedłużenia;

- warunek przejścia na abonament;

- warunki rozwiązania;

- zasady retencji i usunięcia danych.

### 6.4. Cena pilotażu

W niniejszym dokumencie nie ustanawia się jednej kwoty obowiązującej dla wszystkich pilotaży.

Każdy pilotaż musi jednak posiadać konkretną cenę przed rozpoczęciem.

Cena jest ustalana na podstawie:

- pionu;

- liczby źródeł;

- zakresu historii;

- wolumenu;

- przewidywanego czasu onboardingu;

- ryzyka danych;

- wymaganego Supportu;

- wymagań bezpieczeństwa;

- przewidywanego kosztu;

- wartości problemu klienta.

### 6.5. Status ceny docelowej

Docelowy publiczny cennik, minimalna opłacalna cena oraz progi marży pozostają parametrami wymagającymi walidacji na płatnych pilotażach.

Odwołanie do decyzji: DEC-COM-003
Status: warunkowa
Warunek ponownej oceny: po uzyskaniu rzeczywistych danych kosztowych i cenowych
Wymagany rezultat: zatwierdzony cennik oraz minimalna opłacalna cena

## 7. Kwalifikacja ekonomiczna klienta

### 7.1. Kryteria pozytywne

Klient jest ekonomicznie odpowiedni do pilotażu, jeżeli:

- posiada istotny problem;

- posiada obsługiwane źródło;

- jest gotowy zapłacić;

- akceptuje ograniczony zakres;

- posiada osobę odpowiedzialną po swojej stronie;

- jest gotowy uczestniczyć w walidacji;

- potencjalna wartość uzasadnia koszt onboardingu;

- zakres nie wymaga niekontrolowanej pracy niestandardowej.

### 7.2. Kryteria ryzyka

Ryzyko ekonomiczne zwiększa:

- duża liczba niestandardowych źródeł;

- nieuporządkowane dane;

- brak właściciela klienta;

- brak jednoznacznego problemu;

- wymaganie wszystkich integracji;

- wymaganie omnichannel jako pierwszego zakresu;

- duży historyczny backfill;

- częste reprocessingi;

- wysoka liczba przypadków manual review;

- wysoki poziom Supportu;

- oczekiwanie rozbudowanego SLA;

- brak gotowości do zapłaty.

### 7.3. Progi ICP

Twarde progi:

- GMV;

- liczby zamówień;

- liczby źródeł;

- budżetu reklamowego;

- liczby użytkowników

nie są ustanawiane arbitralnie przed uzyskaniem danych z pierwszych pilotaży.

Do tego czasu podstawą kwalifikacji są problem, gotowość organizacyjna, źródła, wartość i gotowość do zapłaty.

Odwołanie: DEC-MKT-004.

## 8. Jednostki rozliczeniowe

### 8.1. Jednostka wartości

Podstawową jednostką wartości jest pion produktowy rozwiązujący określony problem klienta.

### 8.2. Jednostki technicznego meteringu

Metering może obejmować:

- przetworzone zamówienia kanoniczne;

- aktywne connection;

- aktywne źródła;

- liczbę synchronizacji;

- liczbę rekordów;

- wolumen przechowywanych danych;

- długość historii;

- reprocessing;

- deduplikację;

- wykorzystanie AI;

- liczbę workspace;

- liczbę użytkowników;

- poziom Supportu.

### 8.3. Zamówienie kanoniczne

Zamówienie kanoniczne jest preferowaną jednostką wolumenu sprzedażowego, ponieważ:

- reprezentuje fakt po canonicalization;

- ogranicza wielokrotne naliczanie tych samych danych;

- jest powiązane z realnym kosztem przetwarzania;

- może być rozliczane niezależnie od liczby rekordów źródłowych.

Jedno zamówienie obecne w kilku źródłach nie powinno być wielokrotnie naliczane jako kilka zamówień kanonicznych.

### 8.4. Jednostki niezalecane jako jedyna podstawa

Nie należy opierać całego modelu wyłącznie na:

- GMV;

- liczbie logowań;

- liczbie dashboardów;

- liczbie wygenerowanych komunikatów;

- liczbie rekordów źródłowych bez deduplikacji;

- liczbie wywołań AI bez związku z wartością.

## 9. Entitlements

Entitlement określa, do jakiego zakresu klient posiada prawo handlowe.

Może obejmować:

- pion;

- providerów;

- liczbę connection;

- liczbę workspace;

- użytkowników;

- zakres historii;

- częstotliwość synchronizacji;

- wolumen;

- zestaw KPI;

- AI;

- eksport;

- poziom Supportu;

- reprocessing;

- SLA.

Entitlement nie jest tym samym co uprawnienie bezpieczeństwa.

Klient może posiadać techniczną możliwość wykonania operacji, ale nie mieć jej w zakupionym planie.

Analogicznie zakupione entitlement nie zastępuje autoryzacji użytkownika.

## 10. Limity

### 10.1. Typy limitów

Należy rozróżniać:

- limit handlowy;

- limit techniczny;

- limit bezpieczeństwa;

- limit operacyjny;

- limit kosztowy;

- limit providera.

### 10.2. Limit handlowy

Wynika z planu albo umowy.

Przykłady:

- liczba źródeł;

- wolumen zamówień;

- liczba użytkowników;

- długość historii;

- wykorzystanie AI.

### 10.3. Limit techniczny

Chroni stabilność produktu.

Nie musi być równy limitowi handlowemu.

### 10.4. Limit bezpieczeństwa

Ogranicza działania mogące zwiększyć ryzyko, takie jak:

- duży eksport;

- masowy reprocessing;

- wysoka częstotliwość operacji;

- nadmierny dostęp Supportu.

### 10.5. Limit kosztowy

Chroni przed niekontrolowanym wzrostem kosztu.

Może dotyczyć:

- AI;

- reprocessingu;

- backfill;

- Supportu;

- manual review;

- dodatkowych synchronizacji.

### 10.6. Zasada informowania

Przekroczenie limitu nie powinno prowadzić do niejawnej utraty danych albo zablokowania krytycznych operacji bez określonej reguły.

Należy wskazać:

- który limit został osiągnięty;

- jaki jest wpływ;

- co pozostaje dostępne;

- jakie działanie jest wymagane;

- czy powstaje opłata dodatkowa.

## 11. Overage

### 11.1. Definicja

Overage oznacza użycie przekraczające pakiet zawarty w cenie podstawowej.

### 11.2. Możliwe sposoby obsługi

- opłata jednostkowa;

- dodatkowy pakiet;

- podniesienie planu;

- kontrolowane ograniczenie nowego użycia;

- kontakt handlowy;

- czasowa tolerancja.

### 11.3. Zasady

Overage musi posiadać:

- jednostkę;

- cenę;

- sposób pomiaru;

- okres rozliczeniowy;

- regułę zaokrąglania;

- próg informowania;

- spending cap, jeśli stosowany;

- wpływ na działanie produktu.

### 11.4. Bezpieczne ograniczenie

Przekroczenie limitu nie powinno automatycznie powodować:

- utraty danych;

- braku dostępu do danych wymaganych prawnie;

- niemożności wykonania eksportu końcowego;

- usunięcia danych;

- przerwania procesu bezpieczeństwa.

Może natomiast ograniczyć:

- nowe synchronizacje;

- dodatkowy backfill;

- dodatkowe źródła;

- dodatkowe AI;

- niestandardowy reprocessing.

## 12. Spending cap

Spending cap ma chronić klienta przed nieoczekiwanym kosztem.

Może obejmować:

- miesięczny koszt overage;

- użycie AI;

- dodatkowy Support;

- reprocessing;

- niestandardowe prace;

- wolumen danych.

Po osiągnięciu spending cap obowiązuje jedna z zatwierdzonych reguł:

- zatrzymanie dodatkowego użycia;

- wymaganie akceptacji;

- przejście na wyższy pakiet;

- indywidualna decyzja handlowa.

Spending cap nie może być stosowany w sposób powodujący naruszenie integralności albo bezpieczeństwa danych.

## 13. Kategorie kosztów

### 13.1. Koszty infrastruktury

- obliczenia;

- bazy danych;

- storage;

- kolejki;

- cache;

- transfer;

- backup;

- monitoring;

- logowanie;

- narzędzia bezpieczeństwa.

### 13.2. Koszty danych

- pobieranie;

- normalizacja;

- canonicalization;

- deduplikacja;

- rekoncyliacja;

- reprocessing;

- agregacje;

- przechowywanie historii;

- eksporty.

### 13.3. Koszty integracji

- utworzenie adaptera;

- utrzymanie adaptera;

- zmiany API;

- testy;

- konfiguracja;

- diagnostyka;

- wsparcie providera;

- obsługa incydentów.

### 13.4. Koszty AI

- użycie modelu;

- embeddingi;

- retrieval;

- przechowywanie kontekstu;

- ocena jakości;

- moderacja;

- monitoring;

- manualna weryfikacja;

- reprocessing kontekstu.

### 13.5. Koszty Supportu

- zgłoszenia;

- diagnostyka;

- kontakt z klientem;

- wykonywanie runbooków;

- eskalacje;

- rozbieżności danych;

- odzyskiwanie dostępu.

### 13.6. Koszty onboardingu

- kwalifikacja;

- warsztaty;

- konfiguracja;

- connect;

- mapping;

- backfill;

- walidacja;

- szkolenie;

- przygotowanie KPI;

- dokumentacja klienta.

### 13.7. Koszty pracy ręcznej

- manual review;

- korekty;

- deduplikacja ręczna;

- rozwiązywanie konfliktów;

- ręczne przeliczenia;

- niestandardowe raporty;

- ręczne eksporty.

### 13.8. Koszty bezpieczeństwa i zgodności

- ekspertyzy;

- audyty;

- testy penetracyjne;

- narzędzia bezpieczeństwa;

- obsługa incydentów;

- dokumentacja prawna;

- zarządzanie procesorami;

- testy backupu i restore.

### 13.9. Koszty płatności

- prowizja operatora;

- refundy;

- chargebacki;

- obsługa płatności;

- windykacja;

- ryzyko walutowe.

## 14. Klasyfikacja kosztów

### 14.1. Koszt bezpośredni

Może zostać przypisany do konkretnego klienta, workspace, providera albo procesu.

Przykłady:

- użycie AI klienta;

- dedykowany backfill;

- Support klienta;

- storage klienta;

- konkretna synchronizacja.

### 14.2. Koszt współdzielony

Dotyczy wielu klientów.

Przykłady:

- rozwój wspólnej integracji;

- monitoring platformy;

- narzędzia bezpieczeństwa;

- ogólna infrastruktura.

Koszt współdzielony wymaga zatwierdzonej reguły alokacji.

### 14.3. Koszt jednorazowy

Przykłady:

- wdrożenie klienta;

- niestandardowe mapowanie;

- migracja;

- test bezpieczeństwa dla konkretnego wymagania.

### 14.4. Koszt powtarzalny

Przykłady:

- synchronizacja;

- storage;

- Support;

- AI;

- monitoring;

- utrzymanie integracji.

### 14.5. Koszt zmienny

Rośnie wraz z użyciem.

### 14.6. Koszt stały

Nie zależy bezpośrednio od pojedynczego klienta w krótkim okresie.

## 15. Cost Observability

### 15.1. Minimalny zakres

Koszt powinien być możliwy do obserwacji co najmniej:

- per klient;

- per tenant;

- per workspace;

- per pion;

- per provider;

- per connection;

- per dataset;

- per synchronizacja;

- per backfill;

- per reprocessing;

- per deduplikacja;

- per proces AI;

- per zgłoszenie Supportu;

- per manual review.

### 15.2. Minimalne metryki

Należy mierzyć:

- czas pracy ręcznej;

- liczbę wywołań API;

- czas obliczeń;

- wolumen storage;

- transfer;

- liczbę rekordów;

- liczbę zamówień kanonicznych;

- liczbę retry;

- liczbę reprocessingów;

- liczbę przypadków manual review;

- użycie AI;

- liczbę zgłoszeń;

- czas Supportu.

### 15.3. Poziom wiarygodności kosztu

Każda wartość kosztowa powinna posiadać klasyfikację:

- measured — zmierzona;

- allocated — alokowana;

- estimated — oszacowana;

- incomplete — niepełna;

- unknown — nieznana.

### 15.4. Koszt nieznany

Koszt unknown nie jest zerem.

Powinien powodować:

- obniżenie wiarygodności marży;

- obowiązek uzupełnienia pomiaru;

- blokadę skalowania, jeżeli dotyczy istotnej kategorii.

## 16. Unit economics

### 16.1. Przychód klienta

Przychód przypisany do klienta może obejmować:

- opłatę za pilotaż;

- opłatę wdrożeniową;

- abonament;

- overage;

- dodatki;

- usługi niestandardowe;

- rozszerzony Support.

### 16.2. COGS klienta

COGS klienta obejmuje bezpośrednie koszty dostarczenia usługi, w szczególności:

- infrastrukturę;

- dane;

- integracje;

- AI;

- Support;

- manual review;

- płatności;

- operacje;

- koszt niezbędnych usług zewnętrznych.

### 16.3. Marża brutto klienta

Marża brutto kwotowa = przychód klienta – COGS klienta

Marża brutto procentowa = marża brutto kwotowa / przychód klienta

Jeżeli przychód wynosi zero albo dane kosztowe są niekompletne, wynik wymaga właściwego oznaczenia i nie może być przedstawiany jako pełna marża.

### 16.4. Koszt onboardingu

Koszt onboardingu obejmuje wszystkie działania do momentu osiągnięcia uzgodnionej gotowości klienta.

Może zostać:

- w całości pokryty opłatą wdrożeniową;

- częściowo amortyzowany w abonamencie;

- potraktowany jako koszt pozyskania klienta;

- pokryty przez minimalny okres umowy.

Sposób rozliczenia musi być jawny.

### 16.5. Contribution margin

Contribution margin może uwzględniać dodatkowo koszty zmienne związane bezpośrednio z obsługą klienta.

Zakres kosztów w formule musi być zatwierdzony i spójny między klientami.

### 16.6. Koszt utrzymania providera

Koszt providera powinien obejmować:

- utrzymanie adaptera;

- zmiany API;

- monitoring;

- incydenty;

- Support;

- testy regresji;

- dokumentację;

- bezpieczeństwo.

Koszt powinien być analizowany także niezależnie od konkretnego klienta.

### 16.7. Rentowność pionu

Rentowność należy mierzyć osobno dla:

- D2C;

- marketplace;

- omnichannel;

- marketing and analytics.

Piony mogą posiadać różny:

- koszt onboardingu;

- koszt danych;

- koszt Supportu;

- poziom manual review;

- poziom ryzyka;

- potencjał cenowy.

## 17. Minimalna opłacalna cena

Minimalna opłacalna cena powinna uwzględniać:

- oczekiwany COGS;

- udział kosztów współdzielonych;

- koszt onboardingu;

- ryzyko odchyleń;

- oczekiwaną marżę;

- koszt płatności;

- koszt Supportu;

- koszt utrzymania integracji;

- przewidywane użycie;

- wymagany poziom bezpieczeństwa.

Formuła ogólna:

minimalna opłacalna cena = oczekiwany koszt jednostkowy + wymagany bufor ryzyka + wymagana marża

Dokładna formuła i próg muszą zostać zatwierdzone po uzyskaniu danych z płatnych pilotaży.

## 18. Break-even klienta

### 18.1. Definicja

Break-even klienta następuje, gdy skumulowany przychód z klienta pokrywa:

- koszt pozyskania;

- koszt onboardingu;

- skumulowany COGS;

- inne przypisane koszty bezpośrednie.

### 18.2. Pomiar

Należy mierzyć:

- miesiąc pozyskania;

- koszt onboardingu;

- przychód jednorazowy;

- przychód powtarzalny;

- miesięczny COGS;

- skumulowaną marżę;

- miesiąc osiągnięcia break-even.

### 18.3. Zastosowanie

Break-even powinien wpływać na:

- minimalny okres umowy;

- wysokość opłaty wdrożeniowej;

- rabaty;

- zakres bezpłatnych prac;

- decyzję o przedłużeniu nierentownego klienta.

## 19. Rentowność pilotażu

Pilotaż nie musi osiągać docelowej marży produktu skalowanego.

Musi jednak dostarczyć wiarygodną informację:

- ile kosztował;

- które koszty były jednorazowe;

- które koszty będą powtarzalne;

- które koszty wynikają z niedojrzałości procesu;

- jaki byłby koszt kolejnego podobnego klienta;

- czy możliwe jest obniżenie kosztu;

- czy klient zaakceptuje cenę pokrywającą koszt docelowy.

Pilotaż może być zaakceptowany jako inwestycja walidacyjna, jeśli:

- decyzja jest jawna;

- znany jest maksymalny koszt;

- określono wiedzę, która ma zostać pozyskana;

- określono kryterium zakończenia.

## 20. Marża docelowa

W niniejszym dokumencie nie ustanawia się arbitralnej docelowej wartości procentowej marży.

Docelowy próg marży musi zostać ustalony po poznaniu:

- rzeczywistego COGS;

- poziomu Supportu;

- kosztu integracji;

- kosztu AI;

- kosztu pracy ręcznej;

- gotowości klientów do zapłaty;

- kosztu pozyskania klienta;

- oczekiwanej retencji.

Do czasu zatwierdzenia progu każdy klient musi posiadać:

- zmierzony albo oszacowany COGS;

- przychód;

- marżę kwotową;

- marżę procentową;

- poziom wiarygodności kalkulacji.

## 21. Rabaty

Rabaty powinny posiadać:

- uzasadnienie;

- czas obowiązywania;

- zakres;

- wpływ na marżę;

- właściciela decyzji;

- warunek zakończenia.

Dopuszczalne uzasadnienia:

- przedpłata;

- dłuższy okres umowy;

- ograniczony zakres;

- wartość referencyjna;

- udział w walidacji;

- niższy koszt obsługi;

- strategiczny segment.

Nie należy udzielać rabatu bez oceny:

- COGS;

- kosztu onboardingu;

- break-even;

- ryzyka rozszerzania zakresu.

## 22. Usługi niestandardowe

Usługa niestandardowa obejmuje pracę wykraczającą poza zatwierdzony pakiet.

Przykłady:

- nowy provider;

- niestandardowy mapping;

- niestandardowy KPI;

- specjalny eksport;

- nietypowa rekoncyliacja;

- rozbudowany backfill;

- dodatkowy audyt;

- dedykowany raport;

- niestandardowy poziom Supportu.

Usługa niestandardowa wymaga:

- opisu;

- estymacji kosztu;

- ceny;

- terminu;

- kryterium akceptacji;

- informacji, czy rezultat staje się częścią produktu wspólnego;

- oceny wpływu na utrzymanie.

## 23. Billing

### 23.1. Zdarzenie billingowe

Zdarzenie billingowe powinno zawierać:

- klienta;

- tenant;

- okres;

- plan;

- jednostkę;

- ilość;

- cenę;

- walutę;

- podstawę naliczenia;

- wersję cennika;

- źródło danych;

- status.

### 23.2. Źródło danych billingowych

Dane billingowe muszą pochodzić z kontrolowanego źródła meteringu.

Nie mogą być oparte wyłącznie na:

- danych interfejsu;

- ręcznej deklaracji bez dowodu;

- rekordach źródłowych przed deduplikacją;

- niezidentyfikowanym wolumenie.

### 23.3. Rekoncyliacja billingu

Przed wystawieniem rozliczenia należy umożliwić kontrolę:

- okresu;

- planu;

- użycia;

- overage;

- rabatów;

- korekt;

- refundów;

- podatków;

- waluty.

### 23.4. Korekta

Korekta rozliczenia musi posiadać:

- powód;

- wartość przed;

- wartość po;

- właściciela;

- dowód;

- wpływ na przychód;

- wpływ na klienta.

## 24. Płatności

### 24.1. Metody płatności

Konkretny zestaw metod płatności zostanie ustalony przed sprzedażą.

Może obejmować:

- przelew;

- płatność kartą;

- automatyczne obciążenie;

- fakturę.

### 24.2. Warunki

Każda oferta lub umowa określa:

- termin płatności;

- walutę;

- podatki;

- sposób wystawienia dokumentu;

- konsekwencje opóźnienia;

- zasady odnowienia;

- zasady zakończenia.

### 24.3. Weryfikacja prawno-podatkowa

Przed pobieraniem płatności wymagane jest niezależne potwierdzenie:

- modelu sprzedaży;

- zasad VAT;

- danych na fakturze;

- obowiązków informacyjnych;

- zasad refundów;

- zasad sprzedaży transgranicznej, jeśli dotyczy.

Odwołanie: REQ-COM-008, DEC-GOV-002.

## 25. Dunning

### 25.1. Cel

Dunning ma ograniczyć mimowolny churn i odzyskać należną płatność bez nieproporcjonalnego wpływu na dane klienta.

### 25.2. Etapy

Proces może obejmować:

1. wykrycie braku płatności;

1. powiadomienie;

1. przypomnienie;

1. ponowienie płatności;

1. okres tolerancji;

1. ograniczenie wybranych funkcji;

1. zawieszenie nowych operacji;

1. zakończenie umowy;

1. proces retencji albo usunięcia danych.

### 25.3. Bezpieczne ograniczenie

Brak płatności nie powinien powodować niekontrolowanego:

- usunięcia danych;

- utraty eksportu wymaganego umownie;

- przerwania procesu usuwania danych;

- blokady dostępu do informacji o zobowiązaniu;

- naruszenia retencji.

Może natomiast ograniczyć:

- nowe synchronizacje;

- nowe źródła;

- AI;

- reprocessing;

- dodatkowy Support;

- rozszerzenia.

## 26. Refundy

### 26.1. Zasada

Refund płatności klienta za PapaData nie jest tym samym co refund zamówienia e-commerce analizowanego przez PapaData.

### 26.2. Warunki refundu komercyjnego

Warunki refundu powinny być określone w ofercie lub umowie.

Mogą uwzględniać:

- niewykonanie uzgodnionego zakresu;

- rozwiązanie umowy;

- korektę błędnego naliczenia;

- awarię;

- ograniczenia prawne;

- indywidualne ustalenie handlowe.

### 26.3. Wpływ na ekonomikę

Refund musi być przypisany do:

- klienta;

- okresu;

- przyczyny;

- przychodu;

- marży;

- wskaźników pilotażu;

- analizy churn.

## 27. Chargebacki

Chargeback wymaga:

- rejestracji;

- zabezpieczenia dowodów;

- przypisania kosztu;

- oceny przyczyny;

- oceny ryzyka klienta;

- korekty przychodu;

- analizy wpływu na proces płatności.

Koszt chargebacku jest elementem kosztu płatności i ryzyka komercyjnego.

## 28. Retencja komercyjna

Retencja komercyjna oznacza zdolność utrzymania klienta dzięki wartości produktu, a nie przechowywanie danych.

Należy mierzyć:

- aktywność klienta;

- uzyskiwaną wartość;

- liczbę gotowych KPI;

- częstotliwość problemów;

- czas do rozwiązania;

- koszt Supportu;

- expansion;

- ograniczenia;

- ryzyko churn.

Retencja danych jest regulowana odrębnie w Dokumencie 7.

## 29. Churn

### 29.1. Typy churn

- churn dobrowolny;

- churn płatniczy;

- churn produktowy;

- churn jakości danych;

- churn integracyjny;

- churn cenowy;

- churn organizacyjny;

- churn bezpieczeństwa.

### 29.2. Przyczyna

Każde zakończenie współpracy powinno posiadać główną przyczynę i ewentualne przyczyny dodatkowe.

### 29.3. Koszt churn

Należy uwzględnić:

- niewykorzystany koszt onboardingu;

- koszt offboardingu;

- refundy;

- koszt eksportu;

- koszt usunięcia;

- utracony przychód;

- wpływ na break-even.

## 30. Expansion

Expansion może wynikać z:

- dodatkowego źródła;

- dodatkowego pionu;

- większego wolumenu;

- dłuższej historii;

- większej liczby workspace;

- dodatkowych użytkowników;

- rozszerzonego Supportu;

- dodatkowego AI;

- wyższego SLA;

- usług niestandardowych.

Expansion powinien być oceniany pod kątem:

- wartości;

- kosztu;

- marży;

- ryzyka;

- wpływu na operacje;

- wpływu na bezpieczeństwo.

## 31. Zakończenie współpracy

Proces zakończenia musi określać:

- datę zakończenia;

- ostatni okres rozliczeniowy;

- otwarte należności;

- dostęp użytkowników;

- nowe synchronizacje;

- eksport;

- retencję;

- usunięcie danych;

- odłączenie integracji;

- sekrety i tokeny;

- backupy;

- obowiązki obu stron.

Pełne zasady danych po zakończeniu współpracy określa Dokument 7.

## 32. Przejście z pilotażu na abonament

Przejście wymaga:

1. potwierdzonej wartości;

1. co najmniej jednego gotowego KPI;

1. oceny kosztu;

1. oceny pracy ręcznej;

1. określonego zakresu abonamentu;

1. ustalonej ceny;

1. ustalonych limitów;

1. zasad overage;

1. zakresu Supportu;

1. gotowości integracji;

1. wymaganych kontroli bezpieczeństwa;

1. zaakceptowanych warunków handlowych;

1. decyzji klienta;

1. decyzji Artura Wiśniewskiego.

Pilotaż nie przechodzi automatycznie na abonament.

## 33. Bramki gotowości komercyjnej

### Gate C0 — hipoteza modelu

Wymagane:

- problem klienta;

- pion;

- planowana wartość;

- podstawowy model ceny;

- główne kategorie kosztu.

### Gate C1 — płatna oferta pilotażowa

Wymagane:

- konkretny klient;

- zakres;

- cena;

- waluta;

- termin płatności;

- kryteria sukcesu;

- warunki kontynuacji.

### Gate C2 — uruchomienie pilotażu

Wymagane:

- zaakceptowana oferta;

- spełnione bramy Dokumentu 5;

- sposób pomiaru kosztu;

- karta klienta;

- przypisanie przychodu i kosztów.

### Gate C3 — ocena ekonomiki pilotażu

Wymagane:

- przychód;

- COGS;

- koszt onboardingu;

- koszt pracy ręcznej;

- koszt Supportu;

- marża;

- ocena gotowości do dalszej współpracy.

### Gate C4 — abonament

Wymagane:

- potwierdzona wartość;

- zatwierdzony zakres;

- cena;

- limity;

- zasady overage;

- model Supportu;

- oczekiwana rentowność;

- warunki zakończenia.

### Gate C5 — powtarzalna sprzedaż

Wymagane:

- co najmniej kilka porównywalnych obserwacji kosztowych;

- powtarzalny onboarding;

- zrozumiały zakres pakietów;

- kontrolowana praca ręczna;

- znane główne koszty;

- potwierdzona gotowość do zapłaty;

- proces sprzedaży;

- proces billingowy.

### Gate C6 — skalowanie

Wymagane:

- Cost Observability;

- minimalna opłacalna cena;

- docelowy próg marży;

- analiza TAM, SAM i SOM;

- analiza konkurencji;

- znane koszty pozyskania klienta albo plan ich pomiaru;

- kontrolowany Support;

- stabilne integracje;

- powtarzalny onboarding;

- znany break-even;

- zatwierdzone ryzyka.

### Gate C7 — self-service lub kanał partnerski

Wymagane:

- rentowność;

- automatyzacja onboardingu;

- ograniczona liczba wyjątków;

- działający billing;

- kontrola nadużyć;

- skalowalny Support;

- gotowe materiały i odpowiedzialności;

- odpowiednia gotowość bezpieczeństwa.

## 34. Warunki blokujące skalowanie

Skalowanie jest zablokowane, jeżeli:

- nie jest znany koszt onboardingu;

- nie jest znany koszt aktywnego źródła;

- nie jest znany koszt przetwarzania;

- nie jest mierzony Support;

- nie jest mierzony manual review;

- nie jest mierzony reprocessing;

- nie jest znany koszt AI;

- nie istnieje minimalna opłacalna cena;

- nie istnieje próg marży;

- brak danych o konwersji pilotażu;

- onboarding nie jest powtarzalny;

- istotna część kosztu ma status unknown;

- bezpieczeństwo nie pozwala zwiększyć liczby klientów;

- nie wykonano wymaganej analizy rynku.

Odwołanie: DEC-COM-005.

## 35. Warunki dopuszczające kontrolowany pilotaż

Kontrolowany pilotaż może zostać rozpoczęty, jeżeli:

- istnieje konkretna cena;

- zakres jest ograniczony;

- koszt może być mierzony;

- klient akceptuje eksperymentalny charakter parametrów;

- bezpieczeństwo jest wystarczające dla danych klienta;

- znane są główne kategorie kosztów;

- istnieje maksymalny akceptowany zakres pracy;

- istnieje kryterium zatrzymania;

- istnieje warunek przejścia na dalszą współpracę.

Brak finalnego cennika nie blokuje pilotażu.

## 36. Raport ekonomiki klienta

Każdy klient powinien posiadać raport zawierający:

### Przychód

- opłata wdrożeniowa;

- opłata pilotażowa;

- abonament;

- overage;

- dodatki;

- refundy;

- przychód netto.

### Koszt

- onboarding;

- integracje;

- dane;

- infrastruktura;

- AI;

- Support;

- manual review;

- płatności;

- bezpieczeństwo;

- offboarding.

### Wynik

- COGS;

- marża kwotowa;

- marża procentowa;

- koszt nieznany;

- poziom wiarygodności;

- break-even;

- potencjał expansion;

- ryzyko churn.

## 37. Raport ekonomiki providera

Dla każdego strategicznego providera należy mierzyć:

- liczbę aktywnych connection;

- koszt utrzymania;

- koszt Supportu;

- liczbę incydentów;

- liczbę zmian API;

- koszt reprocessingu;

- koszt backfill;

- koszt manualnych interwencji;

- przychód klientów korzystających z providera;

- marżę powiązanych klientów;

- wpływ na retencję;

- znaczenie dla sprzedaży.

Provider o wysokim koszcie i niskiej wartości może wymagać:

- wyższej ceny;

- ograniczenia;

- przebudowy;

- wycofania;

- przeniesienia do planu wyższego.

## 38. Raport ekonomiki pionu

Raport per pion powinien obejmować:

- liczbę klientów;

- przychód;

- koszt onboardingu;

- koszt danych;

- koszt Supportu;

- koszt integracji;

- koszt manual review;

- marżę;

- czas do first useful data;

- konwersję pilotażu;

- churn;

- expansion;

- główne problemy.

Piony D2C, marketplace i omnichannel powinny być oceniane niezależnie.

## 39. KPI komercyjne

### 39.1. Przychód

- przychód z pilotaży;

- przychód abonamentowy;

- przychód z wdrożeń;

- przychód z overage;

- przychód z dodatków;

- przychód z usług niestandardowych.

### 39.2. Konwersja

- candidate-to-qualified;

- qualified-to-pilot;

- offer-to-paid-pilot;

- pilot-to-subscription;

- subscription-to-expansion.

### 39.3. Rentowność

- COGS per klient;

- marża per klient;

- marża per pion;

- koszt onboardingu;

- koszt aktywnego źródła;

- koszt tysiąca zamówień kanonicznych;

- koszt reprocessingu;

- koszt deduplikacji;

- koszt AI;

- koszt Supportu.

### 39.4. Retencja

- churn;

- revenue churn;

- expansion;

- net revenue retention po osiągnięciu odpowiedniej skali;

- czas utrzymania klienta;

- czas do break-even.

### 39.5. Operacje

- liczba interwencji ręcznych;

- czas manual review;

- liczba zgłoszeń;

- czas Supportu;

- udział klientów wymagających niestandardowej obsługi.

## 40. Dane wymagane przed ustaleniem finalnego cennika

Finalny cennik wymaga co najmniej:

- rzeczywistych kosztów pilotaży;

- informacji o gotowości klientów do zapłaty;

- kosztu onboardingu;

- kosztu integracji;

- kosztu przetwarzania;

- kosztu Supportu;

- kosztu manual review;

- kosztu AI;

- oczekiwanej retencji;

- potencjału expansion;

- porównania konkurencyjnego;

- informacji o rynku;

- oczekiwanego progu marży.

Do czasu zebrania danych ceny są konkretnymi cenami ofertowymi, ale nie muszą stanowić finalnego publicznego cennika.

## 41. Analiza wrażliwości

Model powinien umożliwiać ocenę wpływu zmiany:

- ceny;

- wolumenu;

- liczby źródeł;

- częstotliwości synchronizacji;

- kosztu AI;

- kosztu Supportu;

- czasu onboardingu;

- liczby manual review;

- retencji;

- churn;

- rabatu;

- opłaty wdrożeniowej.

Analiza powinna wskazywać:

- wpływ na COGS;

- wpływ na marżę;

- wpływ na break-even;

- wpływ na wymagany wolumen klientów;

- zakres największej niepewności.

## 42. Ryzyka komercyjne

### 42.1. Cena niższa od rzeczywistego kosztu

Wpływ: nierentowny wzrost.

Reakcja: Cost Observability, minimalna cena i ograniczenie zakresu.

### 42.2. Cena nieadekwatna do wartości

Wpływ: niska gotowość do zakupu albo utrata potencjalnego przychodu.

Reakcja: płatne pilotaże i rozmowy wartościowe.

### 42.3. Nadmierny onboarding

Wpływ: długi break-even.

Reakcja: opłata wdrożeniowa, standaryzacja i mierzenie czasu.

### 42.4. Ukryta praca ręczna

Wpływ: zaniżony COGS.

Reakcja: obowiązkowa ewidencja manual review i Supportu.

### 42.5. Niekontrolowane AI

Wpływ: nieprzewidywalny koszt.

Reakcja: limity, metering i spending cap.

### 42.6. Niekontrolowany reprocessing

Wpływ: wzrost kosztu infrastruktury i operacji.

Reakcja: limity, kolejki, zatwierdzanie dużych przeliczeń.

### 42.7. Rabaty bez analizy

Wpływ: trwała utrata marży.

Reakcja: ocena wpływu na break-even.

### 42.8. Zbyt szerokie pakiety

Wpływ: klient płaci za zakres, którego nie potrzebuje, albo koszt przewyższa cenę.

Reakcja: piony wartości i płatne rozszerzenia.

### 42.9. Za wczesny self-service

Wpływ: wzrost Supportu i błędów.

Reakcja: brama powtarzalności i rentowności.

### 42.10. Brak walidacji prawno-podatkowej

Wpływ: błędne rozliczenia albo zobowiązania.

Reakcja: niezależna weryfikacja przed sprzedażą.

## 43. Traceability decyzji i wymagań

Tabela:
- Wiersz 1: Obszar; Decyzje; Wymagania
- Wiersz 2: Płatny pilotaż; DEC-PIL-001, DEC-COM-004; REQ-COM-001, REQ-PIL-002
- Wiersz 3: Model hybrydowy; DEC-COM-001; REQ-COM-002, REQ-COM-003
- Wiersz 4: Cost Observability; DEC-COM-002; REQ-COM-004, REQ-COM-005
- Wiersz 5: Ceny i marża; DEC-COM-003; REQ-COM-006
- Wiersz 6: Brak skalowania; DEC-COM-005; REQ-COM-007
- Wiersz 7: Metering; DEC-DAT-009; REQ-COM-004
- Wiersz 8: ICP; DEC-MKT-004; REQ-PIL-001
- Wiersz 9: Weryfikacja prawna; DEC-GOV-002; REQ-COM-008
- Wiersz 10: Pilotaż i koszt; DEC-PIL-003; REQ-PIL-005–007

## 44. Kryteria akceptacji modelu komercyjnego

Model jest wystarczający do rozpoczęcia płatnego pilotażu, jeżeli:

1. oferta zawiera konkretną cenę;

1. znany jest zakres;

1. znane są główne kategorie kosztu;

1. możliwe jest przypisanie kosztów do klienta;

1. mierzy się pracę ręczną;

1. określono warunki płatności;

1. określono warunki zakończenia;

1. określono warunek przejścia na abonament;

1. brak finalnego cennika jest jawny;

1. ryzyko finansowe jest ograniczone.

Model jest wystarczający do abonamentu, jeżeli dodatkowo:

1. znany jest oczekiwany COGS;

1. określono limity;

1. określono overage;

1. określono Support;

1. oceniono rentowność;

1. określono break-even;

1. zweryfikowano wymagania prawno-podatkowe.

Model jest wystarczający do skalowania, jeżeli dodatkowo:

1. istnieje Cost Observability;

1. zatwierdzono minimalną opłacalną cenę;

1. zatwierdzono próg marży;

1. onboarding jest powtarzalny;

1. praca ręczna jest kontrolowana;

1. znane są koszty providerów;

1. wykonano analizę rynku i konkurencji;

1. bezpieczeństwo i operacje mogą obsłużyć wzrost klientów.

## 45. Decyzje warunkowe dokumentu

### 45.1. Cena finalna

Status: warunkowa
Odwołanie: DEC-COM-003
Obowiązująca reguła: każdy pilotaż posiada konkretną cenę
Warunek ponownej oceny: dane z płatnych pilotaży
Wymagany rezultat: finalny cennik i minimalna opłacalna cena

### 45.2. Próg marży

Status: warunkowa
Obowiązująca reguła: marża jest obliczana dla każdego klienta, nawet jeśli nie ustanowiono jeszcze docelowego progu
Warunek ponownej oceny: reprezentatywne dane COGS i cenowe
Wymagany rezultat: zatwierdzony próg marży dla skalowania

### 45.3. Progi ICP

Status: warunkowa
Odwołanie: DEC-MKT-004
Obowiązująca reguła: kwalifikacja opiera się na problemie, wartości i gotowości do zapłaty
Warunek ponownej oceny: wyniki pierwszych płatnych pilotaży
Wymagany rezultat: twarde kryteria kwalifikacji i dyskwalifikacji

### 45.4. Limity i overage

Status: warunkowa
Obowiązująca reguła: każdy klient posiada kontrolowany zakres użycia
Warunek ponownej oceny: rzeczywisty profil użycia i kosztów
Wymagany rezultat: zatwierdzone limity pakietów i ceny overage

### 45.5. SLA, RTO i RPO w ofercie

Status: warunkowa
Obowiązująca reguła: brak gwarancji umownych bez testów i zatwierdzenia
Warunek ponownej oceny: przed ofertą zawierającą SLA
Wymagany rezultat: zatwierdzone parametry, koszt i odpowiedzialność

## 46. Dokumenty powiązane

1. Dokument 1 — Dokumentacja biznesowo-produktowa PapaData
1. Określa rynek, wartość, segmenty i zakres produktu.

1. Dokument 2 — Rejestr decyzji i wymagań biznesowych
1. Określa obowiązujące decyzje i ich status.

1. Dokument 3 — Kontrakt danych, stanów i KPI
1. Określa dane używane do meteringu, KPI i rozliczeń.

1. Dokument 4 — Integracje i gotowość operacyjna
1. Określa kosztowe i operacyjne właściwości providerów.

1. Dokument 5 — Pierwszy pion produktowy i płatny pilotaż
1. Określa proces sprzedaży, realizacji i zakończenia pilotażu.

1. Dokument 7 — Bezpieczeństwo, prywatność i AI Governance
1. Określa bezpieczeństwo płatności, retencję, usuwanie i wymagania dla AI.

## 47. Zatwierdzenie dokumentu

Dokument ustanawia obowiązujący model komercyjny i unit economics PapaData.

Właściciel i osoba zatwierdzająca: Artur Wiśniewski
Data obowiązywania: 18 lipca 2026 roku
Wersja: 1.0

Dokument nie ustanawia finalnego publicznego cennika i nie stanowi potwierdzenia wdrożenia systemu billingowego.

Każdy płatny pilotaż musi jednak posiadać konkretną cenę, zakres, warunki płatności, sposób pomiaru kosztu oraz kryterium przejścia na dalszą współpracę.
