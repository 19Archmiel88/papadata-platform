# PapaData — kontrakt danych, stanów i KPI

## Metryka dokumentu

Dokument: Kontrakt danych, stanów i KPI PapaData
Numer dokumentu: 3
Wersja: 1.0
Status: Finalny dokument kontraktowy
Data obowiązywania: 18 lipca 2026 roku
Właściciel dokumentu: Artur Wiśniewski
Właściciel danych: Artur Wiśniewski
Właściciel KPI: Artur Wiśniewski
Właściciel stanów domenowych: Artur Wiśniewski
Model odpowiedzialności: jednoosobowe governance przejściowe
Charakter projektu: projekt tworzony od podstaw

Zakres dokumentu:

- źródła i warstwy danych;

- model danych kanonicznych;

- lineage i pochodzenie danych;

- source authority;

- canonicalization;

- wykrywanie nakładania źródeł;

- deduplikacja;

- konflikty danych;

- jakość danych;

- stany domenowe;

- gotowość datasetów i KPI;

- kontrakty KPI;

- reprocessing;

- rekoncyliacja;

- first useful data;

- wymagania audytowe;

- kryteria akceptacji.

Poza zakresem:

- projekt ekranów;

- komponenty;

- układ interfejsu;

- wizualna reprezentacja stanów;

- finalne komunikaty;

- szczegółowa implementacja pipeline;

- wybór technologii bazodanowej;

- konfiguracja infrastruktury;

- kod adapterów providerów;

- finalny cennik;

- szczegółowe procedury bezpieczeństwa.

## 1. Cel dokumentu

Dokument ustanawia wspólny kontrakt biznesowo-analityczny dla danych, stanów i KPI w PapaData.

Jego celem jest zapewnienie, że wszystkie przyszłe elementy produktu interpretują w ten sam sposób:

- dane źródłowe;

- dane znormalizowane;

- dane kanoniczne;

- duplikaty;

- konflikty;

- kompletność;

- świeżość;

- gotowość;

- wyniki procesów;

- błędy;

- ograniczenia;

- definicje KPI;

- możliwość wykorzystania wyniku do decyzji biznesowej.

Dokument określa wymagany stan docelowy. Nie potwierdza, że opisane warstwy, mechanizmy, algorytmy albo procesy zostały zaimplementowane.

Zasada wynika z decyzji DEC-DOC-001.

Dokument ma zapobiegać sytuacjom, w których:

- ten sam KPI posiada kilka różnych definicji;

- połączenie integracji jest uznawane za gotowość danych;

- pierwsze pobrane rekordy są uznawane za użyteczny dataset;

- ten sam fakt biznesowy zasila KPI wielokrotnie;

- brak wartości jest interpretowany jako zero;

- dane reklamowe są przedstawiane jako przychód transakcyjny;

- wynik jest prezentowany bez informacji o jakości;

- niepełny KPI jest interpretowany jako kompletny;

- zmiana reguły nie powoduje kontrolowanego przeliczenia;

- AI wykorzystuje dane niespełniające wymaganego kontraktu gotowości.

## 2. Pozycja dokumentu w pakiecie

Dokument 3 jest źródłem prawdy dla:

- semantyki warstw danych;

- modelu danych kanonicznych;

- zasad lineage;

- zasad source authority;

- zasad canonicalization;

- zasad deduplikacji;

- stanów integralności danych;

- stanów gotowości;

- kontraktów KPI;

- zasad reprocessingu;

- zasad rekoncyliacji;

- warunków first useful data.

Dokument 3 nie jest źródłem prawdy dla:

- statusu decyzji — źródłem jest Dokument 2;

- katalogu i gotowości providerów — źródłem jest Dokument 4;

- przebiegu konkretnego procesu pilotażowego — źródłem jest Dokument 5;

- cen i jednostek handlowych — źródłem jest Dokument 6;

- kontroli bezpieczeństwa i prywatności — źródłem jest Dokument 7.

Najważniejsze decyzje powiązane:

- DEC-DAT-001 — brak danych nie jest zerem;

- DEC-DAT-002 — jeden fakt biznesowy zasila KPI jeden raz;

- DEC-DAT-003 — gotowość jest lokalna;

- DEC-DAT-004 — source authority jest wersjonowane;

- DEC-DAT-005 — exact matching przed fuzzy matching;

- DEC-DAT-006 — fuzzy matching jest warunkowe;

- DEC-DAT-007 — deduplikacja jest ograniczona do tenantu;

- DEC-DAT-008 — rozdzielenie danych transakcyjnych i atrybucyjnych;

- DEC-DAT-009 — zamówienia kanoniczne mogą być jednostką meteringu;

- DEC-AI-001 — AI nie jest źródłem prawdy.

## 3. Zasady nadrzędne

### 3.1. Dane źródłowe nie są automatycznie prawdą biznesową

Dane otrzymane od providera mogą być:

- niepełne;

- opóźnione;

- zdublowane;

- korygowane;

- anulowane;

- oparte na innej definicji;

- zapisane w innej walucie;

- zapisane w innej strefie czasowej;

- dostępne jednocześnie w kilku systemach;

- niespójne między endpointami jednego providera.

Obowiązuje rozróżnienie:

source data ≠ normalized data ≠ canonical data ≠ ready dataset ≠ ready KPI

### 3.2. Jeden fakt biznesowy zasila KPI jeden raz

Jeżeli to samo zdarzenie występuje w kilku źródłach, do KPI może trafić wyłącznie jeden wkład kanoniczny.

Rekordy źródłowe pozostają zachowane dla:

- lineage;

- audytu;

- diagnostyki;

- ponownego przeliczenia;

- rozstrzygania konfliktów.

Zasada wynika z decyzji DEC-DAT-002.

### 3.3. Brak danych nie jest zerem

Brak:

- opłaty;

- kosztu produktu;

- refundu;

- statusu;

- wartości konwersji;

- kursu walutowego;

- identyfikatora;

- daty;

- ilości

nie może zostać automatycznie zastąpiony zerem.

Zero może zostać użyte tylko wtedy, gdy źródło albo zatwierdzona reguła biznesowa jednoznacznie potwierdza wartość zerową.

Zasada wynika z decyzji DEC-DAT-001.

### 3.4. Gotowość jest lokalna

Gotowość jest oceniana dla określonego zakresu, na przykład:

- pola;

- rekordu;

- datasetu;

- źródła;

- KPI;

- pionu;

- okresu;

- waluty;

- workspace.

Nie istnieje ogólny status „wszystko gotowe” bez zdefiniowanej reguły agregacji.

Zasada wynika z decyzji DEC-DAT-003.

### 3.5. Dane transakcyjne i atrybucyjne są odrębne

Przychód sprzedażowy pochodzi z systemów transakcyjnych.

Wartości raportowane przez:

- Google Ads;

- Meta Ads;

- Google Analytics 4;

- inne systemy marketingowe

są wartościami atrybucyjnymi albo analitycznymi.

Nie mogą automatycznie zastępować przychodu transakcyjnego.

Zasada wynika z decyzji DEC-DAT-008.

