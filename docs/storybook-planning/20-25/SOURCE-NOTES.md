# Source notes

Paczka wykorzystuje istniejącą taksonomię i kontrakty snapshotu projektu.

## Sekcja 20 - źródłowe wpisy

Aktualny Storybook contract definiuje:

- 20.01 AppShell
- 20.02 Topbar publiczny
- 20.03 Topbar zalogowany
- 20.04 Sidebar
- 20.05 Sidebar - warianty
- 20.06 Workspace switcher
- 20.07 Global search i Command Palette
- 20.08 Powiadomienia
- 20.09 Centrum operacji w tle
- 20.10 OverlayRoot i system warstw
- 20.11 Powłoka mobilna

Istnieją odpowiadające dokumenty w `docs/specyfikacja-docelowa/06-powloka-produktu-i-nawigacja/`.

## Sekcja 25 - źródłowe wpisy

Aktualny Storybook contract definiuje:

- 25.01 Wejście do Auth
- 25.02 Logowanie
- 25.03 Rejestracja
- 25.04 Zaproszenie
- 25.05 Weryfikacja e-mail
- 25.06 Identyfikacja firmy
- 25.07 MFA
- 25.08 Odzyskiwanie dostępu
- 25.09 Rozwiązanie kontekstu dostępu
- 25.10 Onboarding

Mapowanie FSM oparto na `docs/specyfikacja-docelowa/03-dostep-rejestracja-onboarding/auth-fsm-wykonawczy.md` oraz kontrakcie identity/auth API. Rekomendowane granice ownership są wynikiem audytu i nie są mechanicznym przepisaniem istniejącej dokumentacji.
