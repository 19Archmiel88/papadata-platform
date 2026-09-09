---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Tła, powierzchnie i geometria interfejsu

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-05-01-tlo-auth"></a>

## Tło Auth

### Rola Laboratorium i handoff
`05.01` jest decision recordem dla canvasu Auth i relacji formularz–tło. Nie jest właścicielem AuthShell ani kompletnej macierzy ekranów dostępu. Po akceptacji wzorzec jest promowany do `25 — Access/Auth patterns`.

### Metadane

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

| Status implementacji | PROTOTYP STORYBOOK — ACCEPTED DECISION RECORD |
| Status Storybooka | accepted decision record; docelowy owner produkcyjny: 25 Access/Auth patterns |
| Status testów | walidacje statyczne i kontraktowe: passing; dokument nie deklaruje produkcyjnego AuthShell ani odbioru responsive |

### Decyzja docelowa

Spokojny publiczny canvas z czytelną kolumną formularza osadzoną bezpośrednio w tle, bez obramowanego wrappera; brak marketingowego hero i efektu glass.

### Stan prototypu Storybook 05.01

Prototyp Storybooka jest zaakceptowanym decision recordem. Zakres 05.01 porządkuje kompozycję desktopową, reprezentatywne stany formularzy, rozwiązanie właściwe, antyprzykład oraz granice handoffu. Jest to lokalna demonstracja Storybooka, nie produkcyjny `AuthShell`.

Wdrożony układ porządkuje warianty wymagane przez katalog:

- logowanie `auth-02` jest wariantem głównym w stanie `ready`;
- rejestracja `auth-04` pokazuje reprezentatywny `validationError`: komunikat globalny oraz jedno błędne pole e-mail, bez powtarzania pełnego formularza;
- MFA `auth-16` pokazuje reprezentatywny `rateLimited`: komunikat, `VerificationCodeInput` i powód blokady potwierdzenia;
- reset hasła `auth-18/20` pokazuje reprezentatywny stan `loading`: opisane pole e-mail i kontrolkę przetwarzania;
- zaproszenie `auth-15` pokazuje reprezentatywny stan `blocked`: komunikat, adres odbiorcy i zablokowaną decyzję wejścia;
- osobny dowód globalny pokazuje `serviceUnavailable`/global error bez lokalnego retry;
- mobile i tablet pozostają odroczone oraz poza bieżącym desktopowym decision record;
- sekcja decyzji pokazuje rozwiązanie właściwe zgodne z Fundamentami oraz antyprzykład z konkretnymi naruszeniami.

Zachowania demonstracyjne są deterministyczne i lokalne:

- aktywne wysłanie logowania zapisuje komunikat `aria-live` o intencji `auth.login`, bez komunikacji z backendem;
- aktywne akcje pomocnicze logowania zapisują lokalny komunikat o docelowym przejściu do `auth-18` albo `auth-04`, bez przełączania pełnego FSM;
- próbka rejestracji w stanie `validationError` nie powtarza pełnej akcji wysłania, ponieważ rozstrzygnięciem jest komunikat globalny i błąd pola;
- w stanach `rateLimited`, `loading` i `blocked` pojedyncza kontrolka związana ze stanem ma widoczny powód disabled; `serviceUnavailable` jest nieinteraktywnym dowodem bez fikcyjnej akcji retry;
- mobile i tablet są przedstawione wyłącznie jako zwięzła informacja o odroczonym zakresie, bez makiety udającej zaakceptowany projekt responsive.

Prototyp nie jest produkcyjnym `AuthShell`, nie wdraża produkcyjnego Auth FSM, nie komunikuje się z API i nie zmienia produkcyjnych ekranów Auth. Status `accepted decision record` oznacza zamknięcie decyzji laboratorium, a nie produkcyjną akceptację Auth ani responsive. W tej zmianie nie zmieniono Fundamentów, globalnych tokenów, manifestów ani historycznych hashy.

### Rozwiązanie właściwe

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

### Antyprzykład

Antyprzykład w Storybook 05.01 jest statyczną prezentacją naruszeń, nie alternatywnym wzorcem UI. Każde naruszenie ma opis tekstowy:

- **Nadmiar ramek** — każde pole i panel ma własną mocną ramkę, więc separator staje się dekoracją zamiast strukturą.
- **Cień bez warstwy** — ciężki cień udaje overlay, mimo że formularz nie jest nakładką ani modalem.
- **Przypadkowy gradient i glow** — dekoracyjne światło obniża czytelność i nie jest kontrolowanym gradientem marki ani wizualizacji.
- **Nieczytelna hierarchia** — hero 50/50 i dwa równorzędne przyciski odciągają uwagę od jednego celu logowania.
- **Błędne grupowanie** — pola są rozdzielone ozdobnymi modułami, więc formularz przestaje być jednym zadaniem.

Antyprzykład nie jest interaktywny i nie zawiera pozornie aktywnych kontrolek.

### Granice zakresu 05.01

- **Accepted decision record**: desktop light/dark, reprezentatywne stany formularzy i porównanie decyzji.
- **Odroczone**: mobile i tablet pozostają wymaganiem katalogu, ale bez formalnego odbioru w 05.01.
- **Mock lokalny**: formularze i komunikaty demonstrują zachowania Storybooka, nie produkcyjny `AuthShell`.
- **Poza zakresem**: pełny Auth FSM, backend, API, produkcyjne ekrany Auth i produkcyjna akceptacja.

### Anatomia powierzchni

```text
Surface
├── Background role
├── Content boundary
├── Optional status region
├── Interactive content
└── Overlay anchor
```

### Reguły

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
- mobile i tablet są wymaganiami docelowymi, ale pozostają odroczone w bieżącym decision record
- widoczne kontrolki muszą mieć lokalne działanie demonstracyjne, widoczny powód disabled albo zostać zastąpione nieinteraktywną prezentacją

### Warianty wymagane przez katalog

- tło logowania
- tło rejestracji
- tło MFA
- tło resetu hasła
- tło zaproszenia
- wariant light
- wariant dark
- wariant mobile — odroczony poza zaakceptowanym decision record 05.01.

### Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`.

### Responsywność

Powierzchnia nie ma stałej wysokości zależnej od desktopu. Na compact zachowuje priorytet zadania, na medium redukuje elementy drugorzędne, a na wide nie rozciąga tekstu formularzy i opisów ponad czytelną szerokość. Wąski viewport i reflow przy powiększeniu do 400% mają przechodzić do jednej kolumny, wykorzystywać pełną dostępną szerokość i nie powodować poziomego przewijania. Nie jest to formalna akceptacja projektu mobile.

### Dostępność

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
- układ nie wymaga stałej wysokości, a kontrole viewportu/zoomu służą wyłącznie potwierdzeniu braku poziomego przepełnienia;
- etykiety przycisków widoczności hasła oraz komunikaty MFA muszą być lokalizowane w PL i EN.

### Storybook i odbiór

Wymagane docelowo: light, dark, desktop, tablet, mobile, kontrola wąskiego viewportu, high content density, empty/error oraz porównanie z antyprzykładem. W aktywnym Stage 02 tablet i mobile pozostają odroczone, natomiast wąski viewport jest kontrolą układu historii, a nie projektem produkcyjnego mobile. Kryterium odbioru stanowi brak utraty funkcji, brak poziomego przewijania i brak dekoracyjnych wrapperów bez odpowiedzialności.

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
- kontrola wąskiego viewportu 320–360 CSS px;
- kontrola light/dark;
- kontrola accepted/rejected light/dark;
- screenshot pełnej historii light/dark oraz zbliżeń accepted/rejected.

Stan walidacji 05.01 pozostaje rozdzielony: historia ma status `accepted decision record`, a dowód techniczny nie oznacza produkcyjnej akceptacji Auth, responsive ani backendu. Dla utrzymania tego statusu należy wykonywać typecheck, Storybook build, dostępne checki Storybooka, Foundation verification, `git diff --check`, kontrolę konsoli oraz podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

LOKALNA DECYZJA STORYBOOK 05.01: opcja `rememberDevice` w głównym wariancie logowania jest domyślnie niezaznaczona. Decyzja porządkuje lokalną demonstrację i nie ustanawia wartości początkowej globalnego kontraktu produkcyjnego.

BRAK DECYZJI W DOKUMENTACJI: dokumenty Auth wskazują `AuthShell` jako wymagany element powierzchni, ale w obecnej dokumentacji nie ma osobnego kontraktu produkcyjnego `AuthShell` opisującego jego publiczne API i strukturę implementacyjną. Storybook 05.01 nie może więc deklarować wdrożenia produkcyjnego `AuthShell`.

