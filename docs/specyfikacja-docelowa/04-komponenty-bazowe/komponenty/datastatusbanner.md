---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-8CB559D2A7BB
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# DataStatusBanner

## Zastosowanie komponentu w PapaData 1.0

**Typ:** komponent bazowy.

**Odpowiedzialność szczegółowa:** `DataStatusBanner` odpowiada za komunikowanie statusów, błędów, ostrzeżeń, sukcesów, powodów blokady i działań naprawczych. W dokumentacji 1.0 komponent jest traktowany jako gotowy element kontraktu projektowego: ekran może go skonfigurować, ale nie może przejąć jego semantyki ani zduplikować jego zachowania w lokalnym kodzie.

**Dane wejściowe:** minimalny model danych komponentu obejmuje: `componentId, state, density, testId`. Dane biznesowe muszą zostać przygotowane w view modelu ekranu, a komponent otrzymuje już przetworzone wartości, status jakości danych i teksty do pokazania użytkownikowi.

**Zachowanie użytkownika:** komponent musi przewidywać stan domyślny, ładowanie, częściowe dane, błąd odzyskiwalny, brak uprawnień, tryb tylko do odczytu oraz kompaktowy układ mobilny. Reakcja na akcję użytkownika ma być jawna: albo emituje zdarzenie opisane w kontrakcie propsów, albo przekazuje kontrolę do wzorca nadrzędnego.

**Konsumenci:** komponent jest powiązany z następującymi ekranami lub uzasadnieniem katalogowym: `30.01 | 30.02 | 30.03 | 30.04 | 30.05 | 30.06 | 30.07 | 30.08`. Jeżeli nowy ekran chce użyć komponentu inaczej, najpierw aktualizuje ten dokument, macierz `ekran-komponent.csv` i Storybook.

**Odbiór:** story komponentu powinno pokazywać wariant podstawowy, długi tekst PL, błąd, empty state, loading, disabled, compact density, mobile width, light/dark oraz test klawiatury. To ogranicza ryzyko, że komponent zostanie zaprojektowany ponownie podczas implementacji ekranu.


## Opis komponentu 1.0

`DataStatusBanner` jest kanonicznym komponentem dokumentacji PapaData 1.0. Jego zadaniem jest rozwiązanie jednej, jasno nazwanej potrzeby interfejsu bez tworzenia lokalnego wariantu w konkretnym ekranie. Komponent musi być używany przez ekrany wyłącznie przez opisany kontrakt propsów, zdarzenia i stany, a wszystkie rozszerzenia wymagają aktualizacji tego dokumentu oraz macierzy komponentów.

### Rola w systemie

Komponent standaryzuje zachowanie, dostępność, stan ładowania, stan błędu, stan pusty, wariant kompaktowy i zachowanie w trybach light/dark. Nie może wprowadzać własnej palety, własnego modelu walidacji ani własnych nazw eventów telemetrycznych poza kontraktem opisanym niżej.

### Anatomia opisowa

Komponent składa się z root elementu, obszaru treści, opcjonalnych akcji, opcjonalnego statusu oraz warstwy komunikatu pomocniczego. Warianty wizualne są tylko sposobem prezentacji tej samej odpowiedzialności, a nie osobnymi komponentami.

### Zasady użycia w ekranach

Ekran wybiera wariant, dane wejściowe i akcję użytkownika, ale nie przejmuje odpowiedzialności komponentu. Jeżeli ekran potrzebuje innego układu, powinien użyć kompozycji z istniejących komponentów lub utworzyć nowy komponent domenowy przed opisem ekranu.

## Odpowiedzialność

`DataStatusBanner` jest komponentem bazowym używanym przez wiele ekranów. Definiuje jeden wspólny model semantyczny, jeden kontrakt propsów i jeden zestaw stanów. Ekran może zmienić treść, ale nie może dopisać lokalnego API komponentu.

## Jeden kanoniczny kontrakt TypeScript

Poniższy interfejs jest jedynym publicznym API komponentu. Poprzednie, ogólne kontrakty opisowe zostały zastąpione tym blokiem, aby usunąć konflikt propsów wykryty w audycie.

`Kontrakt TypeScript nie jest powielany w Markdown. Kanoniczny plik znajduje się w katalogu contracts/.`

## Props

| Prop | Typ | Wymagalność | Opis |
|---|---|---|---|
| `id` | `string` | required | stabilny identyfikator komponentu |
| `label` | `string` | required | accessible name albo tytuł |
| `variant` | `ComponentVariant` | optional | wariant semantyczny |
| `state` | `ComponentState` | optional | default/loading/error/disabled/empty |
| `density` | `Density` | optional | compact albo comfortable |
| `testId` | `string` | optional | stabilny selektor testowy |
| `onAction` | `(event: ComponentActionEvent) => void` | optional | zdarzenie interakcji |

