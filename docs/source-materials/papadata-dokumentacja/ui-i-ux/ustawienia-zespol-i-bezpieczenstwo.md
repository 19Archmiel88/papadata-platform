# Ustawienia zespół i bezpieczeństwo

PAPADATA

Ustawienia, zespół i bezpieczeństwo

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M13
- Wiersz 3: Numer modułu; 13 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Ustawienia, zespół i bezpieczeństwo” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: role użytkowników i odpowiedzialności

Dokument 2: governance i wymagania przekrojowe

Dokument 7: IAM, MFA, tenant isolation, audyt, eksport, usuwanie, support access

Dokument 6: entitlements nie zastępują uprawnień bezpieczeństwa

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
- Wiersz 2: M13-E01…; ekrany i widoki
- Wiersz 3: M13-P01…; przepływy użytkownika
- Wiersz 4: M13-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M13-K01…; komponenty i wzorce UI
- Wiersz 6: M13-R01…; ryzyka UX
- Wiersz 7: M13-D01…; decyzje UI/UX do podjęcia

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
- Wiersz 1: Fakty z dokumentacji • Serwer jest źródłem decyzji o dostępie; entitlement handlowy nie zastępuje capability bezpieczeństwa. • MFA jest wymagane dla kont uprzywilejowanych, a zasada najmniejszych uprawnień obowiązuje użytkowników, procesy i dostawców. • Support access ma być uzasadniony, zakresowy, czasowy, audytowany i odwoływalny. • Eksport, usunięcie danych i operacje uprzywilejowane wymagają kontroli, reauthentication i dowodu. • Nie ma finalnego katalogu nazw ról klienta ani kompletnej macierzy capabilities.

Tabela:
- Wiersz 1: Założenia • Administrator workspace może zarządzać członkami w swoim workspace, lecz nie widzi ustawień innych tenantów. • Role startowe: Właściciel biznesowy, Analityk, Administrator workspace, Administrator integracji, Billing admin, Data Steward, Read-only. • Ustawienia tenanta i workspace są rozdzielone, a zmiany krytyczne mają analizę wpływu.

Tabela:
- Wiersz 1: Rekomendacje • Najpierw projektować capabilities i zakresy, dopiero potem wygodne role domyślne. • Pokazywać użytkownikowi efektywny dostęp wynikający z roli, wyjątków i entitlement, ale bez polegania na UI jako zabezpieczeniu. • Audyt ma być czytelny biznesowo: kto, gdzie, co, na czym, z jakim wynikiem i powodem. • Procesy eksportu/usunięcia/support access prowadzić jako sprawy z timeline, nie pojedyncze modale.

## 1.1. Konsekwencje dla projektu

Moduł „Ustawienia, zespół i bezpieczeństwo” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Administrator tenanta; Zarządzanie tenantem i politykami.; Workspace, ownerzy, security policies.
- Wiersz 3: Administrator workspace; Zespół i lokalne capabilities.; Invite, role, revoke.
- Wiersz 4: Security/Privacy Owner; MFA, sessions, audit, export/delete/support.; Critical approvals.
- Wiersz 5: Billing Administrator; Plan i faktury bez dostępu do danych analitycznych ponad potrzebę.; Billing settings.
- Wiersz 6: Zwykły użytkownik; Własny profil, MFA i sesje.; Self-security.

## 2.2. Pozycja modułu w produkcie

Moduł M13 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: role użytkowników i odpowiedzialności

Dokument 2: governance i wymagania przekrojowe

Dokument 7: IAM, MFA, tenant isolation, audyt, eksport, usuwanie, support access