BRAK DECYZJI W DOKUMENTACJI: dokumentacja potwierdza stany `serviceUnavailable` i global error, ale bez backendu nie definiuje deterministycznego lokalnego działania retry. W Storybook 05.01 retry jest pokazane jako disabled z widocznym powodem.

BRAK DECYZJI W DOKUMENTACJI: dokumentacja Auth rozdziela powierzchnie `auth-18` i `auth-20`, ale kontrakt 05.01 nie rozstrzyga, czy lokalna historia ma demonstrować je jako osobne pełne formularze. Storybook 05.01 pokazuje reprezentatywny stan odzyskiwania hasła bez pełnego FSM.

<a id="sekcja-05-02-tlo-aplikacji"></a>

## Tło aplikacji

### Rola Laboratorium i handoff
`05.02` ocenia canvas aplikacji, relacje regionów i scroll ownership. Nie jest docelową specyfikacją AppShell. Po akceptacji decyzja przechodzi do `20 — Powłoka produktu / AppShell`.

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.02 |
| Nazwa polska | Tło aplikacji |
| Nazwa techniczna | tlo-aplikacji |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Design System Lead |
| Moduł | M02 — Design System |

| Status implementacji | PROTOTYP STORYBOOK — ACCEPTED DECISION RECORD |
| Status Storybooka | accepted decision record; docelowy owner produkcyjny: 20 Product Shell / AppShell |
| Status testów | walidacje statyczne i kontraktowe: passing; dokument nie deklaruje runtime AppShell |

### Decyzja docelowa

Canvas i region treści rozdzielają nawigację od zadania. Shell nie tworzy dekoracyjnych kart, a panel Papa jest warstwą nakładaną i nie ściska głównego regionu treści.

**Aktualizacja 2026-08-17:** historyczny zapis tego decision record o obowiązkowo nieprzezroczystym topbarze bez blur/glass nie jest już wymaganiem produkcyjnym. Docelowy owner `20 — Powłoka produktu` definiuje Topbar, Sidebar i shell-owned overlays jako zawsze ciemny **Dark Crystal Shell** z kontrolowaną przezroczystością, refrakcją i backdrop blur. `05.02` pozostaje właścicielem decyzji o canvasie i scroll ownership, a nie o finalnym materiale shella.

### Stan prototypu Storybook 05.02

Prototyp pokazuje jeden reprezentatywny canvas z przełączanymi wariantami: sidebar, brak sidebara, panel Papa i compact rail. Nie mnoży czterech równorzędnych miniaturek. Panel Papa używa scrim, granicy regionu i technicznego cienia overlay; otwiera się nad canvasem i zachowuje szerokość zadania.

Sekcja właściciela scrolla używa skupionego dowodu zamiast powtarzać drugi kompletny AppShell. Pokazuje jeden przewijany region treści przy stabilnym topbarze i nawigacji pozostających poza odpowiedzialnością scrolla. Region jest dostępny w sekwencji klawiaturowej przez `tabIndex=0`, ma jednoznaczną nazwę i widoczny focus oparty na `--pd-focus-visible`. Lokalny scrollbar tego regionu używa neutralnego tracka i akcentowego thumba opartego wyłącznie na istniejących tokenach PapaData; hover i active wzmacniają akcent bez dekoracyjnego neonowego halo. Sticky topbar korzysta z aktualnego materiału Dark Crystal zdefiniowanego przez produkcyjny kontrakt AppShell. Sekcja szerokości treści rozróżnia szeroki region analityczny i kontrolowaną długość formularza. Decyzja i antyprzykład wyjaśniają, dlaczego karty wewnątrz kart i mechaniczne ściskanie przez panel są odrzucane.

Mobile i tablet pozostają wymaganiami katalogu, ale są odroczone poza bieżącym desktopowym decision record. Story nie pokazuje makiety mobile udającej zaakceptowany produkt.

### Reguły

- jeden canvas i jawne granice regionów
- wariant z sidebarem, bez sidebara, z panelem Papa i compact rail
- panel Papa jako warstwa overlay zgodna z „Głębia i warstwy”
- sticky topbar w kanonicznym materiale Dark Crystal należącym do AppShell
- jeden jawny właściciel scrolla: content region, dostępny z klawiatury i z widocznym fokusem
- lokalny firmowy scrollbar: neutralny track, akcentowy thumb, czytelne hover/active, bez zmiany globalnego scrollbara
- pełna szerokość dla analiz, ograniczona dla formularzy
- brak poziomego scrolla i brak dekoracyjnych wrapperów bez odpowiedzialności
- widoczne kontrolki demonstracyjne mają lokalne działanie; nie pozostają martwymi przyciskami
- globalne tokeny i Fundamenty pozostają bez zmian

