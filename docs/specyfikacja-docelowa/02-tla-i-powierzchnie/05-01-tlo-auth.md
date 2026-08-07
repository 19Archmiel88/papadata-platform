---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-D841F3044B90
status: approved-target
updated_at: 2026-08-06T00:00:00+02:00
---

# Tło Auth

## Rola Laboratorium i handoff
`05.01` jest decision recordem dla canvasu Auth i relacji formularz–tło. Nie jest właścicielem AuthShell ani kompletnej macierzy ekranów dostępu. Po akceptacji wzorzec jest promowany do `25 — Access/Auth patterns`.

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.01 |
| Nazwa polska | Tło Auth |
| Nazwa techniczna | to-auth |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Design System Lead |
| Moduł | M02 — Design System |

| Status implementacji | PROTOTYP STORYBOOK — REVIEW |
| Status Storybooka | 05.01 wdrożone jako lokalna kompozycja desktop light/dark z formularzem osadzonym bezpośrednio na canvasie, jednym pełnym wariantem logowania oraz kompaktowymi próbkami stanów rejestracji, MFA, resetu i zaproszenia; historia pozostaje w review |
| Status testów | Dedykowane testy interaction/play i utrwalony test axe: `not_started`; jednorazowa kontrola runtime/axe oraz walidacje techniczne są wymagane przed akceptacją wizualną i nie zmieniają `testStatus` |

## Decyzja docelowa

Spokojny publiczny canvas z czytelną kolumną formularza osadzoną bezpośrednio w tle, bez obramowanego wrappera; brak marketingowego hero i efektu glass.

## Stan prototypu Storybook 05.01

Prototyp Storybooka istnieje i pozostaje w review. Bieżący zakres 05.01 porządkuje kompozycję desktopową, reprezentatywne stany formularzy, rozwiązanie właściwe, antyprzykład oraz granice review. Jest to lokalna demonstracja Storybooka, nie produkcyjny `AuthShell`.

Wdrożony układ porządkuje warianty wymagane przez katalog:

- logowanie `auth-02` jest wariantem głównym w stanie `ready`;
- rejestracja `auth-04` pokazuje reprezentatywny `validationError`: komunikat globalny oraz jedno błędne pole e-mail, bez powtarzania pełnego formularza;
- MFA `auth-16` pokazuje reprezentatywny `rateLimited`: komunikat, `VerificationCodeInput` i powód blokady potwierdzenia;
- reset hasła `auth-18/20` pokazuje reprezentatywny stan `loading`: opisane pole e-mail i kontrolkę przetwarzania;
- zaproszenie `auth-15` pokazuje reprezentatywny stan `blocked`: komunikat, adres odbiorcy i zablokowaną decyzję wejścia;
- osobny dowód globalny pokazuje `serviceUnavailable`/global error bez lokalnego retry;
- mobile i tablet pozostają odroczone oraz poza bieżącym desktopowym review;
- sekcja decyzji pokazuje rozwiązanie właściwe zgodne z Fundamentami oraz antyprzykład z konkretnymi naruszeniami.

Zachowania demonstracyjne są deterministyczne i lokalne:

- aktywne wysłanie logowania zapisuje komunikat `aria-live` o intencji `auth.login`, bez komunikacji z backendem;
- aktywne akcje pomocnicze logowania zapisują lokalny komunikat o docelowym przejściu do `auth-18` albo `auth-04`, bez przełączania pełnego FSM;
- próbka rejestracji w stanie `validationError` nie powtarza pełnej akcji wysłania, ponieważ rozstrzygnięciem jest komunikat globalny i błąd pola;
- w stanach `rateLimited`, `loading` i `blocked` pojedyncza kontrolka związana ze stanem ma widoczny powód disabled; `serviceUnavailable` jest nieinteraktywnym dowodem bez fikcyjnej akcji retry;
- mobile i tablet są przedstawione wyłącznie jako zwięzła informacja o odroczonym zakresie, bez makiety udającej zaakceptowany projekt responsive.

