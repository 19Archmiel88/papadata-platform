# Dostęp rejestracja i onboarding

PAPADATA

Dostęp, rejestracja i onboarding

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M01
- Wiersz 3: Numer modułu; 01 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Dostęp, rejestracja i onboarding” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: kierunek biznesowy i model ról

Dokument 2: DEC-PRD-003 i governance

Dokument 5: płatny pilotaż i onboarding

Dokument 7: DEC-SEC-001, DEC-SEC-002, dostęp i sesje

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
- Wiersz 2: M01-E01…; ekrany i widoki
- Wiersz 3: M01-P01…; przepływy użytkownika
- Wiersz 4: M01-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M01-K01…; komponenty i wzorce UI
- Wiersz 6: M01-R01…; ryzyka UX
- Wiersz 7: M01-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Pierwsze wdrożenia mają być zarządzanym, płatnym pilotażem na rzeczywistych danych; dokumentacja nie potwierdza gotowego self-service. • Dostęp jest oceniany w kontekście tożsamości, sesji, tenanta, tenantId, workspace, membershipu, roli, capability i entitlement. • MFA jest wymagane dla kont uprzywilejowanych, a zmiana tenanta lub workspace wymaga ponownej walidacji dostępu. • Onboarding kończy się po uzyskaniu interpretowalnego wyniku, a nie po samym utworzeniu konta lub połączenia źródła. • Zaproszenia, odzyskiwanie dostępu, sesje i działania uprzywilejowane muszą być audytowalne.

Tabela:
- Wiersz 1: Założenia • MVP działa w modelu invitation-only; publiczna rejestracja i natychmiastowy zakup są wyłączone. • Tenanta i pierwszy workspace zakłada Operations PapaData po zaakceptowaniu karty pilotażu. • Użytkownik może należeć do wielu tenantów i workspace, ale aktywny jest zawsze jeden zweryfikowany kontekst.

Tabela:
- Wiersz 1: Rekomendacje • Zaprojektować onboarding jako centrum postępu z właścicielem kroku, blokadą i bezpiecznym powrotem, a nie jednorazowy wizard. • Rozdzielić utworzenie konta, akceptację zaproszenia, konfigurację MFA, wybór kontekstu oraz onboarding biznesowy. • W odzyskiwaniu dostępu stosować neutralną odpowiedź, bez potwierdzania istnienia konta. • Każdy krok ma wskazywać, czy czeka na klienta, PapaData, providera lub dane.

## 1.1. Konsekwencje dla projektu

Moduł „Dostęp, rejestracja i onboarding” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Zaproszony użytkownik; Bezpieczne dołączenie do wskazanego tenanta i workspace.; Akceptacja zaproszenia, konto, MFA.
- Wiersz 3: Administrator workspace; Zarządzanie członkostwami i dostępem.; Zaproszenia, role, unieważnienie.
- Wiersz 4: Właściciel biznesowy; Zrozumienie drogi do pierwszej wartości.; Profil działalności, karta pilotażu, akceptacja wyniku.
- Wiersz 5: Administrator integracji; Dostarczenie źródła i zakresu danych.; Połączenie źródła, reconnect, scope.
- Wiersz 6: Operations PapaData; Kontrola bram i utworzenie kontekstu klienta.; Kwalifikacja, tenant/workspace, blokery.

## 2.2. Pozycja modułu w produkcie

Moduł M01 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: kierunek biznesowy i model ról

Dokument 2: DEC-PRD-003 i governance

Dokument 5: płatny pilotaż i onboarding

