# Ownership i handoff - sekcje 20 i 25

## Mapa odpowiedzialności

| Problem | Owner docelowy | Nie może być drugim ownerem |
| --- | --- | --- |
| canvas Auth | 05.01 jako zaakceptowana decyzja powierzchni | 25 nie definiuje nowych tokenów/canvasu |
| produkcyjne powierzchnie Auth | 25 | 05.01 |
| canvas aplikacji | 05.02 jako decision record | 20.01 nie utrzymuje drugiego eksperymentu |
| produkcyjny AppShell | 20.01 | 05.02 |
| komponenty bazowe | 10 | 20, 25 |
| wykresy/KPI | 15 | 20, 25 |
| wzorce empty/error/loading/form/table | 18 | 20, 25 |
| global navigation IA | 20.04 | 20.05 |
| sidebar geometry/state machine | 20.05 | 20.04 |
| access resolution przy wejściu | 25.09 | 20.06 |
| workspace switching w aplikacji | 20.06 | 25.09 |
| single async operation pattern | 18.03 | 20.09 |
| global operation center | 20.09 | 18.03 |
| panel/detail/evidence pattern | 18.07 | 20.10 |
| overlay orchestration/root | 20.10 | 18.07 / Dialog / Drawer |
| public chrome | 20.02 | 25 |
| treść i flow Auth | 25 | 20.02 |

## Handoff z Laboratorium

### 05.01 -> 25

05.01 zachowuje decyzje:

- spokojny publiczny canvas;
- brak marketingowego hero;
- brak glass/glow;
- jedna dominująca akcja;
- formularz bez dekoracyjnej karty;
- reprezentatywne zachowanie light/dark.

25 przejmuje:

- prawdziwe auth surfaces;
- przejścia FSM;
- loading/error/blocked wynikające z operacji;
- rzeczywiste składy formularzy;
- mobile/tablet powierzchni Auth;
- routing i state preservation.

Po akceptacji 25, 05.01 nie może być używane jako referencja dla treści formularza lub flow.

### 05.02 -> 20

05.02 zachowuje decyzje:

- jeden canvas;
- content region jako właściciel scrolla;
- sidebar/topbar jako stabilna powłoka;
- panel Papa jako overlay;
- brak glass/blur/glow na sticky chrome;
- analityczny content może być szeroki, formularz kontrolowany.

20 przejmuje:

- publiczne API AppShell;
- realną nawigację;
- workspace/search/notifications/background operations;
- overlay root;
- mobile shell;
- pełną integrację globalnych regionów.

Po akceptacji 20.01 `05.02` jest wyłącznie decision record.

## Handoff z 18 do 20

`18` dostarcza wzorce; `20` umieszcza je w shellu.

Przykłady:

- `18.03` async operation -> `20.09` global operation center;
- `18.07` detail/evidence/recommendation layer -> osadzanie przez `20.10 OverlayRoot`;
- `18.02` empty/error/no-access -> shell/module states bez tworzenia lokalnych komponentów;
- `18.06` approval/step-up -> `25.09` reauthentication/step-up composition.

## Handoff 20 -> 25

25 powinno konsumować:

- `20.02 Public Topbar` na publicznych powierzchniach;
- `20.01 AppShell` po zakończeniu access resolution;
- `20.06 Workspace Switcher` dopiero po wejściu do aplikacji;
- `20.10 OverlayRoot` jeśli onboarding wymaga modal/drawer/popover;
- `20.11` reguły mobilnej powłoki, gdy powierzchnia jest już w AppShell.

25 nie może implementować prywatnej wersji żadnego z tych elementów.