Prototyp nie jest produkcyjnym `AuthShell`, nie wdraża produkcyjnego Auth FSM, nie komunikuje się z API i nie zmienia produkcyjnych ekranów Auth. Nie zmienia statusu historii na accepted, nie oznacza produkcyjnej akceptacji i nie kończy formalnego odbioru responsive. W tej zmianie nie zmieniono Fundamentów, globalnych tokenów, manifestów ani historycznych hashy.

## Rozwiązanie właściwe

Rozwiązanie właściwe w Storybook 05.01 pokazuje:

- spokojny canvas i formularz osadzony bezpośrednio w tle, bez obramowanej karty;
- publiczny kontekst Auth z marką PapaData, nagłówkiem i neutralnym opisem;
- nagłówek i opis każdej sekcji znajdują się nad treścią, bez bocznej kolumny opisowej;
- formularz logowania jako główny cel powierzchni, wyśrodkowany na centralnej osi canvasu; stany porównawcze są szerszymi, kompaktowymi próbkami, które pokazują tylko element rozstrzygający dany stan;
- hairline separację zamiast mnożenia ramek;
- jedno dominujące CTA i lżejsze akcje pomocnicze, których hover/focus nie rozciąga dekoracyjnej linii poza szerokość etykiety;
- status bezpieczeństwa opisany tekstem i umieszczony blisko zadania;
- brak dekoracyjnego glassmorphism, glow i przypadkowych gradientów.

To rozwiązanie wynika z Fundamentów:

- „dane i decyzja przed dekoracją”;
- „separatory, typografia i rytm przed mnożeniem kart”;
- hairline divider jako domyślne narzędzie hierarchii;
- cień wyłącznie dla warstw nakładanych i technicznej separacji;
- tło, gradient ani tekstura nie mogą obniżać kontrastu lub widoczności focus ring.

## Antyprzykład

Antyprzykład w Storybook 05.01 jest statyczną prezentacją naruszeń, nie alternatywnym wzorcem UI. Każde naruszenie ma opis tekstowy:

- **Nadmiar ramek** — każde pole i panel ma własną mocną ramkę, więc separator staje się dekoracją zamiast strukturą.
- **Cień bez warstwy** — ciężki cień udaje overlay, mimo że formularz nie jest nakładką ani modalem.
- **Przypadkowy gradient i glow** — dekoracyjne światło obniża czytelność i nie jest kontrolowanym gradientem marki ani wizualizacji.
- **Nieczytelna hierarchia** — hero 50/50 i dwa równorzędne przyciski odciągają uwagę od jednego celu logowania.
- **Błędne grupowanie** — pola są rozdzielone ozdobnymi modułami, więc formularz przestaje być jednym zadaniem.

Antyprzykład nie jest interaktywny i nie zawiera pozornie aktywnych kontrolek.

## Granice zakresu 05.01

- **Aktywne review**: desktop light/dark, reprezentatywne stany formularzy i porównanie decyzji.
- **Odroczone**: mobile i tablet pozostają wymaganiem katalogu, ale bez formalnego odbioru w 05.01.
- **Mock lokalny**: formularze i komunikaty demonstrują zachowania Storybooka, nie produkcyjny `AuthShell`.
- **Poza zakresem**: pełny Auth FSM, backend, API, produkcyjne ekrany Auth i produkcyjna akceptacja.

## Anatomia powierzchni

```text
Surface
├── Background role
├── Content boundary
├── Optional status region
├── Interactive content
└── Overlay anchor
```

## Reguły

