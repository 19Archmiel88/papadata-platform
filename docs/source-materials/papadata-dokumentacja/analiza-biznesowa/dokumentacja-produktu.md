# PapaData — dokumentacja biznesowo-produktowa

## Metryka dokumentu

Dokument: Dokumentacja biznesowo-produktowa PapaData
Numer dokumentu: 1
Wersja: 2.0
Status: Finalny dokument bazowy
Data obowiązywania: 18 lipca 2026 roku
Właściciel dokumentu: Artur Wiśniewski
Właściciel biznesowy i produktowy: Artur Wiśniewski
Model odpowiedzialności: jednoosobowe governance przejściowe
Charakter projektu: projekt tworzony od podstaw
Zakres dokumentu: strategia produktu, problem biznesowy, rynek, użytkownicy, propozycja wartości, zakres, MVP, pilotaż, procesy biznesowe, model działania, KPI, ryzyka, zależności i kryteria akceptacji
Poza zakresem: projekt ekranów, komponentów, interakcji, nawigacji, stanów UI, finalnych komunikatów, szczegółowa architektura techniczna oraz konfiguracja infrastruktury

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Billing, usage, entitlements, limity, status subskrypcji, dokumenty rozliczeniowe oraz self-service należą do MVP. Funkcje płatnicze działają end-to-end dla wybranego providera i metod płatności dopuszczonych do MVP. Nieobsługiwane metody lub rynki nie są prezentowane jako dostępne; wymagany proces ręczny jest jawnie opisanym fallbackiem operacyjnym, a nie atrapą ekranu.

## 1. Status i sposób stosowania dokumentu

Dokument stanowi nadrzędną bazę biznesowo-produktową projektu PapaData.

Opisuje docelowy sposób działania produktu oraz wymagania, które powinny zostać spełnione w kolejnych etapach jego tworzenia. Nie stanowi potwierdzenia, że opisane funkcje, integracje, procesy, zabezpieczenia albo mechanizmy danych zostały już zaimplementowane.

PapaData jest projektem tworzonym od podstaw. Wszystkie opisy funkcji i procesów należy interpretować jako:

- zatwierdzony kierunek biznesowy;

- wymaganie docelowe;

- warunek wdrożenia;

- warunek dopuszczenia określonego zakresu do pilotażu lub sprzedaży;

- podstawę dalszej analizy produktowej i technicznej.

Dokument nie opisuje bieżącego stanu implementacji i nie może być wykorzystywany jako dowód gotowości technicznej, operacyjnej ani produkcyjnej.

Powyższa zasada wynika z decyzji DEC-DOC-001.

Dokument nie zawiera historii wcześniejszych wersji. Obowiązującą wersją jest wersja 1.0 z dnia 18 lipca 2026 roku.

Szczegółowe decyzje, ich wersje, uzasadnienia, daty obowiązywania oraz warunki ponownej oceny są utrzymywane wyłącznie w Dokumencie 2 — „Rejestr decyzji i wymagań biznesowych”.

Centralny rejestr jest jedynym źródłem prawdy dla statusu decyzji. Niniejszy dokument odwołuje się do decyzji za pomocą ich stabilnych identyfikatorów, zgodnie z decyzją DEC-DOC-002.

## 2. Governance i odpowiedzialność

### 2.1. Właściciel odpowiedzialny

Na obecnym etapie Artur Wiśniewski pełni funkcje:

- właściciela produktu;

- właściciela biznesowego;

- właściciela danych;

- właściciela KPI;

- właściciela integracji;

- właściciela bezpieczeństwa;

- właściciela prywatności;

- właściciela AI Governance;

- właściciela modelu komercyjnego;

- właściciela decyzji projektowych.

Taki model wynika z jednoosobowego charakteru projektu i ma charakter przejściowy.

Odwołanie do decyzji: DEC-GOV-001
Status decyzji: zatwierdzona

### 2.2. Ryzyko koncentracji odpowiedzialności

Skupienie wszystkich odpowiedzialności w jednej osobie ogranicza ryzyko braku decyzyjności, ale nie zapewnia niezależnej kontroli specjalistycznej.

Przed uruchomieniem zakresów obarczonych istotnym ryzykiem wymagane będzie uzyskanie niezależnej weryfikacji eksperckiej, w szczególności w obszarach:

- ochrony danych osobowych i RODO;

- prawa umów i regulaminów;

- podatków i rozliczeń;

- izolacji danych klientów;

- bezpieczeństwa produkcyjnego;

- testów penetracyjnych;

- backupu i odtwarzania danych;

- zobowiązań SLA, RTO i RPO;

- wykorzystywania AI na danych klientów;

- automatyzacji działań o istotnym wpływie.

Brak niezależnej weryfikacji nie blokuje tworzenia projektu ani pracy na danych testowych. Blokuje jednak zakresy, dla których wymagana jest formalna ocena prawna, bezpieczeństwa albo zgodności.

Odwołanie do decyzji: DEC-GOV-002
Status decyzji: zatwierdzona

## 3. Streszczenie biznesowe

PapaData jest planowaną platformą analityczno-decyzyjną dla firm prowadzących sprzedaż internetową.

Produkt ma łączyć dane pochodzące z różnych systemów sprzedażowych, marketplace, narzędzi marketingowych i analitycznych, a następnie:

- porządkować ich znaczenie biznesowe;

- identyfikować braki, konflikty i duplikaty;

- określać, którym danym i wskaźnikom można zaufać;

- obliczać spójne KPI;

- przedstawiać ograniczenia wyników;

- wskazywać problemy i możliwości;

- wspierać decyzje użytkownika;

- umożliwiać pomiar efektów podjętych działań.

Główną wartością PapaData nie ma być sama liczba integracji, liczba raportów ani samo wykorzystanie AI.

Główną wartością ma być dostarczenie użytkownikowi wiarygodnej odpowiedzi na trzy pytania:

1. Co rzeczywiście dzieje się w jego biznesie?

1. Którym danym i wskaźnikom może zaufać?

1. Jakie działanie powinien rozważyć i jak później zmierzyć jego rezultat?

Docelowy cykl wartości produktu:

źródła danych → normalizacja → kontrola jakości → dane kanoniczne → wiarygodny KPI → obserwacja lub rekomendacja → decyzja człowieka → działanie → pomiar rezultatu

## 4. Problem biznesowy

### 4.1. Problem klienta

Firmy e-commerce wykorzystują wiele niezależnych systemów, które mogą inaczej definiować i prezentować:

- zamówienia;

- przychód;

- anulowania;

- zwroty;

- refundy;

- opłaty marketplace;

- produkty i warianty;

- oferty;

- kampanie;

- konwersje;

- wartość konwersji;

- koszty;

- daty i strefy czasowe;

- waluty;

- statusy procesów.

Te same zdarzenia biznesowe mogą być dostępne jednocześnie w kilku systemach, na przykład bezpośrednio w Allegro oraz pośrednio przez BaseLinker.

Bez określenia nadrzędności źródeł i reguł deduplikacji może dojść do podwójnego liczenia sprzedaży.

Dane marketingowe mogą przedstawiać wartość atrybucyjną, która nie jest tym samym co rzeczywisty przychód transakcyjny.

Brak danych, na przykład o opłatach marketplace, może zostać błędnie zinterpretowany jako wartość zerowa.

### 4.2. Skutki problemu

Problemy z jakością i spójnością danych prowadzą do:

- sprzecznych wyników w różnych narzędziach;

- ręcznego łączenia raportów;

- niskiego zaufania do KPI;

- podwójnego liczenia zamówień;

- błędnej oceny przychodów;

- niepełnej oceny marży;

- błędnych decyzji marketingowych;

- trudności w ocenie rentowności kanałów;

- opóźnionego wykrywania problemów;

- braku możliwości zmierzenia efektów działań;

- wysokiego kosztu analizy i obsługi danych.

### 4.3. Problem wewnętrzny PapaData

PapaData musi uniknąć stworzenia produktu, który:

- prezentuje dane bez informacji o ich jakości;

- traktuje samo połączenie źródła jako gotowość analityczną;

- oblicza KPI na danych zdublowanych lub niekompletnych;

- ukrywa ograniczenia danych;

- wykorzystuje AI jako niekontrolowane źródło prawdy;

- generuje koszt operacyjny większy niż wartość komercyjna;

- wymaga ręcznej obsługi każdego klienta na poziomie uniemożliwiającym skalowanie.

## 5. Rynek i segmenty docelowe

### 5.1. Rynek startowy

Rynkiem startowym PapaData jest Polska.

Produkt powinien być od początku definiowany w sposób umożliwiający późniejsze wsparcie:

- wielu walut;

- różnych stref czasowych;

- sprzedaży transgranicznej;

- wielu sklepów;

- wielu kont marketplace;

- różnych modeli działalności;

- rozszerzenia na kolejne rynki.

Wielorynkowość jest wymaganiem przyszłościowym. Nie jest warunkiem pierwszego kontrolowanego pilotażu.

Odwołanie do decyzji: DEC-MKT-001
Status decyzji: zatwierdzona

### 5.2. Segmenty docelowe

PapaData adresuje trzy główne segmenty operacyjne.

#### D2C

Firmy prowadzące sprzedaż przez własny sklep internetowy, w szczególności z wykorzystaniem WooCommerce lub Shopify.

#### Marketplace

Firmy prowadzące sprzedaż przez platformy marketplace, w pierwszej kolejności Allegro, bezpośrednio albo z wykorzystaniem systemu typu OMS, takiego jak BaseLinker.

#### Omnichannel

Firmy łączące sprzedaż przez własne sklepy, marketplace i systemy pośredniczące.

Omnichannel jest segmentem o największym ryzyku podwójnego liczenia, konfliktów danych i złożoności operacyjnej. Nie powinien być pierwszym zakresem komercyjnym przed potwierdzeniem skuteczności source authority, canonicalization i deduplikacji.

Odwołania do decyzji: DEC-PRD-001, DEC-PRD-002
Status decyzji: zatwierdzone

### 5.3. Idealny profil klienta

Pierwszy klient pilotażowy powinien:

- prowadzić rzeczywistą sprzedaż internetową;

- korzystać z co najmniej jednego obsługiwanego źródła sprzedażowego;

- posiadać problem z rozproszonymi lub niespójnymi danymi;

- mieć osobę zdolną interpretować wyniki biznesowe;

- być gotowy udostępnić dane niezbędne do pilotażu;

- być gotowy uczestniczyć w walidacji jakości danych;

- zaakceptować kontrolowany zakres pilotażu;

- być gotowy zapłacić za pilotaż;

- zaakceptować, że część parametrów zostanie skalibrowana na podstawie rzeczywistych danych.

Klient nie musi korzystać ze wszystkich integracji.

Minimalny przypadek wartości wymaga:

pełnej aplikacji działającej na danych z zatwierdzonego katalogu integracji; pojedyncze źródło, dataset, KPI i rezultat są jedynie minimalnym przypadkiem testowym, a nie zakresem MVP

### 5.4. Kryteria negatywne

Na pierwszym etapie nie należy kwalifikować klientów, którzy:

- wymagają jednoczesnej obsługi wszystkich planowanych integracji;

- wymagają integracji, rynku albo metody płatności spoza zatwierdzonego katalogu MVP;

- wymagają złożonego SLA przed wykonaniem testów operacyjnych;

- oczekują pełnej automatyzacji decyzji;

- nie są w stanie udostępnić danych potrzebnych do walidacji;

- nie posiadają osoby odpowiedzialnej za ocenę biznesową wyników;

- wymagają pełnej obsługi omnichannel przed zweryfikowaniem deduplikacji;