### 3.6. AI nie ustanawia kontraktu danych

AI:

- nie definiuje znaczenia pola;

- nie ustala źródła nadrzędnego;

- nie zmienia formuły KPI;

- nie zatwierdza jakości;

- nie podnosi gotowości;

- nie rozstrzyga autoryzacji;

- nie usuwa konfliktu danych;

- nie zastępuje deterministycznej reguły biznesowej.

AI może interpretować wyłącznie dane dopuszczone zgodnie z kontraktem.

Zasada wynika z decyzji DEC-AI-001.

### 3.7. Wszystkie krytyczne definicje są wersjonowane

Wersjonowaniu podlegają co najmniej:

- kontrakt providera;

- schemat danych źródłowych;

- mapping;

- model kanoniczny;

- status mapping;

- source authority;

- algorytm deduplikacji;

- progi jakości;

- formuła KPI;

- polityka walutowa;

- polityka stref czasowych;

- reguły gotowości;

- reguły agregacji;

- reguły reprocessingu.

## 4. Zakres danych

### 4.1. Dane organizacyjne

Obejmują:

- tenanta;

- workspace;

- użytkowników;

- członkostwa;

- role;

- capabilities;

- entitlement;

- profil działalności;

- pion wartości;

- walutę raportową;

- strefę czasową;

- konfigurację źródeł.

### 4.2. Dane integracyjne

Obejmują:

- providera;

- connection;

- konto zewnętrzne;

- sklep;

- konto marketplace;

- konto OMS;

- zakres autoryzacji;

- datę połączenia;

- status synchronizacji;

- zakres historii;

- identyfikatory zewnętrzne.

### 4.3. Dane sprzedażowe

Obejmują:

- zamówienia;

- pozycje zamówienia;

- statusy;

- anulowania;

- rabaty;

- podatki;

- koszty dostawy;

- płatności;

- refundy;

- zwroty;

- opłaty;

- waluty;

- daty zdarzeń.

### 4.4. Dane produktowe

Obejmują:

- produkt;

- wariant;

- SKU;

- ofertę;

- listing;

- kategorię;

- markę;

- identyfikatory zewnętrzne;

- relacje produkt–wariant–oferta.

### 4.5. Dane marketingowe i analityczne

Obejmują:

- kampanie;

- zestawy reklam;

- reklamy;

- koszt;

- kliknięcia;

- wyświetlenia;

- konwersje;

- wartość konwersji;

- sesje;

- użytkowników;

- zdarzenia analityczne;

- modele atrybucji.

### 4.6. Dane jakości i gotowości

Obejmują:

- wynik walidacji;

- kompletność;

- świeżość;

- zgodność schematu;

- konflikt;

- duplikat;

- source overlap;

- readiness;

- problem;

- wpływ biznesowy;

- wymagane następne działanie.

### 4.7. Dane audytowe

Obejmują:

- wersję kontraktu;

- zastosowaną regułę;

- źródło;

- czas pobrania;

- czas przetworzenia;

- czas obowiązywania;

- identyfikator procesu;

- wynik procesu;

- decyzję manualną;

- osobę wykonującą działanie;

- powód zmiany.

## 5. Warstwy danych

### 5.1. Source layer

Warstwa zawiera dane w formie otrzymanej od providera.

Wymagane cechy:

- identyfikacja providera;

- identyfikacja connection;

- tenant;

- workspace;

- czas pobrania;

- wersja kontraktu providera;

- zachowanie identyfikatora źródłowego;

- zachowanie oryginalnej semantyki;

- możliwość audytu.

Dane w tej warstwie nie są jeszcze gotowym faktem biznesowym PapaData.

### 5.2. Raw normalized layer

Warstwa zawiera dane technicznie ujednolicone.

Normalizacja może obejmować:

- typy danych;

- format daty;

- format waluty;

- format liczby;

- nazwy techniczne;

- podstawową walidację;

- metadane źródła;

- rozdzielenie pól złożonych.

Normalizacja techniczna nie rozstrzyga jeszcze:

- nadrzędności źródła;

- duplikacji;

- znaczenia biznesowego;

- kwalifikacji do KPI.

### 5.3. Canonical layer

Warstwa zawiera wspólne obiekty biznesowe PapaData.

Każdy rekord kanoniczny:

- należy do jednego tenantu;

- należy do określonego workspace;

- posiada stabilny identyfikator kanoniczny;

- wskazuje źródła pochodzenia;

- wskazuje wersję mappingu;

- wskazuje zastosowaną politykę source authority;

- wskazuje status integralności;

- może posiadać historię zmian.

### 5.4. Integrity layer

Warstwa odpowiada za:

- wykrywanie nakładania źródeł;

- grupowanie rekordów potencjalnie reprezentujących ten sam fakt;

- canonicalization;

- deduplikację;

- source authority;

- konflikty;

- manual review;

- wyłączenie wielokrotnego wkładu do KPI;

- przygotowanie do reprocessingu.

### 5.5. Analytical layer

Warstwa zawiera:

- datasety analityczne;

- agregaty;

- KPI;

- snapshoty;

- wyniki jakości;

- readiness;

- informacje o ograniczeniach;

- dane potrzebne do analizy biznesowej.

### 5.6. Decision support layer

Warstwa może zawierać:

- obserwacje;

- anomalie;

- insighty;

- rekomendacje;

- kontekst decyzji;

- działania użytkownika;

- rezultaty działań.

Warstwa nie może zmieniać znaczenia danych z warstw wcześniejszych.

## 6. Model danych kanonicznych

### 6.1. Tenant

Reprezentuje jednego klienta PapaData oraz granicę własności danych, umowy, billingu i polityk.

Minimalne atrybuty:

- tenantId;

- legalProfileRef;

- nazwa;

- kraj;

- waluta bazowa;

- strefa czasowa;

- status;

- źródła identyfikacyjne.

### 6.2. Workspace

Reprezentuje przestrzeń operacyjną wewnątrz tenanta i należy do dokładnie jednego tenanta identyfikowanego przez tenantId.

Minimalne atrybuty:

- workspaceId;

- tenantId;

- nazwa;

- aktywny pion;

- waluta raportowa;

- strefa czasowa;

- status.

### 6.3. Provider

Reprezentuje typ zewnętrznego systemu.

Przykłady:

- WooCommerce;

- Shopify;

- BaseLinker;

- Allegro;

- Google Ads;

- Meta Ads;

- Google Analytics 4.

### 6.4. Connection

Reprezentuje konkretne połączenie workspace z providerem.

Minimalne atrybuty:

- connectionId;

- tenantId;

- workspaceId;

- providerId;

- externalAccountId;

- zakres danych;

- status połączenia;

- zakres historii;

- data ostatniej udanej synchronizacji.

### 6.5. Order

Reprezentuje kanoniczne zamówienie.

Minimalne atrybuty:

- canonicalOrderId;

- tenantId;

- workspaceId;

- pion;

- kanał sprzedaży;

- źródła;

- identyfikatory zewnętrzne;

- data utworzenia;

- data aktualizacji;

- waluta;

- status kanoniczny;

- wartość brutto;

- wartość rabatów;

