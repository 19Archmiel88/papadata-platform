---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-C6CF31340BEB
status: review
updated_at: 2026-08-06T21:48:00+01:00
---

# Pola tekstowe i formularzowe

## Source of truth

Publiczne React API jest własnością runtime w `apps/web/src/design-system/components/Field` oraz `apps/web/src/design-system/components/VerificationCodeInput`. Aktywnym ownerem Storybooka jest `00.15 — Pola tekstowe i formularzowe`. Ten dokument zostaje kontraktem runtime/reference.

## Metadane

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

## Cel i decyzja docelowa

Runtime rodziny pól jest jednym kontraktem wejść danych, a `00.15` jest jedyną aktywną prezentacją Storybooka. Nie tworzy lokalnego wyglądu formularza i nie kopiuje komponentów do Auth, Laboratorium ani ekranów domenowych.

Story używa dokładnie tego samego shellu prezentacyjnego co:

- `00 Fundamenty/01 Fundamenty wizualne`;
- `00 Fundamenty/02 Powierzchnie i komunikaty`;
- `00.14 Przyciski i akcje`.

Lokalny `field-family-showcase.css` może odpowiadać wyłącznie za szerokość i reflow przykładów. Nie może zmieniać canvasu, drabiny typograficznej, sekcji ani wyglądu komponentów.

## Zakres runtime

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

## Wspólna anatomia

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

## Kontrakt wizualny

- geometria, spacing, typografia, powierzchnia i focus wynikają z Fundamentów;
- focus stosuje dokładnie wzorzec z `05.02 Tło aplikacji` → `Formularz` → `Kontrolowana długość linii` (`Nazwa raportu`, `Zakres`): pojedynczy zewnętrzny outline i ring na właścicielu `pd-form-control`; wewnętrzny input, password, textarea, file input ani pole kodu nie może renderować drugiej poziomej linii;
- wszystkie pola używają wspólnych klas `pd-form-field`, `pd-form-control` i meta regionu;
- `Textarea` rozszerza powierzchnię pionowo bez nowej estetyki;
- `FileInput` zachowuje natywną semantykę `input type="file"` i tokenowy przycisk wyboru pliku;
- `PasswordField` dodaje wyłącznie kontrolę widoczności, siłę i wymagania;
- `VerificationCodeInput` dodaje wizualizację slotów bez automatycznego submitu;
- lokalne story nie może nadpisywać produkcyjnych selektorów pól.

## Decyzja wizualna — fokus bez poziomej linii

Właściciel produktu odrzucił poziomą niebieską linię pojawiającą się wewnątrz `PasswordField` i `Textarea`. Wzorzec referencyjny stanowią surowe pola demonstracyjne w `05.02 Tło aplikacji`, sekcja `Formularz` → `Kontrolowana długość linii`: `Nazwa raportu` i `Zakres`.

Kontrakt obowiązujący dla całej rodziny pól:

1. fokus jest prezentowany wyłącznie na zewnętrznym właścicielu `.pd-form-control`;
2. wewnętrzna kontrolka ma `border: 0`, `outline: 0`, `background-image: none` i `box-shadow: none` zarówno dla `:focus`, jak i `:focus-visible`;
3. zabronione są focus underline realizowane przez `border-bottom`, inset shadow, gradient albo `scaleX`;
4. fokus nie może zmieniać geometrii kontrolki;
5. treść, walidacja, helper text, przycisk widoczności hasła i pozostałe zachowania komponentów pozostają bez zmian.

## Stany

- default;
- focus-visible;
- required;
- error;
- valid;
- disabled;
- read-only.

Zmiana stanu nie może zmieniać szerokości ani podstawowej geometrii kontrolki.

## Interakcje i dostępność

- każda kontrolka ma powiązaną etykietę;
- helper i message są podłączone przez `aria-describedby`;
- error ustawia `aria-invalid="true"`;
- required korzysta z natywnego `required`;
- read-only korzysta z natywnego `readOnly`;
- disabled blokuje interakcję;
- przycisk widoczności hasła ma dostępną nazwę i `aria-controls`;
- kod weryfikacyjny pozostaje jednym polem tekstowym dla technologii asystujących;
- file input pozostaje natywną kontrolką pliku.

## Storybook i testy

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

## Status odbioru

Implementacja i dokumentacja są przygotowane do review. Status nie może zostać zmieniony na `accepted` ani `passing` przed:

- typecheckiem;
- buildem Storybooka;
- przejściem play i axe;
- kontrolą light/dark, PL/EN, desktop, reflow i zoom 200%;
- wizualną akceptacją właściciela produktu.