## Wartości domyślne i controlled/uncontrolled

- Props wymagane muszą zostać dostarczone przez ekran albo nadrzędny wzorzec.
- Props opcjonalne mają domyślne zachowanie opisane w tabeli i nie mogą ukrywać reguł biznesowych.
- Stan kontrolowany jest wymagany, gdy komponent wpływa na URL, filtr, mutację, eksport albo proces E2E.
- Stan lokalny jest dopuszczalny wyłącznie dla prezentacji, hover, disclosure lub tymczasowego focusu.

## Zdarzenia

Każde zdarzenie używa `DataStatusBannerEvent`, zawiera `componentId`, nazwę akcji, opcjonalny `screenId` i `correlationId`. Payload telemetryczny nie przenosi PII, sekretów ani pełnych wartości tokenów integracyjnych.

## Stany

| Stan | Reguła |
|---|---|
| default | pełna treść i dostępny focus |
| loading | nie zmienia geometrii, blokuje tylko ryzykowną akcję |
| disabled | pokazuje przyczynę, nie ukrywa informacji |
| error | zawiera tekstowy powód, correlation ID i możliwy następny krok |
| empty | wskazuje brak danych oraz akcję naprawczą |
| compact/mobile | zachowuje funkcję podstawową bez ukrywania danych krytycznych |

## Anatomia i dostępność

Komponent ma stabilny root, jawne accessible name, obsługę keyboard/focus-visible i wariant light/dark. Ikona lub kolor nie może być jedyną informacją o statusie. Komponent nie tworzy własnych tokenów CSS i używa wyłącznie `--pd-*`.

## Zasady użycia w ekranach

Ekran może użyć komponentu tylko przez propsy z tego dokumentu. Jeżeli potrzebne jest nowe pole, event albo wariant, aktualizuje się ten kontrakt, a nie lokalny kod ekranu. Komponent nie może być swoim własnym konsumentem w macierzy zależności.

## Storybook i testy

Storybook obejmuje wariant podstawowy, loading, error, empty, disabled, długi tekst PL/EN, light/dark, compact, mobile width oraz keyboard play test. Testy sprawdzają propsy wymagane, event payload, accessible name, focus restore i brak zależności od konkretnego route.

## Konsumenci ekranowi 1.0

Konsumenci komponentu są utrzymywani w `rejestry/component-coverage.csv` oraz `rejestry/component-screen.csv`. Komponent nie jest swoim własnym konsumentem; każdy wpis wskazuje dokument ekranu albo powierzchni, w którym komponent jest używany jako zależność wcześniej opisana.

## Kryteria akceptacji 1.0

1. W dokumencie istnieje dokładnie jeden interfejs `*Props`.
2. Nie występuje drugi ogólny kontrakt `id/label/description/state/density` konkurujący z API komponentu.
3. Każdy prop ma typ, wymagalność i opis.
4. Każdy komponent ma konsumenta ekranowego albo jawne uzasadnienie w `rejestry/component-coverage.csv`.
5. Komponent działa w Storybooku jako osobna jednostka przed użyciem w ekranie.

## Konsumenci ekranowi i uzasadnienie utrzymania

Komponent ma jawne wykorzystanie w dokumentacji 1.0 albo uzasadnione utrzymanie jako składnik docelowy wymagany przez ekran/wzorzec.

| Konsument | Status | Uzasadnienie |
|---|---|---|
| `07-centrum-dowodzenia/30-01-widok-glowny.md` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |
| `30.01` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |
| `30.02` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |
| `30.03` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |
| `30.04` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |
| `30.05` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |
| `30.06` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |
| `30.07` | konsument docelowy | komponent wymagany przez kompozycję ekranu albo przez test stanu |

Jeżeli komponent nie ma jeszcze fizycznego story w snapshotcie, pozostaje kontraktem docelowym, a nie dowodem wdrożenia. Nie wolno tworzyć lokalnego duplikatu w ekranie; ekran musi odwołać się do tego dokumentu albo do nowszego komponentu zatwierdzonego w tej samej macierzy.

## Kanoniczny kontrakt TS 1.0 po audycie

Ten plik jest aliasem dokumentacyjnym i nie tworzy drugiego komponentu `DataStatusBanner`. Jedynym kanonicznym kontraktem jest `04-komponenty-domenowe/data-status-banner.md`, a kompilowany plik propsów to `contracts/components/datastatusbanner.ts`. Ekrany, macierze i testy muszą wskazywać wyłącznie kanoniczny komponent, aby uniknąć równoległych wersji odpowiedzialności.
