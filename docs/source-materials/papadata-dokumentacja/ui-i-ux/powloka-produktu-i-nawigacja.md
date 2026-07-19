# Powłoka produktu i nawigacja

PAPADATA

Powłoka produktu i nawigacja

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M03
- Wiersz 3: Numer modułu; 03 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Powłoka produktu i nawigacja” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: role i cykl wartości

Dokument 3: tenant, workspace i gotowość lokalna

Dokument 7: tenant isolation i ponowna walidacja

Synteza UI/UX: lewa nawigacja, pasek kontekstu, prawy panel, pasek procesów

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
- Wiersz 2: M03-E01…; ekrany i widoki
- Wiersz 3: M03-P01…; przepływy użytkownika
- Wiersz 4: M03-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M03-K01…; komponenty i wzorce UI
- Wiersz 6: M03-R01…; ryzyka UX
- Wiersz 7: M03-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • PapaData wymaga odrębnej aplikacji klienta i Operations Console. • Aktywny kontekst tenanta/workspace jest częścią każdej operacji i nie może być ustalany wyłącznie po stronie klienta. • Problemy lokalne powinny pozostać przy źródle, datasetcie lub KPI; alert globalny jest tylko dla wpływu przekrojowego. • Asystent działa kontekstowo, zwykle w prawym panelu. • Procesy async, jak sync, eksport i reprocessing, muszą pozostać widoczne po zmianie ekranu.

Tabela:
- Wiersz 1: Założenia • Desktop jest głównym środowiskiem; mobile wspiera co najmniej odczyt alertów, decyzji i statusów. • Menu klienta obejmuje: Centrum Dowodzenia, Analiza, Źródła, Jakość danych, Decyzje i działania, Papa, Ustawienia. • Okres analizy jest częścią kontekstu, lecz nie każda strona dziedziczy go automatycznie.

Tabela:
- Wiersz 1: Rekomendacje • Powłoka z czterech warstw: lewa nawigacja, pasek kontekstu, powierzchnia główna, prawy panel. • Aktywny tenant i workspace zawsze widoczne, także w potwierdzeniach operacji krytycznych. • Paleta poleceń wyszukuje ekrany, KPI, źródła i akcje, ale respektuje capabilities. • Stosować sekcje, separatory i osadzone panele zamiast ciężkich kart.

## 1.1. Konsekwencje dla projektu

Moduł „Powłoka produktu i nawigacja” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Użytkownik biznesowy; Przejście od uwagi do działania.; Centrum, decyzje, pomiary.
- Wiersz 3: Analityk; Praca w wielu zakresach.; Wyszukiwanie, filtry, lineage.
- Wiersz 4: Administrator workspace; Konfiguracja i zespół.; Źródła, ustawienia, bezpieczeństwo.
- Wiersz 5: Użytkownik wielu tenantów; Bezpieczna zmiana kontekstu.; Przełącznik i reset.
- Wiersz 6: Support/Operations; Oddzielna konsola.; Dostęp czasowy i audytowany.

## 2.2. Pozycja modułu w produkcie

Moduł M03 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: role i cykl wartości

Dokument 3: tenant, workspace i gotowość lokalna

Dokument 7: tenant isolation i ponowna walidacja