- traktują pilotaż jako bezpłatne środowisko testowe.

### 5.5. TAM, SAM i SOM

W dostępnych materiałach nie ma wystarczających danych do zatwierdzenia liczbowych wartości TAM, SAM i SOM.

Brak liczbowego oszacowania rynku nie blokuje pierwszego kontrolowanego pilotażu. Blokuje jednak decyzję o skalowaniu sprzedaży, rozbudowie organizacji i tworzeniu długoterminowego planu finansowego.

Oszacowanie rynku musi zostać wykonane przed przejściem od etapu pilotaży do skalowania.

Metodologia powinna:

- oddzielać rynek wszystkich firm e-commerce od rynku firm posiadających rzeczywisty problem wieloźródłowych danych;

- wskazywać źródła danych;

- ujawniać przyjęte założenia;

- określać poziom niepewności;

- rozróżniać TAM, SAM i osiągalny SOM;

- uwzględniać realny model sprzedaży i zdolność operacyjną PapaData.

Odwołanie do decyzji: DEC-MKT-002
Status decyzji: warunkowa
Zakres obowiązywania: pierwszy kontrolowany pilotaż
Warunek ponownej oceny: przed zatwierdzeniem skalowania sprzedaży lub wieloletniego planu finansowego
Wymagany rezultat: zatwierdzone oszacowanie TAM, SAM i SOM wraz z metodologią i źródłami

## 6. Użytkownicy i interesariusze

### 6.1. Główne grupy użytkowników

#### Właściciel firmy lub osoba zarządzająca

Potrzebuje wiarygodnego obrazu sprzedaży, kosztów, problemów i efektów działań.

#### E-commerce Manager

Potrzebuje kontroli wyników sklepu, zamówień, refundów, źródeł ruchu i zmian wpływających na sprzedaż.

#### Marketplace Manager

Potrzebuje wiarygodnego obrazu sprzedaży marketplace, opłat, zwrotów, statusów ofert oraz zależności między Allegro i systemem pośredniczącym.

#### Marketing Manager lub Performance Specialist

Potrzebuje odróżnienia danych atrybucyjnych od transakcyjnych i możliwości oceny efektywności kampanii bez zastępowania rzeczywistej sprzedaży wartością raportowaną przez system reklamowy.

#### Analityk

Potrzebuje dostępu do definicji KPI, źródeł, ograniczeń, jakości i lineage.

#### Administrator tenanta lub workspace

Odpowiada za dostęp, członkostwa, uprawnienia, źródła i działania uprzywilejowane.

#### Osoba odpowiedzialna za integracje

Odpowiada operacyjnie za connect, reconnect, retry, diagnostykę i ocenę problemów ze źródłem.

### 6.2. Interesariusze zewnętrzni

- klienci pilotażowi;

- dostawcy źródeł danych;

- dostawcy infrastruktury;

- dostawcy modeli AI;

- procesorzy płatności;

- eksperci prawni i podatkowi;

- specjaliści bezpieczeństwa;

- partnerzy wdrożeniowi;

- przyszły Support i Operations.

## 7. Propozycja wartości

PapaData ma dostarczać wartość przez połączenie pięciu elementów.

### 7.1. Konsolidacja danych

Dane z wielu źródeł są sprowadzane do wspólnego modelu biznesowego.

### 7.2. Ocena wiarygodności

Produkt określa:

- kompletność;

- świeżość;

- jakość;

- konflikty;

- źródło;

- ograniczenia;

- poziom gotowości.

### 7.3. Ochrona przed błędną interpretacją

PapaData ma zapobiegać sytuacjom, w których:

- duplikat jest liczony drugi raz;

- brak danych jest przedstawiony jako zero;

- wartość atrybucyjna jest przedstawiona jako przychód;

- niepełny KPI jest prezentowany jako kompletny;

- gotowe połączenie jest przedstawione jako gotowy dataset;

- wynik AI zastępuje zatwierdzoną definicję biznesową.

### 7.4. Przejście od danych do decyzji

Produkt ma wspierać cykl:

obserwacja → interpretacja → decyzja → działanie → pomiar rezultatu

### 7.5. Jawne ograniczenia

Jeżeli wynik nie jest kompletny, użytkownik powinien otrzymać informację:

- czego brakuje;

- jaki jest wpływ braku;

- które wyniki pozostają wiarygodne;

- co należy zrobić dalej;

- kto powinien wykonać następne działanie.

## 8. Pozycjonowanie i konkurencja

### 8.1. Główne alternatywy klienta

Na obecnym etapie wyróżnia się następujące kategorie alternatyw:

- natywne raporty platform e-commerce;

- raporty marketplace;

- systemy reklamowe i analityczne;

- arkusze kalkulacyjne;

- narzędzia Business Intelligence;

- hurtownie danych budowane indywidualnie;

- agencje i analitycy zewnętrzni;

- systemy raportowe skoncentrowane na dashboardach;

- narzędzia AI analizujące dane bez własnego kontraktu jakości.

### 8.2. Planowany wyróżnik PapaData

PapaData nie powinna konkurować wyłącznie:

- liczbą integracji;

- liczbą wykresów;

- samą obecnością AI;

- szybkością stworzenia dashboardu;

- najniższą ceną.

Planowany wyróżnik:

- jawna gotowość danych;

- lokalna gotowość KPI;

- source authority;

- wykrywanie nakładania źródeł;

- kontrola deduplikacji;

- zachowanie lineage;

- prezentowanie ograniczeń;

- oddzielenie danych transakcyjnych od atrybucyjnych;

- rekomendacje oparte na zatwierdzonych KPI;

- pomiar rezultatu decyzji.

### 8.3. Analiza konkretnych konkurentów

Dostępne materiały nie zawierają kompletnej analizy konkretnych konkurentów, ich cen, udziałów rynkowych, segmentów docelowych ani porównania modelu wartości.

Analiza kategorii konkurencyjnych jest wystarczająca do przygotowania pierwszego kontrolowanego pilotażu.

