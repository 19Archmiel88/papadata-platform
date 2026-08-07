---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-AB3E60357706
status: accepted
updated_at: 2026-08-06T20:27:00+01:00
---

# Marka

## Source of truth
Runtime `PapaDataBrandProps` w `apps/web/src/design-system/icons/PapaDataBrand.tsx` jest publicznym API komponentu. Bazowy komponent marki nie posiada dekoracyjnego `glow`; ewentualne efekty marketingowe nie są częścią jego API. Provider logos należą do osobnej rodziny integracyjnej.

## Metadane

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
| Status Storybooka | `10 Komponenty bazowe/Marka` → `Marka` |
| Plik Storybooka | `apps/web/src/design-system/icons/PapaDataBrand.stories.tsx` |
| Status testów | PASSING — play oraz guard prezentacji |

## Cel i decyzja docelowa

`PapaDataBrand` jest jednym komponentem marki. Sygnet, wordmark i lockup nie są kopiowane do lokalnych stories ani ekranów. Zmiana wariantu wpływa na zakres znaku i semantykę dostępności, ale nie tworzy nowego stylu marki.

Story 10.01 używa dokładnie tego samego shellu prezentacyjnego co:

- `00 Fundamenty/Podstawy`;
- `05 Laboratorium decyzji/Tła i powierzchnie`;
- pozostałe zaakceptowane stories sekcji `10 Komponenty bazowe`.

Canvas, typografia, szerokość treści, guttery, rytm sekcji i separatory pochodzą z klas `pd-f0-*`. Lokalny CSS marki może stylować wyłącznie sam znak i układy demonstracyjne wewnątrz zawartości sekcji. Nie może definiować własnego canvasu, page paddingu ani drabiny typograficznej strony.

## Publiczny kontrakt

### Warianty

- `lockup` — sygnet i wordmark z dostępną nazwą;
- `mark` — sam sygnet;
- `wordmark` — sam napis PapaData;
- `decorative` — znak dekoracyjny ukryty przed technologiami asystującymi.

### Rozmiary

- `small` — nawigacja, topbar i zwarte powierzchnie;
- `medium` — domyślny lockup powłoki aplikacji;
- `large` — ekrany wejściowe i miejsca wysokiego poziomu.

### Pozostałe właściwości

- `label` określa nazwę dostępną wariantu informacyjnego;
- `decorative` wymusza semantykę dekoracyjną;
- `showMark` i `showWordmark` kontrolują części znaku w granicach publicznego kontraktu;
- Bazowy `PapaDataBrand` nie udostępnia dekoracyjnego glow; efekt nie jest częścią publicznego API.

## Geometria i kolor

- sygnet zachowuje trzy warstwy dostarczonego znaku;
- geometria SVG pozostaje `viewBox="0 0 100 100"`;
- kolor marki pochodzi z tokenów `--pd-brand`, `--pd-brand-line` i powiązanych ról semantycznych;
- story nie wprowadza lokalnych kolorów HEX ani alternatywnego tła strony;
- wariant light/dark zmienia wartości tokenów, nie strukturę komponentu.

## Dostępność

- warianty informacyjne mają `role="img"` i nazwę dostępną;
- wariant dekoracyjny ma `aria-hidden="true"` i nie ma roli ani nazwy;
- SVG jest wyłączone z sekwencji fokusu;
- zmiana motywu, gęstości i viewportu nie zmienia semantyki znaku.

## Storybook i testy

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

- lokalny canvas i gradient story 10.01;
- lokalny page padding;
- brak importu wspólnego CSS Fundamentów;
- brak klas wspólnego shellu `pd-f0-*`.

## Kryteria akceptacji

1. Sam komponent marki i jego grafika pozostają bez zmian przy korektach prezentacji Storybooka.
2. Tło, typografia i układ strony są identyczne z zaakceptowanym shellem Fundamentów.
3. Light i dark używają tych samych ról tokenowych i tej samej geometrii.
4. Wszystkie warianty zachowują poprawną semantykę dostępności.
5. Play, axe, typecheck, build Storybooka i guard prezentacji przechodzą.
