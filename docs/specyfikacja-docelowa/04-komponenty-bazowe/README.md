---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Komponenty bazowe — zasady i grupy

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-10-01-marka"></a>

## Marka

### Source of truth
Runtime `PapaDataBrandProps` w `apps/web/src/design-system/icons/PapaDataBrand.tsx` jest publicznym API komponentu. Aktywnym ownerem Storybooka jest `00.12 — Marka`. Bazowy komponent marki nie posiada dekoracyjnego `glow`; ewentualne efekty marketingowe nie są częścią jego API. Provider logos należą do osobnej rodziny integracyjnej.

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.01 |
| Nazwa polska | Marka |
| Nazwa techniczna | marka |
| Typ dokumentu | kontrakt komponentu bazowego |
| Wersja | 1.1 |
| Status kontraktu | accepted |
| Priorytet | P0 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |
| Status implementacji | IMPLEMENTED |
| Status Storybooka | `00 Fundamenty/03 Marka` → `Marka` |
| Plik Storybooka | `apps/web/src/design-system/icons/PapaDataBrand.stories.tsx` |
| Status testów | PASSING — play oraz guard prezentacji |

### Cel i decyzja docelowa

`PapaDataBrand` jest jednym komponentem marki. Sygnet, wordmark i lockup nie są kopiowane do lokalnych stories ani ekranów. Zmiana wariantu wpływa na zakres znaku i semantykę dostępności, ale nie tworzy nowego stylu marki.

Story `00.12` używa dokładnie tego samego shellu prezentacyjnego co:

- `00 Fundamenty/01 Fundamenty wizualne`;
- `00 Fundamenty/02 Powierzchnie i komunikaty`;
- pozostałe zaakceptowane elementy bazowe w `00.12-00.15`.

Canvas, typografia, szerokość treści, guttery, rytm sekcji i separatory pochodzą z klas `pd-f0-*`. Lokalny CSS marki może stylować wyłącznie sam znak i układy demonstracyjne wewnątrz zawartości sekcji. Nie może definiować własnego canvasu, page paddingu ani drabiny typograficznej strony.

### Publiczny kontrakt

#### Warianty

- `lockup` — sygnet i wordmark z dostępną nazwą;
- `mark` — sam sygnet;
- `wordmark` — sam napis PapaData;
- `decorative` — znak dekoracyjny ukryty przed technologiami asystującymi.

#### Rozmiary

- `small` — nawigacja, topbar i zwarte powierzchnie;
- `medium` — domyślny lockup powłoki aplikacji;
- `large` — ekrany wejściowe i miejsca wysokiego poziomu.

#### Pozostałe właściwości

- `label` określa nazwę dostępną wariantu informacyjnego;
- `decorative` wymusza semantykę dekoracyjną;
- `showMark` i `showWordmark` kontrolują części znaku w granicach publicznego kontraktu;
- Bazowy `PapaDataBrand` nie udostępnia dekoracyjnego glow; efekt nie jest częścią publicznego API.

### Geometria i kolor

- sygnet zachowuje trzy warstwy dostarczonego znaku;
- geometria SVG pozostaje `viewBox="0 0 100 100"`;
- kolor marki pochodzi z tokenów `--pd-brand`, `--pd-brand-line` i powiązanych ról semantycznych;
- story nie wprowadza lokalnych kolorów HEX ani alternatywnego tła strony;
- wariant light/dark zmienia wartości tokenów, nie strukturę komponentu.

### Dostępność

- warianty informacyjne mają `role="img"` i nazwę dostępną;
- wariant dekoracyjny ma `aria-hidden="true"` i nie ma roli ani nazwy;
- SVG jest wyłączone z sekwencji fokusu;
- zmiana motywu, gęstości i viewportu nie zmienia semantyki znaku.

### Storybook i testy

Story `Marka` pokazuje:

1. język marki i geometrię;
2. warianty `lockup`, `mark`, `wordmark`, `decorative`;
3. rozmiary `small`, `medium`, `large`;
4. light/dark przez global Storybooka;
5. wspólny shell Fundamentów.

Play test sprawdza:

- obecność kontrolowanego lockupu;
- role i nazwy dostępne wariantów;
- brak semantyki informacyjnej w wariancie dekoracyjnym;
- obecność lub brak sygnetu i wordmarku zgodnie z wariantem;
- klasy rozmiarów;
- niezmienioną geometrię trzech ścieżek SVG.

`check-storybook-presentation-contract.mjs` blokuje:

- lokalny canvas i gradient story marki;
- lokalny page padding;
- brak importu wspólnego CSS Fundamentów;
- brak klas wspólnego shellu `pd-f0-*`.

### Kryteria akceptacji

1. Sam komponent marki i jego grafika pozostają bez zmian przy korektach prezentacji Storybooka.
2. Tło, typografia i układ strony są identyczne z zaakceptowanym shellem Fundamentów.
3. Light i dark używają tych samych ról tokenowych i tej samej geometrii.
4. Wszystkie warianty zachowują poprawną semantykę dostępności.
5. Play, axe, typecheck, build Storybooka i guard prezentacji przechodzą.

<a id="sekcja-10-02-przyciski-i-akcje"></a>

## Przyciski i akcje

### Source of truth i semantyka akcji
Publiczne React API jest własnością runtime w `apps/web/src/design-system/components/Button`. Aktywnym ownerem Storybooka jest `00.14 — Przyciski i akcje`. Podział odpowiedzialności jest jednoznaczny: `Button` = command/submit, `TextAction` = lekka komenda, `LinkAction` = nawigacja przez `<a href>`, `IconButton` = komenda ikonowa. `Button` nie ma wariantu `link`.

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.02 |
| Nazwa polska | Przyciski i akcje |
| Nazwa techniczna | przyciski-i-akcje |
| Typ dokumentu | kontrakt rodziny komponentów |
| Wersja | 1.1 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |
| Status implementacji | IMPLEMENTED |
| Status Storybooka | `00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje` → `Przyciski` |
| Plik Storybooka | `apps/web/src/design-system/components/Button/Button.stories.tsx` |
| Status testów | PASSING — play test + statyczny kontrakt prezentacji |

### Cel i decyzja docelowa

Runtime rodziny akcji jest jedynym źródłem produkcyjnych akcji PapaData, a `00.14` jest jedyną aktywną prezentacją Storybooka. Laboratorium decyzji, ekrany i kolejne stories używają tych komponentów bez lokalnego zmieniania ich koloru, geometrii, typografii, focusu ani znacznika aktywności.

Story `00.14` nie ma własnego canvasu, drabiny typograficznej ani układu strony. Dziedziczy wspólną prezentację z jednego źródła prawdy:

- `apps/web/src/storybook-next/presentation/StoryPresentation.tsx`;
- `apps/web/src/storybook-next/presentation/story-presentation.css`;
- klasy `pd-f0-page`, `pd-f0-page__*`, `pd-f0-section` i `pd-f0-section__*`.

Lokalny `action-showcase.css` odpowiada wyłącznie za rozmieszczenie przykładów przycisków.

### Zakres komponentów

- `Button`;
- `IconButton`;
- `TextAction`;
- `LinkAction`;
- `ButtonGroup`.

### Warianty i stany wymagane

| Lp. | Wymaganie | Dowód |
| --- | --- | --- |
| 1 | primary | story + play test |
| 2 | secondary | story + play test |
| 3 | ghost | story + play test |
| 4 | danger | story + play test |
| 5 | `TextAction` — lekka komenda | story + play test |
| 6 | `LinkAction` — nawigacja `<a href>` | story + play test |
| 7 | `IconButton` — komenda ikonowa | story + play test |
| 8 | loading i `aria-busy` | story + play test |
| 9 | disabled | story + play test |
| 10 | button group poziomy i pionowy | story + play test |
| 11 | small, medium i large | story + kontrola geometrii |
| 12 | akcja full-width | regresja szerokości kreski |

Potwierdzenie operacji destrukcyjnej jest odpowiedzialnością `Dialog` lub `AlertDialog`, a nie wariantem komponentu `Button`.

### Kontrakt kreski aktywności

Kreska hover/focus należy do klikanej akcji:

1. Dla `Button` ma szerokość zawartości akcji: ikona początkowa, etykieta i ikona końcowa.
2. Nie przejmuje szerokości komórki grida, kolumny, wiersza ani `fullWidth` rodzica.
3. Dla `TextAction` i `LinkAction` obejmuje całą akcję wraz z ikoną, a nie tylko tekst etykiety.
4. Dla `IconButton` pozostaje wewnątrz kontrolki ikonowej.
5. Loading i disabled ukrywają kreskę bez zmiany geometrii.
6. Lokalny CSS Storybooka i Laboratorium nie może nadpisywać selektorów `pd-button`, `pd-icon-button` ani `pd-inline-action`.

W implementacji właściciel kreski jest oznaczony `data-slot="activity-line-owner"`, a sama kreska `data-slot="activity-line"`. Umożliwia to test szerokości w rzeczywistym runtime Storybooka.

### Anatomia

```text
Button
└── activity-line-owner (fit-content)
    ├── opcjonalny spinner lub ikona początkowa
    ├── label
    ├── opcjonalna ikona końcowa
    └── activity-line
```

### Fundamenty

Rodzina korzysta wyłącznie z tokenów `--pd-*` dla:

- canvasu i powierzchni;
- tekstu i hierarchii typograficznej;
- koloru marki, interakcji i statusu danger;
- spacingu, promieni, separatorów i focus-visible;
- motion i reduced motion.

Nie wolno definiować lokalnego odpowiednika zaakceptowanego tokenu ani lokalnego wyglądu komponentu w Storybooku lub Laboratorium.

### Interakcje i dostępność

- natywny `button` ma domyślnie `type="button"`;
- Enter i Space uruchamiają kontrolkę;
- focus-visible jest zawsze widoczny;
- kontrolka ikonowa ma nazwę akcji;
- `loading` ustawia `aria-busy="true"` i blokuje kliknięcie;
- disabled nie jest dostępny jako aktywna akcja;
- znaczenie wariantu nie zależy wyłącznie od koloru;
- reduced motion nie usuwa rezultatu interakcji.

### Responsywność

Komponent zachowuje swoją geometrię. To kontener decyduje o zawijaniu grupy lub użyciu `fullWidth`. Przy 200% zoomu i wąskim reflow:

- etykieta może się bezpiecznie zawinąć;
- ikony nie tracą proporcji;
- kreska nadal odpowiada szerokości zawartości;
- akcja nie powoduje poziomego scrolla strony.

### Storybook i testy

Wymagane i wdrożone kontrole:

1. Story używa dokładnie tego samego shellu co Fundamenty i Laboratorium.
2. `action-showcase.css` nie redefiniuje tła, typografii strony ani produkcyjnych selektorów komponentów.
3. Play test sprawdza warianty, loading, disabled, dostępne nazwy, grupy poziome i pionowe oraz brak zmiany geometrii.
4. Play test porównuje szerokość `activity-line` z właścicielem treści dla zwykłego przycisku, linku, ikony i akcji full-width.
5. `check-storybook-presentation-contract.mjs` blokuje ponowne wprowadzenie lokalnych odchyleń.
6. `check-component-system-v1.mjs`, katalog, architektura, taksonomia, typecheck i build Storybooka pozostają bramkami odbioru.

### Kryteria akceptacji

- tło, typografia i geometria strony są identyczne z zaakceptowanymi Fundamentami;
- wygląd przycisków poza korektą kreski nie został zmieniony;
- Laboratorium korzysta z produkcyjnych komponentów akcji bez lokalnych override’ów;
- wszystkie testy statyczne i runtime przechodzą;
- light/dark, PL/EN, desktop, reflow, zoom 200% i reduced motion nie tworzą odchyłów;
- użytkownik zaakceptował końcowy wygląd story.

<a id="sekcja-10-03-pola-tekstowe-i-formularzowe"></a>

## Pola tekstowe i formularzowe

### Source of truth