Synteza UI/UX: lewa nawigacja, pasek kontekstu, prawy panel, pasek procesów

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M03-E01
Powłoka aplikacji klienta; Cel: Stały bezpieczny szkielet modułów.
Użytkownik: Wszyscy
Główna akcja: Przejdź do modułu; Treści: Lewy rail, kontekst, obszar główny, panel prawy, async bar.
Dane: Wejście: rola, tenant, entitlements. Wyjście: dostępna IA.
Komponenty: Nawigacja; breadcrumb; header; panel; async bar.; Stany: domyślny, brak modułów, brak dostępu, wygasła sesja
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M03-E02
Przełącznik tenanta i workspace; Cel: Zmiana kontekstu z ponowną autoryzacją.
Użytkownik: Użytkownik wielu kontekstów
Główna akcja: Zmień workspace; Treści: Nazwa, rola, status, ostatni kontekst, niezapisane zmiany.
Dane: Wejście: wybór. Wyjście: nowy kontekst i reset.
Komponenty: Popover; lista; search; confirmation.; Stany: przetwarzanie, brak membershipu, zawieszony, błąd
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M03-E03
Globalna paleta poleceń; Cel: Szybkie odnajdywanie obiektów i akcji.
Użytkownik: Zaawansowani użytkownicy
Główna akcja: Wykonaj polecenie; Treści: Ostatnie elementy, wyniki grupowane, skróty, akcje z approval.
Dane: Wejście: fraza i kontekst. Wyjście: nawigacja/flow.
Komponenty: Dialog search; grupy; permission hint.; Stany: pusty, loading, brak dostępu, brak wyników
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M03-E04
Centrum powiadomień; Cel: Informacje wymagające uwagi z zakresem i ownerem.
Użytkownik: Wszyscy
Główna akcja: Otwórz problem; Treści: Dane, integracje, decyzje, billing, bezpieczeństwo; priorytet.
Dane: Wejście: eventy. Wyjście: nawigacja i status.
Komponenty: Lista; filtry; badge; CTA.; Stany: pusty, nowe, częściowe, błąd dostarczenia
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M03-E05
Prawy panel kontekstowy; Cel: Jakość, lineage, Papa lub next action bez utraty zadania.
Użytkownik: Analityk i biznes
Główna akcja: Otwórz dowody; Treści: Zakładki: Zaufanie, Źródła, Ograniczenia, Papa, Działanie.
Dane: Wejście: aktywny obiekt. Wyjście: interpretacja/akcja.
Komponenty: Resizable drawer; tabs; pin.; Stany: brak kontekstu, niezależny loading, partial, brak dostępu
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M03-E06
Pasek operacji asynchronicznych; Cel: Widoczność jobów po zmianie strony.
Użytkownik: Admin integracji i analityk
Główna akcja: Otwórz operację; Treści: Sync, backfill, export, reprocessing, delete; etap i wynik.
Dane: Wejście: job events. Wyjście: retry/details.
Komponenty: Dolny pasek; kolejka; progress; historia.; Stany: queued, running, retrying, partial, failed, succeeded
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M03-E07
Brak dostępu; Cel: Bezpieczna odmowa bez ujawniania zasobu.
Użytkownik: Użytkownik bez capability
Główna akcja: Wróć lub poproś admina; Treści: Ogólna informacja, wymagany zakres, ścieżka pomocy.
Dane: Wejście: decyzja serwera. Wyjście: brak danych.
Komponenty: Empty state; CTA; event ID.; Stany: membership, capability, entitlement, security block
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M03-E08
Operations Console; Cel: Rozdzielenie pilotaży, operacji, incydentów i kosztów.
Użytkownik: Role PapaData
Główna akcja: Przejdź do procesu; Treści: Tenanty, pilotaże, integracje, review, monitoring, koszty, bramy, audyt.
Dane: Wejście: rola wewnętrzna. Wyjście: audytowana operacja.
Komponenty: Oddzielny shell; environment banner.; Stany: read-only, brak uprawnienia, incydent, dostęp czasowy
Priorytet: P0 wewnętrzne
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M03-P01 — Zmiana workspace

Punkt startowy: Wybór nowego kontekstu.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Niezapisane zmiany
- Wiersz 3: 2; Żądanie do serwera
- Wiersz 4: 3; Rewalidacja
- Wiersz 5: 4; Czyszczenie cache
- Wiersz 6: 5; Ładowanie IA/danych
- Wiersz 7: 6; Zapis kontekstu

Punkty decyzyjne:

Dostęp?

Można opuścić formularz?

Workspace aktywny?

Błędy i blokery:

Membership wygasł

Błąd sieci

Stare żądanie wraca

Workspace zawieszony

Sukces: Nowy kontekst bez danych poprzedniego tenantu.

Ścieżki alternatywne:

Anulowanie

Powrót do wyboru

Tryb bez danych

## 4.2. M03-P02 — Alert do działania

Punkt startowy: Powiadomienie w shellu.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Otwarcie centrum
- Wiersz 3: 2; Wpływ i zakres
- Wiersz 4: 3; Przejście do obiektu
- Wiersz 5: 4; Panel dowodów
- Wiersz 6: 5; Next action
- Wiersz 7: 6; Aktualizacja statusu

Punkty decyzyjne:

Capability?

Lokalny/globalny?

Approval?

Błędy i blokery:

Obiekt rozwiązany

Brak dostępu

Dane processing

Sukces: Użytkownik rozumie problem i ownera.

Ścieżki alternatywne:

Odłóż

Przekaż

Support case

## 4.3. M03-P03 — Operacja w tle

Punkt startowy: Użytkownik uruchamia job.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Potwierdzenie zakresu
- Wiersz 3: 2; Utworzenie joba
- Wiersz 4: 3; Async bar
- Wiersz 5: 4; Nawigacja dalej
- Wiersz 6: 5; Zmiana etapu
- Wiersz 7: 6; Wynik/błąd

Punkty decyzyjne:

Można anulować?

Partial?

Wymaga user action?

Błędy i blokery:

Retry

Sesja wygasła

Konflikt po jobie

Sukces: Operacja ma historię i wpływ.

Ścieżki alternatywne:

Pozostaw w tle

Eskaluj

Uruchom ograniczony zakres

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Powłoka produktu i nawigacja” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M03-F01 — Zmiana kontekstu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Tenant
• Workspace
• Opcjonalny okres
- Wiersz 3: Walidacje; • Membership serwerowo
• Zakaz zawieszonego kontekstu
• Obsługa szkicu
- Wiersz 4: Błędy; • Dostęp odebrany
• Workspace inactive
• Błąd refresh
- Wiersz 5: Sukces; Nowy kontekst i reset lokalny.
- Wiersz 6: Zależności backendowe; Session API, permission, cache.
- Wiersz 7: Ryzyka UX; Wyścigi żądań mogą pokazać stary tenant.

## 6.2. M03-F02 — Wyszukiwanie globalne

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Fraza
• Typ obiektu
• Zakres
• Workspace
- Wiersz 3: Walidacje; • Filtrowanie serwerowe
• Brak sekretów/PII ponad zakres
- Wiersz 4: Błędy; • Brak wyników
• Brak capability
• Indeks stale
- Wiersz 5: Sukces; Dozwolone wyniki i nawigacja.
- Wiersz 6: Zależności backendowe; Search index per tenant.
- Wiersz 7: Ryzyka UX; Autocomplete nie ujawnia obcych nazw.

