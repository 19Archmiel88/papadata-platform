---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-57FE6FF39170
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Tło aplikacji

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.02 |
| Nazwa polska | Tło aplikacji |
| Nazwa techniczna | to-aplikacji |
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

Canvas i region treści rozdzielają nawigację od zadania; shell nie tworzy dekoracyjnych kart.

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

- układ z sidebarem, railem, drawerem i panelem Papa
- sticky topbar na nieprzezroczystej powierzchni
- pełna szerokość dla analiz, ograniczona dla formularzy
- jawny właściciel scrolla

## Warianty wymagane przez katalog

- główne tło aplikacji
- region treści
- układ z sidebarem
- układ bez sidebara
- układ z panelem Papa
- układ compact.

## Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`.

## Responsywność

Powierzchnia nie ma stałej wysokości zależnej od desktopu. Na compact zachowuje priorytet zadania, na medium redukuje elementy drugorzędne, a na wide nie rozciąga tekstu formularzy i opisów ponad czytelną szerokość.

## Dostępność

Powierzchnia nie jest automatycznie landmarkiem. Landmark wynika z rzeczywistej roli i ma nazwę. Tło, gradient ani tekstura nie mogą obniżyć kontrastu lub utrudnić widoczności focus ring.

## Storybook i odbiór

Wymagane: light, dark, desktop, tablet, mobile, zoom 200%, high content density, empty/error oraz porównanie z antyprzykładem. Kryterium odbioru stanowi brak utraty funkcji i brak dekoracyjnych wrapperów bez odpowiedzialności.