Publiczne React API jest własnością runtime w `apps/web/src/design-system/components/Field` oraz `apps/web/src/design-system/components/VerificationCodeInput`. Aktywnym ownerem Storybooka jest `00.15 — Pola tekstowe i formularzowe`. Ten dokument zostaje kontraktem runtime/reference.

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.03 |
| Nazwa polska | Pola tekstowe i formularzowe |
| Nazwa techniczna | pola-tekstowe-i-formularzowe |
| Typ dokumentu | kontrakt rodziny komponentów |
| Wersja | 1.2 |
| Status kontraktu | review — wymaga odbioru wizualnego właściciela produktu |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |
| Status implementacji | IMPLEMENTED FOR REVIEW |
| Status Storybooka | `00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe` → `Pola formularzy` |
| Plik Storybooka | `apps/web/src/design-system/components/Field/FormFields.stories.tsx` |
| Status testów | PARTIAL — play i guard wdrożone; wymagany pełny runtime/build po instalacji paczki |

### Cel i decyzja docelowa

Runtime rodziny pól jest jednym kontraktem wejść danych, a `00.15` jest jedyną aktywną prezentacją Storybooka. Nie tworzy lokalnego wyglądu formularza i nie kopiuje komponentów do Auth, Laboratorium ani ekranów domenowych.

Story używa dokładnie tego samego shellu prezentacyjnego co:

- `00 Fundamenty/01 Fundamenty wizualne`;
- `00 Fundamenty/02 Powierzchnie i komunikaty`;
- `00.14 Przyciski i akcje`.

Lokalny `field-family-showcase.css` może odpowiadać wyłącznie za szerokość i reflow przykładów. Nie może zmieniać canvasu, drabiny typograficznej, sekcji ani wyglądu komponentów.

### Zakres runtime

| Lp. | Wymaganie | Implementacja |
| --- | --- | --- |
| 1 | TextField | `Field/TextField.tsx` |
| 2 | PasswordField | `Field/PasswordField.tsx` |
| 3 | Textarea | `Field/Textarea.tsx` |
| 4 | FileInput | `Field/FileInput.tsx` |
| 5 | VerificationCodeInput | `VerificationCodeInput/VerificationCodeInput.tsx` |
| 6 | helper text | wspólny meta region pola |
| 7 | walidacja | `aria-invalid`, message, error/valid |
| 8 | required | natywny atrybut + widoczny znacznik |
| 9 | disabled | osobny stan bez interakcji |
| 10 | read-only | osobny stan, nie wariant disabled |

`Select`, `Combobox`, `Checkbox`, `Radio`, `Switch`, `FilterChip`, `Tag` i multi-select są osobnymi kontrolkami, ale ich label, helper, walidacja, focus i materiał powierzchni dziedziczą decyzje `00.15`.

### Wspólna anatomia

```text
field root
├── label row
│   ├── label
│   └── required marker lub badge
├── form control surface
│   └── input / textarea / file / password control
└── meta region
    ├── helper text
    └── optional validation message
```

### Kontrakt wizualny

- geometria, spacing, typografia, powierzchnia i focus wynikają z Fundamentów;
- focus stosuje dokładnie wzorzec z `05.02 Tło aplikacji` → `Formularz` → `Kontrolowana długość linii` (`Nazwa raportu`, `Zakres`): pojedynczy zewnętrzny outline i ring na właścicielu `pd-form-control`; wewnętrzny input, password, textarea, file input ani pole kodu nie może renderować drugiej poziomej linii;
- wszystkie pola używają wspólnych klas `pd-form-field`, `pd-form-control` i meta regionu;
- `Textarea` rozszerza powierzchnię pionowo bez nowej estetyki;
- `FileInput` zachowuje natywną semantykę `input type="file"` i tokenowy przycisk wyboru pliku;
- `PasswordField` dodaje wyłącznie kontrolę widoczności, siłę i wymagania;
- `VerificationCodeInput` dodaje wizualizację slotów bez automatycznego submitu;
- lokalne story nie może nadpisywać produkcyjnych selektorów pól.

### Decyzja wizualna — fokus bez poziomej linii

Właściciel produktu odrzucił poziomą niebieską linię pojawiającą się wewnątrz `PasswordField` i `Textarea`. Wzorzec referencyjny stanowią surowe pola demonstracyjne w `05.02 Tło aplikacji`, sekcja `Formularz` → `Kontrolowana długość linii`: `Nazwa raportu` i `Zakres`.