Analiza konkretnych konkurentów jest wymagana przed:

- zatwierdzeniem finalnego pozycjonowania;

- zatwierdzeniem cennika skalowanego;

- rozpoczęciem szerokich działań marketingowych;

- wejściem na kolejne rynki;

- podjęciem istotnych decyzji inwestycyjnych.

Odwołanie do decyzji: DEC-MKT-003
Status decyzji: warunkowa
Zakres obowiązywania: przygotowanie i realizacja pierwszego kontrolowanego pilotażu
Warunek ponownej oceny: przed skalowaniem sprzedaży lub wejściem na kolejny rynek
Wymagany rezultat: zatwierdzona analiza konkurencji bezpośredniej, pośredniej i alternatyw klienta

## 9. Cele biznesowe i produktowe

### 9.1. Cel nadrzędny

Skrócić czas od połączenia źródła danych do uzyskania wiarygodnej informacji biznesowej, która może wspierać konkretną decyzję.

### 9.2. Cele produktowe

PapaData ma:

1. ograniczać ryzyko decyzji opartych na niepełnych, nieaktualnych lub zdublowanych danych;

1. zapewniać jedną definicję każdego zatwierdzonego KPI;

1. wskazywać źródło, jakość i ograniczenia wyniku;

1. zapobiegać podwójnemu liczeniu tych samych faktów biznesowych;

1. umożliwiać etapowe uruchamianie niezależnych pionów wartości;

1. zapewniać kontrolę człowieka nad istotnymi decyzjami i działaniami;

1. umożliwiać pomiar kosztu obsługi klienta;

1. dostarczyć podstawę płatnego pilotażu;

1. umożliwiać przejście od danych do mierzalnego działania;

1. stworzyć warunki do skalowania bez proporcjonalnego wzrostu pracy ręcznej.

### 9.3. Cele pierwszego etapu biznesowego

Pierwszy etap ma potwierdzić:

- że PapaData może dostarczyć wiarygodny KPI z rzeczywistych danych;

- że użytkownik rozumie wartość informacji o gotowości i ograniczeniach;

- że produkt rozwiązuje rzeczywisty problem decyzyjny;

- że klient jest gotowy zapłacić za pilotaż;

- że koszt onboardingu i utrzymania nie eliminuje marży;

- że wybrany pion może działać end-to-end;

- że wyniki są możliwe do zweryfikowania z klientem.

## 10. Zasady produktowe

### 10.1. Połączenie źródła nie oznacza gotowości danych

Należy rozdzielać:

- istnienie providera w katalogu;

- możliwość rozpoczęcia połączenia;

- poprawne uwierzytelnienie;

- pobranie danych;

- normalizację;

- canonicalization;

- kontrolę integralności;

- gotowość datasetu;

- gotowość KPI;

- gotowość pionu;

- gotowość operacyjną;

- gotowość produkcyjną.

### 10.2. Gotowość jest lokalna

Jeden KPI może być gotowy, podczas gdy inny pozostaje częściowy albo niedostępny.

Brak opłat marketplace nie powinien blokować informacji o liczbie zamówień i przychodzie brutto, ale powinien blokować przedstawienie pełnej marży po opłatach.

Odwołanie do decyzji: DEC-DAT-003
Status decyzji: zatwierdzona

### 10.3. Brak danych nie jest zerem

Wartość nie może zostać automatycznie zastąpiona zerem, jeżeli źródło nie potwierdza wartości zerowej.

Odwołanie do decyzji: DEC-DAT-001
Status decyzji: zatwierdzona

### 10.4. Jeden fakt zasila KPI jeden raz

Ten sam fakt biznesowy nie może wnosić wielokrotnego wkładu do KPI tylko dlatego, że został pobrany z kilku systemów.

Odwołanie do decyzji: DEC-DAT-002
Status decyzji: zatwierdzona

### 10.5. Dane transakcyjne i atrybucyjne są rozdzielone

Przychód sprzedażowy pochodzi z systemów transakcyjnych.

Wartości raportowane przez Google Ads, Meta Ads lub GA4 mają charakter atrybucyjny lub analityczny i nie zastępują automatycznie przychodu transakcyjnego.

### 10.6. AI nie jest źródłem prawdy

AI:

- nie definiuje KPI;

- nie ustala uprawnień;

- nie ustala source authority;

- nie zmienia danych źródłowych;

- nie podnosi gotowości danych;

- nie wykonuje istotnych działań bez zatwierdzonej kontroli;

- nie zastępuje decyzji człowieka w obszarach wysokiego ryzyka.

Odwołanie do decyzji: DEC-AI-001
Status decyzji: zatwierdzona

## 11. Zakres produktu

### 11.1. Zakres podstawowy

PapaData ma docelowo obejmować:

- tenanty i workspace;

- użytkowników, członkostwa i uprawnienia;

- konfigurację profilu działalności;

- wybór pionu wartości;

- integracje ze źródłami;

- pobieranie danych historycznych i bieżących;

- normalizację;

- model danych kanonicznych;

- lineage;

- kontrolę jakości;

- source authority;

- canonicalization;

- deduplikację;

- obsługę konfliktów;

- gotowość datasetów;

- gotowość KPI;

- analitykę;

- obserwacje i rekomendacje;

- rejestrowanie decyzji i działań;

- pomiar rezultatów;

- monitoring;

- procesy recovery;

- rozliczenia i limity;

- kontrolowane wykorzystanie AI.

### 11.2. Integracje docelowe

Docelowy zakres produktowy obejmuje następujące kategorie źródeł:

#### Sprzedaż i marketplace

- WooCommerce;

- Shopify;

- BaseLinker;

- Allegro.

#### Marketing i analityka

- Google Ads;

- Meta Ads;

- Google Analytics 4.

Włączenie integracji do docelowego zakresu nie oznacza, że każda integracja musi zostać uruchomiona jednocześnie.

