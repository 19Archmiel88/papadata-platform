---
version: 1.1
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-SURFACE-05-05
status: approved-target
updated_at: 2026-08-17T05:00:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Gradienty, światło i szkło — Dark Crystal Shell

## Decyzja nadrzędna 2026-08-17

Starszy zakaz glass / blur / glow / halo na AppShell jest **historyczny i nie obowiązuje**. Aktualnym kontraktem jest **Dark Crystal Shell**.

Dark Crystal obejmuje zawsze:

- Topbar authenticated,
- Sidebar / rail,
- WorkspaceSwitcher overlay,
- Calendar należący do shella,
- Account Panel,
- Notification Center,
- pozostałe shell-owned menu/popover/anchored overlays.

Obszary te pozostają ciemne niezależnie od motywu workspace. Jasny motyw dashboardu nie zmienia shella ani jego overlayów na jasne powierzchnie.

## Dozwolone środki

Dozwolone są kontrolowane:

- częściowa przezroczystość powierzchni,
- `backdrop-filter` / blur,
- refrakcyjne hairline borders,
- subtelne wewnętrzne refleksy,
- gradienty wynikające ze wspólnego kontraktu shella,
- techniczny cień i warstwowanie,
- lokalny ambient/glow o niskiej intensywności, jeżeli wzmacnia hierarchię i nie imituje neonowego efektu.

## Ograniczenia

- efekt nie może obniżać kontrastu tekstu, focus ring ani czytelności danych;
- nie tworzymy osobnych prywatnych palet crystal dla każdego komponentu;
- wszystkie shell-owned powierzchnie korzystają ze wspólnych tokenów `--pd-shell-*` i semantycznych aliasów;
- glow/gradient nie może kodować stanu, który nie posiada tekstowego lub strukturalnego odpowiednika;
- nie używamy intensywnego „gamingowego” neon glow;
- workspace pozostaje niezależną warstwą light/dark i nie dziedziczy na siłę tokenów Dark Crystal;
- Calendar, Account Panel i Notifications nie mogą przełączać `color-scheme` na light wewnątrz Dark Crystal.

## Geometria i głębia

Krystaliczność nie zmienia semantyki warstw. Sticky shell, popover, modal, toast i sidecar nadal mają jawny layer owner i działają przez system OverlayRoot. Cień i blur nie zastępują z-index/focus management.

## Responsive

Dark Crystal zachowuje tę samą rodzinę wizualną na desktop/tablet/mobile. Przy małej szerokości zmienia się geometria i szerokość warstwy, nie jej semantyczny motyw.

## Storybook i odbiór

Wymagane są co najmniej:

- authenticated Topbar light-workspace + dark-workspace,
- Account Panel,
- Notification Center z read/unread/snoozed,
- Calendar w jasnym workspace pozostający Dark Crystal,
- Sidebar expanded i rail,
- mobile,
- podstawowy keyboard/focus,
- brak poziomego overflow.

Historyczne stories i copy opisujące bezwzględny zakaz glass/blur/glow należy traktować jako nieaktualne i zsynchronizować z niniejszą decyzją.