Kontrakt obowiązujący dla całej rodziny pól:

1. fokus jest prezentowany wyłącznie na zewnętrznym właścicielu `.pd-form-control`;
2. wewnętrzna kontrolka ma `border: 0`, `outline: 0`, `background-image: none` i `box-shadow: none` zarówno dla `:focus`, jak i `:focus-visible`;
3. zabronione są focus underline realizowane przez `border-bottom`, inset shadow, gradient albo `scaleX`;
4. fokus nie może zmieniać geometrii kontrolki;
5. treść, walidacja, helper text, przycisk widoczności hasła i pozostałe zachowania komponentów pozostają bez zmian.

### Stany

- default;
- focus-visible;
- required;
- error;
- valid;
- disabled;
- read-only.

Zmiana stanu nie może zmieniać szerokości ani podstawowej geometrii kontrolki.

### Interakcje i dostępność

- każda kontrolka ma powiązaną etykietę;
- helper i message są podłączone przez `aria-describedby`;
- error ustawia `aria-invalid="true"`;
- required korzysta z natywnego `required`;
- read-only korzysta z natywnego `readOnly`;
- disabled blokuje interakcję;
- przycisk widoczności hasła ma dostępną nazwę i `aria-controls`;
- kod weryfikacyjny pozostaje jednym polem tekstowym dla technologii asystujących;
- file input pozostaje natywną kontrolką pliku.

### Storybook i testy

Story `PolaFormularzy` prezentuje:

1. TextField podstawowy, required i read-only;
2. PasswordField z kontrolowaną widocznością i wymaganiami;
3. Textarea;
4. FileInput;
5. walidację błędu;
6. disabled;
7. VerificationCodeInput.

Play test sprawdza:

- wartości i role pól;
- required, read-only, disabled i `aria-invalid`;
- natywny element `textarea`;
- `input type="file"`;
- przełączanie widoczności hasła;
- wpisanie pełnego kodu weryfikacyjnego;
- brak wewnętrznego border-bottom, background-image, outline i box-shadow na skupionym input/password/textarea;
- obecność jednego wspólnego outline i ringu na właścicielu `.pd-form-control`;
- brak zmiany szerokości lub wysokości kontrolki po uzyskaniu fokusu.

`check-storybook-presentation-contract.mjs` sprawdza, że `00.15` korzysta z zaakceptowanego shellu Fundamentów i nie wprowadza lokalnych override’ów.

### Status odbioru

Implementacja i dokumentacja są przygotowane do review. Status nie może zostać zmieniony na `accepted` ani `passing` przed:

- typecheckiem;
- buildem Storybooka;
- przejściem play i axe;
- kontrolą light/dark, PL/EN, desktop, reflow i zoom 200%;
- wizualną akceptacją właściciela produktu.

<a id="sekcja-10-04-kontrolki-wyboru"></a>

## Kontrolki wyboru

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.04 |
| Nazwa polska | Kontrolki wyboru |
| Nazwa techniczna | kontrolki-wyboru |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Kontrolki wyboru” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | inline notice | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | banner | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | alert | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | toast | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | error message | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | success message | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | warning | wymagany wariant lub stan | test Storybook + test interakcji |
| 8 | neutral information | wymagany wariant lub stan | test Storybook + test interakcji |
| 9 | empty state. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
kontrolki-wyboru
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

- Title: `10 Komponenty bazowe/Kontrolki wyboru`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

<a id="sekcja-10-05-komunikaty-i-statusy"></a>

## Komunikaty i statusy

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.05 |
| Nazwa polska | Komunikaty i statusy |
| Nazwa techniczna | komunikaty-i-statusy |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Komunikaty i statusy” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | spinner | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | skeleton | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | loading card | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | loading table | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | loading chart | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | background operation | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | retry state. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
komunikaty-i-statusy
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

- Title: `10 Komponenty bazowe/Komunikaty i statusy`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

<a id="sekcja-10-06-ladowanie-i-postep"></a>