- wartość dostawy;

- wartość podatku;

- wynik integralności;

- kwalifikacja do KPI.

### 6.6. Order Line

Reprezentuje pozycję zamówienia.

Minimalne atrybuty:

- canonicalOrderLineId;

- canonicalOrderId;

- productId;

- variantId;

- offerId;

- ilość;

- cena jednostkowa;

- rabat;

- podatek;

- wartość brutto;

- identyfikatory źródłowe.

### 6.7. Product

Reprezentuje produkt biznesowy niezależny od konkretnego kanału.

### 6.8. Variant

Reprezentuje wariant produktu, na przykład rozmiar, kolor albo pojemność.

### 6.9. Offer

Reprezentuje ofertę sprzedażową w konkretnym kanale albo marketplace.

### 6.10. Refund

Reprezentuje potwierdzony zwrot środków.

Minimalne atrybuty:

- refundId;

- canonicalOrderId;

- źródło;

- data;

- kwota;

- waluta;

- status;

- zakres pozycji;

- identyfikator zewnętrzny.

### 6.11. Return

Reprezentuje proces zwrotu towaru.

Zwrot nie musi być równoważny refundowi.

### 6.12. Fee

Reprezentuje potwierdzoną opłatę związaną ze sprzedażą.

Przykłady:

- prowizja marketplace;

- opłata transakcyjna;

- opłata za dostawę;

- opłata promocyjna;

- opłata dodatkowa.

Brak danych o opłacie nie oznacza opłaty zerowej.

### 6.13. Campaign

Reprezentuje kampanię marketingową.

### 6.14. Attribution Fact

Reprezentuje wartość przypisaną do kampanii lub źródła ruchu według określonego modelu atrybucji.

Attribution Fact nie jest zamówieniem ani przychodem transakcyjnym.

### 6.15. Duplicate Group

Reprezentuje grupę rekordów, które mogą opisywać ten sam fakt biznesowy.

### 6.16. Data Conflict

Reprezentuje wykrytą sprzeczność między źródłami albo polami.

### 6.17. KPI Snapshot

Reprezentuje wynik KPI dla:

- określonego okresu;

- zakresu;

- wersji formuły;

- wersji danych;

- waluty;

- strefy czasowej;

- poziomu gotowości.

## 7. Lineage i pochodzenie danych

### 7.1. Wymagane lineage

Każdy rekord kanoniczny i KPI musi umożliwiać ustalenie:

- z jakiego providera pochodzi;

- z którego connection pochodzi;

- z jakich rekordów źródłowych powstał;

- kiedy dane zostały pobrane;

- kiedy dane zostały przetworzone;

- jaka wersja mappingu została zastosowana;

- jaka wersja source authority została zastosowana;

- jaki algorytm deduplikacji został zastosowany;

- jaka wersja formuły KPI została zastosowana;

- czy zastosowano manualne rozstrzygnięcie.

### 7.2. Lineage po deduplikacji

Po deduplikacji rekordy źródłowe nie są usuwane z audytu.

Rekord kanoniczny wskazuje wszystkie źródła, które zostały:

- uznane za reprezentujące ten sam fakt;

- odrzucone jako duplikat wkładu;

- wykorzystane do uzupełnienia pól;

- uznane za konfliktowe;

- wyłączone z KPI.

### 7.3. Lineage KPI

Każdy KPI musi wskazywać:

- datasety wejściowe;

- wersję danych;

- źródła;

- zakres czasu;

- walutę;

- strefę czasową;

- status mapping;

- reguły wyłączeń;

- wersję formuły;

- gotowość;

- ograniczenia.

## 8. Source overlap

### 8.1. Definicja

Source overlap występuje, gdy dwa albo więcej źródeł może dostarczać dane dotyczące tego samego faktu biznesowego.

Przykłady:

- Allegro direct i BaseLinker;

- Shopify direct i BaseLinker;

- system sprzedażowy i narzędzie analityczne;

- dwa connection tego samego providera obejmujące nakładający się zakres.

### 8.2. Ocena overlap

Ocena musi określać:

- parę albo grupę źródeł;

- typ obiektu;

- pola potencjalnie nakładające się;

- okres nakładania;

- wiarygodne identyfikatory;

- poziom ryzyka podwójnego liczenia;

- wymaganą politykę source authority;

- wymaganą metodę deduplikacji.

### 8.3. Status overlap

Dozwolone wartości:

- notAssessed — brak oceny;

- notExpected — nakładanie nie jest oczekiwane;

- possible — nakładanie jest możliwe;

- confirmed — nakładanie zostało potwierdzone;

- controlled — nakładanie jest objęte zatwierdzoną regułą;

- unresolved — nakładanie jest potwierdzone, ale niekontrolowane.

Status unresolved blokuje KPI, które mogłyby zostać zasilone wielokrotnie.

## 9. Source authority

### 9.1. Definicja

Source authority określa, które źródło albo jaka reguła jest nadrzędna dla konkretnego:

- obiektu;

- pola;

- zdarzenia;

- statusu;

- faktu biznesowego;

- zakresu czasu.

### 9.2. Source authority nie jest globalne

Nie należy zakładać, że jeden provider jest nadrzędny dla wszystkich danych.

Przykład:

- źródło A może być nadrzędne dla identyfikatora zamówienia;

- źródło B może być nadrzędne dla statusu logistycznego;

- źródło C może być nadrzędne dla potwierdzonej opłaty;

- źródło reklamowe może być nadrzędne dla kosztu kampanii, ale nie dla przychodu transakcyjnego.

### 9.3. Rekord polityki source authority

Każda polityka zawiera:

- policyId;

- wersję;

- tenant lub zakres globalny;

- parę źródeł;

- typ obiektu;

- pole albo fakt;

- źródło nadrzędne;

- regułę fallback;

- regułę konfliktu;

- datę obowiązywania;

- uzasadnienie;

- kryterium ponownej oceny.

### 9.4. Zmiana source authority

Zmiana polityki wymaga:

1. nowej wersji;

1. analizy wpływu;

1. identyfikacji zależnych datasetów;

1. identyfikacji zależnych KPI;

1. kontrolowanego reprocessingu;

1. zachowania poprzedniej wersji dla audytu.

Zasada wynika z decyzji DEC-DAT-004.

## 10. Canonicalization

### 10.1. Cel

Canonicalization tworzy wspólną reprezentację biznesową danych pochodzących z różnych systemów.

### 10.2. Canonicalization nie usuwa różnic źródłowych

Jeżeli dwa źródła różnią się znaczeniem pola, różnica musi zostać:

- zachowana w lineage;

- opisana;

- rozstrzygnięta polityką;

- przedstawiona jako konflikt;

- albo wyłączona z określonego zastosowania.

### 10.3. Identyfikator kanoniczny

Identyfikator kanoniczny:

- jest stabilny w obrębie tenantu;

- nie może łączyć rekordów różnych tenantów;

- nie powinien zależeć wyłącznie od jednego zmiennego pola;

- musi umożliwiać odtworzenie relacji ze źródłami;

- może zostać ponownie przypisany wyłącznie przez kontrolowany proces korekty.

