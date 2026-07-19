# Centrum dowodzenia

PAPADATA

Centrum Dowodzenia

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M04
- Wiersz 3: Numer modułu; 04 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Centrum Dowodzenia” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: cykl wartości od danych do decyzji

Dokument 3: gotowość lokalna, KPI i brak danych

Dokument 5: pierwszy wynik, decyzja i pomiar

Synteza UI/UX: command center zamiast dashboardu

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
- Wiersz 2: M04-E01…; ekrany i widoki
- Wiersz 3: M04-P01…; przepływy użytkownika
- Wiersz 4: M04-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M04-K01…; komponenty i wzorce UI
- Wiersz 6: M04-R01…; ryzyka UX
- Wiersz 7: M04-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Główną wartością PapaData jest wiarygodna informacja prowadząca do decyzji i pomiaru, nie sam wykres. • Każdy KPI musi mieć zakres, okres, źródła, świeżość, kompletność, ograniczenia i wpływ braków. • Gotowość jest lokalna; jeden KPI może być ready, inny partial lub blocked. • Brak danych nie jest zerem, a konflikt jednego pola nie blokuje niezależnych wyników. • Ekran główny ma prowadzić od stanu danych do uwagi, dowodu, decyzji i działania.

Tabela:
- Wiersz 1: Założenia • Centrum Dowodzenia jest domyślną stroną aktywnego workspace. • Priorytety uwagi są deterministyczne; AI może je objaśniać, lecz ich nie ustanawia. • Użytkownik widzi tylko KPI i działania właściwe dla roli, pionu i readiness.

Tabela:
- Wiersz 1: Rekomendacje • Zastosować kolejkę uwagi zamiast równorzędnych kart KPI. • Każdy skrót wyniku ma kompaktowy Nagłówek Zaufania i link do dowodów. • Oddzielić wynik biznesowy, stan danych, decyzje i operacje techniczne. • Przy porównaniach jawnie oznaczać nieporównywalność definicji i brak danych.

## 1.1. Konsekwencje dla projektu

Moduł „Centrum Dowodzenia” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Właściciel biznesowy; Ocena sytuacji i priorytetów.; Decyzje i działania.
- Wiersz 3: E-commerce/Marketplace Manager; Kontrola sprzedaży i problemów.; Analiza i delegowanie.
- Wiersz 4: Analityk; Weryfikacja definicji i lineage.; Drill-down i porównania.
- Wiersz 5: Data Steward; Problemy danych.; Konflikty i reprocessing.
- Wiersz 6: Administrator integracji; Blockery źródeł.; Reconnect i sync.

## 2.2. Pozycja modułu w produkcie

Moduł M04 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: cykl wartości od danych do decyzji

Dokument 3: gotowość lokalna, KPI i brak danych

Dokument 5: pierwszy wynik, decyzja i pomiar

