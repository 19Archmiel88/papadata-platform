---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Powłoka produktu i nawigacja

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-20-01-appshell"></a>

## AppShell

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.01 |
| Nazwa polska | AppShell |
| Nazwa techniczna | appshell |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Jedna kanoniczna powłoka organizuje topbar, sidebar, lokalną nawigację, status danych, treść, Asystenta, overlaye i toasty.

### Wymagania normatywne

- shell nie przechowuje polityki biznesowej
- treść nie znajduje się pod sticky elementami
- OverlayRoot jest jedynym hostem globalnych warstw
- zmiana stanu sidebara nie resetuje route, scroll ani formularzy
- topbar
- sidebar
- local navigation
- data status region
- main content
- assistant layer
- overlay root
- toast region.

### Anatomia i odpowiedzialność

```text
AppShell
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/AppShell`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**AppShell** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — runtime powłoki

Ta sekcja zastępuje starsze zapisy, które dopuszczały dane demonstracyjne jako fallback produkcyjnego AppShell.

- produkcyjny AppShell nie korzysta z `defaultShell*` ani fixtures Storybooka;
- nawigacja i Command Palette są budowane z capability aktywnej sesji;
- powiadomienia, operacje w tle i workspace pochodzą z rzeczywistego runtime;
- brak danych runtime jest stanem pustym lub błędem providera, a nie sygnałem do pokazania przykładowych danych;
- Topbar, Sidebar i shell-owned overlays należą do jednego kontraktu wizualnego **Dark Crystal Shell**, niezależnego od motywu workspace;
- zmiana workspace jest operacją serwerową sesji i nie może zostać przedstawiona optymistycznie przed potwierdzeniem;
- 7 integracji MVP pozostaje osobnym kontraktem P0 i nie może być pozorowane przez fikcyjny shell.

<a id="sekcja-20-02-topbar-publiczny"></a>

## Topbar publiczny

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.02 |
| Nazwa polska | Topbar publiczny |
| Nazwa techniczna | topbar-publiczny |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Publiczny topbar utrzymuje markę, język i motyw; może udostępnić wejście do logowania/rejestracji, lecz nie przechowuje stanu Auth.

### Wymagania normatywne

- zmiana języka/motywu nie resetuje formularza
- logo zachowuje położenie po zalogowaniu
- mobile zachowuje markę i dostępność preferencji
- logo
- linki publiczne
- wejście do logowania
- wejście do rejestracji
- stan zaproszenia
- mobile.

### Anatomia i odpowiedzialność

```text
Topbar publiczny
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Topbar publiczny`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Topbar publiczny** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — preferencje przed zalogowaniem

Public/Auth Topbar zachowuje bezpośrednio dostępne przełączniki języka i motywu. Ta decyzja dotyczy wyłącznie powierzchni publicznych i Auth. Po zalogowaniu język i motyw są preferencjami osobistymi dostępnymi z Account Panelu, a nie stałymi kontrolkami authenticated Topbara.

<a id="sekcja-20-03-topbar-zalogowany"></a>

## Topbar zalogowany

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.03 |
| Nazwa polska | Topbar zalogowany |
| Nazwa techniczna | topbar-zalogowany |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Topbar zalogowany pokazuje globalny kontekst i kontrolki, nie akcje lokalnego modułu.

### Wymagania normatywne

- kolejność: brand/section context, global search, date, Papa, notifications, account
- workspace pozostaje globalnym kontekstem shella i jest zmieniany przez WorkspaceSwitcher poza Topbarem
- język i motyw należą do Account Panelu, nie do stałej anatomii authenticated Topbara
- brak stałego generatora raportu
- sticky Dark Crystal surface: ciemna, czytelna, z kontrolowaną przezroczystością, refrakcją i backdrop blur
- każdy overlay przywraca fokus
- aktualny workspace
- zakres dat
- global search
- powiadomienia
- user menu
- status danych
- dostęp do Papa
- mobile.

### Anatomia i odpowiedzialność

```text
Topbar zalogowany
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do paneli shella. Język i motyw pozostają osiągalne przez Account Panel; wyszukiwanie i profil zachowują stałe punkty wejścia. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Topbar zalogowany`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Topbar i shell-owned overlays stosują jeden Dark Crystal contract; blur/refrakcja są kontrolowane, a przypadkowy neonowy glow i lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Topbar zalogowany** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — authenticated Topbar i Account Panel

Ta decyzja **zastępuje** starszy zapis wymagający stałych kontrolek `language` i `theme` w authenticated Topbarze oraz starszy zakaz blur/glow dla powłoki.

Docelowa anatomia authenticated Topbara:

`brand + section context → global search → date range → Papa → notifications → account`.

- język i motyw należą do Account Panelu;
- Account Panel jest centrum preferencji i konta użytkownika, ale nie jest drugim Sidebarem;
- Account Panel zawiera: tożsamość/rolę, Konto i bezpieczeństwo, Sesje i urządzenia, Język, Motyw, Operacje w tle, Centrum Pomocy i Wyloguj;
- shell-owned Calendar, Notification Center i Account Panel zawsze używają Dark Crystal Shell również przy jasnym workspace;
- kontrolowana przezroczystość, blur, refrakcyjne obramowania i światło są dozwolone, jeśli zachowują czytelność i wspólny kontrakt tokenów;
- nie używamy przypadkowego neonowego glow ani lokalnych efektów nieposiadających właściciela w shellu;
- wszystkie warstwy zachowują minimum keyboard/focus/Escape/focus restore.

Kryterium akceptacji: authenticated Topbar nie pokazuje osobnych kontrolek języka i motywu, a obie funkcje są dostępne w Account Panelu bez utraty stanu aplikacji.

<a id="sekcja-20-04-sidebar"></a>

## Sidebar

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.04 |
| Nazwa polska | Sidebar |
| Nazwa techniczna | sidebar |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Sidebar zawiera główną nawigację i workspace switcher, nie filtruje pojedynczego modułu.

### Wymagania normatywne

- 12 jawnych pozycji i grupa administracyjna
- aktywny route oraz badge nie tylko kolorem
- brak dostępu i ograniczenie planu mają opis
- rail ma tooltipy i accessible names
- Centrum Dowodzenia
- Kampanie płatne
- Zamówienia
- Produkty
- Klienci
- Ruch na stronie
- Laboratorium Papa Asystenta
- Integracje
- Ustawienia
- Subskrypcja i płatności
- Wsparcie w marketingu
- Centrum Pomocy.

### Anatomia i odpowiedzialność

```text
Sidebar
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Sidebar`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Sidebar** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — Sidebar bez scrolla

Desktopowy Sidebar nie posiada własnego pionowego scrolla. `overflow-y: auto` nie jest dopuszczalnym sposobem ratowania układu na małej wysokości.

Kolejność adaptacji wysokości:

1. expanded / comfortable,
2. expanded / compact density,
3. collapsed rail dla niskiego viewportu,
4. mobile Drawer zgodnie z kontraktem mobile.

Zmiana density lub rail nie zmienia IA, kolejności ani dostępności funkcji. Aktywny route pozostaje jednoznaczny, a collapsed rail zachowuje dostępne nazwy elementów.

### Dolna strefa sidebara

W desktopowym AppShell nawigacja zajmuje przewijalny obszar główny, a kontekst runtime jest przypięty do dołu kolumny. Dolna strefa utrzymuje kolejno status danych z bieżącą lokalną datą i godziną, aktywny workspace oraz kontrolkę `Zwiń` / `Rozwiń`. Kontrolka zwijania nie należy do listy nawigacyjnej `Sidebar`; jej właścicielem jest powłoka produktu.

W wariancie collapsed dolna strefa redukuje copy, ale zachowuje dostępne nazwy i stan przez semantykę kontrolek. Układ nie może wymuszać poziomego scrolla.

<a id="sekcja-20-05-sidebar-warianty"></a>

## Sidebar — warianty

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.05 |
| Nazwa polska | Sidebar — warianty |
| Nazwa techniczna | sidebar-warianty |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Sidebar ma cztery stany: expandedPinned, collapsedPinned, expandedTemporary i overlayTemporary.

### Wymagania normatywne

- tylko stany pinned są trwałą preferencją
- brak otwarcia po przypadkowym hover
- mobile drawer ma focus trap, scrim, Escape i focus restore
- rozwinięty i przypięty
- zwinięty i przypięty
- rozwinięty tymczasowo
- mobile drawer
- aktywny element
- badge błędu
- badge rekomendacji
- brak dostępu
- ograniczenie planu.

### Anatomia i odpowiedzialność

```text
Sidebar — warianty
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Sidebar — warianty`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Sidebar — warianty** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — adaptacja szerokości i wysokości

Wariant Sidebara jest dobierany nie tylko według szerokości, ale również wysokości viewportu. Dla niskiego desktopowego viewportu shell może automatycznie przejść do rail, zamiast tworzyć scrollbar Sidebara. Preferencja użytkownika dotycząca collapse jest zachowana; automatyczny rail jest tymczasowym wymogiem geometrii i nie nadpisuje zapisanej preferencji.

### Wariant dolnej strefy

