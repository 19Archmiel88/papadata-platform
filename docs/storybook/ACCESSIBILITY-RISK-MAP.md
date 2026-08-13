# Mapa ryzyk dostępności podstawowej

| Ryzyko | Minimalny wymóg | Kontrola |
| --- | --- | --- |
| Contrast | Tekst i statusy korzystają z tokenów semantycznych | axe + review tokenów |
| Keyboard | Każda akcja jest osiągalna klawiaturą | play test i review focusu |
| Focus | Widoczny focus na elementach interaktywnych | Storybook responsive review |
| Forms | Label, opis, błąd i required są semantycznie powiązane | play test formularzy |
| ARIA | ARIA tylko tam, gdzie semantyka HTML nie wystarcza | review komponentu |
| Error states | Błąd jest czytelny bez polegania wyłącznie na kolorze | story error/degraded |
| Dynamic updates | Status operacji trafia do właściwego live region | test i review komponentu |
