---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Stany i wzorce przekrojowe

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-18-01-uklad-strony-i-sekcji"></a>

## Układ strony i sekcji

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.01 |
| Nazwa polska | Układ strony i sekcji |
| Nazwa techniczna | uklad-strony-i-sekcji |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P0 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Układ strony i sekcji` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec pokazuje nagłówek strony, nagłówek sekcji, region treści, podział treści i relację lista-szczegół jako otwarty układ oparty o semantyczne regiony, typografię, rytm i separatory.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

### Anatomia

```text
uklad-strony-i-sekcji
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

### Komponenty składowe

- StoryPresentationPage
- StoryPresentationSection
- StoryPresentationMeta
- InlineNotice
- SectionNavigation
- StatusBadge
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Nagłówek strony | Nagłówek strony ustawia kontekst, status i akcję bez osobnego kontenera. | Storybook + fixture |
| 2 | Region treści | Regiony są nazwane i dostępne jako semantyczne sekcje. | Storybook + fixture |
| 3 | Podział treści | Treść i region poboczny są rozdzielone rytmem oraz linią, nie kartami. | Storybook + fixture |
| 4 | Relacja lista-szczegół | Wybór w SectionNavigation zmienia szczegół bez przeładowania strony i oznacza aktywną pozycję przez `aria-current`. | Storybook + fixture |

### Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, SectionNavigation, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Układ strony i sekcji`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/PageSectionLayout.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Play test sprawdza heading, main landmark, nazwane regiony, `aria-current` w SectionNavigation i zmianę szczegółu.
2. Audyt Storybook obejmuje 1440, 768, 390 oraz zoom 200%.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-02-empty-error-i-no-access"></a>

## Routing feedbacku

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.02 |
| Nazwa polska | Routing feedbacku |
| Nazwa techniczna | routing-feedbacku |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Routing feedbacku` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec porządkuje stan pusty, brak wyników, brak danych operacyjnych poza wykresem, błąd, blokadę procesu, brak dostępu, brak uprawnienia w planie i ponowienie przez istniejące komponenty feedback.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

Analityczne stany danych dla ChartFrame i wykresów, w tym `noData`, `partial`, `stale`, `delayed`, `blocked`, `error` i `unavailable`, pozostają własnością `15.08 / ChartDataState`. 18.02 routuje wyłącznie ogólne powierzchnie feedbacku poza kanoniczną ramą wykresu.

### Anatomia

```text
empty-error-i-no-access
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo ścieżka naprawy
└── dowód Storybook / fixture / audyt
```

### Komponenty składowe

- EmptyState
- ErrorState
- InlineNotice
- TextAction

Wzorzec używa istniejących komponentów bazowych. Akcje przyciskowe pochodzą z `EmptyState`, `ErrorState` i `InlineNotice`; story nie importuje lokalnego zamiennika `Button`. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Stan pusty / brak wyników / brak danych operacyjnych | Stany bez danych poza wykresem używają EmptyState i nie udają błędu systemu ani stanu `15.08 / ChartDataState`. | Storybook + fixture |
| 2 | Error | Tylko ErrorState tworzy realny alert i akcję ponowienia. | Storybook + fixture |
| 3 | Blokada / brak dostępu | Blokada i brak dostępu są jawne, ale nie używają fałszywego role alert. | Storybook + fixture |
| 4 | Brak uprawnienia w planie | Brak pakietu produktowego jest oddzielony od awarii źródła. | Storybook + fixture |

### Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.
- Story nie tworzy drugiego słownika analitycznych stanów danych; ten kontrakt pozostaje w `15.08 / ChartDataState`.
- Widoczne akcje w story muszą mieć realny lokalny efekt w play/smoke albo zostać usunięte.

### Storybook

- Title: `18 Wzorce interfejsu/Routing feedbacku`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/FeedbackStates.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Play test sprawdza realny ErrorState alert, pojedynczą rolę alertu, ponowienie oraz niealertowe akcje dostępu/planu.
2. Fixture nie deklaruje focus restoration ani live region bez pokrycia.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-03-ladowanie-danych-i-operacje-w-tle"></a>

## Ładowanie danych i operacje w tle

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.03 |
| Nazwa polska | Ładowanie danych i operacje w tle |
| Nazwa techniczna | ladowanie-danych-i-operacje-w-tle |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Ładowanie danych i operacje w tle` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec pokazuje ładowanie, kolejkę, operację w toku, częściowe zakończenie, anulowanie i ponowienie przez Skeleton, Spinner, Button loading, BackgroundOperationItem i ProgressIndicator.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