Synteza UI/UX: command center zamiast dashboardu

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M04-E01
Widok główny Centrum Dowodzenia; Cel: Odpowiada „co wymaga uwagi i dlaczego?”.
Użytkownik: Właściciel biznesowy
Główna akcja: Otwórz najważniejszą uwagę; Treści: Priorytety, KPI, jakość, decyzje, działania, blokery.
Dane: Wejście: KPI, statusy, decyzje, joby. Wyjście: problem/akcja.
Komponenty: Attention Queue; KPI Snapshot; Trust Header; Next Action.; Stany: onboarding, brak KPI, partial, ready, warning, error
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M04-E02
Kolejka uwagi; Cel: Uszeregowanie problemów i możliwości.
Użytkownik: Manager
Główna akcja: Przejrzyj/przypisz/odłóż; Treści: Typ, zakres, wpływ, dowody, owner, termin.
Dane: Wejście: reguły i eventy. Wyjście: status/owner/decision.
Komponenty: Lista; filters; snooze; assignment.; Stany: nowe, przejrzane, odłożone, rozwiązane, niepewne
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M04-E03
Przegląd KPI; Cel: Porównanie wyników z kontekstem zaufania.
Użytkownik: Biznes i analityk
Główna akcja: Otwórz KPI; Treści: Wartość, trend, porównanie, status, kompletność, źródła.
Dane: Wejście: KPI. Wyjście: detail/decision.
Komponenty: KPI row; mini chart; status; evidence link.; Stany: ready, partial, stale, conflict, blocked, empty
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M04-E04
Przegląd zaufania do danych; Cel: Ocena gotowości obszarów.
Użytkownik: Analityk i Data Steward
Główna akcja: Otwórz problem; Treści: Świeżość, kompletność, integralność, konflikty, wpływ.
Dane: Wejście: quality events. Wyjście: repair action.
Komponenty: Quality summary; impact list.; Stany: ready, warning, critical, waiting, empty
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M04-E05
Decyzje oczekujące; Cel: Zebranie obserwacji wymagających człowieka.
Użytkownik: Właściciel biznesowy
Główna akcja: Podejmij decyzję; Treści: KPI/obserwacja, warianty, dowody, ograniczenia, termin.
Dane: Wejście: observation. Wyjście: decision record.
Komponenty: Decision card; evidence; approve/defer/no action.; Stany: nowa, analiza, odroczona, zatwierdzona, odrzucona
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M04-E06
Działania i pomiary; Cel: Kontrola realizacji i oczekiwania na wynik.
Użytkownik: Manager
Główna akcja: Otwórz działanie; Treści: Owner, termin, baseline, okres pomiaru, status, target.
Dane: Wejście: action/measurement. Wyjście: update/conclusion.
Komponenty: Timeline; progress; baseline; measurement status.; Stany: planned, in progress, blocked, waiting, completed, inconclusive
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M04-E07
Szczegóły uwagi; Cel: Połączenie faktu, dowodu, wpływu i next action.
Użytkownik: Właściciel/analityk
Główna akcja: Utwórz decyzję lub napraw dane; Treści: Opis, zakres, KPI, przyczyna, ograniczenia, działania.
Dane: Wejście: attention item. Wyjście: decision/task/issue.
Komponenty: Impact Banner; Evidence Drawer; CTA.; Stany: loading, partial, no access, conflict, stale
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M04-E08
Pierwsza wartość pilotażu; Cel: Pokazanie pierwszego wiarygodnego KPI.
Użytkownik: Klient i Pilot Owner
Główna akcja: Potwierdź zrozumienie; Treści: KPI, zakres, okres, źródło, kompletność, ograniczenia, feedback.
Dane: Wejście: first useful data. Wyjście: confirmation.
Komponenty: Guided result; checklist; feedback.; Stany: ready, acceptable partial, blocked, no value
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M04-P01 — Uwaga do decyzji

Punkt startowy: Najważniejsza uwaga.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Otwórz uwagę
- Wiersz 3: 2; Zweryfikuj KPI
- Wiersz 4: 3; Trust Header/Evidence
- Wiersz 5: 4; Opcjonalnie Papa
- Wiersz 6: 5; Wybierz decyzję
- Wiersz 7: 6; Zapisz

Punkty decyzyjne:

Dane wystarczające?

Akceptujesz partial?

Data issue czy biznes?

Błędy i blokery:

KPI blocked

Definicja zmieniona

Brak capability

Sukces: Audytowalna decyzja.

Ścieżki alternatywne:

Data Steward

Odłożenie

Eksport

## 4.2. M04-P02 — Decyzja do pomiaru

Punkt startowy: Zatwierdzona decyzja.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Utwórz action
- Wiersz 3: 2; Owner/termin
- Wiersz 4: 3; Baseline
- Wiersz 5: 4; Realizacja
- Wiersz 6: 5; Czekaj na okres
- Wiersz 7: 6; Nowe dane
- Wiersz 8: 7; Porównaj
- Wiersz 9: 8; Zapisz wniosek

Punkty decyzyjne:

Baseline porównywalny?

Okres minął?

Zakłócenia?

Błędy i blokery:

Brak danych

Zmiana definicji

Anulowanie

Sukces: Sukces/częściowa poprawa/brak zmiany/negatywny/inconclusive.

Ścieżki alternatywne:

Wydłuż pomiar

Powtórz

Zamknij z powodem

