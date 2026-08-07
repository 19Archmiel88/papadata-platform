# Rekomendowana kolejność implementacji

## Warunek 0

Zastosowane i zweryfikowane `Source of Truth & Ownership Alignment`.

## Warunek 1

Sekcje `15` i `18` mają zaakceptowany minimalny kontrakt komponentów/wzorców, które będą konsumowane przez shell i moduły ekranowe.

## Etap 20A - szkielet shell

1. `20.01 AppShell`
2. `20.02 Topbar publiczny`
3. `20.03 Topbar zalogowany`
4. `20.04 Sidebar`
5. `20.05 Sidebar - warianty`

Po 20A można rozpocząć pełne story ekranowe Auth bez tworzenia tymczasowego public chrome.

## Etap 20B - globalne systemy shell

6. `20.06 Workspace switcher`
7. `20.07 Global search i Command Palette`
8. `20.08 Powiadomienia`
9. `20.09 Centrum operacji w tle`
10. `20.10 OverlayRoot i system warstw`
11. `20.11 Powłoka mobilna`

## Etap 25A - podstawowy Auth

1. `25.01 Wejście do Auth`
2. `25.02 Logowanie`
3. `25.03 Rejestracja`
4. `25.04 Zaproszenie`
5. `25.05 Weryfikacja e-mail`

## Etap 25B - rozszerzony Access

6. `25.06 Identyfikacja firmy`
7. `25.07 MFA`
8. `25.08 Odzyskiwanie dostępu`
9. `25.09 Rozwiązanie kontekstu dostępu`

## Etap 25C - onboarding

10. `25.10 Onboarding`

## Dlaczego nie implementować 25 przed 20A

Bez zaakceptowanego public topbara i granic AppShell, ekran Auth bardzo łatwo zacznie posiadać lokalny chrome. Później trzeba byłoby drugi raz przenosić markę, topbar, theme/language controls i zasady przejścia do aplikacji.

## Dlaczego 20.10 powinno być przed złożonym onboardingiem

Onboarding może potrzebować dialogów, drawerów, pomocy, step-up albo route-backed surfaces. Powinien użyć jednego OverlayRoot zamiast tworzyć lokalny portal/stack.

## Zasada małych zakresów

Realizacja Storybooka powinna nadal odbywać się po jednym story/range naraz. Akceptacja sekcji `20` lub `25` nie oznacza jednego dużego patcha obejmującego wszystkie wpisy jednocześnie.