### Anatomia

```text
ladowanie-danych-i-operacje-w-tle
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo ścieżka naprawy
└── dowód Storybook / fixture / audyt
```

### Komponenty składowe

- Skeleton
- Spinner
- Button
- BackgroundOperationItem
- ProgressIndicator
- InlineNotice
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Ładowanie | Skeleton stabilizuje region, a Spinner komunikuje rzeczywisty role status. | Storybook + fixture |
| 2 | Kolejka / operacja w toku | Operacje w tle pokazują status i postęp bez blokowania strony. | Storybook + fixture |
| 3 | Częściowe zakończenie / anulowanie | Częściowe zakończenie i anulowanie są odróżnione od błędu. | Storybook + fixture |
| 4 | Ponowienie | Ponowienie występuje tylko jako realna akcja przy operacji failed. | Storybook + fixture |

### Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Ładowanie danych i operacje w tle`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/LoadingOperations.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Play test sprawdza Spinner, pasek postępu, realne anulowanie i realną akcję Ponów import.
2. Nie ma deklaracji fikcyjnego live region poza komponentami, które same go renderują.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-04-tabela-z-filtrami-i-akcjami"></a>

## Tabela z filtrami i akcjami

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.04 |
| Nazwa polska | Tabela z filtrami i akcjami |
| Nazwa techniczna | tabela-z-filtrami-i-akcjami |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Tabela z filtrami i akcjami` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec używa DataTable jako kanonicznej powierzchni danych oraz FilterBar, SearchField, Select i SortControl dla realnego stanu wyszukiwania, filtrowania, sortowania i akcji wiersza.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

### Anatomia

```text
tabela-z-filtrami-i-akcjami
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

### Komponenty składowe

- FilterBar
- SearchField
- Select
- SortControl
- SegmentedControl
- Checkbox
- DataTable
- StatusBadge
- Button

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Wyszukiwanie / filtrowanie / sortowanie | Kontrolki zmieniają stan story i wynik DataTable; sortowaniem steruje SortControl. | Storybook + fixture |
| 2 | Akcje wiersza | Akcja wiersza przechodzi przez DataTable actions menu. | Storybook + fixture |
| 3 | Akcje zbiorcze | Zbiorcza akcja pokazuje licznik zaznaczeń należący do widoku; brak lokalnych atrap checkboxów. | Storybook + fixture |
| 4 | DataTable | Tabela pozostaje jedyną cięższą powierzchnią danych. | Storybook + fixture |

### Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Tabela z filtrami i akcjami`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/FilteredTableActions.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Play test sprawdza wyszukiwanie, filtr statusu, SortControl, akcję wiersza, akcję zbiorczą oraz ustawienia widoku tabeli.
2. DataTable zachowuje własny scroll dla szerokich kolumn.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-05-potwierdzenia-i-operacje-destrukcyjne"></a>