### 10.4. Status canonicalization

Dozwolone wartości:

- notRequired;

- pending;

- inProgress;

- canonicalized;

- partial;

- conflicted;

- failed.

## 11. Deduplikacja

### 11.1. Cel

Deduplikacja ma zapobiegać wielokrotnemu wykorzystaniu tego samego faktu biznesowego.

### 11.2. Zakres tenantu

Deduplikacja nie może działać między tenantami.

Dotyczy to:

- exact matching;

- fuzzy matching;

- similarity search;

- grup duplikatów;

- manual review;

- danych treningowych i testowych;

- kontekstu AI.

Zasada wynika z decyzji DEC-DAT-007.

### 11.3. Exact matching

Exact matching jest pierwszą metodą deduplikacji.

Może wykorzystywać:

- stabilny identyfikator źródłowy;

- numer zamówienia wraz z kanałem;

- identyfikator marketplace;

- identyfikator z systemu pośredniczącego;

- zatwierdzony złożony klucz deterministyczny.

Exact matching musi posiadać test:

- false merge;

- false split;

- brak dopasowania;

- wielokrotne dopasowanie;

- zmiana identyfikatora;

- konflikt zakresu.

Zasada wynika z decyzji DEC-DAT-005.

### 11.4. Fuzzy matching

Fuzzy matching nie jest obowiązkowe dla pierwszego prostego pionu.

Może zostać dopuszczone, jeżeli:

- exact matching nie zapewnia wystarczającej jakości;

- istnieją rzeczywiste dane kalibracyjne;

- określono cechy dopasowania;

- określono progi;

- określono koszt manual review;

- zdefiniowano procedurę korekty;

- zmierzono false merge i false split.

Zasada wynika z decyzji DEC-DAT-006.

### 11.5. Status deduplikacji

Dozwolone wartości:

- notRequired;

- notAssessed;

- pending;

- exactMatched;

- fuzzyMatched;

- manualReviewRequired;

- confirmedDuplicate;

- confirmedDistinct;

- conflicted;

- failed.

### 11.6. Duplicate Group

Każda grupa duplikatów zawiera:

- duplicateGroupId;

- tenantId;

- workspaceId;

- typ obiektu;

- rekordy źródłowe;

- metodę dopasowania;

- wynik podobieństwa;

- zastosowany próg;

- decyzję;

- osobę albo proces rozstrzygający;

- datę;

- wersję algorytmu.

### 11.7. Korekta deduplikacji

Korekta false merge albo false split wymaga:

- zmiany grupy;

- zapisu powodu;

- aktualizacji rekordów kanonicznych;

- reprocessingu zależnych KPI;

- zachowania audytu;

- pomiaru wpływu.

## 12. Konflikty danych

### 12.1. Typy konfliktów

Konflikty mogą dotyczyć:

- identyfikatora;

- statusu;

- daty;

- kwoty;

- waluty;

- ilości;

- refundu;

- opłaty;

- produktu;

- kanału;

- źródła klienta;

- kwalifikacji do KPI.

### 12.2. Status konfliktu

Dozwolone wartości:

- none;

- detected;

- underReview;

- resolvedByAuthority;

- resolvedManually;

- acceptedDifference;

- unresolved.

### 12.3. Wpływ konfliktu

Każdy konflikt musi określać:

- zakres wpływu;

- KPI zależne;

- poziom istotności;

- możliwość bezpiecznego użycia danych;

- wymagane następne działanie;

- właściciela działania.

### 12.4. Konflikt lokalny

Konflikt jednego pola nie musi blokować całego datasetu.

Przykład:

- konflikt opłaty może blokować KPI marżowy;

- nie musi blokować liczby zamówień;

- nie musi blokować przychodu brutto, jeśli ten pochodzi z wiarygodnego źródła.

## 13. Jakość danych

### 13.1. Wymiary jakości

Ocena jakości obejmuje co najmniej:

- kompletność;

- poprawność formatu;

- zgodność schematu;

- unikalność;

- spójność;

- świeżość;

- terminowość;

- integralność referencyjną;

- zgodność waluty;

- zgodność strefy czasowej;

- zgodność statusów;

- wiarygodność źródła;

- integralność wieloźródłową.

### 13.2. Wynik jakości

Wynik jakości nie może być pojedynczą liczbą bez kontekstu.

Musi wskazywać:

- zakres;

- okres;

- reguły;

- wynik per wymiar;

- błędy;

- ostrzeżenia;

- wpływ na KPI;

- wersję reguł.

### 13.3. Klasy problemów

- informational — nie wpływa na użycie;

- limitedImpact — wpływa na ograniczony zakres;

- recoverable — wymaga ponowienia albo korekty;

- blocking — blokuje konkretny dataset albo KPI;

- critical — może prowadzić do błędnej decyzji lub naruszenia integralności.

### 13.4. Próg jakości

Każdy próg jakości musi być:

- przypisany do zakresu;

- wersjonowany;

- uzasadniony;

- testowany;

- możliwy do zmiany przez kontrolowaną decyzję.

## 14. Wielowymiarowy model stanu

PapaData nie posiada jednego płaskiego statusu.

Stan jest opisany przez niezależne wymiary:

scope + phase + access + readiness + problem + outcome + timing + integrity + business impact + next action

### 14.1. Scope

Określa, czego dotyczy stan.

Dozwolone typy zakresu:

- tenant;

- workspace;

- vertical;

- process;

- operation;

- provider;

- connection;

- source;

- sourcePair;

- store;

- marketplaceAccount;

- omsAccount;

- dataset;

- field;

- order;

- product;

- variant;

- offer;

- duplicateGroup;

- dataConflict;

- kpi;

- recommendation;

- supportCase.

### 14.2. Phase

Opisuje aktualną fazę procesu.

Dozwolone wartości:

- notStarted;

- planned;

- waitingForUser;

- waitingForExternalSystem;

- queued;

- running;

- paused;

- retrying;

- validating;

- reprocessing;

- resolved.

resolved oznacza zakończenie fazy, ale nie określa wyniku.

### 14.3. Access

Opisuje możliwość wykonania albo odczytu.

Dozwolone wartości:

- allowed;

- readOnly;

- permissionDenied;

- authenticationRequired;

- reauthenticationRequired;

- administratorRequired;

- supportRequired;

- entitlementRequired;

- temporarilyBlocked.

Access jest niezależny od readiness.

### 14.4. Readiness

Opisuje możliwość wykorzystania danych albo wyniku.

Dozwolone wartości:

- notApplicable;

- notAssessed;

- empty;

- loading;

- partial;

- ready;

- stale;

- invalid;

- blocked.

### 14.5. Problem

Opisuje aktywny problem.

Dozwolone wartości:

- none;

- informational;

- recoverable;

- permission;

- configuration;

- providerUnavailable;

- rateLimited;

- schemaMismatch;

- qualityIssue;

- integrityIssue;

- securityIssue;

- unknown.

### 14.6. Outcome

Opisuje wynik zakończonego procesu.

Dozwolone wartości:

- succeeded;

- partiallySucceeded;

- skipped;