Dokument 6: entitlements nie zastępują uprawnień bezpieczeństwa

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M13-E01
Ustawienia tenanta; Cel: Konfiguracja danych i polityk na poziomie tenanta.
Użytkownik: Administrator tenanta
Główna akcja: Zapisz zmianę; Treści: Name, legal/profile info, default policies, owners, workspace list.
Dane: Wejście: org settings. Wyjście: versioned config.
Komponenty: Section form; impact notice; audit.; Stany: default, incomplete, conflict, saving, success
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M13-E02
Ustawienia workspace; Cel: Konfiguracja pionu, waluty, strefy i ownerów.
Użytkownik: Administrator workspace
Główna akcja: Zapisz ustawienia; Treści: Name, vertical, currency, timezone, reporting period, owners, status.
Dane: Wejście: workspace config. Wyjście: version + impact.
Komponenty: Form; dependency analysis; reprocess warning.; Stany: draft, incomplete, conflict, processing, active
Priorytet: P0/P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M13-E03
Zespół i członkostwa; Cel: Zapraszanie, zmiana roli i odbieranie dostępu.
Użytkownik: Administrator workspace
Główna akcja: Zaproś lub zmień rolę; Treści: Members, invitations, roles, capabilities summary, last activity, status.
Dane: Wejście: memberships. Wyjście: invite/update/revoke.
Komponenty: Table; role picker; invite status; confirmation.; Stany: empty, invitation pending/expired, active, suspended
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M13-E04
Role i capabilities; Cel: Kontrola domyślnych i niestandardowych uprawnień.
Użytkownik: Admin/Security Owner
Główna akcja: Utwórz/edytuj rolę; Treści: Capability, scope, workspace, entitlement dependency, exceptions, owner.
Dane: Wejście: role definition. Wyjście: versioned role.
Komponenty: Matrix; effective access preview; warnings.; Stany: draft, conflict, approval, active, superseded
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M13-E05
Bezpieczeństwo konta; Cel: MFA, hasło/SSO, urządzenia i odzyskiwanie.
Użytkownik: Każdy użytkownik
Główna akcja: Zabezpiecz konto; Treści: MFA methods, recovery, login history, security status.
Dane: Wejście: self account. Wyjście: security changes.
Komponenty: Security checklist; MFA setup; device list.; Stany: incomplete, secure, warning, locked, recovery
Priorytet: P0
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M13-E06
Aktywne sesje i urządzenia; Cel: Przegląd i unieważnienie sesji.
Użytkownik: Użytkownik/Security Owner
Główna akcja: Wyloguj sesję; Treści: Device, location approximate, started, last activity, current, risk.
Dane: Wejście: sessions. Wyjście: revoke.
Komponenty: Session table; current marker; revoke confirmation.; Stany: loading, no other sessions, revoked, revoke failed
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M13-E07
Audyt; Cel: Sprawdzenie działań krytycznych i zmian.
Użytkownik: Admin/Auditor
Główna akcja: Filtruj/eksportuj rekordy; Treści: Actor, tenant, workspace, operation, resource, outcome, reason, timestamp.
Dane: Wejście: audit events. Wyjście: detail/export.
Komponenty: Table; filters; event detail; integrity marker.; Stany: empty, loading, restricted, partial retention, error
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M13-E08
Eksport i prywatność; Cel: Kontrolowane eksporty, żądania i polityki.
Użytkownik: Privacy Owner
Główna akcja: Utwórz sprawę; Treści: Export requests, delete requests, retention, data categories, status.
Dane: Wejście: case. Wyjście: async process/evidence.
Komponenty: Case list; wizard; timeline; expiry.; Stany: draft, verifying, processing, partial, completed, rejected
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 10: M13-E09
Dostęp Supportu; Cel: Udzielenie czasowego, zakresowego dostępu PapaData.
Użytkownik: Admin/Security Owner
Główna akcja: Zatwierdź/odwołaj; Treści: Reason, scope, person/team, start/end, capabilities, active indicator, audit.
Dane: Wejście: access request. Wyjście: temporary grant/revoke.
Komponenty: Approval; countdown; active banner; audit.; Stany: requested, approved, active, expired, revoked, denied
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 11: M13-E10
Centrum bezpieczeństwa workspace; Cel: Zebranie problemów konfiguracji i wymaganych działań.
Użytkownik: Admin/Security Owner
Główna akcja: Rozwiąż problem; Treści: MFA coverage, inactive owners, risky roles, active support, export/delete cases, incidents.
Dane: Wejście: security checks. Wyjście: action.
Komponenty: Checklist; risk summary; next action.; Stany: healthy, warning, critical, incomplete
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M13-P01 — Zaproszenie i rola

Punkt startowy: Admin zaprasza osobę.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Enter email
- Wiersz 3: 2; Choose role/scope
- Wiersz 4: 3; Preview capabilities
- Wiersz 5: 4; Send invitation
- Wiersz 6: 5; User accepts/MFA
- Wiersz 7: 6; Membership active
- Wiersz 8: 7; Audit

Punkty decyzyjne:

Role sufficient?

Privileged MFA?

Invitation still valid?

Błędy i blokery:

Duplicate member

Expired invite

Wrong email

No capability

Sukces: Active membership with least privilege.

Ścieżki alternatywne:

Resend

Revoke

Custom role review

## 4.2. M13-P02 — Zmiana/odebranie dostępu

Punkt startowy: Potrzeba aktualizacji membershipu.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open member
- Wiersz 3: 2; Show effective access
- Wiersz 4: 3; Select new role/revoke
- Wiersz 5: 4; Impact preview
- Wiersz 6: 5; Reauth if critical
- Wiersz 7: 6; Apply
- Wiersz 8: 7; Invalidate sessions as policy
- Wiersz 9: 8; Audit

