# PapaData — rejestr decyzji i wymagań biznesowych

## Metryka dokumentu

Dokument: Rejestr decyzji i wymagań biznesowych PapaData
Numer dokumentu: 2
Wersja: 2.0
Status: Finalny dokument kontrolny
Data obowiązywania: 18 lipca 2026 roku
Właściciel dokumentu: Artur Wiśniewski
Właściciel decyzji: Artur Wiśniewski
Właściciel wymagań: Artur Wiśniewski
Model odpowiedzialności: jednoosobowe governance przejściowe
Charakter projektu: projekt tworzony od podstaw
Zakres dokumentu: decyzje biznesowe i produktowe, wymagania przekrojowe, statusy, wersjonowanie, odpowiedzialność, weryfikacja, zależności oraz śledzenie wpływu
Poza zakresem: projekt interfejsu, szczegółowa architektura techniczna, konfiguracja infrastruktury, szczegółowe kontrakty providerów, pełne formuły KPI oraz instrukcje operacyjne

## 1. Cel dokumentu

Dokument jest centralnym rejestrem decyzji i wymagań biznesowo-analitycznych PapaData.

Jego celem jest zapewnienie jednej odpowiedzi na pytania:

1. Jaka decyzja obowiązuje?

1. Jaki jest jej status?

1. Kto za nią odpowiada?

1. Dlaczego została podjęta?

1. Jakiego zakresu dotyczy?

1. Kiedy wymaga ponownej oceny?

1. Jak zostanie zweryfikowana?

1. Które dokumenty i wymagania są od niej zależne?

1. Jakie ryzyko powstanie, jeśli decyzja lub wymaganie nie zostaną zrealizowane?

Rejestr zastępuje rozproszone listy decyzji otwartych występujące we wcześniejszej dokumentacji.

W pozostałych dokumentach decyzje powinny być przywoływane przez stabilny identyfikator. Nie należy powielać ich pełnej treści, statusu ani uzasadnienia, jeżeli nie jest to konieczne do zrozumienia danego procesu.

## 2. Pozycja dokumentu w pakiecie

Dokument 2 jest jedynym źródłem prawdy w zakresie:

- treści decyzji;

- wersji decyzji;

- statusu decyzji;

- właściciela decyzji;

- zakresu obowiązywania;

- podstawy decyzji;

- warunków ponownej oceny;

- decyzji zastępujących;

- odrzucenia wariantu;

- wymaganych dowodów.

Dokument 2 nie zastępuje szczegółowych kontraktów domenowych.

Podział odpowiedzialności:

- Dokument 1 określa nadrzędny kierunek biznesowy i produktowy.

- Dokument 2 utrzymuje decyzje, wymagania i traceability.

- Dokument 3 rozwija kontrakt danych, stanów i KPI.

- Dokument 4 rozwija wymagania integracji i gotowości operacyjnej.

- Dokument 5 rozwija procesy pierwszego pionu i płatnego pilotażu.

- Dokument 6 rozwija model komercyjny i ekonomikę jednostkową.

- Dokument 7 rozwija bezpieczeństwo, prywatność i AI Governance.

W przypadku sprzeczności:

1. status i obowiązywanie decyzji ustala Dokument 2;

1. znaczenie biznesowe ustala Dokument 1;

1. szczegółową regułę domenową ustala właściwy dokument specjalistyczny;

1. dowód wdrożenia nie wynika z samego zatwierdzenia decyzji lub wymagania.

## 3. Zasady interpretacji

### 3.1. Decyzja nie jest dowodem wdrożenia

Status „zatwierdzona” oznacza, że kierunek obowiązuje.

Nie oznacza, że:

- funkcja została zaimplementowana;

- mechanizm został przetestowany;

- integracja działa;

- osiągnięto gotowość operacyjną;

- zakres może zostać udostępniony klientom;

- istnieje dowód spełnienia wymagania.

### 3.2. Projekt jest tworzony od podstaw

Rejestr opisuje wymagany stan docelowy.

Nie należy interpretować żadnego wpisu jako potwierdzenia istnienia:

- architektury;

- integracji;

- pipeline’ów danych;

- mechanizmów bezpieczeństwa;

- środowiska produkcyjnego;

- procesów operacyjnych;

- gotowych funkcji AI;

- gotowego modelu rozliczeniowego.

### 3.3. Brak pytania otwartego nie oznacza pozornej pewności

Jeżeli decyzja wymaga danych z pilotażu, testu, pomiaru albo ekspertyzy, otrzymuje status warunkowa.

Decyzja warunkowa:

- zawiera konkretną obowiązującą regułę;

- obowiązuje w określonym zakresie;

- wskazuje założenia;

- określa zdarzenie ponownej oceny;

- wskazuje wymagany rezultat walidacji;

- nie jest pytaniem pozostawionym bez odpowiedzi.

### 3.4. Jedna decyzja — jeden rekord

Każda decyzja posiada jeden stabilny identyfikator.

Zmiana decyzji nie powoduje usunięcia starego rekordu. Dotychczasowa decyzja otrzymuje status „zastąpiona”, a nowa wskazuje rekord poprzedni.

### 3.5. Jednoosobowe governance

Artur Wiśniewski odpowiada za decyzje biznesowe i produktowe na obecnym etapie projektu.

W obszarach prawnych, podatkowych, bezpieczeństwa, prywatności oraz innych obszarach specjalistycznych jego zatwierdzenie nie zastępuje niezależnej opinii eksperta wymaganej przed określoną bramą.

## 4. Model rekordu decyzji

Każdy rekord decyzji zawiera:

Tabela:
- Wiersz 1: Pole; Znaczenie
- Wiersz 2: ID; Stabilny identyfikator decyzji
- Wiersz 3: Wersja; Wersja konkretnej decyzji
- Wiersz 4: Status; Zatwierdzona, warunkowa, zastąpiona albo odrzucona
- Wiersz 5: Domena; Obszar odpowiedzialności
- Wiersz 6: Zakres; Etap lub część produktu, której dotyczy
- Wiersz 7: Treść; Jednoznaczna obowiązująca reguła
- Wiersz 8: Uzasadnienie; Powód podjęcia decyzji
- Wiersz 9: Właściciel; Osoba odpowiedzialna za decyzję
- Wiersz 10: Weryfikacja niezależna; Informacja, czy wymagany jest ekspert zewnętrzny
- Wiersz 11: Warunek ponownej oceny; Zdarzenie powodujące obowiązkową rewizję
- Wiersz 12: Wymagany rezultat; Rezultat, jaki ma zostać osiągnięty
- Wiersz 13: Dokument odpowiedzialny; Dokument rozwijający szczegóły
- Wiersz 14: Ryzyko naruszenia; Skutek niezastosowania decyzji

Wersja początkowa wszystkich decyzji w niniejszym dokumencie to 1.0, o ile nie wskazano inaczej.

## 5. Statusy decyzji

### 5.1. Zatwierdzona

Decyzja obowiązuje i nie posiada zaplanowanego terminu ponownej oceny.

Może zostać zmieniona wyłącznie przez utworzenie nowej wersji lub decyzji zastępującej.

### 5.2. Warunkowa

Decyzja obowiązuje w określonym zakresie, ale wymaga ponownej oceny po wystąpieniu wskazanego zdarzenia.

### 5.3. Zastąpiona

Decyzja nie obowiązuje. Rekord musi wskazywać decyzję następczą.

### 5.4. Odrzucona

Wariant został przeanalizowany i nie został przyjęty.

Odrzucenie powinno pozostać w rejestrze, jeżeli istnieje ryzyko ponownego zaproponowania tego samego wariantu bez uwzględnienia wcześniejszego uzasadnienia.

## 6. Statusy wymagań

Status wymagania opisuje jego obowiązywanie, a nie stan implementacji.

### 6.1. Obowiązujące

Wymaganie należy spełnić w przypisanym zakresie.

### 6.2. Warunkowe

Wymaganie stosuje się po uruchomieniu określonego zakresu albo po spełnieniu wskazanego warunku.

### 6.3. Późniejszy etap

Wymaganie nie należy do pierwszego etapu, ale pozostaje częścią zatwierdzonego kierunku.

### 6.4. Wyłączone

Wymaganie nie należy do zatwierdzonego zakresu.

### 6.5. Zastąpione

Wymaganie zostało zastąpione nową regułą.

Status wymagania nie może przyjmować wartości „wdrożone” ani „zweryfikowane” bez wskazania osobnego dowodu w dokumentacji realizacyjnej.

## CZĘŚĆ I — REJESTR DECYZJI

## 7. Dokumentacja i governance

### DEC-DOC-001 — Dokumentacja opisuje stan docelowy

