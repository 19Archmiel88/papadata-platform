# PapaData Storybook - paczka zakresowa 20 + 25

## Status paczki

To jest paczka zakresowa / projektowa. Nie zawiera mutacji kodu produkcyjnego ani Storybooka.

Paczka została przygotowana na podstawie snapshotu `papadata-platform-audit-20260807-071042` i zakłada wcześniejsze uporządkowanie Source of Truth & Ownership oraz realizację warstwy `15` i `18` przed pełnym zamknięciem `20` i `25`.

## Kolejne dwie sekcje

1. `20 - Powłoka produktu i nawigacja` (`Nawigacja i powłoka aplikacji`)
2. `25 - Dostęp, rejestracja i onboarding - M01` (`Dostęp i onboarding`)

## Dlaczego właśnie te sekcje

`20` jest ostatnią sekcją warstwy wzorców/powłoki przed modułami produktowymi. Ma złożyć zaakceptowane Fundamenty, Komponenty Bazowe i Wzorce Interfejsu w spójną konstrukcję aplikacji, bez ponownego definiowania ich API.

`25` jest pierwszym pełnym modułem ekranowym. Powinien być pierwszym miejscem, w którym publiczny shell, Auth canvas, pola, akcje, komunikaty oraz rzeczywisty Auth FSM są składane w kompletne powierzchnie użytkownika.

## Zasada architektoniczna

- `05.01` pozostaje decyzją o powierzchni/canvasie Auth; `25` jest właścicielem rzeczywistych ekranów i przepływu Auth.
- `05.02` pozostaje decyzją laboratoryjną o canvasie aplikacji; `20.01` jest właścicielem produkcyjnego kontraktu AppShell.
- `18` jest właścicielem wzorców przekrojowych; `20` tylko osadza je w shellu.
- `10` jest właścicielem API komponentów bazowych; `20` i `25` je konsumują.
- `20.10 OverlayRoot` orkiestruje warstwy, ale nie redefiniuje `Dialog`, `Drawer`, `Popover`, `Tooltip` ani paneli z `18`.
- `25` nie tworzy lokalnych wersji `TextField`, `PasswordField`, `VerificationCodeInput`, `Button`, `InlineNotice` ani statusów.
- Storybook dla `25` ma być zgodny z istniejącym Auth FSM `auth-01...auth-29`, a nie z lokalnym, uproszczonym flow.

## Pliki paczki

- `20-POWLOKA-PRODUKTU-I-NAWIGACJA.md` - zakres `20.01-20.11`.
- `25-DOSTEP-REJESTRACJA-ONBOARDING.md` - zakres `25.01-25.10` i mapowanie do Auth FSM.
- `OWNERSHIP-AND-HANDOFF.md` - granice odpowiedzialności względem 05, 10, 15 i 18.
- `IMPLEMENTATION-SEQUENCE.md` - rekomendowana kolejność budowy bez tworzenia równoległych systemów.
- `ACCEPTANCE-GATES.md` - kryteria odbioru technicznego i wizualnego.

## Warunek rozpoczęcia implementacji

Najpierw należy zastosować i zweryfikować `Source of Truth & Ownership Alignment`. Następnie rekomendowana kolejność to `15 -> 18 -> 20 -> 25`.