Wariant expanded pokazuje status danych, lokalną datę i godzinę, workspace oraz `Zwiń`. Wariant collapsed pozostawia kompaktowe sygnały statusu, trigger workspace i `Rozwiń`; pełne znaczenie pozostaje dostępne dla technologii asystujących. Przy małej wysokości viewportu powłoka może wymusić rail i ukryć manualną kontrolkę zwijania, aby zachować dostęp do nawigacji.

<a id="sekcja-20-06-workspace-switcher"></a>

## Workspace switcher

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.06 |
| Nazwa polska | Workspace switcher |
| Nazwa techniczna | workspace-switcher |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Workspace switcher jest menu `menuitemradio`; backend waliduje członkostwo i izolację tenanta.

### Wymagania normatywne

- zachowuje moduł, jeśli dostępny
- czyści niezgodne filtry
- odświeża dane i kontekst Papa
- nie resetuje preferencji sidebara
- aktywny workspace
- lista workspace
- workspace niedostępny
- brak członkostwa
- zmiana workspace
- zachowanie aktywnego modułu
- komunikat wpływu na dane.

### Anatomia i odpowiedzialność

```text
Workspace switcher
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Workspace switcher`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Workspace switcher** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — serwerowo potwierdzony wybór workspace

WorkspaceSwitcher nie zmienia aktywnego kontekstu wyłącznie lokalnym stanem React. Wybór wykonuje operację sesji BFF `POST /api/v1/access/workspace/select`, która:

- sprawdza aktywną sesję, Origin i CSRF;
- dopuszcza wyłącznie workspace występujący w memberships sesji;
- przełącza jednocześnie tenant, workspace i capabilities;
- unieważnia aktywny step-up przy zmianie scope;
- zapisuje nowy kontekst w serwerowym session store;
- zwraca potwierdzoną sesję do klienta.

UI zachowuje poprzedni workspace do czasu sukcesu. Po sukcesie zachowuje bieżący route, jeżeli nadal jest dostępny; w przeciwnym razie wybiera bezpieczny fallback route.

### Położenie i akcja utworzenia workspace

Na desktopie Workspace switcher jest częścią dolnej strefy sidebara, a nie nagłówkiem kolumny nawigacyjnej. Otwarcie switchera pokazuje listę dostępnych workspace oraz na końcu osobną akcję `Dodaj workspace`. Akcja jest funkcjonalna i prowadzi do `/app/settings/organizacja`, gdzie zarządzany jest kontekst organizacji i workspace.

Na mobile ten sam switcher pozostaje w dolnej części zawartości drawer po nawigacji, bez kontrolki desktopowego zwijania sidebara.

<a id="sekcja-20-07-global-search-i-command-palette"></a>

## Global search i Command Palette

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.07 |
| Nazwa polska | Global search i Command Palette |
| Nazwa techniczna | global-search-i-command-palette |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Global search jest Command Palette otwieraną także Ctrl/Cmd+K.

### Wymagania normatywne

- wyniki: moduły, rekordy, analizy, akcje, integracje, pomoc i Papa
- wynik pokazuje typ, lokalizację, dostępność i powód blokady
- dialog ma focus trap, scroll lock, Escape, focus restore
- paleta poleceń
- wyszukiwanie modułów
- wyszukiwanie zamówień
- wyszukiwanie produktów
- wyszukiwanie klientów
- wyszukiwanie procedur pomocy
- wynik z Papa Asystenta
- brak wyników
- brak dostępu.

### Anatomia i odpowiedzialność

```text
Global search i Command Palette
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Global search i Command Palette`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Nie ma blur/glow ani lokalnych tokenów geometrii.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Global search i Command Palette** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.

<a id="sekcja-20-08-powiadomienia"></a>

## Powiadomienia

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.08 |
| Nazwa polska | Powiadomienia |
| Nazwa techniczna | powiadomienia |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Centrum powiadomień jest niemodalnym popoverem i łączy użytkownika z kontekstem zdarzenia.

### Wymagania normatywne

- filtry wszystkie/nieprzeczytane/krytyczne
- kategorie system, dane, AI, raporty, billing, wsparcie
- krytyczność nie tylko badge
- mark read jest idempotentne
- notification center
- alert danych
- alert integracji
- alert billingowy
- alert AI
- komunikat sukcesu
- komunikat błędu
- przeczytane/nieprzeczytane.

### Anatomia i odpowiedzialność

```text
Powiadomienia
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Powiadomienia`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Powiadomienia** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — durable Notification Center

Notification Center korzysta z trwałego modelu `app.notifications` scopingowanego przez recipient + tenant + workspace. Stan odczytu i stan odłożenia są niezależne.