Dokument 7: DEC-SEC-001, DEC-SEC-002, dostęp i sesje

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M01-E01
Logowanie; Cel: Bezpieczne wejście bez ujawniania informacji o koncie.
Użytkownik: Wszyscy użytkownicy
Główna akcja: Zaloguj się; Treści: E-mail, sekret/SSO, link odzyskania, informacja o prywatności.
Dane: Wejście: identyfikator i sekret. Wyjście: sesja, MFA lub neutralny błąd.
Komponenty: Formularz logowania; walidacja inline; komunikat sesji.; Stany: domyślny, przetwarzanie, błędne dane, blokada, MFA, wygasła sesja
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M01-E02
Akceptacja zaproszenia; Cel: Dołączenie do konkretnego tenanta bez zmiany adresata.Użytkownik: Zaproszony użytkownikGłówna akcja: Akceptuj zaproszenie; Treści: Tenant, workspace, zapraszający, rola, capabilities, termin.
Dane: Wejście: token jednorazowy. Wyjście: membership lub odmowa.
Komponenty: Karta zaproszenia; podsumowanie roli; CTA; panel błędu.; Stany: ważne, wykorzystane, unieważnione, wygasłe, inny e-mail
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M01-E03
Odzyskanie dostępu; Cel: Przywrócenie dostępu bez ujawniania konta i obejścia MFA.
Użytkownik: Użytkownik bez dostępu
Główna akcja: Wyślij instrukcję; Treści: E-mail, neutralny komunikat, kod/link, MFA recovery.
Dane: Wejście: e-mail. Wyjście: proces lub neutralna odpowiedź.
Komponenty: Pole e-mail; licznik prób; ekran linku; potwierdzenie sekretu.; Stany: wysłano, link wygasł, nieważny, wykorzystany, limit prób
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M01-E04
Konfiguracja MFA; Cel: Zabezpieczenie konta uprzywilejowanego przed pierwszą operacją.
Użytkownik: Administratorzy
Główna akcja: Włącz MFA; Treści: Metoda, kod, recovery codes, potwierdzenie przechowania.
Dane: Wejście: metoda i kod. Wyjście: aktywna konfiguracja i audyt.
Komponenty: Kod QR/klucz; pole kodu; lista kodów odzyskiwania.; Stany: nieukończona konfiguracja, błędny kod, sukces, utrata metody
Priorytet: P0
Podstawa: Fakt; DEC-SEC-002.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M01-E05
Wybór tenanta i workspace; Cel: Ustalenie aktywnego kontekstu po walidacji uprawnień.
Użytkownik: Użytkownik wielu kontekstów
Główna akcja: Otwórz workspace; Treści: Lista kontekstów, rola, status membershipu, ostatnia aktywność.
Dane: Wejście: wybór. Wyjście: nowy kontekst sesji i reset danych.
Komponenty: Przełącznik; lista; badge roli; skeleton.; Stany: brak tenanta, zawieszony workspace, brak membershipu, przetwarzanie
Priorytet: P0
Podstawa: Fakt; izolacja tenantów.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M01-E06
Centrum onboardingu; Cel: Prowadzenie od zaproszenia do pierwszego wiarygodnego wyniku.
Użytkownik: Właściciel biznesowy i administrator integracji
Główna akcja: Kontynuuj następny krok; Treści: Profil, karta pilotażu, źródło, dane, KPI, wynik; owner, termin, blokery.
Dane: Wejście: statusy procesów. Wyjście: next action i postęp.
Komponenty: Oś postępu; lista zadań; panel blokera; historia.; Stany: nie rozpoczęto, w toku, oczekuje, zablokowane, ukończone
Priorytet: P0
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M01-E07
Profil działalności; Cel: Ustalenie kontekstu biznesowego do interpretacji danych.
Użytkownik: Właściciel biznesowy
Główna akcja: Zapisz profil; Treści: Pion, kanały, sklepy, waluta, strefa, okres raportowy, owner.
Dane: Wejście: dane firmy i profilu prawnego tenanta. Wyjście: wersjonowany profil.
Komponenty: Formularz sekcyjny; zależności; podsumowanie wpływu.; Stany: draft, niepełne, konflikt ustawień, zatwierdzone
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M01-E08
Karta pilotażu; Cel: Uzgodnienie zakresu, ceny, sukcesu i odpowiedzialności.
Użytkownik: Właściciele klienta i PapaData
Główna akcja: Akceptuj zakres; Treści: Problem, źródło, KPI, okres, cena, ograniczenia, kryteria, ownerzy.
Dane: Wejście: uzgodnienia. Wyjście: zaakceptowana karta lub odrzucenie.
Komponenty: Sekcje zakresu; kryteria; akceptacja; historia wersji.; Stany: draft, do akceptacji, odrzucona, zaakceptowana, wygasła
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 10: M01-E09
Powrót do przerwanego procesu; Cel: Bezpieczne odtworzenie ostatniego kroku po przerwie.
Użytkownik: Użytkownik w onboardingu
Główna akcja: Wznów; Treści: Ostatni krok, szkic bez sekretów, zmiany stanu po przerwie.
Dane: Wejście: checkpoint i nowa sesja. Wyjście: właściwy ekran.
Komponenty: Banner powrotu; porównanie zmian; CTA.; Stany: sesja wygasła, dane zmienione, krok ukończony, brak dostępu
Priorytet: P0
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M01-P01 — Zaproszenie -> konto -> MFA -> workspace

