# Zasady dla generowanych katalogów Storybooka

## Pliki generowane

- `apps/web/src/storybook-next/catalog/catalog.generated.ts`
- `apps/web/src/storybook-next/storybook-contract.json`
- `apps/web/src/storybook-next/storybook-taxonomy-map.json`

## Reguły

- Nie edytuj ręcznie katalogu wygenerowanego, jeżeli istnieje skrypt generujący dany zakres.
- Po zmianie story uruchom check katalogu Storybooka.
- Po zmianie rejestrów sprawdź zgodność ID, pliku story i statusów.
- W diffie generowanych plików musi być jasne, który story albo dokument spowodował zmianę.
- Plik generowany nie może ukrywać braku wpisu w rejestrze źródłowym.