Punkty decyzyjne:

Owner continuity?

Critical capability removed?

Current user self-lockout?

Błędy i blokery:

Last admin

Conflict with active job

Session revoke failed

Sukces: Updated access and visible outcome.

Ścieżki alternatywne:

Transfer ownership

Schedule change

Escalate security

## 4.3. M13-P03 — Support access

Punkt startowy: Support requests controlled access.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Create request with reason/scope
- Wiersz 3: 2; Customer review
- Wiersz 4: 3; Choose duration/capabilities
- Wiersz 5: 4; Reauth/MFA
- Wiersz 6: 5; Grant
- Wiersz 7: 6; Show active banner
- Wiersz 8: 7; Expire/revoke
- Wiersz 9: 8; Audit

Punkty decyzyjne:

Necessary?

Scope minimal?

Customer consent required?

Błędy i blokery:

Request stale

Overbroad scope

No approver

Sukces: Time-bound access with full trace.

Ścieżki alternatywne:

Deny

Narrow request

Screen-share without access

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Ustawienia, zespół i bezpieczeństwo” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
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

## 6.1. M13-F01 — Zaproszenie użytkownika

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Email
• Workspace
• Role
• Optional expiry
• Message
- Wiersz 3: Walidacje; • Valid email
• No duplicate active membership
• Role allowed
• Privileged role warning
- Wiersz 4: Błędy; • Existing user
• Domain restriction
• No owner capability
- Wiersz 5: Sukces; One-time invitation.
- Wiersz 6: Zależności backendowe; Membership service, email, audit.
- Wiersz 7: Ryzyka UX; Role summary must reflect actual capabilities.

## 6.2. M13-F02 — Rola/capabilities

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Role name
• Capabilities
• Resource scope
• Workspace
• Exceptions
• Owner
• Reason
- Wiersz 3: Walidacje; • Least privilege
• No invalid combinations
• Prevent last admin removal
• Versioning
- Wiersz 4: Błędy; • Capability conflict
• Entitlement missing
• Approval required
- Wiersz 5: Sukces; Active versioned role.
- Wiersz 6: Zależności backendowe; Authorization service, policy engine, audit.
- Wiersz 7: Ryzyka UX; UI matrix cannot be the enforcement layer.

## 6.3. M13-F03 — Support access request

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Reason
• Case ID
• Scope
• Capabilities
• Start/end
• Support identity
• Customer approver
- Wiersz 3: Walidacje; • Time bound
• Tenant/workspace bound
• No forbidden capabilities
• Reauth
- Wiersz 4: Błędy; • Too broad
• No approver
• Expired case
- Wiersz 5: Sukces; Temporary access or denial.
- Wiersz 6: Zależności backendowe; JIT access, audit, notifications.
- Wiersz 7: Ryzyka UX; Support cannot change KPI/source authority by default.