Punkt startowy: Imienne zaproszenie.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Walidacja tokenu
- Wiersz 3: 2; Potwierdzenie adresu i tenanta
- Wiersz 4: 3; Utworzenie/połączenie konta
- Wiersz 5: 4; MFA, gdy wymagana
- Wiersz 6: 5; Rewalidacja membershipu
- Wiersz 7: 6; Wejście do workspace

Punkty decyzyjne:

Czy token jest ważny?

Czy adres odpowiada?

Czy rola wymaga MFA?

Czy membership obowiązuje?

Błędy i blokery:

Link wygasł

Inny e-mail

Błędny kod MFA

Membership unieważniony

Sukces: Użytkownik pracuje w poprawnym kontekście.

Ścieżki alternatywne:

Nowe zaproszenie

Ponowne logowanie z bezpiecznym punktem powrotu

## 4.2. M01-P02 — Onboarding do pierwszej wartości

Punkt startowy: Zaakceptowana karta pilotażu i bramy wejścia.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Utworzenie kontekstu
- Wiersz 3: 2; Profil działalności
- Wiersz 4: 3; Przypisanie ownerów
- Wiersz 5: 4; Połączenie źródła
- Wiersz 6: 5; Initial sync/backfill
- Wiersz 7: 6; Ocena jakości
- Wiersz 8: 7; Pierwszy KPI
- Wiersz 9: 8; Wynik z ograniczeniami
- Wiersz 10: 9; Potwierdzenie zrozumienia

Punkty decyzyjne:

Czy scope jest pełny?

Czy dataset jest ready/partial?

Czy wynik spełnia kryterium wartości?

Błędy i blokery:

OAuth przerwany

Brak danych

Schema mismatch

Konflikt danych

Sukces: Co najmniej jeden wiarygodny KPI i zapisany wynik.

Ścieżki alternatywne:

Reconnect

Lokalna blokada KPI

Eskalacja do Operations

## 4.3. M01-P03 — Odzyskanie dostępu

Punkt startowy: Użytkownik nie może wejść.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Podanie e-maila
- Wiersz 3: 2; Neutralne potwierdzenie
- Wiersz 4: 3; Jednorazowy link/kod
- Wiersz 5: 4; Nowy sekret
- Wiersz 6: 5; MFA/recovery
- Wiersz 7: 6; Unieważnienie sesji

Punkty decyzyjne:

Czy token ważny?

Czy wymagane dodatkowe potwierdzenie?

Błędy i blokery:

Limit prób

Wygasły link

Brak metody MFA

Sukces: Nowa audytowana sesja lub kontrolowane wsparcie.

Ścieżki alternatywne:

Recovery MFA