Pełny katalog integracji, ich statusy, bramy gotowości oraz wymagane dowody są utrzymywane wyłącznie w Dokumencie 4 — „Integracje i gotowość operacyjna”.

### 11.3. Piony wartości

#### Pion D2C

Minimalnie obejmuje:

- jedno źródło sprzedażowe;

- zamówienia;

- liczbę zamówień;

- przychód brutto;

- podstawową obsługę anulowań i refundów;

- ocenę jakości;

- co najmniej jeden wiarygodny KPI.

#### Pion marketplace

Minimalnie obejmuje:

- identyfikację sprzedaży marketplace;

- zamówienia;

- przychód brutto;

- anulowania;

- zwroty i refundy;

- opłaty, jeżeli są dostępne;

- jawne ograniczenie marży, jeżeli opłat brakuje.

#### Pion omnichannel

Obejmuje łączenie danych z własnych sklepów, marketplace i opcjonalnie systemów pośredniczących.

Pion omnichannel wymaga:

- pełnego lineage;

- zatwierdzonego source authority;

- modelu zamówienia kanonicznego;

- deduplikacji między źródłami;

- kontroli konfliktów;

- możliwości ponownego przeliczenia KPI;

- pomiaru jakości dopasowania.

Omnichannel nie jest pierwszym pionem pilotażowym.

Odwołanie do decyzji: DEC-PRD-002
Status decyzji: zatwierdzona

## 12. Zakres MVP

### 12.1. Definicja MVP

MVP PapaData nie oznacza zestawu ekranów ani katalogu integracji.

MVP oznacza zdolność do dostarczenia co najmniej jednego kompletnego przepływu wartości na rzeczywistych danych:

połączenie źródła → pozyskanie danych → normalizacja → ocena jakości → gotowy KPI → interpretowalny rezultat

### 12.2. Zakres biznesowy MVP

MVP powinno obejmować:

- bezpieczny fundament dostępu i izolacji danych;

- jeden kompletny pion D2C;

- jeden kompletny pion marketplace;

- kontrakt danych i KPI;

- jawne stany gotowości;

- obsługę błędów i recovery;

- podstawowy monitoring;

- audyt krytycznych operacji;

- płatny pilotaż;

- pomiar kosztu i jakości.

### 12.3. Etapowe uruchomienie integracji

Integracje są uruchamiane etapowo, po spełnieniu bram przypisanych do konkretnego źródła i pionu wartości.

Shopify i Allegro direct należą do docelowego zakresu produktu, ale nie są bezwzględnymi blokerami pierwszego kontrolowanego pilotażu, jeżeli dostępny jest kompletny alternatywny pion wartości.

Dopuszczalne jest:

- uruchomienie pilotażu D2C przez WooCommerce przed Shopify;

- uruchomienie pilotażu marketplace przez BaseLinker, jeżeli kanał Allegro jest jednoznaczny, dane są wystarczające, a ograniczenia są jawne;

- uruchamianie kolejnych integracji niezależnie, po spełnieniu przypisanych im bram.

Obowiązująca kolejność:

1. bezpieczny fundament;

1. pion D2C z wykorzystaniem gotowego źródła;

1. pion marketplace z wykorzystaniem wiarygodnego źródła danych;

1. płatne pilotaże;

1. pomiar jakości, kosztów i pracy ręcznej;

1. kalibracja deduplikacji;

1. pion omnichannel;

1. dalsze integracje i skalowanie.

Odwołania do decyzji: DEC-PRD-003, DEC-PRD-004
Status decyzji: zatwierdzone

### 12.4. Zakres warunkowy

Do zakresu warunkowego należą:

- deduplikacja fuzzy;

- bezpośrednia integracja Shopify;

- bezpośrednia integracja Allegro;

- pełne KPI marżowe marketplace;

- wieloźródłowy omnichannel;

- rekomendacje AI korzystające z danych klientów;

- zaawansowana automatyzacja działań.

Element warunkowy może zostać uruchomiony wyłącznie po spełnieniu przypisanych kryteriów jakości, bezpieczeństwa, kosztu i gotowości operacyjnej.

Odwołanie do decyzji: DEC-PRD-005
Status decyzji: warunkowa
Zakres obowiązywania: rozwój MVP i kolejne etapy produktu
Warunek ponownej oceny: po uzyskaniu dowodów wymaganych dla konkretnej funkcji lub integracji
Wymagany rezultat: indywidualna decyzja o dopuszczeniu elementu do pilotażu, sprzedaży albo skalowania

## 13. Zakres poza pierwszym etapem

Pierwszy etap nie obejmuje obowiązkowo:

- nieobsługiwanych wariantów self-service poza providerem i metodami MVP;

- wszystkich integracji katalogowych;

- kompletnego omnichannel;

- automatycznego wykonywania istotnych decyzji przez AI;

- pełnej obsługi enterprise;

- formalnego SLA dla wszystkich klientów;

- wielorynkowej sprzedaży;

- kanału partnerskiego;

- zaawansowanej personalizacji;

- pełnej automatyzacji onboardingu;

- skalowania sprzedaży przed poznaniem unit economics;

- rozbudowanej organizacji Supportu;

- gwarancji dostępności przed testami operacyjnymi.

Pełny katalog integracji oraz ich klasyfikacja należą do Dokumentu 4.

## 14. Główne procesy biznesowe

Szczegółowy kontrakt procesów znajduje się w Dokumencie 5 — „Pierwszy pion produktowy i płatny pilotaż”.

Na poziomie nadrzędnym obowiązuje następujący przebieg:

1. użytkownik uzyskuje dostęp;

1. tworzy albo wybiera workspace;

1. podaje dane firmy i profilu prawnego;

1. określa model działalności;

1. wybiera pion wartości;

1. wybiera źródło danych;

1. ustanawia połączenie;

1. PapaData pobiera dane;

1. dane są normalizowane;