- wariant logowania, rejestracji, MFA, resetu i zaproszenia
- light/dark bez zmiany geometrii
- czytelna kolumna formularza desktop bez obramowanego wrappera; pełna szerokość z gutterem przy wąskim reflow
- publiczny topbar nie resetuje formularza
- w Storybook 05.01 nagłówek i opis sekcji są zawsze nad treścią; nie wolno stosować bocznej kolumny opisowej ani pozostawiać treści w implicit grid column
- logowanie pozostaje wariantem głównym na canvasie i jest wyśrodkowane na centralnej osi; pozostałe stany są ułożone niżej jako kompaktowe bloki na tej samej osi i nie mogą tworzyć ściany równorzędnych kart ani przyklejać się do krawędzi canvasu
- warianty porównawcze używają separatorów i odstępów zamiast dodatkowych ciężkich powierzchni; każda próbka pokazuje tylko komunikat stanu, jedno kluczowe pole lub kod oraz — gdy stan tego wymaga — jedną kontrolkę działania
- akcje pomocnicze są tekstowymi przyciskami o szerokości etykiety; linia hover/focus nie może rozciągać się poza tekst
- centralna oś sekcji ma zachować wspólny rytm dla formularzy, podglądów light/dark oraz decyzji; maksymalna szerokość nie może powodować pustej, jednostronnej przestrzeni canvasu
- podglądy light/dark i powierzchnie decyzyjne nie używają ciężkiego cienia; separację budują hairline, różnica tła i rytm
- powtarzalne metadane operacji i stanu są widoczne w wariancie głównym; w wariantach porównawczych tę rolę pełnią identyfikator powierzchni i status w nagłówku, a pełne formularze są zastąpione reprezentatywnymi próbkami
- mobile i tablet są wymaganiami docelowymi, ale pozostają odroczone w bieżącym review
- widoczne kontrolki muszą mieć lokalne działanie demonstracyjne, widoczny powód disabled albo zostać zastąpione nieinteraktywną prezentacją

## Warianty wymagane przez katalog

- tło logowania
- tło rejestracji
- tło MFA
- tło resetu hasła
- tło zaproszenia
- wariant light
- wariant dark
- wariant mobile — odroczony poza bieżącym review 05.01.

## Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`.

## Responsywność

Powierzchnia nie ma stałej wysokości zależnej od desktopu. Na compact zachowuje priorytet zadania, na medium redukuje elementy drugorzędne, a na wide nie rozciąga tekstu formularzy i opisów ponad czytelną szerokość. Wąski viewport i reflow przy powiększeniu do 400% mają przechodzić do jednej kolumny, wykorzystywać pełną dostępną szerokość i nie powodować poziomego przewijania. Nie jest to formalna akceptacja projektu mobile.

## Dostępność

Powierzchnia nie jest automatycznie landmarkiem. Landmark wynika z rzeczywistej roli i ma nazwę. Tło, gradient ani tekstura nie mogą obniżyć kontrastu lub utrudnić widoczności focus ring. Antyprzykład może celowo naruszać hierarchię, proporcje i reguły efektów, ale nie obniża kontrastu tekstu poniżej wymagań WCAG; odrzucenie wzorca wynika z opisanych decyzji, a nie z nieczytelności.

W Storybook 05.01 formularze używają istniejących komponentów `TextField`, `PasswordField`, `VerificationCodeInput`, `Checkbox`, `InlineNotice` i `Button`. Oznacza to:

- widoczne etykiety są powiązane z kontrolkami przez `label` i `htmlFor`;
- wymagane pola mają oznaczenie `required`;
- błędy pól używają `aria-invalid` i komunikatu powiązanego przez `aria-describedby`;
- komunikaty globalne używają ról status/alert wynikających z tonu;
- lokalne akcje demonstracyjne zapisują komunikaty w regionie `aria-live="polite"`;
- pola e-mail używają typu `email` i `autocomplete="email"`;
- hasło logowania używa `autocomplete="current-password"`, a nowe hasła używają `autocomplete="new-password"`;
- MFA używa `VerificationCodeInput` z `inputMode="numeric"` i `autocomplete="one-time-code"`;
- focus pozostaje widoczny na komponentach DS, a kolejność klawiaturowa wynika z kolejności treści formularza;
- układ nie wymaga stałej wysokości, przy zoomie 200% zachowuje pełną treść, a przy reflow 400% przechodzi do jednej kolumny bez poziomego przepełnienia;
- etykiety przycisków widoczności hasła oraz komunikaty MFA muszą być lokalizowane w PL i EN.