- cancelled;

- superseded;

- expired;

- rejected;

- failed;

- requiresAdministrator;

- requiresSupport.

### 14.7. Timing

Opisuje aspekt czasowy.

Dozwolone wartości:

- current;

- delayed;

- stale;

- historical;

- futureScheduled;

- unknown.

### 14.8. Integrity

Integralność jest opisana przez zestaw niezależnych pól:

- overlapStatus;

- canonicalizationStatus;

- deduplicationStatus;

- conflictStatus;

- sourceAuthorityPolicyId;

- integrityReadiness.

### 14.9. Business impact

Dozwolone poziomy:

- none;

- low;

- medium;

- high;

- critical.

Wpływ musi odnosić się do konkretnego procesu, KPI albo decyzji.

### 14.10. Next action

Stan może wskazywać:

- działanie;

- właściciela;

- termin;

- warunek;

- możliwość automatycznego retry;

- potrzebę interwencji użytkownika;

- potrzebę Supportu;

- potrzebę decyzji właściciela danych.

## 15. Zasady interpretacji stanu

### 15.1. Stan zawsze należy do zakresu

Niepoprawne:

- „system jest ready”;

- „workspace ma error”;

- „dane są partial”.

Poprawne:

- „orders dataset jest ready”;

- „marketplace fees dataset jest empty”;

- „gross revenue KPI jest ready”;

- „margin after marketplace fees KPI jest partial”;

- „Allegro connection wymaga reauthentication”.

### 15.2. Faza nie zastępuje wyniku

phase: resolved nie oznacza sukcesu.

Proces może być rozwiązany z wynikiem:

- succeeded;

- failed;

- cancelled;

- expired;

- requiresSupport.

### 15.3. Problem nie zastępuje gotowości

Dataset może być jednocześnie:

- readiness: partial;

- problem: recoverable;

- access: allowed;

- phase: retrying.

### 15.4. Access nie zastępuje gotowości

Użytkownik może posiadać dostęp do danych historycznych, ale nie posiadać uprawnienia do reconnect.

### 15.5. Integralność jest niezależna od poprawności technicznej

Dane mogą być:

- poprawnie pobrane;

- zgodne ze schematem;

- technicznie kompletne;

a jednocześnie posiadać:

- unresolved overlap;

- pending deduplication;

- konflikt source authority;

- ryzyko podwójnego liczenia.

## 16. Agregacja stanów

### 16.1. Brak automatycznej agregacji globalnej

Stan zakresu nadrzędnego nie może być prostym maksimum albo minimum stanów potomnych bez jawnej reguły.

### 16.2. Reguła agregacji pionu

Pion może być uznany za gotowy, jeżeli:

- istnieje co najmniej jedno kwalifikujące się źródło sprzedażowe;

- wymagany dataset jest gotowy;

- wymagany KPI jest gotowy;

- krytyczne konflikty są rozwiązane;

- ograniczenia są jawne;

- istnieje interpretowalny rezultat.

### 16.3. Lokalny brak nie blokuje niezależnych wyników

Przykład marketplace:

- orders dataset: ready;

- gross revenue KPI: ready;

- fees dataset: empty;

- margin after fees KPI: empty;

- marketplace vertical: partial.

### 16.4. Krytyczny problem integralności

Potwierdzony, niekontrolowany source overlap może blokować:

- agregacje wieloźródłowe;

- KPI sprzedażowe zależne od obu źródeł;

- pion omnichannel.

Nie musi blokować danych pochodzących z jednego, niezależnego źródła, jeżeli są używane bez łączenia.

## 17. Gotowość datasetu

### 17.1. Empty

Dataset jest empty, gdy:

- nie zawiera rekordów dla zakresu;

- źródło potwierdza brak zdarzeń;

- albo nie pobrano żadnych danych i stan jest jednoznacznie opisany.

Należy odróżniać:

- potwierdzony brak zdarzeń;

- brak danych z powodu problemu;

- brak rozpoczęcia synchronizacji.

### 17.2. Partial

Dataset jest partial, gdy:

- obejmuje tylko część okresu;

- brakuje części pól;

- brakuje części obiektów;

- część rekordów nie przeszła walidacji;

- część źródeł pozostaje niedostępna;

- występuje lokalny konflikt;

- backfill nie został zakończony.

### 17.3. Ready

Dataset jest ready, gdy:

- zakres jest jednoznaczny;

- wymagane dane zostały pobrane;

- schemat jest zgodny;

- jakość przekracza wymagany próg;

- lineage jest dostępne;

- integralność jest wystarczająca;

- brak blokującego konfliktu;

- świeżość spełnia wymaganie;

- dataset może zasilać określony KPI.

### 17.4. Stale

Dataset jest stale, gdy:

- wcześniej był gotowy;

- aktualność przekroczyła dopuszczalny próg;

- nowe dane nie są pobierane;

- wynik historyczny pozostaje dostępny, ale nie jest bieżący.

### 17.5. Invalid

Dataset jest invalid, gdy:

- narusza schemat;

- posiada nierozwiązywalny błąd jakości;

- nie można określić znaczenia danych;

- nie może być bezpiecznie wykorzystany.

### 17.6. Blocked

Dataset jest blocked, gdy jego przetwarzanie albo udostępnienie jest zablokowane przez:

- bezpieczeństwo;

- prywatność;

- brak uprawnienia;

- nierozwiązany source overlap;

- brak krytycznej polityki;

- decyzję biznesową.

## 18. Gotowość KPI

### 18.1. Warunki podstawowe

KPI może być obliczony wyłącznie, jeżeli:

- posiada zatwierdzoną definicję;

- posiada wersję formuły;

- posiada właściciela;

- posiada określony zakres;

- wykorzystuje kwalifikujące się datasety;

- spełnia reguły jakości;

- posiada lineage;

- nie narusza source authority;

- nie zawiera niekontrolowanego podwójnego wkładu;

- posiada informację o ograniczeniach.

### 18.2. Ready

KPI jest ready, gdy:

- wszystkie wymagane dane są gotowe;

- formuła jest zatwierdzona;

- brak krytycznego konfliktu;

- zakres czasu i waluty jest jednoznaczny;

- wynik może wspierać deklarowany typ decyzji.

### 18.3. Partial

KPI jest partial, gdy:

- wynik jest obliczalny;

- ale brakuje części danych;

- zakres jest ograniczony;

- wynik nie obejmuje części kanałów;

- brakuje części kosztów;

- występują jawne ograniczenia.

KPI partial nie może być przedstawiany jako pełny wynik.

### 18.4. Empty

KPI jest empty, gdy:

- brak kwalifikujących się faktów;

- źródło potwierdza brak zdarzeń;

- albo brak danych uniemożliwia obliczenie i stan jest jawnie opisany.

### 18.5. Stale

KPI jest stale, gdy wykorzystuje dataset przekraczający próg świeżości.

### 18.6. Invalid

KPI jest invalid, gdy:

- zastosowano błędną formułę;

- dane naruszają kontrakt;

- wynik nie może zostać poprawnie zinterpretowany;

- wykryto podwójne liczenie;