## Potwierdzenia i operacje destrukcyjne

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.05 |
| Nazwa polska | Potwierdzenia i operacje destrukcyjne |
| Nazwa techniczna | potwierdzenia-i-operacje-destrukcyjne |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Potwierdzenia i operacje destrukcyjne` |
| Status produkcyjny | `not_started` — zakres pattern-only |
| Status testów | `passing` — fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec pokazuje świadome potwierdzenie operacji destrukcyjnej przez realny `AlertDialog` i `Button`. Story rozdziela otwarcie potwierdzenia, jasny opis skutku, anulowanie, zamknięcie Escape z powrotem focusu oraz potwierdzenie destrukcyjnej akcji.

Zakres jest Storybook/pattern-only. Dokument nie dodaje approval, OTP, MFA, typed confirmation ani domenowego endpointu wykonania operacji.

### Anatomia

```text
potwierdzenia-i-operacje-destrukcyjne
├── opis operacji i skutku
├── akcja otwarcia potwierdzenia
├── AlertDialog z opisem skutku
├── anulowanie lub destrukcyjne potwierdzenie
└── status decyzji użytkownika
```

### Komponenty składowe

- AlertDialog
- Button
- InlineNotice
- StatusBadge

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Otwarcie potwierdzenia | Przycisk otwiera `AlertDialog` z rolą `alertdialog`. | Storybook + play |
| 2 | Jasny opis skutku | Treść dialogu opisuje konsekwencję dla integracji i synchronizacji danych. | Storybook + play |
| 3 | Anulowanie | Akcja anulowania zamyka dialog i nie wykonuje operacji. | Storybook + play |
| 4 | Escape i focus restore | Escape zamyka realny overlay, a focus wraca do przycisku otwarcia. | Storybook + play |
| 5 | Destrukcyjne potwierdzenie | Potwierdzenie używa wariantu destrukcyjnego i zapisuje wynik w stanie story. | Storybook + play |

### Poza zakresem

- typed confirmation;
- OTP, MFA albo reauthentication;
- approval lub drugi approver;
- loading/result z domenowego endpointu;
- publiczny flow produkcyjny.

### Kontrakt UI

- Story nie tworzy lokalnego zamiennika `AlertDialog`, `Dialog` ani `Button`.
- AlertDialog jest jedyną warstwą potwierdzenia.
- Znaczenie ryzyka nie jest komunikowane wyłącznie kolorem.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Potwierdzenia i operacje destrukcyjne`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DestructiveConfirmations.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.
- Production status: not_started.

### Testy i kryteria akceptacji

1. Play test otwiera AlertDialog, sprawdza opis skutku, anuluje, zamyka Escape, sprawdza focus restore i potwierdza operację destrukcyjną.
2. Fixture deklaruje tylko PL i kroki realnie pokryte w play/audycie.
3. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-06-approval-step-up-i-ochrona-zmian"></a>

## Approval, step-up i ochrona zmian

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.06 |
| Nazwa polska | Approval, step-up i ochrona zmian |
| Nazwa techniczna | approval-step-up-i-ochrona-zmian |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Approval, step-up i ochrona zmian` |
| Status produkcyjny | `not_started` — zakres pattern-only |
| Status testów | `passing` — fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec pokazuje dodatkowy warunek autoryzacji przed dopuszczeniem zmiany chronionej. `ApprovalPanel` prezentuje `subjectId`, `subjectLabel`, `risk`, listę approverów i `expiresAt`; akcja pozostaje zablokowana, dopóki approval nie jest zatwierdzony.

18.06 nie jest potwierdzeniem operacji. 18.05 odpowiada na pytanie „czy na pewno wykonać operację?”, a 18.06 odpowiada „czy warunek autoryzacji/approval jest spełniony?”.

### Anatomia

```text
approval-step-up-i-ochrona-zmian
├── opis zmiany chronionej
├── ApprovalPanel
├── status pending / approved / rejected
├── ryzyko, approverzy i wygaśnięcie
└── akcja zablokowana do spełnienia warunku
```

### Komponenty składowe

- ApprovalPanel
- Button
- InlineNotice
- StatusBadge

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Pending approval | Jeden approver oczekuje, a akcja chroniona jest disabled. | Storybook + play |
| 2 | Approved approval | Wszyscy approverzy zatwierdzili zmianę, a akcja jest dostępna. | Storybook + play |
| 3 | Rejected approval | Odrzucony approval blokuje akcję i pokazuje krytyczny komunikat. | Storybook + play |
| 4 | Ryzyko i wygaśnięcie | Panel pokazuje ryzyko wysokie oraz termin wygaśnięcia approval. | Storybook + play |
| 5 | Blokada akcji | Button pozostaje zablokowany do spełnienia warunku. | Storybook + play |

### Poza zakresem

- reauthentication, MFA i step-up UI;
- lokalny flow 25.09;
- potwierdzenie destrukcyjne z 18.05;
- approval backendowy lub domenowy endpoint wykonania zmiany.

Step-up ma handoff do 25.09 i wymaga osobnego właściciela procesu. Ten dokument nie udaje MFA ani ponownego uwierzytelnienia.

### Kontrakt UI

- Story nie tworzy lokalnego zamiennika `ApprovalPanel`.
- Status approval jest jawny tekstowo, nie wyłącznie kolorem.
- Akcja chroniona jest widoczna, lecz niedostępna do spełnienia warunku.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Approval, step-up i ochrona zmian`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/ApprovalProtection.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.
- Production status: not_started.