Kontakt z administratorem

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Dostęp, rejestracja i onboarding” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M01-F01 — Logowanie i MFA

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • E-mail
• Hasło lub SSO
• Kod MFA
• Opcjonalne zapamiętanie urządzenia
- Wiersz 3: Walidacje; • Format e-mail
• Rate limiting
• Kod w oknie czasowym
• Decyzja serwerowa
- Wiersz 4: Błędy; • Nieprawidłowe dane
• Kod wygasł
• Blokada
• Metoda niedostępna
- Wiersz 5: Sukces; Sesja po pełnej walidacji.
- Wiersz 6: Zależności backendowe; Identity provider, sesje, audyt.
- Wiersz 7: Ryzyka UX; Komunikat nie rozróżnia kont istniejących.

## 6.2. M01-F02 — Profil działalności

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Pion
• Kraj
• Waluta
• Strefa
• Sklepy/konta
• Okres
• Owner
- Wiersz 3: Walidacje; • Słowniki kontrolowane
• Co najmniej jeden kanał
• Zgodność z kartą pilotażu
- Wiersz 4: Błędy; • Sprzeczna strefa
• Brak ownera
• Pion poza zakresem
- Wiersz 5: Sukces; Zapis profilu i analiza wpływu.
- Wiersz 6: Zależności backendowe; Workspace config, wersjonowanie.
- Wiersz 7: Ryzyka UX; Zmiana po sync może wymagać reprocessingu.

