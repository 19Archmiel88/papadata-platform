---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Fundamenty UI, marka i dostępność

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-00-01-kierunek-wizualny"></a>

## Kierunek wizualny

### Decyzja

PapaData buduje wrażenie premium przez precyzję, kontrolowaną gęstość, czytelne dowody i spokojną hierarchię. Zaakceptowany Storybook desktop light/dark jest źródłem prawdy dla kierunku wizualnego Etapu 01.

### Zakres baselineu

- desktop, light, dark, PL, comfortable, full motion
- bez mobile, tabletu, pełnej responsywności i ekranów produkcyjnych
- Laboratorium 05.01-05.05 pozostaje prototypem w review

### Zasady

- dane i decyzja przed dekoracją
- separatory, typografia i rytm przed mnożeniem kart
- light i dark mają tę samą geometrię
- zmiana zaakceptowanego stylu wymaga jawnej decyzji
- helper Storybooka nie jest publicznym API komponentu

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-02-typografia"></a>

## Typografia

### Decyzja

Kanoniczna para fontów to Inter dla interfejsu użytkownika oraz JetBrains Mono dla danych technicznych, identyfikatorów, wartości systemowych, kodu i treści monospace.

### Publiczne role

| Rola | Token CSS | Zastosowanie |
|---|---|---|
| sans | `--pd-font-sans` | UI, nagłówki, formularze, tabele |
| mono | `--pd-font-mono` | dane techniczne i identyfikatory |
| label | `--pd-type-size-label` | etykiety i krótkie metadane |
| heading1-heading5 | `--pd-type-size-heading-*` | hierarchia nagłówków komponentów |
| headingSmall | `--pd-type-size-heading-small` | kompaktowe nagłówki paneli |
| tight | `--pd-line-height-tight` | zwarte nagłówki i tytuły |

### Reguły użycia

- zwykły tekst, nawigacja, formularze i przyciski używają Inter
- liczby techniczne mogą używać JetBrains Mono z tabular numerals
- font monospace nie służy do zwykłych opisów ani nawigacji
- hierarchia wynika z rozmiaru, line-height i weight, nie z wersalików
- dokumentacja i tokeny nie utrzymują konkurencyjnych fontów

### Formatowanie danych

Runtime source of truth dla lokalnego formatowania danych znajduje się w `apps/web/src/design-system/foundations/runtime/formatters.ts`. Konsumenci nie składają ręcznie liczb, walut, procentów, świeżości ani zakresów dat.

Przykłady dla `pl`:

- liczba: `1 284 590,42`;
- waluta: `248 950,80 zł`;
- wynik: `18,6%`;
- aktualność: `4 minuty temu`;
- zakres dat: `1–31 lip 2026`.

Zakres dat jest wartością tekstową formatowaną przez Foundation runtime. Jego przykład w Fundamentach pozostaje płaski — bez dodatkowej karty lub powierzchni wewnątrz sekcji. Kontrolka wyboru dat należy do komponentu/wzorca, który ją konsumuje; 00.02 nie tworzy drugiego DateRangePicker.

Kwoty i KPI używają cyfr tabelarycznych tam, gdzie stabilność szerokości wartości ma znaczenie dla porównania kolumn lub kart.

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-03-kolory-semantyczne"></a>

## Kolory semantyczne

### Decyzja

Kolor jest rolą semantyczną. Akcent marki nie komunikuje warning ani critical, a paleta danych nie zastępuje statusów systemowych.

### Tokeny kanoniczne

- powierzchnie: `--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-surface-overlay`, `--pd-surface-data`, `--pd-surface-panel`
- tekst: `--pd-text`, `--pd-text-secondary`, `--pd-text-muted`
- separatory: `--pd-separator-subtle`, `--pd-separator`, `--pd-separator-strong`
- statusy: `--pd-status-info`, `--pd-status-success`, `--pd-status-warning`, `--pd-status-danger`, `--pd-status-neutral` oraz warianty subtle/border
- dane: `--pd-data-*`

### Reguły