- użyto niezgodnych walut bez konwersji;

- połączono nieporównywalne zakresy.

### 18.7. Blocked

KPI jest blocked, gdy:

- brak zatwierdzonej definicji;

- brak source authority;

- nierozwiązana deduplikacja wpływa na wynik;

- brakuje wymaganej zgody;

- wynik jest objęty blokadą bezpieczeństwa.

## 19. First useful data

### 19.1. Definicja

First useful data oznacza pierwszy moment, w którym użytkownik otrzymuje wynik:

- oparty na rzeczywistych danych;

- posiadający określone źródło;

- posiadający wystarczającą jakość;

- posiadający jawny zakres;

- możliwy do interpretacji;

- przydatny do konkretnego zadania biznesowego.

### 19.2. First useful data nie oznacza

- pierwszego pobranego rekordu;

- zakończonego connect;

- zakończenia dowolnej synchronizacji;

- pojawienia się liczby;

- wygenerowania komunikatu przez AI.

### 19.3. Minimalny warunek

Minimalny warunek:

jedno źródło sprzedażowe → jeden gotowy dataset → jeden gotowy KPI → jeden interpretowalny rezultat

### 19.4. Pomiar

Należy mierzyć:

- czas od rozpoczęcia onboardingu;

- czas od ustanowienia connection;

- czas od pierwszego pobrania danych;

- czas do gotowego datasetu;

- czas do gotowego KPI;

- czas do pierwszej interpretacji przez klienta.

## 20. Kontrakt KPI

### 20.1. Obowiązkowe pola

Każdy KPI posiada:

- kpiId;

- nazwę;

- opis biznesowy;

- właściciela;

- wersję;

- status obowiązywania;

- cel;

- zakres;

- źródła;

- datasety wejściowe;

- jednostkę;

- walutę;

- strefę czasową;

- formułę;

- reguły włączeń;

- reguły wyłączeń;

- status mapping;

- politykę refundów;

- politykę anulowań;

- politykę opłat;

- politykę FX;

- próg świeżości;

- reguły gotowości;

- ograniczenia;

- zależne KPI;

- kryterium ponownego przeliczenia.

### 20.2. Zasada jednej definicji

Dla danego:

- KPI;

- zakresu;

- okresu;

- wersji

obowiązuje jedna definicja.

Dwie różne definicje muszą być reprezentowane jako:

- dwie wersje;

- albo dwa różne KPI o różnych nazwach i znaczeniu.

### 20.3. Wersja wyniku

Każdy snapshot KPI wskazuje:

- wersję formuły;

- wersję datasetu;

- wersję source authority;

- wersję mappingu;

- czas obliczenia;

- readiness;

- ograniczenia.

## 21. Podstawowe KPI pierwszych pionów

### 21.1. Liczba zamówień

Nazwa: Order Count
Znaczenie: liczba kwalifikujących się zamówień kanonicznych w danym okresie
Jednostka: liczba zamówień

Formuła ogólna:

liczba unikalnych canonicalOrderId spełniających zatwierdzone reguły statusu i zakresu.

Zasady:

- jedno zamówienie kanoniczne liczone jest jeden raz;

- duplikaty źródłowe nie zwiększają wyniku;

- anulowane zamówienia są obsługiwane zgodnie z zatwierdzonym status mapping;

- zakres kanału musi być jawny.

### 21.2. Gross Revenue

Znaczenie: wartość brutto kwalifikujących się zamówień kanonicznych przed odjęciem potwierdzonych refundów, opłat marketplace i kosztów produktu
Jednostka: waluta

Zasady:

- źródłem jest system transakcyjny;

- dane atrybucyjne nie zasilają tego KPI;

- zamówienia są kwalifikowane zgodnie ze statusem;

- waluta musi być jawna;

- wynik wielowalutowy wymaga polityki FX.

### 21.3. Refund Value

Znaczenie: suma potwierdzonych refundów w okresie
Jednostka: waluta

Zasady:

- refund musi posiadać źródło i powiązanie z zamówieniem;

- zwrot produktu bez potwierdzonego zwrotu środków nie musi być refundem;

- brak informacji o refundach nie oznacza zera.

### 21.4. Net Revenue

Znaczenie: przychód po odjęciu potwierdzonych refundów od kwalifikującego się Gross Revenue
Jednostka: waluta

Formuła ogólna:

Net Revenue = Gross Revenue – confirmed Refund Value

Anulowania są obsługiwane na etapie kwalifikacji zamówień zgodnie z zatwierdzonym status mapping.

### 21.5. Marketplace Fees

Znaczenie: suma potwierdzonych opłat marketplace związanych z kwalifikującą się sprzedażą
Jednostka: waluta

Jeżeli dane o opłatach są niedostępne:

- KPI nie może przyjmować wartości zero;

- status może być empty albo partial;

- zależny KPI marżowy nie może być ready.

### 21.6. Revenue After Marketplace Fees

Znaczenie: przychód po refundach i potwierdzonych opłatach marketplace
Jednostka: waluta

Formuła ogólna:

Revenue After Marketplace Fees = Net Revenue – confirmed Marketplace Fees

KPI nie jest pełną marżą, jeśli nie uwzględnia:

- kosztu produktu;

- logistyki;

- płatności;

- innych kosztów zmiennych.

### 21.7. Advertising Spend

Znaczenie: koszt kampanii raportowany przez określony system reklamowy
Jednostka: waluta

Wynik musi wskazywać:

- platformę;

- konto reklamowe;

- zakres czasu;

- walutę;

- model rozliczenia.

### 21.8. Attributed Conversion Value

Znaczenie: wartość konwersji przypisana przez system reklamowy albo analityczny według określonego modelu atrybucji
Jednostka: waluta atrybucyjna

KPI nie jest przychodem transakcyjnym.

### 21.9. ROAS

Znaczenie: relacja wartości atrybucyjnej do kosztu reklamy
Formuła ogólna:

ROAS = Attributed Conversion Value / Advertising Spend

Warunki:

- koszt i wartość dotyczą zgodnego zakresu;

- waluty są zgodne albo przeliczone;

- model atrybucji jest jawny;

- Advertising Spend jest większy od zera;

- wynik nie jest interpretowany jako relacja rzeczywistego przychodu transakcyjnego do kosztu, chyba że utworzono odrębny KPI z taką definicją.

### 21.10. Contribution Margin

KPI może zostać uruchomiony dopiero, gdy dostępne są zatwierdzone dane o:

- przychodzie;

- refundach;

- opłatach;

- koszcie produktu;

- innych uwzględnianych kosztach zmiennych.

Brak któregokolwiek wymaganego składnika nie może zostać zastąpiony zerem.

Status: KPI warunkowy dla zakresu, w którym dane kosztowe nie są potwierdzone.

## 22. Waluty

### 22.1. Waluta źródłowa

Każdy fakt finansowy zachowuje:

- kwotę źródłową;

- walutę źródłową;

- źródło kursu, jeśli zastosowano konwersję;

- datę kursu;

- wersję polityki FX.

### 22.2. Waluta raportowa

Workspace może posiadać walutę raportową.