## 6.3. M01-F03 — Karta pilotażu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Problem
• Źródło
• KPI
• Okres
• Cena
• Ograniczenia
• Sukces
• Ownerzy
• Termin
- Wiersz 3: Walidacje; • Jedno użyteczne źródło
• Mierzalny KPI
• Płatny zakres
• Owner klienta
- Wiersz 4: Błędy; • Brak ceny
• Nieosiągalny sukces
• Omnichannel bez bram
- Wiersz 5: Sukces; Zaakceptowana wersjonowana karta.
- Wiersz 6: Zależności backendowe; Pilot register, billing, bramy.
- Wiersz 7: Ryzyka UX; Akceptacja nie jest dowodem gotowości.

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
- Wiersz 2: Logowanie - błąd; Nie udało się zalogować. Sprawdź dane lub użyj odzyskiwania dostępu.
- Wiersz 3: Neutralne odzyskanie; Jeżeli konto może otrzymać wiadomość, wyślemy dalsze instrukcje.
- Wiersz 4: Zaproszenie wygasło; To zaproszenie nie jest już ważne. Poproś administratora o nowe.
- Wiersz 5: Inny adres; Zaproszenie jest przypisane do innego adresu e-mail.
- Wiersz 6: MFA wymagane; Dokończ konfigurację MFA, aby uzyskać dostęp do tej roli.
- Wiersz 7: Onboarding oczekuje; Ten krok czeka na dane z pierwszej synchronizacji. Postęp zostanie zachowany.
- Wiersz 8: Sesja wygasła; Zaloguj się ponownie, aby kontynuować z bezpiecznie odtworzonym kontekstem.
- Wiersz 9: Pierwszy KPI niegotowy; Połączenie jest aktywne, ale dane i KPI nie zostały jeszcze zweryfikowane.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M01-K01; Karta zaproszenia; Tenant, workspace, rola, termin i status tokenu.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M01-K02; Przełącznik tenanta i obszaru roboczego; Zmiana z rewalidacją i resetem.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M01-K03; Oś wdrożenia; Etapy, owner, blokada, termin i next action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M01-K04; Wskaźnik sesji; Wygasanie, reauth i kontekst.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M01-K05; Panel blokady; Problem, wpływ, owner i CTA.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M01-K06; Podsumowanie roli i uprawnień; Realny zakres dostępu.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M01-K07; Wzorzec powrotu; Checkpoint i porównanie zmian.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M01-K08; Potwierdzenie uprzywilejowane; Reauth, wpływ i audyt.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Podstawy/Typografia
- Wiersz 3: Folder; Dostęp/Logowanie
- Wiersz 4: Folder; Dostęp/Zaproszenie
- Wiersz 5: Folder; Dostęp/MFA
- Wiersz 6: Folder; Dostęp/Odzyskanie
- Wiersz 7: Folder; Wdrożenie/Centrum_postępu
- Wiersz 8: Folder; Wdrożenie/Karta_pilotażu
- Wiersz 9: Folder; Przepływy/Dostęp_i_wdrożenie
- Wiersz 10: Historia; Logowanie/Domyślny
- Wiersz 11: Historia; Logowanie/Błędne_dane
- Wiersz 12: Historia; Zaproszenie/Wygasłe
- Wiersz 13: Historia; MFA/Nieukończona_konfiguracja
- Wiersz 14: Historia; Obszar_roboczy/Brak_dostępu
- Wiersz 15: Historia; Wdrożenie/Oczekuje_na_klienta
- Wiersz 16: Historia; Wdrożenie/Zablokowane_przez_dane
- Wiersz 17: Historia; Przepływy/Zaproszenie_do_pierwszego_KPI
- Wiersz 18: Wariant; Jasny
- Wiersz 19: Wariant; Ciemny
- Wiersz 20: Wariant; Mały_ekran
- Wiersz 21: Wariant; Klawiatura
- Wiersz 22: Wariant; Wysoki_kontrast
- Wiersz 23: Wariant; Długi_tekst
- Wiersz 24: Wariant; Błąd_serwera
- Wiersz 25: Wariant; Wygasła_sesja

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
- Wiersz 2: P0; Logowanie, zaproszenia, recovery, MFA, wybór kontekstu, centrum onboardingu, profil i karta pilotażu.
- Wiersz 3: P1; SSO, rozszerzone sesje, przypomnienia i klientowska historia audytu.
- Wiersz 4: P2; Publiczny signup, samodzielny tenant, zakup i self-service onboarding.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M01-R01; Publiczna rejestracja w MVP; Niekontrolowane konta i koszt.; Invitation-only.
- Wiersz 3: M01-R02; Connect jako koniec onboardingu; Fałszywe poczucie wartości.; Koniec na KPI i wyniku.
- Wiersz 4: M01-R03; Stary kontekst po zmianie workspace; Cross-tenant.; Reset cache i rewalidacja.
- Wiersz 5: M01-R04; Zbyt wiele kroków bez wyjaśnienia; Porzucenie.; Cel, owner i postęp.
- Wiersz 6: M01-R05; Brak ownera kroku; Proces stoi.; Owner: klient/PapaData/provider/system.
- Wiersz 7: M01-R06; Utrata formularza po sesji; Frustracja.; Szkic bez sekretów i odtworzenie.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M01-D01; Metoda logowania; Decyzja UI/UX do podjęcia; Hasło, magic link, SSO czy hybryda.; Formularze i recovery.
- Wiersz 3: M01-D02; Publiczny signup; Założenie; Potwierdzić invitation-only.; Cały flow utworzenia tenanta.
- Wiersz 4: M01-D03; Katalog ról; Decyzja UI/UX do podjęcia; Nazwy i capabilities.; Onboarding i brak dostępu.
- Wiersz 5: M01-D04; Tenant-workspace; Decyzja UI/UX do podjęcia; Znaczenie workspace.; Kontekst danych.
- Wiersz 6: M01-D05; Recovery MFA; Luka; Proces utraty urządzenia.; Konta uprzywilejowane.
- Wiersz 7: M01-D06; TTL linków; Luka; Czas ważności i ponowienia.; Stany i mikrocopy.
- Wiersz 8: M01-D07; Kanały powiadomień; Decyzja UI/UX do podjęcia; In-app/e-mail/inne.; Powrót do procesu.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Ustalić tenant-workspace-membership i capabilities.

Zaprojektować sesję, zaproszenie, reauth i MFA.

Połączyć zaproszenie, konto, kontekst i onboarding.

Dodać wygasły link, inny e-mail, brak membershipu i przerwane MFA.

Rozwinąć profil i kartę pilotażu z analizą wpływu.

Przetestować powrót po sesji i zmianie stanu.

Udokumentować flow i warianty w Storybooku.

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
