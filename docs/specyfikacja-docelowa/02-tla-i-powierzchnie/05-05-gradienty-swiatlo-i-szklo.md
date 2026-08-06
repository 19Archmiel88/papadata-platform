---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-C87562F9E702
status: approved-target
updated_at: 2026-08-06T00:00:00+02:00
---

# Gradienty, światło i szkło

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.05 |
| Nazwa polska | Gradienty, światło i szkło |
| Nazwa techniczna | gradienty-swiatlo-i-szklo |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status implementacji | PROTOTYP STORYBOOK — REVIEW |
| Status Storybooka | decyzje funkcjonalne desktop light/dark |
| Status testów | dedykowane interaction/play i utrwalone axe: `not_started` |

## Decyzja docelowa

Dekoracyjne gradienty, glow i glassmorphism są zabronione w AppShell. Efekt wizualny jest dopuszczony tylko wtedy, gdy ma konkretną rolę.

## Stan prototypu Storybook 05.05

Historia rozdziela:

- kontrolowany gradient zasobu marki;
- gradient wizualizacji kodujący dane;
- scrim warstwy;
- techniczny cień rzeczywistego overlayu;
- powierzchnię premium wynikającą z proporcji, typografii i rytmu;
- odrzucony dekoracyjny chaos.

Light i dark zachowują tę samą geometrię i nie używają neonowego halo. Próbki obu motywów korzystają z tych samych tokenów semantycznych `--pd-surface`, `--pd-text`, `--pd-separator` i `--pd-surface-subtle`; atrybut `data-theme` zmienia wartości tokenów zamiast wprowadzać lokalne kolory HEX. Cień występuje wyłącznie w przykładzie rzeczywistej warstwy. AppShell pozostaje nieprzezroczysty, bez blur i glass.

## Decyzja dotycząca glass

W AppShell glass, blur i glow są jednoznacznie zabronione. Dokumentacja nie ustanawia globalnej zgody na glassmorphism poza AppShell. Story oznacza ten obszar jako `BRAK DECYZJI W DOKUMENTACJI` i nie rozszerza efektu na inne komponenty.

## Reguły

- gradient tylko dla marki albo wizualizacji, gdy koduje konkretną rolę
- overlay używa scrim i technicznego cienia
- cień nie zastępuje semantycznej warstwy
- tło nie obniża kontrastu ani widoczności focus ring
- surface premium wynika z proporcji, danych, typografii i rytmu
- brak dekoracyjnego glass, glow, halo i przypadkowego gradientu w AppShell

## Warianty wymagane przez katalog

- gradient marki
- gradient danych
- scrim
- techniczna głębia overlay
- powierzchnia premium
- zakaz dekoracyjnego chaosu
- light/dark

## Storybook i odbiór

Przed akceptacją wymagane są: typecheck, Storybook build, checki katalogu/architektury/taksonomii, Foundation verification, `git diff --check`, desktop light/dark, kontrola kontrastu i focusu, potwierdzenie braku blur/glass/glow w dozwolonych przykładach oraz brak poziomego overflow. Historia pozostaje `review`.

BRAK DECYZJI W DOKUMENTACJI: zastosowanie glassmorphism poza AppShell wymaga osobnego kontraktu i świadomej akceptacji. 05.05 nie ustanawia takiej reguły.