Status: zatwierdzona
Domena: dokumentacja
Zakres: wszystkie etapy

Treść decyzji:
Dokumentacja PapaData opisuje wymagany stan docelowy projektu tworzonego od podstaw. Nie potwierdza istnienia funkcji, architektury, integracji ani gotowości produkcyjnej.

Uzasadnienie:
Rozdzielenie wymagania od dowodu wdrożenia ogranicza ryzyko papierowej architektury i błędnego raportowania gotowości.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: niewymagana
Warunek ponownej oceny: brak
Wymagany rezultat: każdy dokument jednoznacznie odróżnia stan docelowy od dowodu realizacji
Dokument odpowiedzialny: wszystkie dokumenty
Ryzyko naruszenia: podjęcie decyzji biznesowej na podstawie nieistniejących możliwości produktu

### DEC-DOC-002 — Centralny rejestr decyzji

Status: zatwierdzona
Domena: dokumentacja
Zakres: wszystkie etapy

Treść decyzji:
Dokument 2 jest jedynym źródłem prawdy dla treści, wersji i statusu decyzji.

Uzasadnienie:
Powielanie decyzji w wielu dokumentach powoduje rozjazd treści, statusów i odpowiedzialności.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: niewymagana
Warunek ponownej oceny: zmiana modelu zarządzania dokumentacją
Wymagany rezultat: pozostałe dokumenty odwołują się do decyzji przez ID
Dokument odpowiedzialny: Dokument 2
Ryzyko naruszenia: kilka konkurencyjnych źródeł prawdy

### DEC-GOV-001 — Jednoosobowe governance przejściowe

Status: zatwierdzona
Domena: governance
Zakres: obecny etap projektu

Treść decyzji:
Artur Wiśniewski pełni przejściowo funkcje właściciela produktu, biznesu, danych, KPI, integracji, bezpieczeństwa, prywatności, AI Governance, modelu komercyjnego oraz decyzji.

Uzasadnienie:
Projekt jest rozwijany jednoosobowo. Jawne przypisanie odpowiedzialności jest lepsze niż pozostawianie pustych ról.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: niewymagana dla samego modelu
Warunek ponownej oceny: dołączenie osoby przejmującej stałą odpowiedzialność za określoną domenę
Wymagany rezultat: zaktualizowana macierz odpowiedzialności
Dokument odpowiedzialny: Dokumenty 1 i 2
Ryzyko naruszenia: brak jednoznacznej odpowiedzialności albo niejawne oczekiwania wobec nieistniejących ról

### DEC-GOV-002 — Niezależna weryfikacja specjalistyczna

Status: zatwierdzona
Domena: governance
Zakres: dane produkcyjne, sprzedaż, bezpieczeństwo, prawo, podatki i AI wysokiego ryzyka

Treść decyzji:
Jednoosobowe governance nie zastępuje niezależnej weryfikacji specjalistycznej przed bramami wymagającymi wiedzy prawnej, podatkowej, bezpieczeństwa, prywatności albo ciągłości działania.

Uzasadnienie:
Właściciel produktu nie powinien samodzielnie pełnić funkcji jedynej kontroli w obszarach, w których błąd może skutkować naruszeniem prawa, utratą danych albo zobowiązaniem umownym.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: obowiązkowa przed odpowiednią bramą
Warunek ponownej oceny: ustanowienie stałych właścicieli domenowych
Wymagany rezultat: opinia, test, audyt albo formalne zatwierdzenie eksperta
Dokument odpowiedzialny: Dokument 7 oraz Dokument 6 w sprawach prawno-podatkowych
Ryzyko naruszenia: konflikt interesów i brak zasady niezależnej kontroli

## 8. Rynek, produkt i zakres

### DEC-MKT-001 — Polska jako rynek startowy

Status: zatwierdzona
Domena: rynek
Zakres: pierwszy etap komercyjny

Treść decyzji:
Rynkiem startowym PapaData jest Polska.

Uzasadnienie:
Koncentracja na jednym rynku ogranicza złożoność sprzedaży, podatków, lokalizacji i obsługi pierwszych pilotaży.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: wymagana prawno-podatkowo przed sprzedażą
Warunek ponownej oceny: decyzja o wejściu na kolejny rynek
Wymagany rezultat: zatwierdzony plan ekspansji i ocena wymagań lokalnych
Dokument odpowiedzialny: Dokumenty 1 i 6
Ryzyko naruszenia: rozproszenie zasobów i niekontrolowane zobowiązania transgraniczne

### DEC-MKT-002 — TAM, SAM i SOM przed skalowaniem

Status: warunkowa
Domena: rynek
Zakres: pilotaż i skalowanie

Treść decyzji:
Brak liczbowego TAM, SAM i SOM nie blokuje pierwszego kontrolowanego pilotażu, ale blokuje skalowanie sprzedaży, istotne inwestycje organizacyjne i wieloletni plan finansowy.

Uzasadnienie:
Pilotaż służy walidacji problemu i gotowości do zapłaty. Skalowanie wymaga zewnętrznego uzasadnienia potencjału rynku.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: rekomendowana
Warunek ponownej oceny: przed zatwierdzeniem skalowania
Wymagany rezultat: TAM, SAM i SOM wraz ze źródłami, metodą i poziomem niepewności
Dokument odpowiedzialny: Dokument 1
Ryzyko naruszenia: skalowanie na rynku o niewystarczającym potencjale

### DEC-MKT-003 — Analiza konkurencji przed skalowaniem

Status: warunkowa
Domena: rynek
Zakres: pilotaż i skalowanie

Treść decyzji:
Analiza kategorii alternatyw jest wystarczająca do pierwszego pilotażu. Analiza konkretnych konkurentów jest wymagana przed finalnym pozycjonowaniem, szerokim marketingiem, skalowaniem albo wejściem na kolejny rynek.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: niewymagana
Warunek ponownej oceny: przed skalowaniem lub ekspansją
Wymagany rezultat: analiza konkurencji bezpośredniej, pośredniej i alternatyw klienta
Dokument odpowiedzialny: Dokument 1
Ryzyko naruszenia: nieadekwatne pozycjonowanie i cena

### DEC-MKT-004 — Progi kwalifikacji ICP

Status: warunkowa
Domena: rynek i sprzedaż
Zakres: pierwsze pilotaże

Treść decyzji:
Pierwszych klientów kwalifikuje się przede wszystkim na podstawie problemu danych, gotowości organizacyjnej, dostępności źródła oraz gotowości do płatnego pilotażu. Twarde progi GMV, liczby zamówień i budżetu reklamowego zostaną ustalone po uzyskaniu danych z pierwszych pilotaży.

Uzasadnienie:
Brak danych empirycznych nie uzasadnia arbitralnego wykluczania klientów wyłącznie na podstawie skali sprzedaży.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: po pierwszych płatnych pilotażach
Wymagany rezultat: zatwierdzone kryteria kwalifikacji i dyskwalifikacji
Dokument odpowiedzialny: Dokumenty 1, 5 i 6
Ryzyko naruszenia: dobór klientów bez potencjału wartości albo klientów zbyt złożonych na pierwszy etap

### DEC-PRD-001 — D2C i marketplace jako pierwsze segmenty

Status: zatwierdzona
Domena: produkt
Zakres: MVP

Treść decyzji:
Pierwszy zakres produktu obejmuje niezależny pion D2C oraz niezależny pion marketplace.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: wyniki pilotaży wykazujące brak wartości jednego z pionów
Wymagany rezultat: co najmniej jeden kompletny przepływ wartości w każdym pionie
Dokument odpowiedzialny: Dokumenty 1 i 5
Ryzyko naruszenia: zakres niepotwierdzający dwóch podstawowych modeli sprzedaży

### DEC-PRD-002 — Omnichannel jako etap późniejszy

Status: zatwierdzona
Domena: produkt
Zakres: po pierwszych pilotażach

Treść decyzji:
Omnichannel nie jest pierwszym pionem pilotażowym. Może zostać dopuszczony po potwierdzeniu source authority, modelu kanonicznego, deduplikacji, konfliktów i przeliczeń zależnych KPI.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: spełnienie bramy integralności danych
Wymagany rezultat: zweryfikowany proces wieloźródłowy
Dokument odpowiedzialny: Dokumenty 3, 4 i 5
Ryzyko naruszenia: podwójne liczenie i utrata zaufania do podstawowej wartości produktu

### DEC-PRD-003 — Etapowe uruchamianie produktu

Status: zatwierdzona
Domena: produkt
Zakres: MVP i kolejne wydania