Wymagane zachowania:

- filtry: Wszystkie, Nieprzeczytane, Krytyczne, Odłożone;
- rzeczywisty unread count nie obejmuje powiadomień odłożonych do przyszłości;
- oznacz jako przeczytane / nieprzeczytane;
- oznacz wszystkie aktywne jako przeczytane;
- `Przypomnij później`: 1h, 3h, jutro 09:00, najbliższy dzień roboczy 09:00, własna data/godzina;
- `unsnooze` przywraca powiadomienie natychmiast;
- odłożone powiadomienie nie jest usuwane i zachowuje read/unread;
- krytyczne powiadomienia nie mogą być snoozowane; polityka jest egzekwowana także na backendzie;
- brak API/provider response jest jawnie prezentowany jako error/empty, nigdy fixtures.

Snooze nie wymaga joba do samego in-app inboxa: rekord wraca do aktywnego widoku, gdy `snoozed_until <= now()`.

<a id="sekcja-20-09-centrum-operacji-w-tle"></a>

## Centrum operacji w tle

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.09 |
| Nazwa polska | Centrum operacji w tle |
| Nazwa techniczna | centrum-operacji-w-tle |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

Operacje w tle są jawnie modelowanymi jobami, nie spinnerem bez właściciela.

### Wymagania normatywne

- queued/running/retrying/succeeded/failed/cancelled/expired
- eksport i raport mają wygasający artefakt
- powiadomienie prowadzi do wyniku
- retry respektuje idempotencję
- synchronizacja
- eksport
- raport
- reprocessing
- retry
- częściowe niepowodzenie
- sukces
- anulowanie.

### Anatomia i odpowiedzialność

```text
Centrum operacji w tle
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/Centrum operacji w tle`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Centrum operacji w tle** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — realne akcje operacji

Centrum operacji w tle nie pokazuje akcji bez rzeczywistego handlera runtime. `Ponów` jest dostępne wyłącznie dla operacji, które backend potrafi retry, a `Anuluj` wyłącznie dla stanów możliwych do anulowania. Brak capability zarządzania usuwa akcję z modelu prezentacyjnego. Widoczne przyciski bez `onAction` są błędem release-blocking.

<a id="sekcja-20-10-overlayroot-i-system-warstw"></a>

## OverlayRoot i system warstw

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.10 |
| Nazwa polska | OverlayRoot i system warstw |
| Nazwa techniczna | overlayroot-i-system-warstw |
| Typ dokumentu | kontrakt powłoki |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Frontend Platform |
| Moduł | M03 — Powłoka produktu i nawigacja |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Decyzja docelowa

OverlayRoot zarządza z-index, kolejkowaniem, focus i zamknięciem warstw.

### Wymagania normatywne

- dialog, alert dialog, drawer, bottom sheet, popover, menu, command palette
- jedna aktywna modalna warstwa
- Escape zamyka najwyższą dozwoloną warstwę
- route-backed workspace ma własny URL
- dialog
- alert dialog
- drawer
- bottom sheet
- popover
- menu
- command palette
- spotlight tour
- route-backed workspace.

### Anatomia i odpowiedzialność

```text
OverlayRoot i system warstw
├── semantic trigger or landmark
├── visible context
├── primary controls
├── status / badge with text equivalent
├── responsive overflow
└── overlay integration through OverlayRoot
```

Komponent powłoki nie podejmuje decyzji autoryzacyjnej. Otrzymuje backendowo rozstrzygnięte capabilities i modele prezentacyjne. Nie przechowuje danych biznesowych ani nie dubluje `PageHeader`.

### Stany i zachowanie

- default, hover, focus-visible, active/expanded, disabled z przyczyną, loading, error i no-access.
- zmiana route, workspace, języka, motywu i stanu panelu ma jawne zasady zachowania kontekstu.
- focus nie może zostać zasłonięty przez sticky topbar.
- scroll strony i lokalnych paneli ma jednego, zdefiniowanego właściciela.

### Mobile i reflow

Na compact topbar zachowuje markę i kontrolki priorytetowe, sidebar staje się drawerem, a kontrolki drugorzędne trafiają do menu. Język, motyw, wyszukiwanie i profil pozostają osiągalne. Zoom 200% nie tworzy poziomego scrolla strony dla treści krytycznych.

### Bezpieczeństwo

Tenant/workspace pochodzą z bezpiecznego bootstrapu sesji. Ukrycie pozycji nie zastępuje kontroli backendu. Linki i wyniki search respektują capability. Powiadomienia nie zawierają PII ani sekretów, a support access jest jawnie oznaczony.

