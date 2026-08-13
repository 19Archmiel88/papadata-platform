# Mapa zależności 20 -> 25 -> 30+

## Kolejność produkcji

1. `00` dostarcza fundamenty wizualne, tokeny, semantykę i komponenty bazowe.
2. `20` dostarcza powłokę produktu, nawigację, topbar, sidebar, workspace i globalne operacje.
3. `25` dostarcza Auth, rejestrację, sesję, recovery, MFA i routing chroniony.
4. `30+` może budować prawdziwe ekrany domenowe dopiero po stabilnym `20` i `25`.

## Blokady

- Brak shell `20` blokuje sensowny ekran domenowy.
- Brak Auth `25` blokuje wiarygodny protected route.
- Brak komponentu bazowego blokuje lokalne odtwarzanie tego samego wzorca na ekranie.
- Brak fixture blokuje jawne testowanie stanu danych w Storybooku.

## Bieżący zakres

W bieżącym branchu `20`, aktywne powierzchnie `25`, `30.01-30.13` oraz `31.01-31.06` mają implementację techniczną. Właścicielska akceptacja UI pozostaje osobnym etapem.