- `danger` jest nazwą tokenu koloru, nie publiczną wartością statusu komponentu
- `critical` mapuje się wizualnie na `--pd-status-danger`
- nie używać starych nazw `legacy surface alias`, `legacy border alias` ani `legacy text alias`
- drobne odchylenie kontrastu w B2B jest rekomendacją, jeśli nie blokuje czytelności



### Paleta danych dla większych serii

Paleta danych obejmuje `--pd-data-series-1`–`--pd-data-series-10`. Przy większej liczbie kategorii lub serii wykres używa kolejnych kolorów z palety danych, a nie kreskowania jako substytutu brakującego koloru. Linie kreskowane są zarezerwowane wyłącznie dla znaczeń semantycznych, takich jak granica prognozy, przedział niepewności lub referencja pomocnicza, i zawsze muszą mieć opis tekstowy w legendzie albo metadanych.

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-04-statusy-systemowe"></a>

## Statusy systemowe

### Source of truth i ownership
Fundament definiuje wyłącznie anatomię statusu oraz semantic tones: `neutral`, `info`, `success`, `warning`, `critical`, `processing`. Konkretne klucze i etykiety billing/security/commerce/operations należą do modeli domenowych produktu. `StatusBadge` renderuje ton, ale nie jest właścicielem słownika biznesowego.

### Decyzja

Jeden publiczny słownik **tonów semantycznych** obowiązuje komponenty, Fundamenty i Laboratorium: `neutral`, `info`, `success`, `warning`, `critical`, `processing`. Klucze statusów biznesowych pozostają własnością domen.

### Mapowanie

| Status API | Znaczenie | Token wizualny |
|---|---|---|
| neutral | brak oceny lub stan pomocniczy | `--pd-status-neutral` |
| info | informacja bez pilnej reakcji | `--pd-status-info` |
| success | zakończenie poprawne | `--pd-status-success` |
| warning | ryzyko lub opóźnienie | `--pd-status-warning` |
| critical | błąd, blokada, nieodwracalny skutek | `--pd-status-danger` |
| processing | operacja trwa | `--pd-brand-accent` |

### Reguły

- `danger` pozostaje wyłącznie nazwą tokenu koloru lub lokalnej roli obramowania/separatora
- `muted` nie jest statusem domenowym i mapuje się na `neutral` albo rolę tekstową
- status nie może być przekazywany wyłącznie kolorem
- `StatusBadge` renderuje kanoniczny status; Laboratorium nie tworzy drugiego runtime badge dla `processing`, `partial`, `stale`, `noData` ani błędów danych
- lokalny badge laboratoryjny może opisywać wyłącznie metadane decyzji/handoffu, nie status produktu
- `implemented` oznacza tylko istnienie story lub kodu referencyjnego, nie akceptację ani produkcję

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-05-spacing-i-grid"></a>

## Spacing i grid

### Decyzja

Skala odstępów bazuje na 4 px. Desktop light/dark jest baselineem Etapu 01; mobile, tablet i pełna responsywność pozostają poza zamrożeniem.

### Tokeny

- `--pd-space-0` do `--pd-space-24` opisują rytm odstępów
- `--pd-grid-gutter`, `--pd-grid-columns-wide`, `--pd-grid-columns-tablet`, `--pd-grid-columns-mobile` opisują obecny kontrakt gridu
- density comfortable i compact są trybami runtime, ale accepted baseline Etapu 01 dotyczy comfortable

### Reguły

- nie deklarować mobile jako zakończonego baselineu
- zoom 200% nie może usuwać funkcji
- tabele poniżej użytecznego minimum przechodzą w scroll lub widok uproszczony
- nowy breakpoint wymaga osobnej decyzji responsive

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-06-promienie-i-geometria"></a>

## Promienie i geometria

### Decyzja

Geometria jest techniczna i umiarkowana. Promienie są małe, a kształt nie zastępuje semantyki ani statusu.

### Tokeny

- `--pd-radius-none`, `--pd-radius-subtle`, `--pd-radius-small`, `--pd-radius-control`, `--pd-radius-surface`, `--pd-radius-overlay`, `--pd-radius-pill`
- `--pd-border-width-subtle`, `--pd-border-width-strong`
- cienie są opisane w `00.08 Głębia i warstwy`