Treść decyzji:
PapaData MVP obejmuje kompletną funkcjonalność aplikacji. Wydania są rozszerzane etapowo przez dodawanie kolejnych kompletnych integracji, providerów, wariantów, rynków i skali. Brak gotowości jednego providera nie blokuje funkcji ani niezależnych integracji, których problem nie dotyczy.

Właściciel: Artur Wiśniewski
Wymagany rezultat: każda decyzja release wskazuje konkretny pion, źródła i bramy
Dokument odpowiedzialny: Dokumenty 1, 4 i 5
Ryzyko naruszenia: niepotrzebne opóźnienie wejścia na rynek

### DEC-PRD-004 — Shopify i Allegro direct nie są globalnymi blokerami

Status: zatwierdzona
Domena: produkt i integracje
Zakres: pierwszy pilotaż

Treść decyzji:
Shopify, WooCommerce, Allegro i BaseLinker należą do zatwierdzonego katalogu integracji MVP. Gotowość lub awaria jednego providera nie blokuje pozostałych integracji ani funkcji niezależnych. Każdy provider jest udostępniany dopiero po przejściu właściwych bram gotowości.

Właściciel: Artur Wiśniewski
Wymagany rezultat: provider-specific ocena danych i gotowości
Dokument odpowiedzialny: Dokumenty 4 i 5
Ryzyko naruszenia: uzależnienie całego MVP od kilku niezależnych adapterów

### DEC-PRD-005 — Warunkowe dopuszczanie zakresów zaawansowanych

Status: warunkowa
Domena: produkt
Zakres: funkcje zaawansowane

Treść decyzji:
Warianty wysokiego ryzyka, takie jak niekontrolowana automatyzacja, predykcja bez walidacji, fuzzy matching i złożone reguły wieloźródłowe, wymagają osobnej bramy jakości i bezpieczeństwa. Nie wyłącza to z MVP pełnych procesów omnichannel, rekomendacji i AI Actions realizowanych w wariancie kontrolowanym i audytowalnym.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: spełnienie kryteriów konkretnego zakresu
Wymagany rezultat: osobna decyzja dopuszczająca
Dokument odpowiedzialny: właściwy dokument domenowy
Ryzyko naruszenia: jednoczesne uruchamianie niezweryfikowanych mechanizmów

## 9. Pilotaż

### DEC-PIL-001 — Płatny model pilotażu

Status: zatwierdzona
Domena: pilotaż i sprzedaż
Zakres: pierwsze wdrożenia klienckie

Treść decyzji:
Pierwsze pilotaże są płatne, ograniczone czasowo, zakresowo i danymi oraz posiadają warunek przejścia na dalszą współpracę.

Uzasadnienie:
Pilotaż ma walidować gotowość klienta do zapłaty, a nie wyłącznie możliwość technicznego podłączenia danych.

Właściciel: Artur Wiśniewski
Wymagany rezultat: zaakceptowana oferta i warunki pilotażu
Dokument odpowiedzialny: Dokumenty 5 i 6
Ryzyko naruszenia: pozorna walidacja bez potwierdzenia wartości komercyjnej

### DEC-PIL-002 — Dane rzeczywiste w pilotażu

Status: zatwierdzona
Domena: pilotaż
Zakres: płatny pilotaż

Treść decyzji:
Pilotaż musi wykorzystywać rzeczywiste dane klienta. Dane demonstracyjne mogą służyć przygotowaniu rozwiązania, ale nie stanowią dowodu wartości ani gotowości produkcyjnej.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: wymagania bezpieczeństwa i prywatności zgodnie z Dokumentem 7
Wymagany rezultat: zatwierdzony zakres danych i podstawa przetwarzania
Dokument odpowiedzialny: Dokumenty 5 i 7
Ryzyko naruszenia: walidacja na danych niereprezentatywnych

### DEC-PIL-003 — Sukces pilotażu wymaga wartości i pomiaru kosztu

Status: zatwierdzona
Domena: pilotaż
Zakres: zakończenie pilotażu

Treść decyzji:
Pilotaż nie może zostać uznany za udany wyłącznie dlatego, że pobrano dane. Wymagane jest co najmniej jedno gotowe KPI, interpretowalny wynik, potwierdzenie wartości przez klienta oraz pomiar kosztu i pracy ręcznej.

Właściciel: Artur Wiśniewski
Wymagany rezultat: raport zakończenia pilotażu
Dokument odpowiedzialny: Dokument 5
Ryzyko naruszenia: mylenie działania integracji z wartością produktu

## 10. Dane i KPI

### DEC-DAT-001 — Brak danych nie jest zerem

Status: zatwierdzona
Domena: dane
Zakres: wszystkie dane i KPI

Treść decyzji:
Brak wartości nie może być automatycznie interpretowany jako wartość zero, chyba że źródło jednoznacznie potwierdza zero.

Właściciel: Artur Wiśniewski
Wymagany rezultat: jawne rozróżnienie braku i zera
Dokument odpowiedzialny: Dokument 3
Ryzyko naruszenia: błędne KPI i decyzje klienta

### DEC-DAT-002 — Jeden fakt biznesowy zasila KPI jeden raz

Status: zatwierdzona
Domena: dane
Zakres: dane wieloźródłowe

Treść decyzji:
Ten sam fakt biznesowy może wnieść tylko jeden wkład do KPI, niezależnie od liczby systemów, z których został pobrany.

Właściciel: Artur Wiśniewski
Wymagany rezultat: rekord kanoniczny i zachowane lineage źródeł
Dokument odpowiedzialny: Dokument 3
Ryzyko naruszenia: podwójne liczenie sprzedaży

### DEC-DAT-003 — Gotowość jest lokalna

Status: zatwierdzona
Domena: dane i KPI
Zakres: datasety, pola, KPI i piony

Treść decyzji:
Gotowość jest oceniana dla konkretnego zakresu. Brak albo problem jednego datasetu lub KPI nie obniża automatycznie niezależnych wyników.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 3
Ryzyko naruszenia: ukrywanie dostępnej wartości albo prezentowanie fałszywej kompletności

### DEC-DAT-004 — Source authority jest wersjonowane

Status: zatwierdzona
Domena: dane
Zakres: źródła nakładające się

Treść decyzji:
Polityka source authority musi być wersjonowana, audytowana i przypisana do konkretnej pary źródeł, obiektu, pola albo faktu biznesowego.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: zmiana providera, kontraktu danych albo jakości źródła
Wymagany rezultat: wersjonowana polityka i analiza wpływu
Dokument odpowiedzialny: Dokument 3
Ryzyko naruszenia: różne zespoły albo procesy wybierają różne źródła prawdy

### DEC-DAT-005 — Exact matching przed fuzzy matching

Status: zatwierdzona
Domena: dane
Zakres: pierwszy etap deduplikacji

Treść decyzji:
Pierwszy zakres deduplikacji wykorzystuje jednoznaczne i deterministyczne reguły exact matching tam, gdzie dostępne są wiarygodne identyfikatory.

Właściciel: Artur Wiśniewski
Wymagany rezultat: testy false merge i false split na danych rzeczywistych
Dokument odpowiedzialny: Dokument 3
Ryzyko naruszenia: zbyt wczesne wdrożenie nieprzewidywalnego dopasowania

### DEC-DAT-006 — Fuzzy matching jako decyzja warunkowa

Status: warunkowa
Domena: dane
Zakres: deduplikacja zaawansowana

Treść decyzji:
Fuzzy matching nie jest wymagany do pierwszego prostego pionu. Może zostać dopuszczony, gdy exact matching nie zapewnia akceptowalnej jakości i istnieją dane umożliwiające kalibrację.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: wyniki rzeczywistych przypadków niedopasowania
Wymagany rezultat: zatwierdzone progi, test jakości, procedura manual review i koszt operacyjny
Dokument odpowiedzialny: Dokument 3
Ryzyko naruszenia: false merge, false split i niekontrolowany koszt manual review

### DEC-DAT-007 — Deduplikacja jest ograniczona do tenantu

Status: zatwierdzona
Domena: dane i bezpieczeństwo
Zakres: wszystkie procesy dopasowania

Treść decyzji:
Deduplikacja, grupowanie podobieństwa i manual review nie mogą łączyć ani porównywać danych klientów w sposób naruszający izolację tenantów.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: wymagana przed danymi produkcyjnymi
Dokument odpowiedzialny: Dokumenty 3 i 7
Ryzyko naruszenia: ujawnienie albo połączenie danych różnych klientów

### DEC-DAT-008 — Rozdzielenie danych transakcyjnych i atrybucyjnych

Status: zatwierdzona
Domena: dane i KPI
Zakres: sprzedaż i marketing

Treść decyzji:
Wartości raportowane przez systemy reklamowe i analityczne nie zastępują automatycznie przychodu pochodzącego z systemu transakcyjnego.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 3
Ryzyko naruszenia: prezentowanie wartości atrybucyjnej jako rzeczywistej sprzedaży