## 6.4. M13-F04 — Eksport/usunięcie

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Request type
• Scope
• Purpose/legal reference
• Recipient
• TTL
• Owner
- Wiersz 3: Walidacje; • Capability
• Dependencies
• Retention exceptions
• MFA
- Wiersz 4: Błędy; • Identity/scope ambiguous
• Legal hold
• Job partial
- Wiersz 5: Sukces; Controlled case and evidence.
- Wiersz 6: Zależności backendowe; Export/delete services, backup policy, audit.
- Wiersz 7: Ryzyka UX; No immediate deletion promise.

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
- Wiersz 2: Role summary; Ta rola może czytać KPI i eksportować dane, ale nie może zarządzać źródłami.
- Wiersz 3: Last admin; Nie możesz odebrać dostępu ostatniemu administratorowi bez wskazania następcy.
- Wiersz 4: MFA; Ta rola wymaga MFA przed aktywacją uprawnień uprzywilejowanych.
- Wiersz 5: Support active; Support PapaData ma czasowy dostęp do workspace do 18:00. Zobacz zakres lub odwołaj.
- Wiersz 6: Permission denied; Nie masz capability wymaganej do tej operacji. Skontaktuj się z administratorem workspace.
- Wiersz 7: Audit outcome; Zmiana roli nie została zastosowana, ponieważ użytkownik jest ostatnim właścicielem.
- Wiersz 8: Delete; Usuwanie może obejmować okres retencji i backupy. Pokażemy dowód zakończenia właściwego zakresu.
- Wiersz 9: Session revoked; Sesja została unieważniona. Urządzenie będzie wymagało ponownego logowania.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M13-K01; Tabela członkostw; User, role, scope, activity, invitation state.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M13-K02; Podsumowanie efektywnego dostępu; Role + exceptions + entitlement.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M13-K03; Macierz uprawnień; Capability by role and scope.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M13-K04; Lista kontrolna bezpieczeństwa; MFA, sessions, owners, risky grants.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M13-K05; Wiersz sesji; Device, activity, current, revoke.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M13-K06; Rekord audytowy; Actor, context, action, result, reason.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M13-K07; Baner dostępu wsparcia; Active scope, identity, expiry, revoke.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M13-K08; Oś sprawy prywatności; Request, checks, processing, evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M13-K09; Zatwierdzenie zmiany krytycznej; Impact, reauth, second approval if needed.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

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
- Wiersz 2: Folder; Ustawienia/Tenant
- Wiersz 3: Folder; Ustawienia/Obszar_roboczy
- Wiersz 4: Folder; Zespół/Członkostwa
- Wiersz 5: Folder; Zespół/Role_i_uprawnień
- Wiersz 6: Folder; Bezpieczeństwo/Konto
- Wiersz 7: Folder; Bezpieczeństwo/Sesje
- Wiersz 8: Folder; Bezpieczeństwo/Audyt
- Wiersz 9: Folder; Prywatność/Eksport_i_usunięcie
- Wiersz 10: Folder; Bezpieczeństwo/Dostęp_Wsparcieu
- Wiersz 11: Historia; Zespół/Puste
- Wiersz 12: Historia; Zaproszenie/Wygasłe
- Wiersz 13: Historia; Role/Konflikt_uprawnień
- Wiersz 14: Historia; Konto/MFA_nieukończone
- Wiersz 15: Historia; Sesje/Nieudane_odebranie
- Wiersz 16: Historia; Audyt/Brak_dostępu
- Wiersz 17: Historia; Wsparcie/Aktywny
- Wiersz 18: Historia; Prywatność/Usuwanie_częściowe
- Wiersz 19: Historia; Przepływy/Odebranie_dostępu
- Wiersz 20: Wariant; Administrator_tenanta
- Wiersz 21: Wariant; Administrator_obszaru_roboczego
- Wiersz 22: Wariant; Właściciel_bezpieczeństwa
- Wiersz 23: Wariant; Administrator_rozliczeń
- Wiersz 24: Wariant; Tylko_odczyt
- Wiersz 25: Wariant; Ostatni_administrator
- Wiersz 26: Wariant; Wygasła_sesja
- Wiersz 27: Wariant; Wysoki_kontrast

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
- Wiersz 2: P0; Basic memberships, invitations, MFA for privileged, workspace settings, account security.
- Wiersz 3: P1; Custom roles/capabilities, sessions, audit, exports/deletion cases, support access, security center.
- Wiersz 4: P2; Enterprise SSO/SCIM, advanced policy automation and external auditor portal.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M13-R01; Entitlement=permission; Security bypass.; Separate models.
- Wiersz 3: M13-R02; Role names before capabilities; Hidden overprivilege.; Capabilities first.
- Wiersz 4: M13-R03; Support broad/permanent; Privacy breach.; JIT scoped access.
- Wiersz 5: M13-R04; Last admin removed; Lockout.; Continuity validation.
- Wiersz 6: M13-R05; Audit too technical; No accountability.; Business-readable records.
- Wiersz 7: M13-R06; Delete as simple modal; False promise.; Case workflow.
- Wiersz 8: M13-R07; UI enforcement only; Critical vulnerability.; Server authorization.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M13-D01; Final roles; Decyzja UI/UX do podjęcia; Names/default capabilities.; Team UX.
- Wiersz 3: M13-D02; SSO/magic/password; Decyzja product/security; Auth model.; Account settings.
- Wiersz 4: M13-D03; Capability catalogue; Luka; Full operations and scopes.; Role matrix.
- Wiersz 5: M13-D04; Audit visibility/retention; Luka; Which records customer sees.; Audit screen.
- Wiersz 6: M13-D05; Support access consent; Decision/legal; When customer approval required.; JIT flow.
- Wiersz 7: M13-D06; Retention periods; Luka; Per data category.; Privacy cases.
- Wiersz 8: M13-D07; WCAG target; Decyzja UI/UX do podjęcia; Minimum AA.; All settings.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Finalize capability catalogue and scopes.

Define default roles and owner continuity.

Design memberships/invitations/MFA.

Design workspace/org settings with impact.

Design sessions and audit.

Design support access and privacy cases.

Then SSO/SCIM and enterprise policies.

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