## Storybook i odbiór

Wymagane docelowo: light, dark, desktop, tablet, mobile, zoom 200%, reflow 400%, high content density, empty/error oraz porównanie z antyprzykładem. W aktywnym Stage 02 tablet i mobile pozostają odroczone, natomiast reflow wąskiego viewportu jest kontrolą dostępności historii, a nie projektem produkcyjnego mobile. Kryterium odbioru stanowi brak utraty funkcji, brak poziomego przewijania i brak dekoracyjnych wrapperów bez odpowiedzialności.

W stanie 05.01 odbiór dotyczy desktop light/dark, reprezentatywnych stanów formularzy, lokalnych zachowań demonstracyjnych, dostępności pól, braku martwych kontrolek oraz porównania rozwiązania właściwego z opisanym antyprzykładem. Tablet i mobile pozostają odroczone jako formalny odbiór responsive. Pełna obsługa Auth FSM, backend, produkcyjny `AuthShell` i produkcyjne ekrany Auth pozostają poza tym zadaniem.

Zakres testów 05.01:

- typecheck;
- Storybook build;
- dostępne checki Storybooka;
- Foundation verification;
- `git diff --check`;
- kontrola klawiatury;
- kontrola focus;
- kontrola konsoli;
- kontrola zoom 200%;
- kontrola reflow 400% lub równoważnego viewportu 320–360 CSS px;
- kontrola light/dark;
- kontrola accepted/rejected light/dark;
- screenshot pełnej historii light/dark oraz zbliżeń accepted/rejected.

Stan walidacji 05.01 pozostaje rozdzielony: historia ma status `review`, a dedykowane testy interaction/play oraz utrwalony test axe mają status `not_started`. Jednorazowe uruchomienie axe podczas kontroli runtime nie jest równoznaczne z dodaniem testu do repozytorium i nie zmienia `testStatus`. Przed akceptacją należy ponownie wykonać `typecheck`, Storybook build, dostępne checki Storybooka, Foundation verification, `git diff --check`, kontrolę konsoli, klawiatury, focus, zoom 200%, reflow 400% oraz screenshoty light/dark. Przejście walidacji technicznych nie zmienia statusu historii na accepted.

LOKALNA DECYZJA STORYBOOK 05.01: opcja `rememberDevice` w głównym wariancie logowania jest domyślnie niezaznaczona. Decyzja porządkuje lokalną demonstrację i nie ustanawia wartości początkowej globalnego kontraktu produkcyjnego.

BRAK DECYZJI W DOKUMENTACJI: dokumenty Auth wskazują `AuthShell` jako wymagany element powierzchni, ale w obecnej dokumentacji nie ma osobnego kontraktu produkcyjnego `AuthShell` opisującego jego publiczne API i strukturę implementacyjną. Storybook 05.01 nie może więc deklarować wdrożenia produkcyjnego `AuthShell`.

BRAK DECYZJI W DOKUMENTACJI: dokumentacja potwierdza stany `serviceUnavailable` i global error, ale bez backendu nie definiuje deterministycznego lokalnego działania retry. W Storybook 05.01 retry jest pokazane jako disabled z widocznym powodem.

BRAK DECYZJI W DOKUMENTACJI: dokumentacja Auth rozdziela powierzchnie `auth-18` i `auth-20`, ale kontrakt 05.01 nie rozstrzyga, czy lokalna historia ma demonstrować je jako osobne pełne formularze. Storybook 05.01 pokazuje reprezentatywny stan odzyskiwania hasła bez pełnego FSM.