### DEC-DAT-009 — Zamówienia kanoniczne jako jednostka meteringu

Status: zatwierdzona
Domena: dane i rozliczenia
Zakres: pomiar użycia

Treść decyzji:
Liczba przetworzonych zamówień kanonicznych może być jednostką meteringu i kosztu. Nie jest North Star Metric ani samodzielnym miernikiem wartości klienta.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokumenty 3 i 6
Ryzyko naruszenia: optymalizacja produktu pod wolumen przetwarzania zamiast efektu biznesowego

## 11. Integracje i operacje

### DEC-INT-001 — Katalog integracji nie definiuje zakresu wydania

Status: zatwierdzona
Domena: integracje
Zakres: wszystkie wydania

Treść decyzji:
Obecność providera w katalogu nie oznacza dostępności połączenia, gotowości danych, gotowości KPI ani gotowości produkcyjnej.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 4
Ryzyko naruszenia: składanie klientom deklaracji bez wymaganych dowodów

### DEC-INT-002 — Wielowymiarowa gotowość integracji

Status: zatwierdzona
Domena: integracje
Zakres: każdy provider

Treść decyzji:
Gotowość integracji jest oceniana osobno co najmniej dla katalogu, implementacji, konfiguracji, dostępności runtime, połączenia, danych, integralności, KPI, operacji i produkcji.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 4
Ryzyko naruszenia: traktowanie jednego statusu jako potwierdzenia całej gotowości

### DEC-INT-003 — Lokalna degradacja awarii providera

Status: zatwierdzona
Domena: integracje i operacje
Zakres: działanie wieloźródłowe

Treść decyzji:
Awaria jednego providera nie powinna automatycznie blokować niezależnych źródeł, danych historycznych i KPI, których problem nie dotyczy.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokumenty 4 i 7
Ryzyko naruszenia: nieproporcjonalna niedostępność produktu

### DEC-OPS-001 — Izolacja ciężkich workloadów

Status: zatwierdzona
Domena: operacje
Zakres: reprocessing, backfill, deduplikacja i analityka ciężka

Treść decyzji:
Ciężkie przeliczenia muszą posiadać limity i nie mogą niekontrolowanie pogarszać operacji czasu rzeczywistego oraz procesów krytycznych.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokumenty 4 i 7
Ryzyko naruszenia: awarie albo spadek jakości obsługi wszystkich klientów

### DEC-OPS-002 — Manual review podlega pomiarowi

Status: zatwierdzona
Domena: operacje i koszty
Zakres: wszystkie procesy ręczne

Treść decyzji:
Manual review, ręczne poprawki, interwencje Supportu i manualny onboarding muszą być mierzone jako czas, koszt, wolumen i przyczyna.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokumenty 4, 5 i 6
Ryzyko naruszenia: ukryty koszt ograniczający marżę i skalowalność

## 12. Bezpieczeństwo, prywatność i AI

### DEC-SEC-001 — Wielowarstwowa izolacja tenantów

Status: zatwierdzona
Domena: bezpieczeństwo
Zakres: wszystkie dane klientów

Treść decyzji:
Izolacja tenantów jest wymogiem bezwzględnym. Sama obecność pola tenantId nie jest wystarczającą kontrolą.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: obowiązkowa przed danymi produkcyjnymi
Wymagany rezultat: zatwierdzony model i test izolacji
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: dostęp do danych innego klienta

### DEC-SEC-002 — MFA dla kont uprzywilejowanych

Status: zatwierdzona
Domena: bezpieczeństwo
Zakres: konta o podwyższonych uprawnieniach

Treść decyzji:
MFA jest obowiązkowe dla kont uprzywilejowanych przed dopuszczeniem danych produkcyjnych klientów.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: przejęcie konta o szerokim dostępie

### DEC-SEC-003 — Backup wymaga rzeczywistego restore

Status: zatwierdzona
Domena: ciągłość działania
Zakres: dane produkcyjne

Treść decyzji:
Istnienie backupu nie stanowi dowodu możliwości odtworzenia. Przed danymi produkcyjnymi wymagany jest rzeczywisty test restore.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: rekomendowana
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: nieodwracalna utrata danych mimo deklarowanego backupu

### DEC-SEC-004 — Restore respektuje usunięcie danych

Status: zatwierdzona
Domena: prywatność i ciągłość działania
Zakres: backup, restore i retencja

Treść decyzji:
Proces odtworzenia nie może niejawnie przywracać danych, które zostały wcześniej usunięte zgodnie z zatwierdzoną procedurą.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: wymagana prawnie i technicznie przed produkcją
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: nieskuteczne usunięcie i naruszenie zobowiązań wobec klienta

### DEC-SEC-005 — Pseudonimizacja nie jest anonimizacją

Status: zatwierdzona
Domena: prywatność
Zakres: wszystkie dane osobowe

Treść decyzji:
Dane pseudonimizowane pozostają danymi wymagającymi ochrony, jeśli możliwe jest ponowne powiązanie ich z osobą.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: prawna przed danymi produkcyjnymi
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: błędna klasyfikacja danych i nieadekwatne zabezpieczenia

### DEC-SEC-006 — Procedura usunięcia przed pilotażem

Status: zatwierdzona
Domena: prywatność i operacje
Zakres: dane rzeczywistego klienta

Treść decyzji:
Przed pierwszym pilotażem na danych klienta musi istnieć zatwierdzona procedura usunięcia danych, uwzględniająca kopie, backupy, eksporty i systemy zależne.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: prawna i techniczna
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: brak możliwości wykonania zobowiązania do usunięcia danych

### DEC-SEC-007 — RTO i RPO jako parametry warunkowe

Status: warunkowa
Domena: ciągłość działania
Zakres: pilotaż i umowy komercyjne

Treść decyzji:
RTO i RPO nie mogą być deklarowane jako gwarancja bez testów restore, pomiarów operacyjnych i analizy kosztu. Dla pilotażu obowiązują parametry wewnętrzne, które nie stanowią SLA, dopóki nie zostaną formalnie zatwierdzone.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: przed umową zawierającą SLA albo gwarancję dostępności
Wymagany rezultat: przetestowane i zatwierdzone RTO oraz RPO
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: zobowiązanie umowne niemożliwe do spełnienia

### DEC-AI-001 — AI nie jest źródłem prawdy

Status: zatwierdzona
Domena: AI Governance
Zakres: wszystkie funkcje AI

Treść decyzji:
AI nie definiuje KPI, source authority, uprawnień ani gotowości danych i nie zmienia danych źródłowych.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokumenty 3 i 7
Ryzyko naruszenia: nieaudytowalne wyniki i decyzje oparte na modelu generatywnym

### DEC-AI-002 — Tenant-safe retrieval

Status: zatwierdzona
Domena: AI Governance i bezpieczeństwo
Zakres: AI korzystające z danych klientów

Treść decyzji:
Retrieval, kontekst, pamięć, logi i wyniki AI muszą respektować izolację tenantów.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: obowiązkowa przed danymi produkcyjnymi w AI
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: ujawnienie danych innego klienta przez kontekst AI

### DEC-AI-003 — Kontrola człowieka nad działaniami istotnymi

Status: zatwierdzona
Domena: AI Governance
Zakres: działania o istotnym wpływie

Treść decyzji:
AI nie wykonuje samodzielnie działań o istotnym wpływie finansowym, operacyjnym, prawnym albo dotyczącym dostępu bez zatwierdzonego mechanizmu kontroli człowieka.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 7
Ryzyko naruszenia: niekontrolowane działanie i brak przypisania odpowiedzialności

## 13. Model komercyjny

### DEC-COM-001 — Hybrydowy model komercyjny

Status: zatwierdzona
Domena: komercyjna
Zakres: pilotaż i abonament

Treść decyzji:
Model komercyjny łączy opłatę bazową za pion wartości, wliczony pakiet użycia, dodatkową opłatę za źródła lub wolumen oraz opcjonalną opłatę wdrożeniową.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: prawno-podatkowa przed sprzedażą
Dokument odpowiedzialny: Dokument 6
Ryzyko naruszenia: cena niezwiązana ani z wartością, ani z kosztem

### DEC-COM-002 — Cost Observability jako brama skalowania

Status: warunkowa
Domena: ekonomika jednostkowa
Zakres: pilotaże i skalowanie

Treść decyzji:
Pomiar kosztu rozpoczyna się od pierwszego pilotażu. Brak wystarczającej Cost Observability blokuje skalowanie, ale nie blokuje kontrolowanego pilotażu.