### Anatomia powierzchni

```text
Surface
├── Background role
├── Content boundary
├── Optional status region
├── Interactive content
└── Overlay anchor
```

### Warianty wymagane przez katalog

- główne tło aplikacji
- region treści
- układ z sidebarem
- układ bez sidebara
- układ z panelem Papa
- układ compact

### Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-separator`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`, role warstw z `00-08-glebia-i-warstwy.md`.

### Responsywność

Aktywny zakres Stage 02 obejmuje desktop light/dark. Compact oznacza desktopowy rail, nie formalny projekt mobile. Wąski reflow nie może tworzyć poziomego scrolla; formalny odbiór tablet/mobile pozostaje odroczony.

### Dostępność

Landmark wynika z rzeczywistej roli i ma nazwę unikalną dla wariantu lub demonstracji, dzięki czemu kilka canvasów w jednej historii pozostaje rozróżnialnych. Przełącznik wariantu używa `aria-pressed`, nawigacja używa `aria-current`, a scroll owner jest nazwanym regionem dostępnym przez Tab i przewijanym klawiaturą. Panel Papa ma nazwę i kontrolkę zamknięcia. Warstwa zamyka się przez kontrolkę oraz scrim; produkcyjne zachowanie OverlayRoot pozostaje odpowiedzialnością docelowego komponentu.

### Storybook i odbiór

Dla utrzymania statusu accepted decision record wymagane są: typecheck, Storybook build, checki katalogu/architektury/taksonomii, Foundation verification, `git diff --check`, desktop light/dark, kontrola interakcji wariantów, panelu Papa, scroll ownera, klawiatury, focus, konsoli i braku poziomego overflow. Przejście walidacji utrzymuje status `accepted decision record`, bez deklarowania produkcyjnego runtime.

BRAK DECYZJI W DOKUMENTACJI: kontrakt 05.02 nie definiuje produkcyjnego publicznego API AppShell ani pełnego przepływu OverlayRoot. Story pozostaje lokalnym laboratorium struktury.

<a id="sekcja-05-03-powierzchnie-danych"></a>

## Powierzchnie danych

### Rola Laboratorium i handoff
`05.03` porównuje archetypy powierzchni danych. Nie jest trwałym właścicielem `MetricCard`, `ChartFrame`, `DataTable`, panelu szczegółów, dowodów ani rekomendacji. Po akceptacji odpowiedzialności są promowane odpowiednio do warstw `00 / 15 / 18`.

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.03 |
| Nazwa polska | Powierzchnie danych |
| Nazwa techniczna | powierzchnie-danych |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Design System Lead |
| Moduł | M02 — Design System |

| Status implementacji | PROTOTYP STORYBOOK — ACCEPTED DECISION RECORD |
| Status Storybooka | accepted decision record; docelowi ownerzy produkcyjni: 15/18 |
| Status testów | walidacje statyczne i kontraktowe: passing; dokument nie deklaruje drugiego ownera wykresów, tabel ani warstw przekrojowych |

### Decyzja docelowa

Panel istnieje tylko wtedy, gdy ma własną rolę, stan albo cykl interakcji. Story 05.03 jest laboratorium decyzji i nie zastępuje docelowych stories `MetricCard`, `ChartFrame`, rodzin wykresów, `DataTable`, `ColumnPicker`, `DetailPanel` ani eksportu.

### Wdrożony zakres laboratorium

1. Role powierzchni.
2. Handoff KPI do `15.02 MetricCard`.
3. Rodziny wykresów.
4. Handoff ChartFrame do `15.01 ChartFrame`.
5. Użycie runtime `DataTable` i handoff workflow tabeli do `18.04`.
6. Stany powierzchni konsumujące kanoniczny model statusu.
7. Panele robocze w kontekście.
8. Decyzja i antyprzykład.

