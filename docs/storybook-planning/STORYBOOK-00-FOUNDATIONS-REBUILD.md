# Storybook 00 Fundamenty — audit i przebudowa

Status: wdrożone technicznie, do oceny wizualnej właściciela produktu.

## Zakres

Przebudowa dotyczy wyłącznie aktywnej sekcji `00 Fundamenty`:

- `01 Fundamenty wizualne`
- `02 Powierzchnie i komunikaty`
- `03 Marka`
- `04 Ikony`
- `05 Akcje i wejścia / Przyciski i akcje`
- `05 Akcje i wejścia / Pola tekstowe i formularzowe`

Sekcje `15 Wykresy i dane` oraz `18 Wzorce interfejsu` pozostają kolejnymi etapami. `00` definiuje język systemu, ale nie przejmuje runtime komponentów analitycznych ani pełnych wzorców produktowych.

## Audit

1. `00.16-00.20` miały nowe stories, ale kontrakt i katalog nadal wskazywały stare angielskie eksporty: `SurfaceHierarchy`, `InlineNotice`, `StatusBadgeStory`, `EmptyErrorBlockedStates`.
2. Publiczny słownik komunikatów używał jeszcze `danger`; w `00` publicznym tonem statusowym jest `critical`. `danger` zostaje wyłącznie nazwą wariantu destrukcyjnej akcji w `Button`.
3. Część bazowych stories przeniesionych z dawnej sekcji `10` nie pokazywała jawnie aktywnego motywu i języka.
4. `Ikony` mieszały polskie etykiety bez znaków diakrytycznych z angielskimi nazwami kategorii.
5. Przełączenie PL/EN mogło wizualnie działać częściowo, ale play testy nadal zakładały polskie etykiety.

## Decyzje

1. Każda story w `00` pokazuje w meta aktywny `Motyw/Theme` i `Język/Language`.
2. `Podstawy` i `Powierzchnie i komunikaty` są warstwą reguł: tokeny, role, powierzchnie, statusy, komunikaty i stany.
3. `00.12 Marka`, `00.13 Ikony`, `00.14 Przyciski i akcje` i `00.15 Pola formularzy` są widocznymi owners bazowych elementów, ale runtime API pozostaje w `apps/web/src/design-system`.
4. `critical` jest publicznym tonem statusowym. `danger` nie jest publicznym tonem komunikatu ani statusu w `00`.
5. Stories muszą renderować copy zależne od globalnego `locale`, a testy play muszą używać tych samych nazw dostępności.
6. `00.14 Przyciski i akcje` jest źródłem zasad dla decyzji akcyjnych: `Button` wykonuje komendę pierwszoplanową, `TextAction` komendę w treści, `LinkAction` nawigację, a `IconButton` komendę ikonową z jawną etykietą.

## Następne etapy

1. `15 Wykresy i dane` powinno konsumować kolory danych, statusy, powierzchnie i akcje z `00`, bez lokalnego słownika tonów, chrome albo przycisków.
2. `18 Wzorce interfejsu` powinno pokazywać kompozycje produktowe: sidecar, toast, rekomendacje, loading, empty/error/no access, tabele i grupy akcji jako wzorce, nie jako nowe fundamenty.
3. Jeżeli w `15` lub `18` pojawi się potrzeba nowego tonu, powierzchni albo reguły ruchu, decyzja wraca do `00`.