Właściciel: Artur Wiśniewski
Warunek ponownej oceny: przed zatwierdzeniem skalowania
Wymagany rezultat: koszt per klient, pion, provider, przetwarzanie, AI, Support i manual review
Dokument odpowiedzialny: Dokument 6
Ryzyko naruszenia: skalowanie nierentownego modelu

### DEC-COM-003 — Ceny i progi wymagają walidacji

Status: warunkowa
Domena: ceny
Zakres: pierwsze pilotaże

Treść decyzji:
Każdy pilotaż musi posiadać konkretną cenę. Docelowy cennik, minimalna opłacalna cena i progi marży zostaną zatwierdzone po uzyskaniu rzeczywistych danych kosztowych i informacji o gotowości klientów do zapłaty.

Właściciel: Artur Wiśniewski
Weryfikacja niezależna: prawno-podatkowa przed sprzedażą
Warunek ponownej oceny: po pierwszych płatnych pilotażach
Wymagany rezultat: zatwierdzony cennik i progi rentowności
Dokument odpowiedzialny: Dokument 6
Ryzyko naruszenia: cena pilotażu bez przełożenia na rentowny model docelowy

### DEC-COM-004 — Pilotaż nie jest bezpłatnym testem

Status: zatwierdzona
Domena: komercyjna
Zakres: pierwsze wdrożenia

Treść decyzji:
Pilotaż nie jest bezpłatnym środowiskiem testowym. Wyjątek wymaga osobnej decyzji zawierającej ekwiwalent wartości, zakres i uzasadnienie.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 6
Ryzyko naruszenia: walidacja zainteresowania bez walidacji gotowości do zapłaty

### DEC-COM-005 — Brak skalowania bez unit economics

Status: zatwierdzona
Domena: ekonomika jednostkowa
Zakres: skalowanie

Treść decyzji:
PapaData nie przechodzi do skalowania sprzedaży, self-service ani kanału partnerskiego bez poznania kosztu onboardingu, utrzymania źródeł, Supportu, przetwarzania, deduplikacji, reprocessingu i AI.

Właściciel: Artur Wiśniewski
Dokument odpowiedzialny: Dokument 6
Ryzyko naruszenia: wzrost liczby klientów zwiększający stratę jednostkową

## 8A. Decyzje przekrojowe zakresu MVP i architektury

### DEC-PRD-MVP-001 — Pełna funkcjonalność MVP przy ograniczonej liczbie integracji

Status: zatwierdzona

Domena: produkt

Zakres: MVP

Treść decyzji:

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Uzasadnienie:

Ograniczenie produktu przez wycinanie procesów tworzyłoby martwe ekrany, niespójne kontrakty i fałszywą walidację. Kontrolowany zakres uzyskuje się przez ograniczenie providerów, wariantów, rynków i skali.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: wszystkie funkcje MVP działają end-to-end, a ograniczenia są wyłącznie jawnie providerowe lub rynkowe

Dokument odpowiedzialny: Dokumenty 1-7, A01-A15, AI-00-AI-20, SEC-00-SEC-19 i M01-M15

Ryzyko naruszenia: produkt częściowo działający i niemożliwy do wiarygodnego przetestowania

### DEC-INT-MVP-001 — Zamknięty katalog kompletnych integracji MVP

Status: zatwierdzona

Domena: integracje

Zakres: MVP

Treść decyzji:

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Uzasadnienie:

Pełne funkcje modułów sprzedaży, marketingu i ruchu wymagają co najmniej jednego kompletnego providera w każdej kluczowej kategorii danych.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: katalog release zawiera wyłącznie integracje po pełnych bramach gotowości

Dokument odpowiedzialny: Dokument 4, A08, A14, A15, M10

Ryzyko naruszenia: pozorna dostępność providerów i niespójna wartość modułów

### DEC-ARCH-CLOUD-001 — Google Cloud Platform jako platforma docelowa

Status: zatwierdzona

Domena: architektura i infrastruktura

Zakres: wszystkie środowiska chmurowe

Treść decyzji:

Google Cloud Platform jest docelową platformą infrastrukturalną PapaData. Architektura może korzystać z każdej usługi GCP zatwierdzonej w katalogu usług i uzasadnionej wymaganiami produktu, bezpieczeństwa, operacji lub kosztu; nie oznacza to obowiązku wdrażania wszystkich usług GCP. Referencyjne mapowanie obejmuje Cloud Run dla API, BFF, workerów i jobów, Cloud SQL for PostgreSQL, Memorystore for Redis, Pub/Sub i Cloud Tasks, Cloud Storage, Secret Manager, Cloud Scheduler, Artifact Registry, Cloud Build, IAM, Cloud KMS, Cloud Logging, Monitoring i Trace oraz komponenty sieciowe i ochronne odpowiednie do ryzyka.

Uzasadnienie:

Jedna platforma docelowa umożliwia konkretne decyzje bezpieczeństwa, obserwowalności, kosztu, disaster recovery i automatyzacji wdrożeń.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: zatwierdzony katalog usług GCP, mapowanie komponentów i kontrola kosztu

Dokument odpowiedzialny: A01, A03, A05, A08, A15 i Dokument 7

Ryzyko naruszenia: architektura neutralna bez wykonalnego modelu wdrożenia

### DEC-ENV-PARITY-001 — Parzystość kontraktów środowisk Local, CI i GCP

Status: zatwierdzona

Domena: architektura i operacje

Zakres: Local, CI, Development, Staging i Production

Treść decyzji:

Środowiska Local, CI, Development i Staging odtwarzają produkcyjne kontrakty, wersje, granice procesów i przepływy danych w maksymalnym praktycznym zakresie. Lokalny development wykorzystuje Docker Compose oraz kontenery API, BFF, workerów i migracji, PostgreSQL w tej samej głównej wersji co Cloud SQL, Redis, emulator lub adapter kolejek, emulator GCS albo MinIO za interfejsem storage, lokalny scheduler, OpenTelemetry Collector oraz sandboxy lub mocki providerów. Te same migracje, obrazy, schematy API i kontrakty zdarzeń obowiązują w Local, CI i GCP. Bruno jest wersjonowanym narzędziem testowania i dokumentowania API, a nie usługą infrastrukturalną.

Uzasadnienie:

Różnice między lokalnym developmentem a produkcją są jedną z głównych przyczyn błędów integracyjnych i operacyjnych.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: wersjonowany docker-compose, obrazy, emulatory, migracje, testy Bruno i rejestr nieuniknionych różnic

Dokument odpowiedzialny: A15 oraz dokumentacja repozytorium

Ryzyko naruszenia: błędy ujawniane dopiero na środowisku GCP

### DEC-TEN-001 — Tenant i workspace jako dwupoziomowy model granic

Status: zatwierdzona

Domena: dane, bezpieczeństwo i autoryzacja

Zakres: cała aplikacja

Treść decyzji:

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Uzasadnienie:

Model oddziela własność i billing od operacyjnej granicy danych oraz eliminuje wieloznaczność terminu tenant.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: jawne tenantId w kontraktach tenantowych oraz tenantId i workspaceId w kontraktach zasobów workspace, wraz z testami izolacji

Dokument odpowiedzialny: Dokumenty 3 i 7, A03, A05, SEC-01

Ryzyko naruszenia: IDOR, wyciek danych i niespójna autoryzacja

### DEC-AUTHZ-001 — Role jako pakiety capabilities i data scope

Status: zatwierdzona

Domena: autoryzacja

Zakres: MVP i kolejne wydania

Treść decyzji:

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Uzasadnienie:

Sam RBAC jest zbyt sztywny, a pełny ABAC niepotrzebnie złożony dla pierwszego wydania.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: jedna macierz capabilities, data scope i wymagań MFA używana przez UI, API i joby

Dokument odpowiedzialny: Dokument 7, A05, SEC-01, SEC-02 i M01-M15

Ryzyko naruszenia: niespójne uprawnienia i decyzje podejmowane w UI

### DEC-AI-ACT-001 — AI Actions w MVP pod kontrolą człowieka

Status: zatwierdzona

Domena: AI Governance

Zakres: MVP

Treść decyzji:

Papa Asystent, Laboratorium AI oraz AI Actions należą do MVP. AI korzysta wyłącznie z danych dopuszczonych przez readiness i uprawnienia, zwraca evidence, ograniczenia i poziom pewności oraz potrafi odmówić. Działania istotne wymagają zatwierdzenia człowieka, ponownej walidacji targetu i danych, idempotencji, audytu oraz mechanizmu anulowania lub kompensacji, gdy jest to technicznie możliwe. Niedopuszczalne jest niekontrolowane autonomiczne wykonanie o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

Uzasadnienie:

Pełny produkt decyzyjny wymaga przejścia od obserwacji do kontrolowanego działania, bez przekazywania AI nieograniczonej sprawczości.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: proposal, approval, revalidation, execution, audit, outcome i recovery dla każdego typu działania

Dokument odpowiedzialny: Dokument 7, AI-00-AI-20, A11, M12 i M15

Ryzyko naruszenia: martwy przepływ decyzji albo niekontrolowana automatyzacja

### DEC-BILL-MVP-001 — Pełny billing i self-service w katalogu MVP

Status: zatwierdzona

Domena: billing i komercja

Zakres: MVP

Treść decyzji:

Billing, usage, entitlements, limity, status subskrypcji, dokumenty rozliczeniowe oraz self-service należą do MVP. Funkcje płatnicze działają end-to-end dla wybranego providera i metod płatności dopuszczonych do MVP. Nieobsługiwane metody lub rynki nie są prezentowane jako dostępne; wymagany proces ręczny jest jawnie opisanym fallbackiem operacyjnym, a nie atrapą ekranu.

Uzasadnienie:

Funkcje planów, limitów i płatności są częścią kompletnej aplikacji i nie mogą pozostawać atrapą, jeśli produkt ma być sprzedawany.

Właściciel: Artur Wiśniewski

Weryfikacja niezależna: zgodnie z bramą domenową; wymagana dla bezpieczeństwa, prywatności, produkcji i zobowiązań prawnych

Warunek ponownej oceny: zmiana zakresu produktu, katalogu providerów, rynku, modelu danych lub platformy infrastrukturalnej

Wymagany rezultat: działający lifecycle subskrypcji, usage, entitlements, płatność, dokumenty i recovery dla wybranego providera

Dokument odpowiedzialny: Dokument 6, A03, A05, A14, M14 i SEC

Ryzyko naruszenia: brak kontroli dostępu komercyjnego i ręczne obejścia bez audytu

## CZĘŚĆ II — REJESTR WYMAGAŃ PRZEKROJOWYCH

## 14. Zasady rejestru wymagań

Rejestr poniżej obejmuje wymagania przekrojowe, których niespełnienie wpływa na więcej niż jeden dokument lub etap.

Szczegółowe wymagania domenowe są rozwijane w Dokumentach 3–7.

Każde wymaganie posiada:

- identyfikator;

- status obowiązywania;

- priorytet;

- zakres;

- treść;

- metodę weryfikacji;

- dokument odpowiedzialny;

- ryzyko niespełnienia.

Właścicielem wszystkich wymagań na obecnym etapie jest Artur Wiśniewski.

## 15. Wymagania dokumentacyjne i governance

Tabela:
- Wiersz 1: ID; Status; Priorytet; Wymaganie; Weryfikacja; Dokument
- Wiersz 2: REQ-DOC-001; obowiązujące; MUST; Każde odwołanie do decyzji wykorzystuje stabilny identyfikator z Dokumentu 2.; przegląd spójności; wszystkie
- Wiersz 3: REQ-DOC-002; obowiązujące; MUST; Dokumenty nie mogą przedstawiać planowanego mechanizmu jako istniejącej implementacji.; przegląd treści; wszystkie
- Wiersz 4: REQ-DOC-003; obowiązujące; MUST; Zmiana decyzji wymaga analizy wpływu na dokumenty i wymagania zależne.; wpis w rejestrze; Dokument 2
- Wiersz 5: REQ-DOC-004; obowiązujące; MUST; Dokumenty finalne nie zawierają historii wcześniejszych wersji.; przegląd metryki; wszystkie
- Wiersz 6: REQ-DOC-005; obowiązujące; MUST; Decyzje warunkowe wskazują zakres, warunek ponownej oceny i wymagany rezultat.; walidacja rekordu; Dokument 2
- Wiersz 7: REQ-GOV-001; obowiązujące; MUST; Każdy obszar posiada imiennego właściciela odpowiedzialnego.; przegląd metryk; wszystkie
- Wiersz 8: REQ-GOV-002; warunkowe; MUST; Przed bramą specjalistyczną należy pozyskać niezależny dowód lub opinię.; raport, audyt lub opinia; Dokumenty 6–7

## 16. Wymagania biznesowe i produktowe

Tabela:
- Wiersz 1: ID; Status; Priorytet; Wymaganie; Weryfikacja; Dokument
- Wiersz 2: REQ-BUS-001; obowiązujące; MUST; Produkt musi skracać czas od podłączenia źródła do uzyskania wiarygodnej informacji biznesowej.; time-to-first-useful-data; Dokumenty 1 i 5
- Wiersz 3: REQ-BUS-002; obowiązujące; MUST; Każdy pion musi dostarczać kompletny przepływ wartości, a nie wyłącznie dostęp do integracji.; test end-to-end; Dokument 5
- Wiersz 4: REQ-BUS-003; obowiązujące; MUST; MVP musi obejmować kompletną funkcjonalność aplikacji dla D2C, marketplace, analityki, marketingu, decyzji, AI, administracji, bezpieczeństwa i billingu, przy ograniczeniu dostępności do zatwierdzonego katalogu integracji MVP.; brama MVP; Dokumenty 1 i 5
- Wiersz 5: REQ-BUS-004; późniejszy etap; SHOULD; Omnichannel może zostać udostępniony dopiero po spełnieniu bramy integralności danych.; test wieloźródłowy; Dokumenty 3–5
- Wiersz 6: REQ-BUS-005; obowiązujące; MUST; Klient musi otrzymać informację o ograniczeniach i jakości wyniku.; kryteria akceptacji KPI; Dokument 3
- Wiersz 7: REQ-BUS-006; obowiązujące; MUST; Istotne działania muszą pozostać pod odpowiedzialnością człowieka.; test procesu i audytu; Dokumenty 5 i 7
- Wiersz 8: REQ-BUS-007; warunkowe; MUST; Przed skalowaniem należy zatwierdzić TAM, SAM, SOM i analizę konkurencji.; raport rynkowy; Dokument 1

## 17. Wymagania pilotażu

Tabela:
- Wiersz 1: ID; Status; Priorytet; Wymaganie; Weryfikacja; Dokument
- Wiersz 2: REQ-PIL-001; obowiązujące; MUST; Każdy pilotaż posiada imiennie wskazanego klienta, zakres, pion, źródła i KPI.; karta pilotażu; Dokument 5
- Wiersz 3: REQ-PIL-002; obowiązujące; MUST; Pilotaż posiada konkretną cenę i warunki płatności.; zaakceptowana oferta; Dokument 6
- Wiersz 4: REQ-PIL-003; obowiązujące; MUST; Pilotaż wykorzystuje rzeczywiste dane klienta.; dowód połączenia i danych; Dokumenty 4–5
- Wiersz 5: REQ-PIL-004; obowiązujące; MUST; Przed pilotażem należy spełnić bramy bezpieczeństwa przypisane do danych produkcyjnych.; pakiet dowodów; Dokument 7
- Wiersz 6: REQ-PIL-005; obowiązujące; MUST; Pilotaż posiada mierzalne kryteria sukcesu i zakończenia.; raport pilotażu; Dokument 5
- Wiersz 7: REQ-PIL-006; obowiązujące; MUST; Pilotaż mierzy koszt onboardingu, utrzymania, pracy ręcznej i Supportu.; raport kosztowy; Dokument 6
- Wiersz 8: REQ-PIL-007; obowiązujące; MUST; Sukces pilotażu wymaga co najmniej jednego gotowego KPI i potwierdzenia wartości przez klienta.; protokół akceptacji; Dokument 5
- Wiersz 9: REQ-PIL-008; obowiązujące; MUST; Pilotaż określa warunek przejścia na abonament albo zakończenia współpracy.; umowa lub oferta; Dokumenty 5–6

## 18. Wymagania danych i KPI