W całej historii nie wolno używać poziomego scrolla jako rozwiązania układu. Elementy układają się pionowo albo w elastycznej siatce. Panele szczegółów, eksportu, dowodów i rekomendacji są warstwami zgodnymi z `00-08-glebia-i-warstwy.md`, a nie blokami przedłużającymi stronę.

### KPI — handoff

Warianty KPI i mikrotrend zostały promowane do `15.02 MetricCard`. 05.03 nie renderuje lokalnego katalogu KPI, nie utrzymuje `KpiSparkline` i nie definiuje drugiego języka sygnału. Laboratorium pokazuje jedynie informację o ownerze i zachowuje historię decyzji.

### Rodziny wykresów

Historia pokazuje `TrendChart`, `ComparisonChart`, `ShareChart`, `CorrelationChart`, `ForecastChart`, `WaterfallChart` i `FunnelChart`. Każda rodzina odpowiada na inne pytanie biznesowe i ma własny kontekst metryki, źródła, zakresu oraz punktu odniesienia. Laboratorium nie prezentuje siedmiu miniaturek z identycznym opisem.

Serie analityczne używają ról `--pd-data-accent` oraz `--pd-data-series-*`. `--pd-brand-*` nie pełni roli koloru danych, a tony statusowe są używane tylko wtedy, gdy wykres rzeczywiście koduje semantyczny wzrost, spadek lub błąd. Grid i osie mają niższą wagę niż dane. Benchmark jest rozróżniony linią przerywaną. Zoom, brush, pan i crosshair pozostają poza zatwierdzonym kontraktem, dlatego nie są deklarowane jako gotowe funkcje.

### ChartFrame — handoff

Pełny kontener został promowany do `15.01 ChartFrame`. 05.03 nie renderuje lokalnej implementacji ChartFrame. Nagłówek, status, metadane, wizualizacja, legenda, wniosek, tabela alternatywna i akcja Papa są kontraktem 15.01.

### Tabela — handoff i użycie

Bazowy `DataTable` pozostaje runtime komponentem, a aktywnym ownerem workflow tabeli w Storybooku jest `18.04`. 05.03 konsumuje ten komponent bez lokalnego silnika `<table>`, bez własnego `DataSurfaceSelect`, bez własnej paginacji, wyboru kolumn, gęstości, filtrowania i mechanizmu zaznaczeń.

Laboratorium pokazuje jedynie kontekst użycia tabeli oraz warstwy uruchamiane z akcji rekordu:

- `Pokaż szczegóły` używa istniejącej ikony `data` i otwiera warstwę szczegółów;
- `Wyjaśnij z Papa` używa istniejącej ikony `assistant` i otwiera warstwę interpretacji;
- `Podgląd eksportu` jest wyłącznie handoffem, ponieważ pełny workflow `FilterBar + DataTable + Pagination + actions + DetailPanel` należy do `18.04`.

Tabela domyślnie nie zaznacza żadnego rekordu. Laboratorium dodaje nad runtime `DataTable` wyłącznie kontekst powierzchni: zakres, źródła, status danych i aktualny opis sortowania. Nie implementuje własnego toolbara, filtrów, paginacji ani ColumnPicker. Liczby, waluty i procenty są formatowane przez Foundation runtime. Na wąskim reflow nie wolno wprowadzać poziomego scrolla jako zastępstwa decyzji układowej.

### Stany danych

Laboratoryjne stany używają `AnalyticsDataState`, `resolveAnalyticsDataStateTone()` i kanonicznego `StatusBadge`. 05.03 nie mapuje `processing`, `partial`, `stale`, `noData` ani błędów danych przez lokalny `ReviewBadge`. Każdy stan korzysta z tej samej stabilnej anatomii powierzchni: nagłówek metryki, stały region danych, metadane świeżości/kompletności i tekstowy opis stanu. Stan zmienia informację, a nie konstrukcję powierzchni. Konkretny klucz stanu pozostaje własnością domeny/Analytics UI.

### Panele robocze

Dowody, rekomendacja i panel roboczy są uruchamiane z rzeczywistego kontekstu decyzji zawierającego metryki, trend i sygnał biznesowy. Otwierają się jako warstwy ponad canvasem i nie są trzema równorzędnymi kartami dokładanymi pod wykresem lub tabelą. Warstwa ma nazwę, kontrolkę zamknięcia, Escape, scrim i focus restore wynikające z komponentu Drawer/OverlayRoot.

### Decyzja i antyprzykład