## 6.3. M03-F03 — Preferencje powiadomień

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Kategorie
• Kanał
• Częstotliwość
• Priorytet
• Workspace
- Wiersz 3: Walidacje; • Krytycznych alertów nie można wyłączyć
• Kanał zweryfikowany
- Wiersz 4: Błędy; • Kanał niedostępny
• Brak uprawnienia
- Wiersz 5: Sukces; Zapis preferencji.
- Wiersz 6: Zależności backendowe; Notification service, profile, policy.
- Wiersz 7: Ryzyka UX; Nie dublować tego samego lokalnego problemu.

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
- Wiersz 2: Zmiana workspace; Przełączasz się do workspace „D2C Polska”. Dane i filtry poprzedniego workspace zostaną wyczyszczone.
- Wiersz 3: Brak dostępu; Nie masz dostępu do tego zakresu. Widoczność może nadać administrator workspace.
- Wiersz 4: Operacja w tle; Synchronizacja trwa. Możesz kontynuować pracę; wynik pojawi się w pasku operacji.
- Wiersz 5: Stary wynik; Element zmienił się po otwarciu strony. Odświeżyliśmy dane przed akcją.
- Wiersz 6: Brak wyników; Nie znaleziono elementów dostępnych w bieżącym workspace.
- Wiersz 7: Problem lokalny; Problem dotyczy tylko Meta Ads. KPI sprzedażowe pozostają dostępne.
- Wiersz 8: Sesja wygasła; Zaloguj się ponownie. Zweryfikujemy workspace i wznowimy ekran.
- Wiersz 9: Operations; Pracujesz w konsoli operacyjnej PapaData. Działania są audytowane.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M03-K01; Nawigacja główna; Moduły filtrowane rolą.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M03-K02; Pasek kontekstu; Tenant, workspace, okres, pion.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M03-K03; Przełącznik kontekstu; Rewalidacja i reset.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M03-K04; Panel kontekstowy; Zaufanie, lineage, Papa, action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M03-K05; Paleta poleceń; Search i bezpieczne akcje.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M03-K06; Centrum powiadomień; Zakres, wpływ, priorytet, owner.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M03-K07; Pasek operacji w tle; Postęp i historia jobów.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M03-K08; Baner środowiska; Klient vs Operations/test.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M03-K09; Ścieżka nawigacyjna zakresu; Hierarchia i workspace.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Powłoka/Nawigacja
- Wiersz 3: Folder; Powłoka/Pasek_kontekstu
- Wiersz 4: Folder; Powłoka/Przełącznik_obszaru_roboczego
- Wiersz 5: Folder; Powłoka/Panel_kontekstowy
- Wiersz 6: Folder; Powłoka/Paleta_poleceń
- Wiersz 7: Folder; Powłoka/Powiadomienia
- Wiersz 8: Folder; Powłoka/Operacje_w_tle
- Wiersz 9: Folder; Powłoka/Brak_dostępu
- Wiersz 10: Historia; Nawigacja/Rola_biznesowa
- Wiersz 11: Historia; Nawigacja/Administrator
- Wiersz 12: Historia; Przełącznik/Przetwarzanie
- Wiersz 13: Historia; Przełącznik/Brak_członkostwa
- Wiersz 14: Historia; Panel/Zaufanie_do_KPI
- Wiersz 15: Historia; Panel/Papa
- Wiersz 16: Historia; Operacje/Ponawianie
- Wiersz 17: Historia; Przepływy/Zmiana_obszaru_roboczego_z_formularzem
- Wiersz 18: Wariant; Jasny
- Wiersz 19: Wariant; Ciemny
- Wiersz 20: Wariant; Nawigacja_zwinięta
- Wiersz 21: Wariant; Długi_nagłówek
- Wiersz 22: Wariant; Wiele_obszaru_roboczego
- Wiersz 23: Wariant; Tylko_odczyt
- Wiersz 24: Wariant; Wygasła_sesja
- Wiersz 25: Wariant; Wolna_sieć

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
- Wiersz 2: P0; Shell klienta, kontekst, nawigacja, panel, async bar, brak dostępu i oddzielny Operations shell.
- Wiersz 3: P1; Paleta poleceń, powiadomienia, preferencje, skróty.
- Wiersz 4: P2; Personalizacja IA i pełny mobile admin.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M03-R01; Jedna IA dla klienta i Operations; Ujawnienie i przeciążenie.; Oddzielne powłoki.
- Wiersz 3: M03-R02; Ukryty tenant; Błędne decyzje/cross-tenant.; Stały kontekst.
- Wiersz 4: M03-R03; Globalne alarmy lokalnych problemów; Alarm fatigue.; Lokalny impact.
- Wiersz 5: M03-R04; AI bez kontekstu; Generyczne odpowiedzi.; Dziedziczenie obiektu i zakresu.
- Wiersz 6: M03-R05; Job znika; Duplikaty i koszt.; Stały async bar.
- Wiersz 7: M03-R06; Ciężkie karty; Brak hierarchii.; Warstwy i separatory.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M03-D01; Responsywność; Decyzja UI/UX do podjęcia; Zakres mobile admin.; Shell i priorytet.
- Wiersz 3: M03-D02; Finalna IA; Decyzja UI/UX do podjęcia; Nazwy modułów per rola.; Route design.
- Wiersz 4: M03-D03; Globalny okres; Luka; Które ekrany dziedziczą.; Niejawne filtry.
- Wiersz 5: M03-D04; Powiadomienia; Luka; Kanały, retencja, priorytety.; Centrum uwagi.
- Wiersz 6: M03-D05; Paleta poleceń; Rekomendacja; Zakres akcji i approval.; Bezpieczeństwo.
- Wiersz 7: M03-D06; Operations Console; Decyzja UI/UX do podjęcia; Aplikacja/subdomena.; Deployment.
- Wiersz 8: M03-D07; Support access; Luka; Widoczność aktywnego dostępu.; Transparentność.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Zatwierdzić IA i role.

Zaprojektować pasek kontekstu i przełącznik.

Zbudować shell i panel.

Dodać async i powiadomienia.

Przetestować access/session/race conditions.

Zaprojektować Operations shell.

Udokumentować mobile i Storybook.

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