1. identyfikowane jest nakładanie źródeł;

1. wykonywana jest canonicalization i deduplikacja;

1. oceniana jest jakość danych;

1. oceniana jest gotowość datasetów;

1. obliczane są kwalifikujące się KPI;

1. użytkownik otrzymuje wynik wraz z ograniczeniami;

1. użytkownik interpretuje wynik;

1. użytkownik podejmuje decyzję;

1. rejestrowane jest działanie;

1. mierzony jest rezultat.

Proces nie może pomijać jakości, integralności i gotowości tylko po to, aby szybciej przedstawić wynik.

## 15. Pierwszy płatny pilotaż

### 15.1. Cel pilotażu

Pilotaż ma potwierdzić jednocześnie:

- wartość dla klienta;

- jakość danych;

- przydatność KPI;

- gotowość procesu;

- koszt onboardingu;

- koszt utrzymania;

- skalę pracy ręcznej;

- gotowość klienta do zapłaty;

- możliwość przejścia na abonament.

### 15.2. Model pilotażu

Pilotaż powinien być:

- płatny;

- ograniczony czasowo;

- ograniczony zakresem;

- oparty na rzeczywistych danych;

- przypisany do konkretnego pionu;

- oparty na uzgodnionym zestawie źródeł;

- oparty na uzgodnionym zestawie KPI;

- zakończony oceną jakości, wartości i kosztu;

- powiązany z warunkiem przejścia na dalszą współpracę.

Pilotaż nie jest bezpłatnym środowiskiem demonstracyjnym.

Odwołanie do decyzji: DEC-PIL-001
Status decyzji: zatwierdzona

### 15.3. Kryteria rozpoczęcia

Przed rozpoczęciem pilotażu wymagane są:

- jednoznaczny zakres;

- wybrany klient;

- wybrane źródło;

- potwierdzona podstawa prawna przetwarzania danych;

- izolacja danych klienta;

- zasady dostępu;

- procedura usunięcia danych;

- możliwość odtworzenia danych;

- minimalny threat model;

- zdefiniowane KPI;

- zasady gotowości;

- znany zakres Supportu;

- zatwierdzona cena;

- zaakceptowane warunki zakończenia.

Szczegółowe wymagania wejścia i wyjścia dla pilotażu są utrzymywane w Dokumencie 5.

### 15.4. Kryteria sukcesu

Pilotaż jest uznany za udany, jeżeli:

- dane zostały pozyskane i przetworzone;

- co najmniej jeden KPI spełnił kontrakt gotowości;

- klient potwierdził przydatność wyniku;

- nie wystąpiło niekontrolowane podwójne liczenie;

- ograniczenia danych były jawne;

- możliwe było wskazanie konkretnego wniosku biznesowego;

- zmierzono koszt obsługi;

- zmierzono pracę ręczną;

- określono warunki przejścia na abonament;

- nie wystąpiło naruszenie bezpieczeństwa lub izolacji danych.

## 16. Model komercyjny — kierunek nadrzędny

PapaData powinna stosować model hybrydowy:

opłata bazowa za pion wartości + wliczony pakiet użycia + opłata za dodatkowy wolumen lub źródła + opcjonalna opłata wdrożeniowa

Cena nie powinna być oparta wyłącznie na GMV klienta.

GMV może być wykorzystywane:

- do kwalifikacji klienta;

- jako wskaźnik skali działalności;

- jako element analizy wartości.

GMV nie powinno być podstawową jednostką technicznego meteringu.

Podstawą kosztu mogą być między innymi:

- liczba aktywnych źródeł;

- liczba przetworzonych zamówień kanonicznych;

- zakres historii;

- częstotliwość synchronizacji;

- reprocessing;

- deduplikacja;

- manual review;

- wykorzystanie AI;

- zakres Supportu.

Odwołanie do decyzji: DEC-COM-001
Status decyzji: zatwierdzona

Dokładne ceny, limity i progi rentowności zostaną określone w Dokumencie 6 — „Model komercyjny i unit economics”.

Do czasu uzyskania danych z płatnych pilotaży konkretne wartości cenowe i kosztowe mają charakter parametrów startowych wymagających walidacji.

Odwołanie do decyzji: DEC-COM-003
Status decyzji: warunkowa
Zakres obowiązywania: pierwsze płatne pilotaże
Warunek ponownej oceny: po uzyskaniu rzeczywistych kosztów i informacji o gotowości klientów do zapłaty
Wymagany rezultat: zatwierdzony cennik, minimalna opłacalna cena i progi marży

## 17. Bezpieczeństwo, prywatność i AI Governance

Dopuszczenie danych produkcyjnych klientów wymaga spełnienia minimalnych warunków bezpieczeństwa, prywatności, izolacji tenantów, ciągłości działania i kontroli AI.

Niniejszy dokument ustanawia wyłącznie nadrzędną bramę biznesową: zakres nie może zostać dopuszczony do pracy na danych produkcyjnych, jeżeli nie spełnia wymagań przypisanych do tej bramy.

Pełny kontrakt zasad, kontroli, dowodów, procedur i kryteriów akceptacji znajduje się wyłącznie w Dokumencie 7 — „Bezpieczeństwo, prywatność i AI Governance”.

Odwołanie do decyzji: DEC-GOV-002
Status decyzji: zatwierdzona

## 18. KPI sukcesu produktu

### 18.1. KPI wartości

- czas do pierwszych użytecznych danych;

- czas do pierwszego gotowego KPI;

- odsetek klientów, którzy uzyskali interpretowalny rezultat;

- odsetek pilotaży zakończonych przejściem na dalszą współpracę;

- liczba decyzji podjętych na podstawie gotowych KPI;

- odsetek działań, dla których zmierzono rezultat.

### 18.2. KPI danych

- odsetek KPI z pełnym lineage;

- odsetek KPI z jawną gotowością;

- liczba wykrytych konfliktów źródeł;