### Storybook i testy

Title: `20 Powłoka/OverlayRoot i system warstw`. Stories: wszystkie wymagania, desktop/tablet/mobile, light/dark, PL/EN, long workspace name, 0/1/99+ notifications, no-access, provider error, keyboard i reduced motion. Testy obejmują route preservation, Escape, focus restore, reflow i brak utraty kontekstu.

### Kryteria akceptacji

1. Istnieje jedna kanoniczna implementacja używana przez moduły.
2. Elementy należące do powłoki stosują aktualny Dark Crystal contract: kontrolowany blur/refrakcję i wspólne tokeny; przypadkowy neonowy glow oraz lokalne efekty bez właściciela są niedopuszczalne.
3. Wszystkie overlaye korzystają z OverlayRoot.
4. Capabilities są egzekwowane na backendzie i prezentowane bezpiecznie w UI.
5. Mobile, keyboard, focus restore i session expiry mają testy.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**OverlayRoot i system warstw** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — shell-owned anchored overlays

Account Panel, Calendar i Notification Center korzystają z jednego portalowego systemu `OverlayRoot`. Anchored overlay odpowiada za pozycjonowanie względem triggera, zamknięcie poza warstwą, Escape i focus restore. Tylko najwyższa aktywna warstwa shella jest otwarta; otwarcie nowej shell-owned warstwy zamyka poprzednią.

<a id="sekcja-20-11-powloka-mobilna"></a>

## Powłoka mobilna

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 20.11 |
| Nazwa polska | Powłoka mobilna |
| Nazwa techniczna | powoka-mobilna |
| Typ dokumentu | kontrakt powłoki mobilnej |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Frontend Platform |
| Moduł | Powłoka produktu i nawigacja — M03 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Powłoka mobilna” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | stan domyślny | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
powoka-mobilna
├── semantic root
├── header or accessible label
├── primary content
├── status / validation region
├── primary action
└── optional secondary actions or metadata
```

### Komponenty składowe

- PageHeader
- InlineNotice
- Button

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

### Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.

### Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

### Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook

- Title: `20 Powłoka produktu i nawigacja/Powłoka mobilna`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

### Specyfikacja opisowa ekranu 1.0

#### Cel użytkownika

**Powłoka mobilna** jest powierzchnią interfejsu, która prowadzi użytkownika przez jedno zadanie bez mieszania odpowiedzialności kilku procesów. Widok powinien jasno komunikować, jaki jest aktualny stan, co użytkownik może zrobić oraz jakie ograniczenia wynikają z bezpieczeństwa, sesji, workspace albo statusu danych.

#### Regiony i treść

| Region | Zawartość | Wymaganie |
| --- | --- | --- |
| Nagłówek | nazwa procesu i krótka informacja kontekstowa | bez nadmiaru tekstu i bez fałszywej obietnicy sukcesu |
| Główna treść | formularz, wybór, komunikat albo panel decyzyjny | jeden główny cel na powierzchnię |
| Pomoc | opis następnego kroku i bezpieczny komunikat błędu | nie ujawnia danych wrażliwych ani stanu konta |
| Akcje | jedna akcja primary i akcje pomocnicze | widoczne zgodnie z aktualnym stanem i uprawnieniami |

#### Zachowanie

Powierzchnia nie może wymagać od użytkownika zgadywania, czy problem jest błędem technicznym, brakiem uprawnień, wygasłą sesją czy niekompletnymi danymi. Każdy stan ma własny komunikat, akcję naprawczą i kryterium zakończenia. Jeżeli powierzchnia jest częścią Auth, jej operacje muszą korzystać z `25-kontrakty-domenowe-i-api/identity-auth-api.md`.

#### Kryteria akceptacji

1. Widok ma jeden główny cel i jeden dominujący kierunek działania.
2. Błąd jest opisany neutralnie, bez ujawniania niepotrzebnych danych.
3. Focus po błędzie wraca do właściwego regionu lub pola.
4. Storybook obejmuje wariant ready, loading, error, mobile, dark mode i keyboard.
5. Implementacja nie tworzy lokalnych komponentów poza katalogiem współdzielonym.


### Aktualizacja normatywna 2026-08-17 — preferencje i Dark Crystal na mobile

Authenticated mobile nie musi utrzymywać osobnych przycisków języka i motywu w Topbarze; obie funkcje pozostają dostępne przez Account Panel. Public/Auth Topbar nadal zapewnia bezpośredni dostęp do preferencji. Shell-owned overlays zachowują Dark Crystal na mobile i nie przejmują motywu jasnego workspace.