### Reguły

- kontrolki używają promieni technicznych
- powierzchnie nie tworzą kart zagnieżdżonych bez osobnego cyklu interakcji
- focus nie jest cieniem dekoracyjnym
- zmiana globalnej roli promienia wymaga tokenu, nie lokalnego CSS

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-07-linie-i-separacja"></a>

## Linie i separacja

### Source of truth i handoff z 05.04
Ten dokument jest kanonicznym właścicielem separatorów, obramowań i ról linii. `05.04 — Separatory i obramowania` jest decision recordem Laboratorium. Po akceptacji decyzje z 05.04 są promowane tutaj i nie tworzą drugiej specyfikacji.

### Decyzja

Hairline divider i kontrolowana separacja są domyślnym sposobem budowania hierarchii, zamiast mnożenia kart i obramowań.

### Tokeny

- `--pd-separator-subtle` dla podziałów wewnętrznych
- `--pd-separator` dla granic regionów
- `--pd-separator-strong` dla mocniejszej granicy powierzchni
- `--pd-focus-visible` dla fokusu
- `--pd-status-danger` dla krytycznych granic ryzyka

### Reguły

- active, focus i critical mają osobne role
- status critical nie jest zwykłym active border
- separator nie może być używany jako dekoracyjna ramka każdego elementu
- stara nazwa `legacy border alias` nie jest publicznym tokenem

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-08-glebia-i-warstwy"></a>

## Głębia i warstwy

### Decyzja

Warstwa opisuje odpowiedzialność interfejsu, nie przypadkową wartość `z-index`. Cień służy wyłącznie warstwom nakładanym i technicznej separacji.

### Kontrakt warstw

| Rola | Token CSS | Wartość | Zastosowanie |
|---|---|---:|---|
| underlay | `--pd-layer-underlay` | -1 | dekoracyjne elementy pod zawartością |
| base | `--pd-layer-base` | 0 | standardowy dokument |
| sticky | `--pd-layer-sticky` | 10 | elementy przyklejone |
| popover | `--pd-layer-popover` | 20 | dropdowny, menu, tooltipy |
| modal | `--pd-layer-modal` | 30 | dialogi i blokujące overlaye |
| toast | `--pd-layer-toast` | 40 | komunikaty najwyższej warstwy |

### Reguły

- lokalny stacking context jest dopuszczalny tylko wewnątrz komponentu
- globalne overlaye używają ról `layerTokens` i `layerContract`
- `--pd-shadow-control`, `--pd-shadow-raised`, `--pd-shadow-floating`, `--pd-shadow-overlay` nie zastępują warstwy semantycznej
- nowa globalna warstwa wymaga aktualizacji CSS, TS i dokumentacji

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-09-ikonografia"></a>

## Ikonografia

### Source of truth i granica z 00.13
`00.09` definiuje język ikon: geometrię, stroke, `currentColor`, rozmiary, znaczenie i reguły użycia. Pełny katalog nazw i wariantów należy wyłącznie do `00.13 — Ikony` oraz runtime `Icon`. Provider marks i logo marki są osobnymi rodzinami.

### Decyzja

Ikona wspiera etykietę i strukturę, ale nie zastępuje nazwy dostępnościowej w akcji krytycznej. Rejestr ikon i brand mark są oddzielone.

### Zasady

- icon-only button zawsze ma accessible name
- status nie jest przekazywany wyłącznie ikoną lub kolorem
- logo i provider marks nie są zwykłymi ikonami systemu
- rozmiar ikony wynika z wariantu kontrolki
- tekst ikonografii używa `--pd-text`, nie starego aliasu `--pd-text`

### Zakres

- ikony nawigacji, statusów, akcji, danych, AI, security, billing i pomocy
- `Icon`, `PapaDataBrand`, `PapaDataIconName` oraz publiczny rejestr nazw ikon
- brak lokalnych zestawów ikon w stories bez dopisania do rejestru

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-10-motion"></a>

## Motion

### Decyzja

Motion komunikuje zmianę stanu i warstwy, ale nie przenosi informacji samodzielnie. Reduced motion nie może usuwać informacji o stanie.