### Testy i kryteria akceptacji

1. Play test sprawdza pending, approved, rejected, blokadę przycisku i wykonanie akcji dopiero po approval.
2. Fixture deklaruje tylko PL i kroki realnie pokryte w play/audycie.
3. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-07-panele-szczegolow-dowodow-i-rekomendacji"></a>

## Panele szczegółów, dowodów i rekomendacji

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.07 |
| Nazwa polska | Panele szczegółów, dowodów i rekomendacji |
| Nazwa techniczna | panele-szczegolow-dowodow-i-rekomendacji |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec używa Drawer jako realnej warstwy panelu oraz Tabs dla szczegółów, dowodów i rekomendacji. To jedyna semantycznie uzasadniona zamknięta powierzchnia w zakresie 18.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

### Anatomia

```text
panele-szczegolow-dowodow-i-rekomendacji
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

### Komponenty składowe

- Drawer
- Tabs
- DataList
- StatusBadge
- Button
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Detail panel | Drawer pokazuje szczegóły decyzji bez lokalnego panelu zastępczego. | Storybook + fixture |
| 2 | Evidence panel | Dowody są listą z metadanymi źródeł. | Storybook + fixture |
| 3 | Recommendation panel | Rekomendacja pokazuje decyzję i ograniczenia. | Storybook + fixture |
| 4 | Escape / focus restore | Play test otwiera Drawer, zamyka Escape i sprawdza powrót focusu. | Storybook + fixture |

### Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DetailEvidenceRecommendationPanels.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Play test sprawdza akcję kontekstową, dialog, Tabs, Escape close i focus restoration.
2. Story kończy z otwartym panelem rekomendacji do screenshotu.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-08-status-danych-i-readiness"></a>

## Readiness operacyjny

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.08 |
| Nazwa polska | Readiness operacyjny |
| Nazwa techniczna | readiness-operacyjny |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Readiness operacyjny` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec pokazuje przekrojową gotowość operacyjną przez StatusBadge, InlineNotice i listy separatorowe. Stany danych wykresów analitycznych pozostają własnością 15.08 ChartDataState.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

### Anatomia

```text
status-danych-i-readiness
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo ścieżka naprawy
└── dowód Storybook / fixture / audyt
```

### Komponenty składowe

- StatusBadge
- InlineNotice

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Gotowe / synchronizacja | Gotowość i synchronizacja są widoczne przekrojowo. | Storybook + fixture |
| 2 | Opóźnienie procesu / zakres częściowy / do odświeżenia | Ograniczenia procesu danych są opisane jako wpływ na decyzję, bez przejmowania stanów 15.08. | Storybook + fixture |
| 3 | Zablokowane / niedostępne | Blokada i niedostępność są oddzielone od zwykłego ładowania. | Storybook + fixture |
| 4 | Wymaga działania | Status wskazuje potrzebny następny krok klienta. | Storybook + fixture |

### Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Readiness operacyjny`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DataReadinessStatus.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Play test sprawdza listę statusów i handoff do 15.08 ChartDataState.
2. analytics-system-v1.json pozostaje bez zmian.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-09-formularze-zlozone-i-kreatory"></a>

