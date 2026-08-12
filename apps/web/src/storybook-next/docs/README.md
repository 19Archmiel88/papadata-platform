# Storybook Next Docs

Ten katalog jest lokalnym miejscem na dokumentację wykonawczą Storybooka dla `apps/web/src/storybook-next`.

Źródłem prawdy dla zakresu i statusów pozostają:

- `apps/web/src/storybook-next/storybook-contract.json`;
- `apps/web/src/storybook-next/storybook-taxonomy-map.json`;
- `rejestry/storybook.csv`;
- dokumenty w `docs/specyfikacja-docelowa/`.

Nie dodajemy tu osobnego katalogu statusów ani drugiego planu komponentów. Pliki w tym katalogu mogą tylko wyjaśniać lokalne decyzje implementacyjne Storybooka i muszą linkować do aktywnego kontraktu lub rejestru.

Fixtures wykonawcze Storybooka są kanonicznie przechowywane w `fixtures/storybook/`. Katalog `apps/web/src/storybook-next/docs/` nie przejmuje fixtures i nie tworzy ich lokalnej kopii; może tylko opisywać, które aktywne story konsumuje dany plik fixture.