### Czasy

| Rola | Token | Czas |
|---|---|---:|
| reakcja natychmiastowa | `--pd-motion-duration-instant` | 70 ms |
| mała zmiana stanu | `--pd-motion-duration-fast` | 110 ms |
| standardowe przejście | `--pd-motion-duration-standard` | 180 ms |
| większa zmiana powierzchni | `--pd-motion-duration-deliberate` | 240 ms |

### Reduced motion

- skraca przejścia do wartości natychmiastowych
- usuwa dekoracyjny ruch i dystans `--pd-motion-distance`
- nie usuwa komunikatu, focus, statusu ani informacji o zakończeniu operacji
- skeleton zachowuje finalną geometrię

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-11-dostepnosc"></a>

## Dostępność

### Decyzja

Baseline Etapu 01 wymaga praktycznej dostępności desktopowej: semantyki HTML, obsługi klawiatury, widocznego focus-visible w postaci jednego zewnętrznego ringu, tekstowych statusów i reduced motion. Formalne drobne odchylenia kontrastu w produkcie B2B są rekomendacją, jeśli nie blokują użycia.

### Macierz stanów interakcji

| Stan | Znaczenie | Minimum |
|---|---|---|
| default | stan bazowy | czytelna etykieta i rola |
| hover | wskazanie kursorem | nie zmienia układu |
| focus-visible | fokus klawiatury | jeden widoczny zewnętrzny ring bez dodatkowej linii wewnątrz kontrolki |
| active | akcja w trakcie naciśnięcia | krótkie potwierdzenie |
| pressed | przełącznik wciśnięty | `aria-pressed` tam, gdzie dotyczy |
| selected | element wybrany | tekst/ARIA poza kolorem |
| disabled | akcja istnieje, czasowo niedostępna | brak focusu, czytelny powód w kontekście |
| read-only | wartość widoczna, nieedytowalna | semantyka readonly |
| invalid | dane wymagają korekty | opis błędu tekstem |
| loading | operacja trwa | stan nie usuwa etykiety |
| unavailable | funkcja niedostępna w kontekście | nie udaje disabled |

### Kontrakt focus-visible

- fokus klawiatury jest prezentowany jako jeden zewnętrzny ring oparty na `--pd-focus-visible`, `--pd-focus-width`, `--pd-focus-offset` i `--pd-focus-ring`;
- globalny kontrakt nie używa niebieskiego podkreślenia `border-bottom` ani insetowej linii wewnątrz kontrolki;
- komponent złożony, taki jak pole formularza, pokazuje ring na powierzchni właściciela przez `:focus-within`;
- wewnętrzny `input`, `textarea`, `select` lub `file input` nie renderuje drugiego outline ani drugiego box-shadow;
- focus nie może zmieniać geometrii, wysokości ani szerokości kontrolki;
- forced colors zachowuje natywny kolor `Highlight` przez outline.

### Zakres komponentów

- przyciski, linki, pola formularza, checkboxy, radio, switche, segment controls, sortowalne nagłówki, elementy tabel i komponenty read-only
- stan nie może być komunikowany wyłącznie kolorem
- `disabled` nie jest uniwersalnym zamiennikiem `unavailable`, `read-only`, `loading` ani `invalid`
- WCAG blokuje etap tylko przy realnej utracie funkcji lub czytelności

### Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.

<a id="sekcja-00-12-marka"></a>

## Marka

### Cel

`00.12` jest aktywnym ownerem Storybooka dla użycia marki PapaData. Pokazuje lockup, sygnet, wordmark, rozmiary oraz zachowanie light/dark w tym samym materiale wizualnym co pozostałe Fundamenty.

### Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/icons/PapaDataBrand.tsx`. Ten dokument i story `00 Fundamenty/03 Marka` są kanonicznym miejscem prezentacji marki w Storybooku. Dokument `04-komponenty-bazowe/README.md` zostaje kontraktem runtime/reference, a nie aktywną sekcją Storybooka.

### Zakres

