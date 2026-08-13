# Checklist przed nowym ekranem produkcyjnym

Ekran produkcyjny nie może wyprzedzać komponentów, kontraktów danych i wariantów Storybooka.

- [ ] Istnieje dokument specyfikacji docelowej ekranu.
- [ ] Istnieje story dla ekranu albo dla jego głównych stanów.
- [ ] Wszystkie komponenty użyte na ekranie mają właściciela w Storybooku lub runtime API.
- [ ] Ekran używa BFF/API przez istniejący klient lub jawnie opisany kontrakt danych.
- [ ] Fixtures Storybooka i fixtures API pokazują te same kategorie danych.
- [ ] Routing runtime jest zgodny z `rejestry/routes.csv`.
- [ ] Ekran ma stany loading, empty, error, no access i degraded data, jeżeli domena tego wymaga.
- [ ] Ekran nie wprowadza lokalnej palety, lokalnego systemu spacingu ani równoległych CTA.
- [ ] Storybook renderuje wariant desktop, tablet i mobile bez poziomego overflow.
- [ ] Test techniczny nie jest traktowany jako właścicielska akceptacja UI.