Tabela:
- Wiersz 1: ID; Status; Priorytet; Wymaganie; Weryfikacja; Dokument
- Wiersz 2: REQ-DAT-001; obowiązujące; MUST; Dane źródłowe, znormalizowane, kanoniczne i analityczne muszą pozostać rozróżnialne.; kontrakt i test lineage; Dokument 3
- Wiersz 3: REQ-DAT-002; obowiązujące; MUST; Każdy KPI posiada definicję, źródła, wzór, gotowość, ograniczenia i właściciela.; kontrakt KPI; Dokument 3
- Wiersz 4: REQ-DAT-003; obowiązujące; MUST; Brak danych musi pozostawać odróżniony od wartości zero.; test przypadków braku; Dokument 3
- Wiersz 5: REQ-DAT-004; obowiązujące; MUST; Ten sam fakt biznesowy nie może zasilać KPI wielokrotnie.; test deduplikacji; Dokument 3
- Wiersz 6: REQ-DAT-005; obowiązujące; MUST; Rekordy źródłowe muszą zachowywać lineage po canonicalization i deduplikacji.; audyt lineage; Dokument 3
- Wiersz 7: REQ-DAT-006; obowiązujące; MUST; Gotowość jest oceniana lokalnie dla datasetu, pola, KPI i pionu.; test stanów; Dokument 3
- Wiersz 8: REQ-DAT-007; obowiązujące; MUST; Source authority musi być wersjonowane i testowane.; wersja polityki i test; Dokument 3
- Wiersz 9: REQ-DAT-008; obowiązujące; MUST; Dane transakcyjne i atrybucyjne muszą pozostać semantycznie odrębne.; test KPI; Dokument 3
- Wiersz 10: REQ-DAT-009; obowiązujące; MUST; Exact matching musi posiadać pomiar false merge i false split.; raport jakości; Dokument 3
- Wiersz 11: REQ-DAT-010; warunkowe; MUST; Fuzzy matching wymaga progów, testu jakości, manual review i pomiaru kosztu.; raport kalibracji; Dokument 3
- Wiersz 12: REQ-DAT-011; obowiązujące; MUST; Zmiana definicji KPI lub source authority wymaga kontrolowanego przeliczenia danych zależnych.; test reprocessingu; Dokument 3
- Wiersz 13: REQ-DAT-012; obowiązujące; MUST; AI może korzystać wyłącznie z danych i KPI spełniających przypisany kontrakt gotowości.; audyt kontekstu AI; Dokumenty 3 i 7

## 19. Wymagania integracji i operacji

Tabela:
- Wiersz 1: ID; Status; Priorytet; Wymaganie; Weryfikacja; Dokument
- Wiersz 2: REQ-INT-001; obowiązujące; MUST; Każdy provider posiada osobne statusy katalogu, implementacji, środowiska, runtime i weryfikacji.; macierz integracji; Dokument 4
- Wiersz 3: REQ-INT-002; obowiązujące; MUST; Connect nie może być interpretowany jako gotowość danych ani KPI.; test bram; Dokument 4
- Wiersz 4: REQ-INT-003; obowiązujące; MUST; Dostępność integracji dla klienta wymaga dowodu przypisanego do właściwej bramy.; pakiet dowodów; Dokument 4
- Wiersz 5: REQ-INT-004; obowiązujące; MUST; Każda integracja posiada monitoring, retry, recovery i procedurę obsługi problemów przed gotowością operacyjną.; test operacyjny; Dokument 4
- Wiersz 6: REQ-INT-005; obowiązujące; MUST; Awaria jednego providera nie może automatycznie blokować niezależnych danych i źródeł.; test degradacji; Dokumenty 4 i 7
- Wiersz 7: REQ-OPS-001; obowiązujące; MUST; Reprocessing, backfill i ciężka analityka posiadają limity zasobów.; test obciążenia; Dokumenty 4 i 7
- Wiersz 8: REQ-OPS-002; obowiązujące; MUST; Manual review i interwencje ręczne muszą być mierzone.; telemetry i raport kosztowy; Dokumenty 4–6
- Wiersz 9: REQ-OPS-003; obowiązujące; MUST; Gotowość produkcyjna wymaga monitoringu, recovery, Supportu i runbooków.; brama produkcyjna; Dokumenty 4 i 7

## 20. Wymagania bezpieczeństwa, prywatności i AI

Tabela:
- Wiersz 1: ID; Status; Priorytet; Wymaganie; Weryfikacja; Dokument
- Wiersz 2: REQ-SEC-001; obowiązujące; MUST; Izolacja tenantów obejmuje dane, joby, cache, logi, wyniki, eksporty i procesy AI.; test izolacji; Dokument 7
- Wiersz 3: REQ-SEC-002; obowiązujące; MUST; Decyzje dostępu są podejmowane po stronie zaufanej, a nie przez warstwę prezentacyjną.; test autoryzacji; Dokument 7
- Wiersz 4: REQ-SEC-003; obowiązujące; MUST; Konta uprzywilejowane wymagają MFA.; test konfiguracji; Dokument 7
- Wiersz 5: REQ-SEC-004; obowiązujące; MUST; Sekrety nie mogą trafiać do logów, telemetry, URL, eksportów ani narzędzi AI.; audyt sekretów; Dokument 7
- Wiersz 6: REQ-SEC-005; obowiązujące; MUST; Przed danymi produkcyjnymi wymagany jest minimalny threat model.; zatwierdzony threat model; Dokument 7
- Wiersz 7: REQ-SEC-006; obowiązujące; MUST; Backup wymaga rzeczywistego testu odtworzenia.; raport restore; Dokument 7
- Wiersz 8: REQ-SEC-007; obowiązujące; MUST; Restore nie może niejawnie przywracać danych wcześniej usuniętych.; test reconciliation; Dokument 7
- Wiersz 9: REQ-SEC-008; obowiązujące; MUST; Procedura usunięcia obejmuje systemy aktywne, kopie, eksporty i retencję.; test procedury; Dokument 7
- Wiersz 10: REQ-SEC-009; obowiązujące; MUST; Dane pseudonimizowane podlegają ochronie, jeśli możliwe jest ponowne powiązanie.; ocena prawna; Dokument 7
- Wiersz 11: REQ-AI-001; obowiązujące; MUST; AI nie może ustalać KPI, source authority, gotowości ani uprawnień.; test kontroli; Dokument 7
- Wiersz 12: REQ-AI-002; obowiązujące; MUST; Retrieval i kontekst AI muszą być tenant-safe.; test izolacji AI; Dokument 7
- Wiersz 13: REQ-AI-003; obowiązujące; MUST; Istotne działania AI wymagają kontroli człowieka i audytu.; test human oversight; Dokument 7
- Wiersz 14: REQ-AI-004; warunkowe; MUST; Aktywacja AI na danych klientów wymaga osobnej bramy prywatności i bezpieczeństwa.; decyzja dopuszczająca; Dokument 7

## 21. Wymagania komercyjne i ekonomiczne

Tabela:
- Wiersz 1: ID; Status; Priorytet; Wymaganie; Weryfikacja; Dokument
- Wiersz 2: REQ-COM-001; obowiązujące; MUST; Każdy pilotaż posiada konkretną cenę, nawet jeśli docelowy cennik pozostaje warunkowy.; oferta pilotażu; Dokument 6
- Wiersz 3: REQ-COM-002; obowiązujące; MUST; Cena uwzględnia wartość, złożoność, użycie, Support, bezpieczeństwo i koszt danych.; kalkulacja ceny; Dokument 6
- Wiersz 4: REQ-COM-003; obowiązujące; MUST; GMV nie może być jedyną jednostką rozliczeniową.; przegląd cennika; Dokument 6
- Wiersz 5: REQ-COM-004; obowiązujące; MUST; Koszt musi być mierzony co najmniej per klient, pion, provider i główny proces kosztowy.; Cost Observability; Dokument 6
- Wiersz 6: REQ-COM-005; obowiązujące; MUST; Manual onboarding, Support, reprocessing, deduplikacja i AI są uwzględniane w COGS.; raport kosztowy; Dokument 6
- Wiersz 7: REQ-COM-006; warunkowe; MUST; Przed skalowaniem należy zatwierdzić minimalną opłacalną cenę i próg marży.; model unit economics; Dokument 6
- Wiersz 8: REQ-COM-007; późniejszy etap; MUST; Self-service należy do MVP i musi działać dla zakresu, providerów i metod płatności dopuszczonych do MVP. Kanał partnerski pozostaje zależny od potwierdzonej rentowności i powtarzalnego onboardingu.; brama skalowania; Dokument 6
- Wiersz 9: REQ-COM-008; obowiązujące; MUST; Warunki sprzedaży, VAT, płatności, refundów i retencji wymagają weryfikacji prawno-podatkowej.; opinia ekspercka; Dokument 6

## 21A. Wymagania zakresu MVP, chmury i środowisk

REQ-MVP-001 | obowiązujące | MUST | Wszystkie funkcje przypisane do MVP działają end-to-end; ograniczenie dotyczy providerów, wariantów, rynków i skali. | macierz funkcja-proces-API-story-test | wszystkie dokumenty

REQ-MVP-002 | obowiązujące | MUST | Każda funkcja posiada sukces, loading, empty/no data, partial, błąd, anulowanie i recovery. | Storybook + E2E | M01-M15, A15

REQ-INT-MVP-001 | obowiązujące | MUST | Każda integracja katalogu MVP przechodzi pełny lifecycle i bramy gotowości. | evidence pack providera | Dokument 4, A08