## Formularze złożone i kreatory

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.09 |
| Nazwa polska | Formularze złożone i kreatory |
| Nazwa techniczna | formularze-zlozone-i-kreatory |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Formularze złożone i kreatory` |
| Status produkcyjny | `not_started` — zakres pattern-only |
| Status testów | `passing` — fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec pokazuje wieloetapowy formularz złożony z istniejących komponentów: `TextField`, `Select`, `Checkbox`, `Dialog`, `Button` i `InlineNotice`. Story obejmuje sekwencję kroków, walidację pól wymaganych, zapis szkicu, dialog zmian niezapisanych oraz wysłanie konfiguracji.

Zakres jest Storybook/pattern-only. Dokument nie tworzy publicznego komponentu `Wizard`, nie definiuje nowych inputów i nie deklaruje server validation bez kontraktu backendowego.

### Anatomia

```text
formularze-zlozone-i-kreatory
├── wskaźnik kroków
├── pola formularzowe z 00.15
├── walidacja i status szkicu
├── Dialog zmian niezapisanych
└── przegląd i wysłanie
```

### Komponenty składowe

- TextField
- Select
- Checkbox
- Dialog
- Button
- InlineNotice

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Sekwencja kroków | Story przechodzi przez dane podstawowe, warunki i przegląd. | Storybook + play |
| 2 | Walidacja | Próba przejścia bez wymaganych danych pokazuje summary i komunikaty pól. | Storybook + play |
| 3 | Zmiany niezapisane | Anulowanie brudnego formularza otwiera realny `Dialog`. | Storybook + play |
| 4 | Zapis szkicu | Akcja zapisuje stan story bez deklarowania backendu. | Storybook |
| 5 | Submit processing | `Button.loading` pokazuje wysyłanie i końcowy status. | Storybook + play |

### Poza zakresem

- publiczny komponent `Wizard`;
- server validation i partial recovery bez kontraktu backendowego;
- routing resume flow;
- nowe komponenty inputów.

### Kontrakt UI

- Story używa wyłącznie istniejących pól i kontrolek zgodnych z 00.15.
- Sekwencja kroków jest kompozycją story, nie nowym publicznym API.
- Dialog zmian niezapisanych korzysta z runtime `Dialog`.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

### Storybook

- Title: `18 Wzorce interfejsu/Formularze złożone i kreatory`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/ComplexFormsWizards.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.
- Production status: not_started.

### Testy i kryteria akceptacji

1. Play test sprawdza walidację, uzupełnienie TextField, wybór Select, Checkbox, przejście do przeglądu, Dialog zmian niezapisanych i submit.
2. Fixture deklaruje tylko PL i kroki realnie pokryte w play/audycie.
3. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-10-macierz-stanow-przekrojowych"></a>

## Macierz stanów przekrojowych

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.10 |
| Nazwa polska | Macierz stanów przekrojowych |
| Nazwa techniczna | macierz-stanow-przekrojowych |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Macierz stanów przekrojowych` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

### Cel i realny zakres

Macierz przypisuje rodziny stanów do powierzchni i właścicieli przez DataTable oraz lekką listę zasad, bez ściany checklist ani lokalnych kart.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

Domenowa gotowość procesu danych pozostaje przy domenach danych i integracji. Analityczne stany prezentacyjne `noData`, `partial`, `stale` i `delayed` pozostają przy `15.08 / ChartDataState`.

### Anatomia