Story pokazuje również ograniczony wizualny antyprzykład. Demonstruje on kartę dla każdego fragmentu danych, zagnieżdżanie powierzchni i sztuczny poziomy scrollbar. Antyprzykład jest zamknięty we własnym regionie demonstracyjnym i nie wprowadza rzeczywistego poziomego overflow strony.

### Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-separator`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*` oraz role warstw z Fundamentów.

### Responsywność i dostępność

Aktywny odbiór Stage 02 obejmuje desktop light/dark. Reflow nie może tworzyć poziomego scrolla. SVG ma tekstowy odpowiednik, tabela ma caption i etykiety, a znaczenie statusów i trendów nie zależy wyłącznie od koloru. Mobile i tablet pozostają odroczone jako formalny projekt produktu.

### Storybook i odbiór

Dla utrzymania statusu accepted decision record wymagane są: typecheck, Storybook build, checki katalogu/architektury/taksonomii, Foundation verification, `git diff --check`, desktop light/dark, kontrola wszystkich ośmiu sekcji, klawiatury istniejących komponentów, focus, Drawer/OverlayRoot, Escape, focus restore, braku domyślnego zaznaczenia, braku lokalnego silnika tabeli/Selecta, braku poziomego overflow i błędów konsoli. Historia ma status `accepted`.

BRAK DECYZJI W DOKUMENTACJI: szczegółowy kontrakt zoom, brush, pan i crosshair nie jest zatwierdzony. Funkcje nie są wdrażane w tym laboratorium.

BRAK DECYZJI W DOKUMENTACJI: określenie „wykres kwadratowy” nie identyfikuje Treemap, Heatmap ani nowej rodziny i wymaga osobnej decyzji.


### Handoff po promocji 15.01–15.02

- archetyp pełnego `ChartFrame` został promowany do `15.01`; 05.03 nie utrzymuje drugiej implementacji;
- warianty KPI i lokalny `KpiSparkline` zostały promowane do `15.02 MetricCard`; 05.03 nie utrzymuje drugiego katalogu KPI;
- rodziny wykresów pozostają decyzją laboratoryjną do czasu implementacji `15.03–15.07`;
- bazowa tabela jest konsumowana jako runtime `DataTable`; workflow filtrów, paginacji, akcji i detail należy do `18.04`;
- stany danych konsumują kanoniczny `StatusBadge` i mapowanie Analytics; docelowe zachowanie rodzin danych pozostaje do promocji w `15.08`;
- warstwy szczegółów/dowodów/rekomendacji pozostają decision recordem do czasu handoffu do `18.07`.

Od tego etapu 05.03 jest źródłem historii decyzji, a nie runtime source of truth dla ChartFrame i MetricCard.

<a id="sekcja-05-04-separatory-i-obramowania"></a>

## Separatory i obramowania

### Status decyzji i handoff
Decyzja laboratoryjna jest zaakceptowana. Kanonicznym właścicielem reguł separatorów i linii jest `00.07 — Linie i separacja`. Ten dokument pozostaje zapisem decyzji i nie może być używany jako alternatywna specyfikacja.

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.04 |
| Nazwa polska | Separatory i obramowania |
| Nazwa techniczna | separatory-i-obramowania |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status implementacji | PROTOTYP STORYBOOK — ACCEPTED DECISION RECORD |
| Status Storybooka | accepted decision record; docelowy owner produkcyjny: 00.07 Linie i separacja |
| Status testów | walidacje statyczne i kontraktowe: passing; dokument nie deklaruje osobnego runtime separatorów |

### Decyzja docelowa

Hairline divider i kontrolowana separacja są podstawowym sposobem budowania hierarchii. Active, focus i danger mają odrębne role.

### Stan prototypu Storybook 05.04

Historia pokazuje poziomy `subtle`, `default`, `strong`, `focus`, `active` i `danger`, używa poprawnego tokenu `--pd-separator-strong`, mapuje `active` na `--pd-interactive` i rozdziela role separatora, interakcji, focusu oraz statusu krytycznego.

Mapa aplikacji demonstruje topbar, sidebar, region treści i wizualną próbkę drawera bez kart wewnątrz kart. Próbka drawera jest zwykłym kontenerem prezentacyjnym, a nie landmarkiem `aside`, ponieważ nie pełni w historii samodzielnej roli komplementarnej. Nawigacja ma lokalny aktywny stan. Antyprzykład pokazuje utratę znaczenia, gdy każdy element dostaje tę samą ciężką ramkę.