- jakość deduplikacji;

- liczba false merge;

- liczba false split;

- liczba rekordów wymagających manual review;

- czas rekoncyliacji;

- udział danych stale, partial i empty.

### 18.3. KPI operacyjne

- czas onboardingu;

- liczba interwencji ręcznych;

- liczba problemów integracyjnych;

- średni czas recovery;

- liczba nieudanych synchronizacji;

- liczba reprocessingów;

- liczba zgłoszeń Supportu;

- koszt Supportu na klienta.

### 18.4. KPI komercyjne

- przychód z pilotażu;

- koszt onboardingu;

- COGS na klienta;

- marża na kliencie;

- koszt aktywnego źródła;

- koszt tysiąca zamówień kanonicznych;

- koszt deduplikacji;

- koszt reprocessingu;

- koszt wykorzystania AI;

- konwersja pilotaż–abonament;

- churn;

- expansion.

### 18.5. KPI bezpieczeństwa i jakości

- liczba naruszeń izolacji tenantów;

- liczba nieautoryzowanych operacji;

- skuteczność odtworzenia danych;

- czas wykrycia incydentu;

- czas reakcji;

- liczba operacji krytycznych bez dowodu audytowego;

- liczba wyników AI opartych na niegotowym KPI.

### 18.6. Progi KPI

Wartości docelowe i progi akceptacji zostaną zatwierdzone po uzyskaniu danych z pierwszych pilotaży albo przed bramą, dla której konkretny próg jest wymagany.

Cost Observability obowiązuje od pierwszego pilotażu i stanowi bramę skalowania.

Odwołanie do decyzji: DEC-COM-002
Status decyzji: warunkowa
Zakres obowiązywania: pierwszy pilotaż i etap przed skalowaniem
Warunek ponownej oceny: po zebraniu reprezentatywnych danych kosztowych
Wymagany rezultat: zatwierdzone progi kosztu, marży, pracy ręcznej i opłacalności segmentu

## 19. Główne ryzyka

### 19.1. Ryzyko koncentracji odpowiedzialności

Jedna osoba pełni wiele funkcji kontrolnych.

Reakcja: jawne opisanie modelu przejściowego i obowiązkowa niezależna weryfikacja przed określonymi bramami.

### 19.2. Ryzyko papierowej architektury

Dokumentacja może wyprzedzać implementację i walidację.

Reakcja: dokumentacja opisuje wymagania docelowe, a nie istniejący stan. Każdy status wdrożenia wymaga dowodu.

### 19.3. Ryzyko podwójnego liczenia

Nakładanie danych z Allegro i BaseLinkera albo Shopify i BaseLinkera może zniekształcić KPI.

Reakcja: source authority, canonicalization, deduplikacja i test na danych rzeczywistych.

### 19.4. Ryzyko braku danych o opłatach

Brak opłat marketplace może uniemożliwić obliczenie pełnej marży.

Reakcja: brak pozostaje brakiem; gotowe KPI niezależne pozostają dostępne; KPI zależne mają ograniczony status gotowości.

### 19.5. Ryzyko zbyt szerokiego MVP

Próba jednoczesnego uruchomienia wszystkich integracji może opóźnić wejście na rynek.

Reakcja: etapowe uruchamianie kompletnych pionów.

### 19.6. Ryzyko kosztu pracy ręcznej

Onboarding, manual review, deduplikacja i Support mogą ograniczyć marżę.

Reakcja: Cost Observability od pierwszego pilotażu.

### 19.7. Ryzyko braku walidacji cenowej

Struktura cenowa może nie odpowiadać gotowości rynku do zapłaty.

Reakcja: płatny pilotaż, konkretna cena i pomiar przejścia na abonament.

### 19.8. Ryzyko bezpieczeństwa danych

Błąd izolacji lub dostępu może ujawnić dane innego klienta.

Reakcja: zastosowanie wymagań, testów i bram określonych w Dokumencie 7.

### 19.9. Ryzyko niekontrolowanego AI

AI może przedstawić rekomendację na podstawie niegotowych lub niepełnych danych.

Reakcja: AI korzysta wyłącznie z kwalifikujących się danych, wskazuje podstawę i pozostaje pod kontrolą człowieka.

### 19.10. Ryzyko braku walidacji rynku

Brak liczbowego TAM, SAM, SOM i szczegółowej analizy konkurencji może prowadzić do błędnych decyzji o skalowaniu.

Reakcja: brak nie blokuje pierwszego kontrolowanego pilotażu, ale blokuje skalowanie.

## 20. Zależności

Realizacja wartości PapaData zależy od:

- dostępu do danych providerów;

- stabilności ich API;

- jakości danych klientów;

- możliwości jednoznacznego identyfikowania faktów biznesowych;

- zasad source authority;

- skuteczności deduplikacji;

- zgodności prawnej;

- izolacji danych;

- monitoringu;

- kosztu infrastruktury;

- dostępności klienta podczas walidacji;

- gotowości klienta do zapłaty;

- niezależnej oceny specjalistycznej;

- właściwego rozdzielenia etapów pilotażu i skalowania.

## 21. Kryteria akceptacji biznesowej MVP

MVP może zostać uznane za biznesowo gotowe, jeżeli:

1. wszystkie funkcje D2C przewidziane dla MVP działają dla obsługiwanych providerów;

1. wszystkie funkcje marketplace przewidziane dla MVP działają dla obsługiwanych providerów;

1. co najmniej jeden klient przeszedł kontrolowany proces pilotażowy;

1. klient otrzymał wiarygodny KPI z rzeczywistych danych;

1. KPI posiada źródło, definicję, lineage i poziom gotowości;

1. podwójne liczenie zostało wyeliminowane albo zakres nie zawiera nakładających się źródeł;

1. brakujące dane zostały przedstawione jako braki, nie jako zera;

1. dostęp do danych jest izolowany między klientami;

1. spełniono wymagania bezpieczeństwa i prywatności przypisane do pilotażu;