## 4.3. M04-P03 — Problem danych

Punkt startowy: KPI partial/conflict/stale.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Pokaż lokalny wpływ
- Wiersz 3: 2; Quality detail
- Wiersz 4: 3; Owner
- Wiersz 5: 4; Reconnect/review/reprocess
- Wiersz 6: 5; Czekaj
- Wiersz 7: 6; Przelicz KPI
- Wiersz 8: 7; Aktualizuj uwagę

Punkty decyzyjne:

Blokuje KPI?

Klient czy Operations?

Historia wiarygodna?

Błędy i blokery:

Recovery failed

Konflikt unresolved

Wynik się zmienił

Sukces: Zaktualizowany status bez globalnej blokady.

Ścieżki alternatywne:

Pozostaw partial

Eskaluj

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Centrum Dowodzenia” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M04-F01 — Filtry Centrum

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Okres
• Pion
• Źródło
• Kategoria
• Status decyzji
• Owner
- Wiersz 3: Walidacje; • Zakres dostępnych danych
• Krytyczne problemy nie znikają bez informacji
• Pamięć per workspace
- Wiersz 4: Błędy; • Brak danych
• Nieporównywalny okres
• Brak capability
- Wiersz 5: Sukces; Jawny zakres widoku.
- Wiersz 6: Zależności backendowe; Query API, saved views.
- Wiersz 7: Ryzyka UX; Domyślny filtr nie może udawać braku problemów.

## 6.2. M04-F02 — Rejestr decyzji

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • KPI/uwaga
• Typ decyzji
• Uzasadnienie
• Owner
• Termin
• Action/no action
• Target
- Wiersz 3: Walidacje; • Ready lub świadomy partial
• Uzasadnienie dla no action
• Owner/termin dla action
- Wiersz 4: Błędy; • Brak baseline
• KPI zmienił wersję
• Brak capability
- Wiersz 5: Sukces; Decision record z dowodem.
- Wiersz 6: Zależności backendowe; Decision service, snapshots, audit.
- Wiersz 7: Ryzyka UX; Kontekst wyniku musi być zamrożony.

