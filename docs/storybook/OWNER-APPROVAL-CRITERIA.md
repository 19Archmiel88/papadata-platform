# Kryteria akceptacji wizualnej właściciela

Test techniczny potwierdza brak wykrytych błędów automatycznych. Akceptacja właścicielska potwierdza, że ekran spełnia oczekiwania produktu, tonu i jakości UI.

## Warunki techniczne przed akceptacją

- Storybook renderuje ekran bez błędów konsoli.
- Browser audit nie wykazuje krytycznych ani poważnych naruszeń axe.
- Widoki desktop, tablet i mobile nie mają poziomego overflow.
- Typecheck i guardy dokumentacyjne przechodzą lokalnie.

## Warunki właścicielskie

- Hierarchia informacji jest zrozumiała bez wyjaśnień autora implementacji.
- CTA są jednoznaczne i nie konkurują semantycznie.
- Statusy danych nie sugerują większej pewności niż wynika z evidence.
- Ekran zachowuje spójność z sekwencją `20 -> 25 -> 30+`.
- Język UI jest spójny z produktem i nie miesza statusów PL/EN bez uzasadnienia.

## Status

`accepted` w Storybooku oznacza techniczne przyjęcie story do katalogu. Nie oznacza automatycznie akceptacji właścicielskiej ekranu produkcyjnego.