Przeliczenie wymaga zatwierdzonej polityki określającej:

- źródło kursu;

- moment kursu;

- sposób obsługi korekt;

- sposób obsługi refundów;

- zaokrąglenia;

- wersję.

### 22.3. Brak polityki FX

Brak polityki FX blokuje agregację danych w różnych walutach do jednego KPI.

Nie blokuje prezentacji wyników oddzielnie per waluta.

## 23. Strefy czasowe

Każdy rekord czasowy powinien zachowywać:

- czas źródłowy;

- strefę źródłową, jeśli jest dostępna;

- czas znormalizowany;

- strefę workspace;

- czas przetworzenia.

Agregacje dzienne, tygodniowe i miesięczne muszą wskazywać strefę czasową.

Zmiana strefy raportowej może wymagać ponownego przeliczenia okresów.

## 24. Status mapping

### 24.1. Cel

Status mapping przekształca statusy providerów na wspólne znaczenie biznesowe.

### 24.2. Minimalne kategorie kanoniczne

- created;

- pending;

- confirmed;

- processing;

- fulfilled;

- partiallyFulfilled;

- cancelled;

- refunded;

- partiallyRefunded;

- returned;

- disputed;

- unknown.

### 24.3. Unknown

Status nierozpoznany nie może zostać automatycznie uznany za status kwalifikujący do przychodu.

### 24.4. Wersjonowanie

Status mapping jest wersjonowany per provider.

Zmiana mappingu wymaga analizy wpływu i reprocessingu zależnych KPI.

## 25. Świeżość i opóźnienia

### 25.1. Freshness

Freshness opisuje czas od ostatnich danych uznanych za poprawne dla określonego zakresu.

### 25.2. Provider latency

Opóźnienie providera należy odróżnić od:

- błędu synchronizacji;

- błędu pipeline;

- braku zdarzeń;

- opóźnienia procesu wewnętrznego.

### 25.3. Progi świeżości

Progi są określane per:

- provider;

- dataset;

- KPI;

- pion;

- typ decyzji.

Jeden globalny próg świeżości nie jest wymagany.

## 26. Rekoncyliacja

### 26.1. Cel

Rekoncyliacja porównuje dane PapaData z wiarygodnym punktem odniesienia.

### 26.2. Zakres

Może obejmować:

- liczbę zamówień;

- wartości przychodu;

- liczbę refundów;

- sumę opłat;

- zakres dat;

- statusy;

- brakujące rekordy;

- duplikaty.

### 26.3. Wynik

Wynik rekoncyliacji zawiera:

- zakres;

- okres;

- źródła;

- różnicę;

- tolerancję;

- przyczynę;

- wpływ;

- decyzję;

- wymagane działanie.

### 26.4. Tolerancja

Tolerancja musi być:

- jawna;

- wersjonowana;

- uzasadniona;

- przypisana do KPI albo datasetu.

## 27. Reprocessing

### 27.1. Zdarzenia uruchamiające

Reprocessing jest wymagany po:

- zmianie mappingu;

- zmianie source authority;

- zmianie status mapping;

- zmianie algorytmu deduplikacji;

- korekcie false merge albo false split;

- zmianie formuły KPI;

- zmianie polityki FX;

- zmianie reguł gotowości;

- naprawie błędu danych;

- otrzymaniu korekty od providera.

### 27.2. Zakres reprocessingu

Reprocessing powinien być ograniczony do najmniejszego bezpiecznego zakresu:

- rekordów;

- okresu;

- datasetu;

- KPI;

- workspace;

- providera.

### 27.3. Wymagania

Każdy reprocessing posiada:

- identyfikator;

- powód;

- zakres;

- wersję przed;

- wersję po;

- właściciela;

- status;

- koszt;

- czas;

- wpływ na wyniki;

- wynik weryfikacji.

### 27.4. Ciężkie przeliczenia

Ciężkie przeliczenia muszą podlegać kontroli zasobów i nie mogą niekontrolowanie wpływać na procesy krytyczne.

Szczegółowe wymagania operacyjne należą do Dokumentu 4 i Dokumentu 7.

## 28. Manual review

Manual review może być wymagane dla:

- niejednoznacznej deduplikacji;

- konfliktu source authority;

- nierozpoznanego statusu;

- nietypowego mappingu;

- korekty źródła;

- wysokiego wpływu biznesowego.

Każdy przypadek manual review musi być mierzony jako:

- liczba przypadków;

- czas obsługi;

- osoba;

- przyczyna;

- wynik;

- koszt;

- wpływ na KPI.

Manual review nie może być niewidocznym, nieograniczonym procesem operacyjnym.

## 29. Wykorzystanie danych przez AI

AI może korzystać wyłącznie z danych:

- należących do właściwego tenantu;

- zgodnych z uprawnieniami;

- dopuszczonych do danego celu;

- posiadających wymagany poziom gotowości;

- posiadających lineage;

- pozbawionych nierozwiązanych blokujących konfliktów.

Każdy wynik AI powinien umożliwiać ustalenie:

- jakich KPI użyto;

- jakie były ich wersje;

- jaka była gotowość;

- jakie były ograniczenia;

- z jakiego okresu pochodziły dane.

AI nie może przedstawiać KPI partial jako pełnego wyniku bez ujawnienia ograniczenia.

Pełny kontrakt bezpieczeństwa AI należy do Dokumentu 7.

## 30. Wymagania audytowe

Należy zachować możliwość ustalenia:

- kto zmienił regułę;

- kiedy ją zmieniono;

- jaka wersja obowiązywała;

- jakie dane zostały przeliczone;

- które KPI uległy zmianie;

- dlaczego podjęto decyzję;

- czy użyto manual review;

- jakie były wyniki przed i po zmianie;

- jaki był koszt operacji.

Audyt nie oznacza przechowywania danych bez ograniczeń. Retencja podlega zasadom Dokumentu 7.

## 31. Błędy i wyjątki

### 31.1. Brak identyfikatora źródłowego

Rekord nie może zostać automatycznie połączony, jeśli brak bezpiecznej reguły identyfikacji.

Może otrzymać:

- partial;

- manualReviewRequired;

- excludedFromKPI.

### 31.2. Nieznany status

Rekord nie może zostać automatycznie zakwalifikowany do przychodu.

### 31.3. Niezgodna waluta

Rekord może pozostać dostępny w walucie źródłowej, ale nie może zostać zagregowany do wspólnego KPI bez polityki FX.

### 31.4. Nierozwiązany overlap

KPI zależny od nakładających się źródeł zostaje zablokowany albo ograniczony do jednego, jednoznacznego źródła.

### 31.5. Brak opłat

KPI przychodu może pozostać gotowy, ale KPI po opłatach pozostaje empty albo partial.

### 31.6. Opóźnienie providera

Dane mogą otrzymać timing: delayed albo stale, zamiast błędnie wskazywać pusty wynik.

### 31.7. Błąd reprocessingu

Poprzednia zweryfikowana wersja wyniku może pozostać historycznie dostępna, ale nie może być przedstawiana jako bieżąca bez oznaczenia.

## 32. Kryteria akceptacji kontraktu danych

