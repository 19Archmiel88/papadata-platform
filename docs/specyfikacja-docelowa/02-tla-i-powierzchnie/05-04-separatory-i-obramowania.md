---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-4AF5EFAB439D
status: approved-target
updated_at: 2026-08-06T00:00:00+02:00
---

# Separatory i obramowania

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.04 |
| Nazwa polska | Separatory i obramowania |
| Nazwa techniczna | separatory-i-obramowania |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status implementacji | PROTOTYP STORYBOOK — REVIEW |
| Status Storybooka | mapa ról i zastosowań desktop light/dark |
| Status testów | dedykowane testy Storybook interaction/axe: `not_started` |

## Decyzja docelowa

Hairline divider i kontrolowana separacja są podstawowym sposobem budowania hierarchii. Active, focus i danger mają odrębne role.

## Stan prototypu Storybook 05.04

Historia pokazuje poziomy `subtle`, `default`, `strong`, `focus`, `active` i `danger`, używa poprawnego tokenu `--pd-separator-strong` i mapuje je na sekcje, topbar/sidebar, tabelę, drawer, focus oraz status krytyczny.

Mapa aplikacji demonstruje topbar, sidebar, region treści i wizualną próbkę drawera bez kart wewnątrz kart. Próbka drawera jest zwykłym kontenerem prezentacyjnym, a nie landmarkiem `aside`, ponieważ nie pełni w historii samodzielnej roli komplementarnej. Nawigacja ma lokalny aktywny stan. Antyprzykład pokazuje utratę znaczenia, gdy każdy element dostaje tę samą ciężką ramkę.

## Reguły

- `--pd-separator-subtle` dla podziałów wewnętrznych
- `--pd-separator` dla granic regionów
- `--pd-separator-strong` dla wyjątkowo mocnej granicy ważnej powierzchni
- `--pd-focus-visible` wyłącznie dla widocznego focusu
- `--pd-brand-accent` dla aktywnego wyboru
- `--pd-status-danger` dla statusu krytycznego
- danger nie jest zwykłym active border
- separator ani wizualna próbka drawera nie tworzą dodatkowego landmarku lub dekoracyjnej ramki każdego elementu

## Warianty wymagane przez katalog

- podział sekcji
- obramowania ważnych powierzchni
- podziały tabel
- separatory topbara
- separatory sidebara
- granice drawerów

## Storybook i odbiór

Przed akceptacją wymagane są: typecheck, Storybook build, checki Storybooka i Fundamentów, `git diff --check`, desktop light/dark, kontrola widocznego focusu, aktywnej nawigacji, rozróżnienia danger/active/focus, braku poziomego overflow i zgodności tokenów z `00-07-linie-i-separacja.md`. Historia pozostaje `review`.