## 6.3. M04-F03 — Potwierdzenie pierwszego wyniku

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Zrozumienie
• Użyteczność
• Komentarz
• Następny krok
• Akceptacja ograniczeń
- Wiersz 3: Walidacje; • Nie wymuszać pozytywnej oceny
• Powiązanie z kartą pilotażu
- Wiersz 4: Błędy; • Brak KPI
• Wynik poza zakresem
• Zła rola
- Wiersz 5: Sukces; First useful data i feedback.
- Wiersz 6: Zależności backendowe; Pilot tracking, KPI evidence.
- Wiersz 7: Ryzyka UX; Brak sprzeciwu ≠ wartość.

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
- Wiersz 2: Partial KPI; Gross Revenue obejmuje 94% zamówień. Brakuje danych z 16-17 lipca.
- Wiersz 3: Brak danych; Brak potwierdzonej wartości. Nie traktujemy jej jako 0.
- Wiersz 4: Zmiana definicji; Definicja KPI zmieniła się 1 lipca; porównanie może być niepełne.
- Wiersz 5: Decyzja oczekuje; Ta obserwacja wymaga decyzji właściciela do 22 lipca.
- Wiersz 6: Pomiar; Działanie zakończone. Na wynik trzeba poczekać do końca okresu pomiaru.
- Wiersz 7: Konflikt lokalny; Konflikt refundu blokuje marżę, ale nie liczbę zamówień.
- Wiersz 8: AI; Papa wyjaśnia wynik; nie zmienia definicji KPI ani danych.
- Wiersz 9: Brak wartości; Nie potwierdzono użytecznego wyniku. Zapisz przyczynę i decyzję.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M04-K01; Kolejka uwagi; Priorytet, wpływ, zakres, owner, next action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M04-K02; Skrócony nagłówek zaufania; Readiness, fresh, complete, constraints.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M04-K03; Wiersz KPI z dowodem; Wartość, trend, porównanie i evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M04-K04; Baner wpływu; Problem techniczny -> konsekwencja.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M04-K05; Panel dowodów KPI; Definicja, wersja, lineage, źródła.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M04-K06; Karta decyzji; Warianty, owner, termin i wynik.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M04-K07; Oś działania i pomiaru; Baseline, realization, measurement.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M04-K08; Wskaźnik pierwszej wartości; Moment użytecznego wyniku.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M04-K09; Lista ograniczeń; Jawna i sortowana wpływem.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Centrum_Dowodzenia/Widok_główny
- Wiersz 3: Folder; Centrum_Dowodzenia/Kolejka_uwagi
- Wiersz 4: Folder; Centrum_Dowodzenia/KPI
- Wiersz 5: Folder; Centrum_Dowodzenia/Zaufanie
- Wiersz 6: Folder; Centrum_Dowodzenia/Decyzje
- Wiersz 7: Folder; Centrum_Dowodzenia/Pomiary
- Wiersz 8: Historia; Widok/Wdrożenie
- Wiersz 9: Historia; Widok/Brak_KPI
- Wiersz 10: Historia; Widok/Dane_częściowe
- Wiersz 11: Historia; Uwaga/Krytyczny_problem
- Wiersz 12: Historia; KPI/Konflikt
- Wiersz 13: Historia; Decyzje/Oczekująca
- Wiersz 14: Historia; Pomiary/Oczekuje_na_dane
- Wiersz 15: Historia; Przepływy/KPI_do_wyniku
- Wiersz 16: Wariant; Domyślny
- Wiersz 17: Wariant; Mało_danych
- Wiersz 18: Wariant; Wiele_uwag
- Wiersz 19: Wariant; Tylko_odczyt
- Wiersz 20: Wariant; Brak_dostępu
- Wiersz 21: Wariant; Wygasła_sesja
- Wiersz 22: Wariant; Zmiana_definicji
- Wiersz 23: Wariant; Długi_okres

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
- Wiersz 2: P0; Widok główny, uwagi, KPI z zaufaniem, decyzje, działania/pomiary i pierwsza wartość.
- Wiersz 3: P1; Saved views, notifications, porównania i kontekstowy Papa.
- Wiersz 4: P2; Personalized priority, forecasts i auto-observations po governance.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M04-R01; Kafelki bez priorytetu; Brak działania.; Kolejka uwagi.
- Wiersz 3: M04-R02; KPI bez zaufania; Błędne decyzje.; Trust Header.
- Wiersz 4: M04-R03; Brak jako zero; Fałszywy wynik.; Semantyczny brak.
- Wiersz 5: M04-R04; AI ustala priorytet; Nieweryfikowalne.; Reguły deterministyczne.
- Wiersz 6: M04-R05; Lokalny konflikt blokuje wszystko; Niedostępność.; Wpływ per KPI.
- Wiersz 7: M04-R06; Brak pomiaru; Produkt kończy się na rekomendacji.; Baseline i okres.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M04-D01; Algorytm uwag; Decyzja UI/UX do podjęcia; Reguły wpływu i pilności.; Kolejka.
- Wiersz 3: M04-D02; KPI startowe; Luka; KPI per pion i formuły.; Widok główny.
- Wiersz 4: M04-D03; Progi świeżości; Luka; Per źródło/dataset/KPI.; Stale.
- Wiersz 5: M04-D04; Porównywalność; Decyzja UI/UX do podjęcia; Definicja/waluta/źródło.; Trendy.
- Wiersz 6: M04-D05; Personalizacja; Rekomendacja; Saved views per rola.; Nie ukrywać krytycznych.
- Wiersz 7: M04-D06; Alert/obserwacja/rekomendacja; Luka; Kontrakty treści.; Kolejka.
- Wiersz 8: M04-D07; First useful data; Decyzja UI/UX do podjęcia; Kryterium i potwierdzenie.; Pilotaż.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Zatwierdzić model uwagi.

Zaprojektować KPI + Trust Header.

Zbudować P0 dla jednego D2C KPI.

Połączyć decyzję, action i measurement.

Dodać partial/stale/conflict/no data.

Test z biznesem i analitykiem.

Dopiero potem Papa i personalizacja.

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