- lockup, mark, wordmark i wariant dekoracyjny;
- rozmiary small, medium i large;
- nazwa dostępna i `aria-hidden` dla wariantu dekoracyjnego;
- użycie marki w app shell, auth, empty state i eksporcie dokumentu;
- brak dekoracyjnego `glow` w bazowym API.

### Granice

Marka nie definiuje całego systemu wizualnego. Canvas, kolor, typografia, geometria i warstwy należą do `00.01-00.11`. Provider marks i logotypy integracji są osobną rodziną.

<a id="sekcja-00-13-ikony"></a>

## Ikony

### Cel

`00.13` jest aktywnym ownerem Storybooka dla runtime komponentu `Icon` i pełnego katalogu ikon systemowych. Fundament `00.09` definiuje zasady języka ikon, a `00.13` pokazuje katalog, rozmiary i dostępność komponentu.

### Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/icons/Icon.tsx`. Story `00 Fundamenty/04 Ikony` jest jedynym katalogiem nazw i wariantów ikon w Storybooku. Dokument `04-komponenty-bazowe/README.md` zostaje kontraktem runtime/reference.

### Zakres

- `currentColor`, `strokeWidth`, viewBox i rozmiary 16, 20, 24;
- wariant dekoracyjny i informacyjny;
- dostępna nazwa przez `label`;
- kategorie funkcjonalne: nawigacja, dane, integracje, operacje i status;
- light/dark oraz PL/EN bez zmiany semantyki.

### Granice

Nie tworzymy lokalnych list ikon w sekcjach `15`, `18` ani w story ekranów. Nowa ikona trafia do runtime katalogu `Icon` i jest dokumentowana w `00.13`.

<a id="sekcja-00-14-przyciski-i-akcje"></a>

## Przyciski i akcje

### Cel

`00.14` jest aktywnym ownerem Storybooka dla systemu decyzji: komenda, nawigacja, akcja w danych, akcja destrukcyjna i układ mobilny. Sekcje `15` i `18` konsumują te komponenty bez lokalnej geometrii, koloru ani focusu.

### Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/components/Button`. Story `00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje` jest kanoniczną prezentacją Storybooka. Dokument `04-komponenty-bazowe/README.md` zostaje kontraktem runtime/reference.

### Zakres

- `Button` jako command/submit;
- `TextAction` jako lekka komenda w treści, tabeli lub komunikacie;
- `LinkAction` jako nawigacja przez `<a href>`;
- `IconButton` jako komenda ikonowa z jawną etykietą;
- `ButtonGroup`, loading, disabled, danger, full-width i mobile;
- kontrakt kreski aktywności bez zmiany layoutu.

### Granice

`Button` nie ma wariantu link. Komponenty danych, wykresów i wzorców nie tworzą własnych przycisków ani lokalnych override'ów `.pd-button`, `.pd-icon-button` lub `.pd-inline-action`.

<a id="sekcja-00-15-pola-tekstowe-i-formularzowe"></a>

## Pola tekstowe i formularzowe

### Cel

`00.15` jest zaakceptowanym ownerem Storybooka dla wejść danych: etykieta, helper, error, required, disabled, read-only oraz walidacja. Fundament określa zachowanie i wygląd pola, ale nie narzuca jednej biblioteki formularzy, kalendarza ani zaawansowanych kontrolek.

### Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/components/Field` oraz `apps/web/src/design-system/components/VerificationCodeInput`. Story `00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe` jest kanoniczną prezentacją Storybooka. Dokument `04-komponenty-bazowe/README.md` zostaje kontraktem runtime/reference.

### Zakres

- `TextField`, `PasswordField`, `Textarea`, `FileInput` i `VerificationCodeInput`;
- label, helper text, message, required, error, disabled i read-only;
- loading/validating jako przyszłe rozszerzenie tego samego wzorca;
- jeden zewnętrzny focus na właścicielu kontrolki;
- PL/EN, długie teksty, reflow i zoom 200%.

### Granice

Select, combobox, date picker, kalendarz, checkbox, radio, switch i multi-select mogą korzystać z bibliotek zewnętrznych, ale ich materiał, focus, label, helper i walidacja mają dziedziczyć decyzje `00.15`.