1. proces posiada obsługę błędów i recovery;

1. zmierzono koszt onboardingu i obsługi;

1. znana jest cena pilotażu;

1. istnieje podstawa przejścia z pilotażu na abonament;

1. wszystkie blokery przypisane do pilotażu posiadają dowód spełnienia;

1. Artur Wiśniewski zatwierdził wynik bramy MVP;

1. wymagane obszary specjalistyczne zostały niezależnie zweryfikowane.

Spełnienie kryterium biznesowego nie zastępuje technicznego, operacyjnego ani bezpieczeństwa dowodu gotowości.

## 22. Etapy realizacji

### Etap 1 — fundament decyzyjny i bezpieczeństwo

- centralny rejestr decyzji;

- governance;

- zasady danych;

- izolacja tenantów;

- dostęp i MFA;

- procedura usunięcia danych;

- backup i restore;

- minimalny threat model.

### Etap 2 — rozszerzenie katalogu integracji, rynków i skali

- źródło sprzedażowe;

- dane zamówień;

- normalizacja;

- KPI;

- gotowość;

- proces end-to-end.

### Etap 3 — pierwszy kompletny pion marketplace

- dane Allegro bezpośrednio albo przez BaseLinker;

- jawne pochodzenie kanału;

- zamówienia i przychód;

- refundy i zwroty;

- ograniczenia dotyczące opłat.

### Etap 4 — płatne pilotaże

- klient;

- cena;

- zakres;

- KPI;

- warunki sukcesu;

- pomiar kosztu i wartości.

### Etap 5 — kalibracja

- jakość danych;

- deduplikacja;

- manual review;

- Cost Observability;

- cena;

- warunki abonamentu.

### Etap 6 — omnichannel

- source overlap;

- source authority;

- deduplikacja;

- konflikty;

- ponowne przeliczenia;

- KPI wieloźródłowe.

### Etap 7 — skalowanie

- powtarzalny onboarding;

- niższy koszt pracy ręcznej;

- finalny model cenowy;

- analiza TAM, SAM i SOM;

- analiza konkurencji;

- kanały sprzedaży;

- self-service;

- kolejne integracje.

## 23. Indeks decyzji nadrzędnych

Poniższe identyfikatory są odwołaniami do rekordów, których pełna treść, uzasadnienie, wersja, data obowiązywania, właściciel, kryteria weryfikacji i historia zastąpień znajdują się wyłącznie w Dokumencie 2.

Tabela:
- Wiersz 1: ID decyzji; Obszar
- Wiersz 2: DEC-DOC-001; Dokumentacja opisuje stan docelowy, nie istniejącą implementację
- Wiersz 3: DEC-DOC-002; Centralny rejestr jest jedynym źródłem prawdy dla decyzji
- Wiersz 4: DEC-GOV-001; Jednoosobowe governance przejściowe
- Wiersz 5: DEC-GOV-002; Niezależna weryfikacja obszarów specjalistycznych
- Wiersz 6: DEC-MKT-001; Polska jako rynek startowy
- Wiersz 7: DEC-MKT-002; Warunkowe podejście do TAM, SAM i SOM
- Wiersz 8: DEC-MKT-003; Warunkowe podejście do analizy konkurencji
- Wiersz 9: DEC-PRD-001; D2C i marketplace jako pierwsze segmenty
- Wiersz 10: DEC-PRD-002; Omnichannel jako etap późniejszy
- Wiersz 11: DEC-PRD-003; Etapowe uruchamianie produktu i integracji
- Wiersz 12: DEC-PRD-004; Shopify i Allegro direct nie są globalnymi blokerami pilotażu
- Wiersz 13: DEC-PRD-005; Warunkowe dopuszczanie elementów zaawansowanych
- Wiersz 14: DEC-PIL-001; Płatny model pierwszych pilotaży
- Wiersz 15: DEC-DAT-001; Brak danych nie jest wartością zero
- Wiersz 16: DEC-DAT-002; Jeden fakt biznesowy zasila KPI jeden raz
- Wiersz 17: DEC-DAT-003; Gotowość danych i KPI jest lokalna
- Wiersz 18: DEC-AI-001; AI nie jest źródłem prawdy
- Wiersz 19: DEC-COM-001; Hybrydowy model komercyjny
- Wiersz 20: DEC-COM-002; Cost Observability jako brama skalowania
- Wiersz 21: DEC-COM-003; Warunkowe ceny i progi do czasu walidacji pilotażowej

Zmiana statusu lub treści decyzji w Dokumencie 2 wymaga analizy wpływu na wszystkie odwołania do jej identyfikatora w niniejszym dokumencie.

## 24. Dokumenty powiązane

Docelowy pakiet dokumentacji PapaData obejmuje:

1. Dokumentacja biznesowo-produktowa PapaData — niniejszy dokument.

1. Rejestr decyzji i wymagań biznesowych — jedyne źródło prawdy dla decyzji, ich wersji, statusów i uzasadnień.

1. Kontrakt danych, stanów i KPI — zasady danych, gotowości, source authority, deduplikacji, jakości i obliczania KPI.

1. Integracje i gotowość operacyjna — katalog integracji, statusy, bramy, synchronizacja, monitoring, recovery i gotowość produkcyjna.

1. Pierwszy pion produktowy i płatny pilotaż — szczegółowe procesy, onboarding, warunki pilotażu i kryteria sukcesu.

1. Model komercyjny i unit economics — ceny, limity, COGS, marża, rentowność i progi skalowania.

1. Bezpieczeństwo, prywatność i AI Governance — pełny kontrakt bezpieczeństwa, prywatności, ciągłości działania i kontroli AI.

Dokumenty 2–7 rozwijają zasady niniejszego dokumentu w swoich domenach. Nie powinny powielać jego treści poza niezbędnym kontekstem i odwołaniami do stabilnych identyfikatorów decyzji.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