## Ładowanie i postęp

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.06 |
| Nazwa polska | Ładowanie i postęp |
| Nazwa techniczna | adowanie-i-postep |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Ładowanie i postęp” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | tabela podstawowa | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | tabela danych | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | tabela z filtrami | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | tabela z wyborem kolumn | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | tabela z akcjami | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | tabela z pustym stanem | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | tabela z częściowymi danymi | wymagany wariant lub stan | test Storybook + test interakcji |
| 8 | tabela z błędem. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
adowanie-i-postep
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
- FilterBar
- DataTable

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

- Title: `10 Komponenty bazowe/Ładowanie i postęp`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

<a id="sekcja-10-07-tabela-bazowa"></a>

## Tabela bazowa

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.07 |
| Nazwa polska | Tabela bazowa |
| Nazwa techniczna | tabela-bazowa |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Tabela bazowa” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | nawigacja | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | statusy | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | dane | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | integracje | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | AI | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | security | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | billing | wymagany wariant lub stan | test Storybook + test interakcji |
| 8 | pomoc. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
tabela-bazowa
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
- FilterBar
- DataTable

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

- Title: `10 Komponenty bazowe/Tabela bazowa`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

<a id="sekcja-10-08-nawigacja-lokalna"></a>

## Nawigacja lokalna

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.08 |
| Nazwa polska | Nawigacja lokalna |
| Nazwa techniczna | nawigacja-lokalna |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Nawigacja lokalna” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | dropdown | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | user menu | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | context menu | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | action menu | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | listbox | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | command palette item. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
nawigacja-lokalna
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

- Title: `10 Komponenty bazowe/Nawigacja lokalna`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

<a id="sekcja-10-09-menu-popovery-i-tooltipy"></a>

## Menu, popovery i tooltipy

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.09 |
| Nazwa polska | Menu, popovery i tooltipy |
| Nazwa techniczna | menu-popovery-i-tooltipy |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Menu, popovery i tooltipy” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | dialog informacyjny | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | alert dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | approval dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | destructive action | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | MFA step-up dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | reconnect dialog | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | unsaved changes. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
menu-popovery-i-tooltipy
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
- AlertDialog

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

- Title: `10 Komponenty bazowe/Menu, popovery i tooltipy`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

<a id="sekcja-10-10-dialogi-i-warstwy"></a>

## Dialogi i warstwy

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.10 |
| Nazwa polska | Dialogi i warstwy |
| Nazwa techniczna | dialogi-i-warstwy |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Dialogi i warstwy” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | stan domyślny | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
dialogi-i-warstwy
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

- Title: `10 Komponenty bazowe/Dialogi i warstwy`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

<a id="sekcja-10-11-ikony"></a>

## Ikony

### Source of truth
`00.13` i runtime `Icon` są jedynym właścicielem pełnego katalogu ikon w Storybooku. `00.09` definiuje wyłącznie reguły języka ikon. `StatusIcon` i `ProviderLogo` nie są wymaganiami tej sekcji; provider branding jest osobną rodziną.

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.11 |
| Nazwa polska | Ikony |
| Nazwa techniczna | ikony |
| Typ dokumentu | kontrakt komponentu bazowego |
| Wersja | 1.1 |
| Status kontraktu | accepted |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |
| Status implementacji | IMPLEMENTED |
| Status Storybooka | `00 Fundamenty/04 Ikony` → `Ikony` |
| Plik Storybooka | `apps/web/src/design-system/icons/Icon.stories.tsx` |
| Status testów | PASSING — play oraz guard prezentacji |

### Cel i decyzja docelowa

`Icon` jest zamkniętym komponentem ikon systemowych. Ikona nie niesie własnego koloru; dziedziczy `currentColor`, a znaczenie wynika z roli komponentu, statusu lub kontekstu danych.

Story `00.13` używa dokładnie tego samego shellu prezentacyjnego co:

- `00 Fundamenty/01 Fundamenty wizualne`;
- `00 Fundamenty/02 Powierzchnie i komunikaty`;
- pozostałe zaakceptowane elementy bazowe w `00.12-00.15`.

Canvas, typografia, szerokość treści, guttery, rytm sekcji i separatory pochodzą z klas `pd-f0-*`. Story nie definiuje lokalnego `pageStyle`, gradientu canvasu ani własnej drabiny typograficznej strony. Lokalne style mogą służyć wyłącznie do układu próbek ikon wewnątrz `pd-f0-section__content`.