### Reguły

- `--pd-separator-subtle` dla podziałów wewnętrznych
- `--pd-separator` dla granic regionów
- `--pd-separator-strong` dla wyjątkowo mocnej granicy ważnej powierzchni
- `--pd-focus-visible` wyłącznie dla widocznego focusu
- `--pd-interactive` dla aktywnego wyboru i aktywnej nawigacji; kolor marki nie przejmuje roli interakcji
- `--pd-status-danger` dla statusu krytycznego
- danger nie jest zwykłym active border
- separator ani wizualna próbka drawera nie tworzą dodatkowego landmarku lub dekoracyjnej ramki każdego elementu

### Warianty wymagane przez katalog

- podział sekcji
- obramowania ważnych powierzchni
- podziały tabel
- separatory topbara
- separatory sidebara
- granice drawerów

### Storybook i odbiór

Dla utrzymania statusu accepted decision record wymagane są: typecheck, Storybook build, checki Storybooka i Fundamentów, `git diff --check`, desktop light/dark, kontrola widocznego focusu, aktywnej nawigacji, rozróżnienia danger/active/focus, braku poziomego overflow i zgodności tokenów z `00-07-linie-i-separacja.md`. Historia ma status `accepted`.

<a id="sekcja-05-05-gradienty-swiatlo-i-szklo"></a>

## Gradienty, światło i szkło — Dark Crystal Shell

### Decyzja nadrzędna 2026-08-17

Starszy zakaz glass / blur / glow / halo na AppShell jest **historyczny i nie obowiązuje**. Aktualnym kontraktem jest **Dark Crystal Shell**.

Dark Crystal obejmuje zawsze:

- Topbar authenticated,
- Sidebar / rail,
- WorkspaceSwitcher overlay,
- Calendar należący do shella,
- Account Panel,
- Notification Center,
- pozostałe shell-owned menu/popover/anchored overlays.

Obszary te pozostają ciemne niezależnie od motywu workspace. Jasny motyw dashboardu nie zmienia shella ani jego overlayów na jasne powierzchnie.

### Dozwolone środki

Dozwolone są kontrolowane:

- częściowa przezroczystość powierzchni,
- `backdrop-filter` / blur,
- refrakcyjne hairline borders,
- subtelne wewnętrzne refleksy,
- gradienty wynikające ze wspólnego kontraktu shella,
- techniczny cień i warstwowanie,
- lokalny ambient/glow o niskiej intensywności, jeżeli wzmacnia hierarchię i nie imituje neonowego efektu.

### Ograniczenia

- efekt nie może obniżać kontrastu tekstu, focus ring ani czytelności danych;
- nie tworzymy osobnych prywatnych palet crystal dla każdego komponentu;
- wszystkie shell-owned powierzchnie korzystają ze wspólnych tokenów `--pd-shell-*` i semantycznych aliasów;
- glow/gradient nie może kodować stanu, który nie posiada tekstowego lub strukturalnego odpowiednika;
- nie używamy intensywnego „gamingowego” neon glow;
- workspace pozostaje niezależną warstwą light/dark i nie dziedziczy na siłę tokenów Dark Crystal;
- Calendar, Account Panel i Notifications nie mogą przełączać `color-scheme` na light wewnątrz Dark Crystal.

### Geometria i głębia

Krystaliczność nie zmienia semantyki warstw. Sticky shell, popover, modal, toast i sidecar nadal mają jawny layer owner i działają przez system OverlayRoot. Cień i blur nie zastępują z-index/focus management.

### Responsive

Dark Crystal zachowuje tę samą rodzinę wizualną na desktop/tablet/mobile. Przy małej szerokości zmienia się geometria i szerokość warstwy, nie jej semantyczny motyw.

### Storybook i odbiór

Wymagane są co najmniej:

- authenticated Topbar light-workspace + dark-workspace,
- Account Panel,
- Notification Center z read/unread/snoozed,
- Calendar w jasnym workspace pozostający Dark Crystal,
- Sidebar expanded i rail,
- mobile,
- podstawowy keyboard/focus,
- brak poziomego overflow.

Historyczne stories i copy opisujące bezwzględny zakaz glass/blur/glow należy traktować jako nieaktualne i zsynchronizować z niniejszą decyzją.