```text
macierz-stanow-przekrojowych
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

### Komponenty składowe

- DataTable
- InlineNotice
- StatusBadge

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Rodziny stanów | Uniwersalne, dane, dostęp, billing, AI, operacje i integracje są widoczne w DataTable. | Storybook + fixture |
| 2 | Statusy | Gotowość rodzin stanów używa neutralnego StatusBadge w kolumnie statusu. | Storybook + fixture |
| 3 | Zasady | Przypisanie stanu opisuje semantykę, powierzchnię i recovery. | Storybook + fixture |
| 4 | Brak duplikacji | Macierz nie zastępuje właścicieli komponentów, gotowości procesu danych ani kontraktów 15.*. | Storybook + fixture |

### Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.
- Story nie implementuje lokalnego sortowania; workflow sortowania pozostaje w `18.04`.
- Pierwsza kolumna DataTable jest nagłówkiem wiersza przez `rowHeaderColumnId="family"`, a poziomy scroll pozostaje własnością `DataTable/Table`.

### Storybook

- Title: `18 Wzorce interfejsu/Macierz stanów przekrojowych`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/CrossStateMatrix.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Play test sprawdza tabelę macierzy, nagłówek wiersza i listę zasad.
2. Audyt Storybook obejmuje viewporty i zoom dla tej story.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.

<a id="sekcja-18-11-data-decision-workspace"></a>

## DataDecisionWorkspace

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.11 |
| Nazwa polska | Przestrzeń decyzji danych |
| Nazwa techniczna | data-decision-workspace |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Product UI |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/DataDecisionWorkspace` |
| Status testów | fixture + audit dopasowane do realnej implementacji |

### Cel i realny zakres

Wzorzec pokazuje produktową kompozycję decyzji: obszar danych w ChartFrame, TrendChart, alternatywę DataTable, rekomendację, sidecar Papa Asystenta i toast operacyjny. `18.11` nie tworzy nowych tokenów, statusów, powierzchni ani lokalnych wariantów komunikatów. Źródłem zasad wizualnych pozostaje `00`, właścicielem wykresów i danych pozostaje `15`, a workflow tabeli należy do `18.04`.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu i nie zmienia ownerów `00`, `15` ani istniejącego runtime API.

### Anatomia

```text
data-decision-workspace
├── canvas aplikacji z metrykami
├── powierzchnia danych z wykresem i tabelą
├── panel rekomendacji jako warstwa pomocnicza
├── sidecar Papa Asystenta bez scrimu
└── toast operacyjny bez zmiany layoutu
```

### Komponenty składowe

- ChartFrame
- TrendChart
- DataTable
- InlineNotice
- StatusBadge
- Toast

Wzorzec konsumuje fundamenty z `00` i komponenty z `15`/runtime. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do decyzji kompozycyjnej tej story.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Dane jako główny obszar pracy | ChartFrame utrzymuje powierzchnię danych, TrendChart renderuje wykres, a DataTable jest alternatywą tabelaryczną. | Storybook + fixture |
| 2 | Rekomendacja | Warstwa pomaga w decyzji i nie zastępuje danych. | Storybook + fixture |
| 3 | Papa Asystent | Sidecar jest panelowy, bez scrimu i bez przejmowania ownerstwa komunikatów. | Storybook + fixture |
| 4 | Toast | Potwierdza operację i nie zmienia układu strony. | Storybook + fixture |

### Kontrakt UI

- `00` jest jedynym źródłem prawdy dla canvasu, powierzchni, głębi, akcji, komunikatów, statusu i koloru.
- `15` jest właścicielem wykresów i danych analitycznych.
- `18.11` pokazuje tylko realny układ pracy, bez lokalnego systemu komponentów.
- Story nie tworzy drugiego Button, DataTable, StatusBadge, InlineNotice, Toast, Drawer ani OverlayRoot.

### Storybook

- Title: `18 Wzorce interfejsu/DataDecisionWorkspace`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DataDecisionWorkspace.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

### Testy i kryteria akceptacji

1. Fixture wskazuje `18.11` jako wzorzec Storybook/pattern-only, a nie runtime component.
2. Play test sprawdza ChartFrame/TrendChart, rekomendację, sidecar, toast i alternatywną tabelę DataTable.
3. Audyt Storybook obejmuje viewporty i zoom dla tej story.
4. Lokalny CSS nie override'uje klas produkcyjnych ani fundamentów `00`.
5. Brak poziomego scrolla strony na mobile i przy zoom 200%.