### Publiczny kontrakt

- `name` wybiera ikonę z zamkniętego katalogu;
- `size` przyjmuje `16`, `20` lub `24`;
- `label` nadaje nazwę dostępną ikonie informacyjnej;
- `decorative` ukrywa ikonę przed technologiami asystującymi;
- pozostałe bezpieczne atrybuty SVG są przekazywane bez zmiany geometrii systemowej.

### Geometria

- `viewBox="0 0 24 24"`;
- `strokeWidth="1.75"`;
- zakończenia linii są zaokrąglone;
- kolor jest dziedziczony przez `currentColor`;
- SVG ma `focusable="false"` i nie wchodzi samodzielnie do kolejności Tab.

### Role semantyczne

#### Ikona dekoracyjna

- używana obok widocznej etykiety;
- ma `aria-hidden="true"`;
- nie ma `role="img"` ani dostępnej nazwy.

#### Ikona informacyjna

- samodzielnie przekazuje znaczenie;
- ma `role="img"`;
- otrzymuje nazwę przez element `<title>` i `aria-labelledby`.

### Rozmiary

- `16 px` — metadane i informacje pomocnicze;
- `20 px` — przyciski, menu, listy i nawigacja;
- `24 px` — nagłówki paneli, landmarki i ważne punkty orientacyjne.

Te trzy rozmiary są demonstrowane wyłącznie przez ownera `00.13`. Historie 05, 15 i 18 mogą konsumować `Icon`, ale nie tworzą lokalnej sekcji rozmiarów. Akcje danych używają istniejącej roli `data`, a akcje Papa istniejącej roli `assistant`; widoczna etykieta nadal pozostaje źródłem dostępnej nazwy akcji.

### Katalog

Katalog grupuje ikony według zadania:

- nawigacja;
- analityka;
- integracje;
- operacje;
- status.

Grupa nie zmienia komponentu ani jego geometrii. Kolor grupy jest kontekstem demonstracyjnym opartym na tokenach semantycznych.

### Storybook i testy

Story `Ikony` pokazuje:

1. język ikon i parametry geometrii;
2. role dekoracyjną i informacyjną;
3. rozmiary `16`, `20`, `24`;
4. zamknięty katalog według zadań;
5. light/dark przez global Storybooka;
6. wspólny shell Fundamentów.

Play test sprawdza:

- `focusable="false"`;
- `role="img"` i `aria-labelledby` dla ikony informacyjnej;
- obecność dostępnego `<title>`;
- `stroke="currentColor"`;
- `aria-hidden="true"` i brak roli dla ikony dekoracyjnej;
- szerokości SVG dla rozmiarów `16`, `20`, `24`;
- obecność wszystkich ikon katalogu.

`check-storybook-presentation-contract.mjs` blokuje:

- lokalny `pageStyle`;
- lokalny gradient canvasu;
- brak importu wspólnego CSS Fundamentów;
- brak klas wspólnego shellu `pd-f0-*`.

### Kryteria akceptacji

1. Grafika, geometria, katalog i publiczne API ikon pozostają bez zmian przy korektach prezentacji Storybooka.
2. Tło, typografia i układ strony są identyczne z zaakceptowanym shellem Fundamentów.
3. Znaczenie ikon nie zależy wyłącznie od koloru.
4. Role dekoracyjne i informacyjne zachowują poprawną semantykę.
5. Play, axe, typecheck, build Storybooka i guard prezentacji przechodzą.

<a id="sekcja-10-12-data-i-zakres-czasu"></a>

## Data i zakres czasu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.12 |
| Nazwa polska | Data i zakres czasu |
| Nazwa techniczna | data-i-zakres-czasu |
| Typ dokumentu | indeks rodziny komponentów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel i decyzja docelowa

„Data i zakres czasu” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | stan domyślny | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
data-i-zakres-czasu
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

- Title: `10 Komponenty bazowe/Data i zakres czasu`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: planowane, chyba że ścieżka została potwierdzona w inwentarzu snapshotu.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.