REQ-ARCH-001 | obowiązujące | MUST | Wdrożenie produkcyjne jest projektowane dla GCP i korzysta wyłącznie z usług zatwierdzonych w katalogu architektonicznym. | przegląd architektury i IaC | A03, A15

REQ-ENV-001 | obowiązujące | MUST | Local i CI odtwarzają produkcyjne kontrakty, wersje i granice procesów; różnice są jawne i testowane w GCP. | test parity | A15

REQ-TEN-001 | obowiązujące | MUST | Kontrakty tenantowe używają tenantId, a kontrakty zasobów workspace używają tenantId i workspaceId; joby, cache, logi, AI i eksporty zachowują właściwy zakres. | test izolacji | D3, D7, A05

REQ-AUTHZ-001 | obowiązujące | MUST | API i workery egzekwują capabilities i data scope niezależnie od UI. | test autoryzacji/IDOR | D7, SEC-02

REQ-AI-ACT-001 | obowiązujące | MUST | Istotne AI Actions wymagają approval, revalidation, idempotencji, audytu i recovery. | test workflow | AI, SEC, M12/M15

REQ-BILL-MVP-001 | obowiązujące | MUST | Billing i self-service działają dla zatwierdzonego providera i metod MVP. | E2E billing | D6, M14

## CZĘŚĆ III — ZARZĄDZANIE REJESTREM

## 22. Zdarzenia wymagające zmiany decyzji

Analiza wpływu i aktualizacja rejestru są obowiązkowe w przypadku:

- zmiany rynku startowego;

- zmiany segmentu docelowego;

- zmiany zakresu MVP;

- dodania albo wycofania pionu wartości;

- uruchomienia integracji z nową kategorią danych;

- zmiany source authority;

- zmiany algorytmu deduplikacji;

- zmiany wzoru KPI;

- zmiany klasyfikacji danych;

- zmiany modelu tenant isolation;

- zmiany modelu AI lub dostawcy;

- zmiany polityki retencji;

- zmiany ceny, jednostki rozliczeniowej albo limitu;

- zawarcia zobowiązania SLA;

- wejścia na kolejny rynek;

- rozpoczęcia self-service;

- rozpoczęcia sprzedaży partnerskiej;

- ustanowienia nowego właściciela domeny.

## 23. Obowiązkowe przeglądy decyzji warunkowych

Tabela:
- Wiersz 1: ID; Zdarzenie przeglądu; Wymagany rezultat
- Wiersz 2: DEC-MKT-002; przed skalowaniem; TAM, SAM i SOM
- Wiersz 3: DEC-MKT-003; przed skalowaniem lub ekspansją; analiza konkurencji
- Wiersz 4: DEC-MKT-004; po pierwszych pilotażach; progi kwalifikacji ICP
- Wiersz 5: DEC-PRD-005; przed aktywacją funkcji zaawansowanej; decyzja dopuszczająca
- Wiersz 6: DEC-DAT-006; po uzyskaniu przypadków niedopasowania; progi fuzzy matching
- Wiersz 7: DEC-SEC-007; przed zobowiązaniem SLA; zatwierdzone RTO i RPO
- Wiersz 8: DEC-COM-002; przed skalowaniem; pełniejsza Cost Observability
- Wiersz 9: DEC-COM-003; po płatnych pilotażach; cennik i progi marży

Brak przeprowadzenia obowiązkowego przeglądu oznacza, że decyzja warunkowa nie może być rozszerzana poza dotychczasowy zakres obowiązywania.

## 24. Traceability między decyzjami a dokumentami

Tabela:
- Wiersz 1: Dokument; Główne decyzje
- Wiersz 2: Dokument 1 — Dokumentacja biznesowo-produktowa; DEC-DOC-001–002, DEC-GOV-001–002, DEC-MKT-001–004, DEC-PRD-001–005
- Wiersz 3: Dokument 3 — Kontrakt danych, stanów i KPI; DEC-DAT-001–009, DEC-AI-001
- Wiersz 4: Dokument 4 — Integracje i gotowość operacyjna; DEC-PRD-003–004, DEC-INT-001–003, DEC-OPS-001–002
- Wiersz 5: Dokument 5 — Pierwszy pion i płatny pilotaż; DEC-PRD-001–005, DEC-PIL-001–003
- Wiersz 6: Dokument 6 — Model komercyjny i unit economics; DEC-MKT-004, DEC-PIL-001, DEC-DAT-009, DEC-COM-001–005
- Wiersz 7: Dokument 7 — Bezpieczeństwo, prywatność i AI Governance; DEC-GOV-002, DEC-DAT-007, DEC-SEC-001–007, DEC-AI-001–003

## 25. Kryteria jakości rejestru

Rejestr jest spójny, jeżeli:

1. każda decyzja posiada stabilne ID;

1. każda decyzja posiada jednego imiennego właściciela;

1. każda decyzja ma jednoznaczną treść;

1. decyzje warunkowe posiadają kryterium ponownej oceny;

1. nie istnieją rekordy o statusie „otwarta” albo „review”;

1. odrzucony wariant pozostaje audytowalny;

1. decyzja zastąpiona wskazuje następcę;

1. pozostałe dokumenty odwołują się do właściwych ID;

1. zatwierdzenie nie jest przedstawiane jako dowód wdrożenia;

1. wymagania specjalistyczne wskazują konieczność niezależnej weryfikacji;

1. zmiana decyzji uruchamia analizę wpływu;

1. szczegółowa reguła znajduje się w jednym właściwym dokumencie domenowym.

## 26. Decyzje odrzucone

### DEC-REJ-001 — GMV jako jedyna jednostka ceny

Status: odrzucona
Domena: komercyjna

Odrzucony wariant:
Cena PapaData jest ustalana wyłącznie jako funkcja GMV klienta.

Uzasadnienie odrzucenia:
GMV nie odzwierciedla bezpośrednio kosztu przetwarzania, liczby źródeł, Supportu, AI ani złożoności danych i może być odbierane jako podatek od wzrostu.

Decyzja obowiązująca: DEC-COM-001

### DEC-REJ-002 — Wszystkie integracje jako warunek jednego wydania

Status: odrzucona
Domena: produkt

Odrzucony wariant:
Publiczne uruchomienie produktu wymaga jednoczesnej gotowości wszystkich planowanych integracji.

Uzasadnienie odrzucenia:
Wariant niepotrzebnie wiąże niezależne piony i zwiększa czas wejścia na rynek.

Decyzje obowiązujące: DEC-PRD-003 i DEC-PRD-004

### DEC-REJ-003 — Samo połączenie jako dowód gotowości

Status: odrzucona
Domena: integracje

Odrzucony wariant:
Poprawne uwierzytelnienie i ustanowienie connection oznacza gotową integrację.

Uzasadnienie odrzucenia:
Połączenie nie potwierdza poprawności danych, integralności, KPI ani gotowości operacyjnej.

Decyzje obowiązujące: DEC-INT-001 i DEC-INT-002

### DEC-REJ-004 — Brak danych jako zero

Status: odrzucona
Domena: dane

Odrzucony wariant:
Brak wartości źródłowej może być automatycznie uzupełniany zerem.

Uzasadnienie odrzucenia:
Zmienia znaczenie biznesowe wyniku i może prowadzić do błędnych decyzji.

Decyzja obowiązująca: DEC-DAT-001

### DEC-REJ-005 — AI jako samodzielne źródło decyzji domenowej

Status: odrzucona
Domena: AI Governance

Odrzucony wariant:
Model AI może samodzielnie definiować KPI, gotowość, source authority albo uprawnienia.

Uzasadnienie odrzucenia:
Takie decyzje wymagają deterministycznych, audytowalnych kontraktów domenowych.

Decyzja obowiązująca: DEC-AI-001

## 27. Zatwierdzenie dokumentu

Dokument ustanawia obowiązujący rejestr decyzji i wymagań biznesowo-analitycznych PapaData.

Właściciel i osoba zatwierdzająca: Artur Wiśniewski
Data obowiązywania: 18 lipca 2026 roku
Wersja: 2.0

Wszystkie kolejne dokumenty PapaData powinny korzystać z identyfikatorów ustanowionych w niniejszym rejestrze.

Zmiana decyzji albo wymagania nie wymaga dodawania historii zmian do dokumentów domenowych. Wymaga natomiast:

1. utworzenia nowej wersji rekordu albo decyzji zastępującej;

1. wskazania uzasadnienia;

1. przeprowadzenia analizy wpływu;

1. aktualizacji zależnych odwołań;

1. wskazania wymaganego dowodu;

1. ponownego zatwierdzenia przez właściciela;

1. niezależnej weryfikacji, jeżeli wymaga jej dana brama.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
