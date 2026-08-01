---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-C87562F9E702
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Gradienty, światło i szkło

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.05 |
| Nazwa polska | Gradienty, światło i szkło |
| Nazwa techniczna | gradienty-swiato-i-szko |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Design System Lead |
| Moduł | M02 — Design System |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Decyzja docelowa

Dekoracyjne gradienty, glow i glassmorphism są zabronione w AppShell.

## Anatomia powierzchni

```text
Surface
├── Background role
├── Content boundary
├── Optional status region
├── Interactive content
└── Overlay anchor
```

## Reguły

- dopuszczalny wyłącznie kontrolowany gradient zasobu marki lub wizualizacji
- overlay używa scrim i technicznego cienia
- tło nie obniża kontrastu
- surface premium wynika z proporcji i typografii

## Warianty wymagane przez katalog

- dopuszczalne gradienty
- subtelne światło
- powierzchnie premium
- efekt głębi
- zakaz dekoracyjnego chaosu
- warianty light/dark.

## Tokeny

`--pd-canvas`, `--pd-surface-1`, `--pd-surface-2`, `--pd-surface-3`, `--pd-border-subtle`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`.

## Responsywność

Powierzchnia nie ma stałej wysokości zależnej od desktopu. Na compact zachowuje priorytet zadania, na medium redukuje elementy drugorzędne, a na wide nie rozciąga tekstu formularzy i opisów ponad czytelną szerokość.

## Dostępność

Powierzchnia nie jest automatycznie landmarkiem. Landmark wynika z rzeczywistej roli i ma nazwę. Tło, gradient ani tekstura nie mogą obniżyć kontrastu lub utrudnić widoczności focus ring.

## Storybook i odbiór

Wymagane: light, dark, desktop, tablet, mobile, zoom 200%, high content density, empty/error oraz porównanie z antyprzykładem. Kryterium odbioru stanowi brak utraty funkcji i brak dekoracyjnych wrapperów bez odpowiedzialności.