Kontrakt jest spełniony dla danego zakresu, jeżeli:

1. każda warstwa danych ma określone znaczenie;

1. rekordy posiadają tenant i workspace;

1. lineage jest zachowane;

1. source overlap został oceniony;

1. source authority jest zatwierdzone tam, gdzie jest wymagane;

1. deduplikacja nie działa między tenantami;

1. jeden fakt zasila KPI jeden raz;

1. brak danych jest odróżniony od zera;

1. gotowość jest lokalna;

1. statusy nie są redukowane do jednego płaskiego pola;

1. każdy KPI posiada kontrakt;

1. dane transakcyjne są oddzielone od atrybucyjnych;

1. zmiany reguł są wersjonowane;

1. zależne dane mogą zostać przeliczone;

1. konflikty wskazują wpływ biznesowy;

1. AI nie korzysta z niedopuszczonych danych;

1. istnieje dowód testu jakości;

1. istnieje możliwość audytu wyniku.

## 33. Kryteria gotowości danych do pilotażu

Dane mogą zostać wykorzystane w pilotażu, jeżeli:

1. pochodzą z rzeczywistego źródła klienta;

1. należą do właściwego tenantu;

1. posiadają lineage;

1. zostały znormalizowane;

1. posiadają określony zakres czasu;

1. posiadają określoną walutę;

1. status mapping jest zatwierdzony;

1. wymagane source authority jest zatwierdzone;

1. nie istnieje niekontrolowane podwójne liczenie;

1. krytyczne konflikty zostały rozwiązane;

1. co najmniej jeden dataset jest ready;

1. co najmniej jeden KPI jest ready;

1. ograniczenia są jawne;

1. istnieje możliwość reprocessingu;

1. spełniono wymagania bezpieczeństwa z Dokumentu 7.

## 34. Kryteria gotowości pionu D2C

Minimalny pion D2C jest gotowy, jeżeli:

- istnieje jedno kwalifikujące się źródło sprzedażowe;

- orders dataset jest ready;

- status mapping jest zatwierdzony;

- liczba zamówień jest ready;

- Gross Revenue jest ready;

- refundy są obsługiwane albo ich ograniczenie jest jawne;

- nie istnieje podwójny wkład do KPI;

- first useful data został osiągnięty.

## 35. Kryteria gotowości pionu marketplace

Minimalny pion marketplace jest gotowy, jeżeli:

- kanał marketplace jest jednoznaczny;

- źródło danych jest określone;

- orders dataset jest ready;

- liczba zamówień jest ready;

- Gross Revenue jest ready;

- anulowania, zwroty i refundy posiadają zdefiniowaną obsługę;

- dostępność opłat jest jawna;

- brak opłat nie jest przedstawiany jako zero;

- ograniczenia KPI marżowych są jawne;

- source overlap został oceniony;

- first useful data został osiągnięty.

## 36. Kryteria gotowości omnichannel

Pion omnichannel może zostać dopuszczony, jeżeli:

1. wszystkie źródła posiadają lineage;

1. source overlap jest potwierdzony albo wykluczony;

1. source authority jest zatwierdzone;

1. model zamówienia kanonicznego jest zweryfikowany;

1. exact matching został przetestowany;

1. ewentualny fuzzy matching spełnia decyzję DEC-DAT-006;

1. false merge i false split są mierzone;

1. konflikty są kontrolowane;

1. jeden fakt zasila KPI jeden raz;

1. istnieje kontrolowany reprocessing;

1. KPI wieloźródłowe przeszły rekoncyliację;

1. koszt deduplikacji i manual review jest mierzony.

## 37. Traceability decyzji i wymagań

Tabela:
- Wiersz 1: Obszar; Decyzje; Wymagania
- Wiersz 2: Brak danych; DEC-DAT-001; REQ-DAT-003
- Wiersz 3: Jednokrotny wkład; DEC-DAT-002; REQ-DAT-004
- Wiersz 4: Gotowość lokalna; DEC-DAT-003; REQ-DAT-006
- Wiersz 5: Source authority; DEC-DAT-004; REQ-DAT-007
- Wiersz 6: Exact matching; DEC-DAT-005; REQ-DAT-009
- Wiersz 7: Fuzzy matching; DEC-DAT-006; REQ-DAT-010
- Wiersz 8: Izolacja deduplikacji; DEC-DAT-007; REQ-SEC-001
- Wiersz 9: Dane transakcyjne i atrybucyjne; DEC-DAT-008; REQ-DAT-008
- Wiersz 10: Metering; DEC-DAT-009; REQ-COM-004
- Wiersz 11: AI; DEC-AI-001; REQ-DAT-012, REQ-AI-001

## 38. Zdarzenia wymagające aktualizacji kontraktu

Aktualizacja dokumentu albo właściwego rekordu kontraktowego jest wymagana po:

- dodaniu nowego typu danych;

- dodaniu nowego providera;

- zmianie schematu providera;

- zmianie modelu kanonicznego;

- zmianie source authority;

- zmianie algorytmu deduplikacji;

- zmianie status mapping;

- zmianie formuły KPI;

- zmianie waluty raportowej;

- zmianie polityki FX;

- zmianie progu świeżości;

- zmianie reguł gotowości;

- zmianie zakresu wykorzystania AI;

- wykryciu błędu wpływającego na historyczne KPI.

Zmiana nie wymaga dodawania historii zmian do niniejszego dokumentu.

Wymaga natomiast:

1. aktualizacji wersjonowanego rekordu;

1. analizy wpływu;

1. wskazania zakresu reprocessingu;

1. testu;

1. zatwierdzenia;

1. zachowania audytu.

## 39. Dokumenty powiązane

1. Dokument 1 — Dokumentacja biznesowo-produktowa PapaData
1. Określa cele, wartość, zakres i etapy produktu.

1. Dokument 2 — Rejestr decyzji i wymagań biznesowych
1. Określa status i obowiązywanie decyzji użytych w niniejszym kontrakcie.

1. Dokument 4 — Integracje i gotowość operacyjna
1. Określa gotowość providerów, synchronizacji, monitoringu i recovery.

1. Dokument 5 — Pierwszy pion produktowy i płatny pilotaż
1. Wykorzystuje kontrakt danych i stanów w konkretnych procesach.

1. Dokument 6 — Model komercyjny i unit economics
1. Wykorzystuje dane o użyciu, kosztach, zamówieniach kanonicznych i pracy ręcznej.

1. Dokument 7 — Bezpieczeństwo, prywatność i AI Governance
1. Określa zabezpieczenia danych, tenant isolation, retencję, audyt i warunki AI.

## 40. Zatwierdzenie dokumentu

Dokument ustanawia obowiązujący kontrakt danych, stanów i KPI projektu PapaData.

Właściciel i osoba zatwierdzająca: Artur Wiśniewski
Data obowiązywania: 18 lipca 2026 roku
Wersja: 1.0

Dokument nie stanowi dowodu implementacji. Każde spełnienie kontraktu musi zostać potwierdzone odpowiednim testem, raportem, audytem albo innym dowodem przypisanym do konkretnego zakresu.
