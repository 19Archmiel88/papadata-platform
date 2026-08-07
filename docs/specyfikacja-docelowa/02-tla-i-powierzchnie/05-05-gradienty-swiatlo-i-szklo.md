---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-C87562F9E702
status: approved-target
updated_at: 2026-08-07T00:00:00+02:00
---

# Gradienty, światło i szkło

## Rola Laboratorium i handoff
`05.05` jest miejscem oceny efektów, nie ich drugim standardem. Zaakceptowane reguły głębi i warstw są promowane do `00.08 — Głębia i warstwy`; ograniczenia AppShell pozostają własnością powłoki produktu.

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

AppShell używa jednego kanonicznego ambient canvasu opartego na `--pd-canvas-gradient`. Lokalne powierzchnie AppShell nie tworzą własnych dekoracyjnych gradientów, glow, halo ani glassmorphismu. Pozostały efekt wizualny jest dopuszczony tylko wtedy, gdy ma konkretną rolę.

## Stan prototypu Storybook 05.05

Historia rozdziela:

- kanoniczny ambient canvas aplikacji oparty na `--pd-canvas-gradient`;
- kontrolowany gradient zasobu marki;
- gradient wizualizacji kodujący dane;
- scrim warstwy;
- techniczny cień rzeczywistego overlayu;
- neutralną powierzchnię wynikającą z proporcji, typografii, rytmu i jakości danych;
- odrzucony dekoracyjny chaos.

Light i dark zachowują tę samą geometrię i nie używają neonowego halo. Globalny canvas korzysta z `--pd-canvas` oraz `--pd-canvas-gradient`, a lokalne powierzchnie nadal używają semantycznych tokenów `--pd-surface`, `--pd-text`, `--pd-separator` i `--pd-surface-subtle`. Atrybut `data-theme` zmienia wartości tokenów zamiast wprowadzać lokalne kolory HEX. Cień występuje wyłącznie w przykładzie rzeczywistej warstwy. Powierzchnie AppShell pozostają nieprzezroczyste, bez blur i glass.

## Decyzja dotycząca glass

Na powierzchniach i kontrolkach AppShell glass, blur i glow są jednoznacznie zabronione. Kanoniczny ambient canvas nie jest glassmorphismem i nie używa blur ani halo. Dokumentacja nie ustanawia globalnej zgody na glassmorphism poza AppShell. Story oznacza ten obszar jako `BRAK DECYZJI W DOKUMENTACJI` i nie rozszerza efektu na inne komponenty.

## Reguły

- `--pd-canvas-gradient` jest jednym kanonicznym ambientowym tłem całej aplikacji
- lokalne powierzchnie AppShell nie definiują własnych dekoracyjnych gradientów
- gradient zasobu marki jest dopuszczony wyłącznie w kontrolowanym kontekście marki
- gradient wizualizacji używa semantyki danych i koduje konkretną informację
- overlay używa scrim i technicznego cienia
- cień nie zastępuje semantycznej warstwy
- tło nie obniża czytelności treści ani widoczności focus ring
- jakość neutralnej powierzchni wynika z proporcji, danych, typografii i rytmu
- brak dekoracyjnego glass, glow i halo na powierzchniach AppShell

## Warianty wymagane przez katalog

- ambient canvas aplikacji
- gradient marki
- gradient danych
- scrim
- techniczna głębia overlay
- neutralna powierzchnia
- zakaz dekoracyjnego chaosu
- light/dark

## Storybook i odbiór

Przed akceptacją wymagane są: typecheck, Storybook build, checki katalogu/architektury/taksonomii, Foundation verification, `git diff --check`, desktop light/dark, kontrola kontrastu i focusu, potwierdzenie braku blur/glass/glow w dozwolonych przykładach oraz brak poziomego overflow. Historia ma status `accepted`.

BRAK DECYZJI W DOKUMENTACJI: zastosowanie glassmorphism poza AppShell wymaga osobnego kontraktu i świadomej akceptacji. 05.05 nie ustanawia takiej reguły.
