---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-D841F3044B90
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Tło Auth

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.01 |
| Nazwa polska | Tło Auth |
| Nazwa techniczna | to-auth |
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

Jedna spokojna powierzchnia publiczna z czytelnym panelem formularza; brak marketingowego hero i efektu glass.

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

- wariant logowania, rejestracji, MFA, resetu i zaproszenia
- light/dark bez zmiany geometrii
- panel 380–440 px desktop, pełna szerokość z gutterem mobile
- publiczny topbar nie resetuje formularza

## Warianty wymagane przez katalog

- tło logowania
- tło rejestracji
- tło MFA
- tło resetu hasła
- tło zaproszenia
- wariant light
- wariant dark
- wariant mobile.

## Tokeny

`--pd-canvas`, `--pd-surface-1`, `--pd-surface-2`, `--pd-surface-3`, `--pd-border-subtle`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`.

## Responsywność

Powierzchnia nie ma stałej wysokości zależnej od desktopu. Na compact zachowuje priorytet zadania, na medium redukuje elementy drugorzędne, a na wide nie rozciąga tekstu formularzy i opisów ponad czytelną szerokość.

## Dostępność

Powierzchnia nie jest automatycznie landmarkiem. Landmark wynika z rzeczywistej roli i ma nazwę. Tło, gradient ani tekstura nie mogą obniżyć kontrastu lub utrudnić widoczności focus ring.

## Storybook i odbiór

Wymagane: light, dark, desktop, tablet, mobile, zoom 200%, high content density, empty/error oraz porównanie z antyprzykładem. Kryterium odbioru stanowi brak utraty funkcji i brak dekoracyjnych wrapperów bez odpowiedzialności.
