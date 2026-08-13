# Indeks fixtures Storybook/API/E2E

## Reguła źródła prawdy

Fixture Storybooka pokazuje stan UI. Fixture API pokazuje kontrakt wejścia/wyjścia. Fixture E2E pokazuje ścieżkę użytkownika. Żaden z tych plików nie zastępuje pozostałych.

## Sekcje aktywne w bieżącym zakresie

| Sekcja | Storybook fixtures | Runtime/API | Cel |
| --- | --- | --- | --- |
| 20 | `fixtures/storybook/114-124-*` | shell data w `apps/web/src/shell/app-shell` | powłoka produktu i nawigacja |
| 25 | `fixtures/storybook/131-*`, `143-*`, `145-*`, `146-*`, `147-*` | Auth surface i routing | dostęp, rejestracja, odzyskiwanie |
| 30 | `fixtures/storybook/154-167-*` | `bffClient` i `CommandCenterScreen` | centrum dowodzenia |
| 31 | `fixtures/storybook/168-174-*` | `bffClient` i `CampaignsScreen` | kampanie płatne |

## Reguły utrzymania

- ID fixture musi odpowiadać ID story albo dokumentu docelowego.
- Nazwa pliku ma zawierać numer sekcji i czytelny slug.
- Dane nie mogą zawierać danych osobowych ani markerów generatora.
- Ten sam stan biznesowy powinien mieć ten sam sens w Storybooku, API i E2E.
- Zmiana kontraktu BFF wymaga przeglądu powiązanych fixtures Storybooka.
