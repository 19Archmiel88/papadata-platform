---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-GOV-039
updated_at: 2026-07-30T20:56:00+02:00
status: approved-target
---

# 39. Raport zaleznosci i licencji

Data audytu: 2026-07-30
Branch: `docs/docelowa-dokumentacja-1-0`
Zakres: bezposrednie zaleznosci z `package.json` w root oraz `apps/web/package.json`, z weryfikacja wersji i pol `license` na podstawie `pnpm-lock.yaml` oraz zainstalowanych manifestow w `node_modules`.

## Decyzje bazowe

- Nie instalujemy teraz nowych bibliotek.
- Obecne zaleznosci na licencjach `MIT` i `Apache-2.0` sa zaakceptowane.
- `@fontsource/inter` i `@fontsource/jetbrains-mono` na `OFL-1.1` sa dopuszczone, ale wymagaja swiadomej akceptacji licencji fontowej.
- Kazda nowa biblioteka wymaga osobnej decyzji przed instalacja.

## Package manager i lockfile

- Package manager: `pnpm@10.29.3`
- Lockfile: `pnpm-lock.yaml`
- `lockfileVersion`: `9.0`
- `node_modules`: istnieje
- `engines.node`: `24.18.0`
- Lokalny `node -v`: `v24.18.0`
- Zgodnosc lokalnego Node z `engines.node`: zgodna
- Komenda instalacji awaryjnej, gdyby trzeba bylo odtworzyc srodowisko: `pnpm install --frozen-lockfile`

## Liczba zaleznosci

| Manifest | dependencies | devDependencies |
| --- | ---: | ---: |
| `package.json` | 0 | 2 |
| `apps/web/package.json` | 4 | 10 |
| Suma wpisow | 4 | 12 |

Uwagi:
- Liczba unikalnych pakietow w audytowanym zakresie: 15.
- `typescript` wystepuje w root i w `apps/web`.

## Tabela bibliotek runtime

| Pakiet | Manifest | Specyfikator | Wersja zainstalowana | Licencja | Status | Uwagi |
| --- | --- | --- | --- | --- | --- | --- |
| `@fontsource/inter` | `apps/web/package.json` | `^5.3.0` | `5.3.0` | `OFL-1.1` | wymaga weryfikacji | Licencja fontowa, nie copyleft, ale ma odrebne warunki dla fontow i ich dystrybucji. |
| `@fontsource/jetbrains-mono` | `apps/web/package.json` | `^5.3.0` | `5.3.0` | `OFL-1.1` | wymaga weryfikacji | Jak wyzej; dotyczy osadzenia i redystrybucji plikow fontow. |
| `react` | `apps/web/package.json` | `^19.2.8` | `19.2.8` | `MIT` | OK | Standardowa licencja permisywna. |
| `react-dom` | `apps/web/package.json` | `^19.2.8` | `19.2.8` | `MIT` | OK | Standardowa licencja permisywna. |

## Tabela bibliotek dev

| Pakiet | Manifest | Specyfikator | Wersja zainstalowana | Licencja | Status | Uwagi |
| --- | --- | --- | --- | --- | --- | --- |
| `turbo` | `package.json` | `2.10.5` | `2.10.5` | `MIT` | OK | Narzedzie build orchestration. |
| `typescript` | `package.json` | `~6.0.3` | `6.0.3` | `Apache-2.0` | OK | Licencja permisywna. |
| `@storybook/addon-a11y` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source addon Storybook. |
| `@storybook/addon-docs` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source addon Storybook. |
| `@storybook/react-vite` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source integracja Storybook + React + Vite. |
| `@types/node` | `apps/web/package.json` | `^24.13.3` | `24.13.3` | `MIT` | OK | Typy DefinitelyTyped. |
| `@types/react` | `apps/web/package.json` | `^19.2.17` | `19.2.17` | `MIT` | OK | Typy DefinitelyTyped. |
| `@types/react-dom` | `apps/web/package.json` | `^19.2.3` | `19.2.3` | `MIT` | OK | Typy DefinitelyTyped. |
| `@vitejs/plugin-react` | `apps/web/package.json` | `^6.0.4` | `6.0.4` | `MIT` | OK | Plugin Vite dla React. |
| `storybook` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source core Storybook. |
| `typescript` | `apps/web/package.json` | `~6.0.3` | `6.0.3` | `Apache-2.0` | OK | Ten sam pakiet co w root. |
| `vite` | `apps/web/package.json` | `^8.1.5` | `8.1.5` | `MIT` | OK | Narzedzie build/dev server. |

## Licencje

Bezposrednie pakiety w audytowanym zakresie korzystaja z nastepujacych licencji:

| Licencja | Pakiety |
| --- | --- |
| `MIT` | `react`, `react-dom`, `turbo`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/react-vite`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `storybook`, `vite` |
| `Apache-2.0` | `typescript` |
| `OFL-1.1` | `@fontsource/inter`, `@fontsource/jetbrains-mono` |

## Wynik skanu ryzyk licencyjnych

- Nie wykryto bezposrednich pakietow na licencjach `GPL`, `AGPL`, `LGPL`, `SSPL` ani `BUSL`.
- Nie wykryto pakietow oznaczonych jako `enterprise`, `commercial` albo `trial` w audytowanym zakresie bezposrednich zaleznosci.
- Dodatkowy skan zainstalowanego drzewa `pnpm` wykryl `0` pakietow z licencjami `GPL/AGPL/LGPL/SSPL/BUSL` wsrod `686` unikalnych zainstalowanych pakietow.
- Dodatkowy skan zainstalowanego drzewa `pnpm` nie wykryl slow kluczowych `enterprise/commercial/trial` w polach `name`, `description`, `license`, `homepage` dla tych samych `686` pakietow.

## Ryzyka

- `@fontsource/inter` oraz `@fontsource/jetbrains-mono` sa na licencji `OFL-1.1`, czyli nie sa problemem copyleft, ale wymagaja swiadomej akceptacji zasad licencji fontowej.
- Audyt tabelaryczny obejmuje bezposrednie zaleznosci z root i `apps/web`. Przy dodawaniu nowych pakietow trzeba wykonywac ten sam przeglad dla pakietu i jego licencji przed instalacja.
- Skan slow kluczowych `enterprise/commercial/trial` ma charakter pomocniczy. Brak trafien nie jest formalna opinia prawna; oznacza tylko brak oczywistych sygnalow w metadanych npm.

## Rekomendacje

- Zostawic obecne pakiety na `MIT` i `Apache-2.0`: `react`, `react-dom`, `turbo`, `typescript`, pakiety `storybook`, pakiety `@types/*`, `@vitejs/plugin-react`, `vite`.
- Zostawic `@fontsource/inter` i `@fontsource/jetbrains-mono` tylko pod warunkiem akceptacji licencji `OFL-1.1` dla fontow samohostowanych.
- Nie dodawac nowych pakietow na licencjach `GPL`, `AGPL`, `LGPL`, `SSPL`, `BUSL`, `Elastic-2.0`, `Commons Clause`, `Polyform`, ani pakietow z `commercial`, `enterprise`, `trial` lub `EULA/custom license`, bez osobnej decyzji.
- Dla kazdej nowej biblioteki wymagac przed instalacja: nazwy pakietu, wersji, licencji, linku do repozytorium oraz krotkiej noty o modelu komercyjnym.
- Jezeli srodowisko trzeba bedzie odtworzyc, uzywac `pnpm install --frozen-lockfile`, zeby nie przesunac wersji poza aktualny lockfile.

## Lista bibliotek, ktorych nie wolno instalowac bez decyzji

Aktualnie w audytowanym zakresie nie ma bezposrednich pakietow oznaczonych jako `blokada do decyzji`.

Bez osobnej decyzji nie wolno instalowac zadnych nowych pakietow, jezeli:

- ich licencja to `GPL`, `AGPL`, `LGPL`, `SSPL`, `BUSL` albo inna licencja copyleft lub source-available z ograniczeniami dystrybucji;
- sa oznaczone jako `commercial`, `enterprise`, `trial`, `EULA`, `custom license`;
- nie maja jednoznacznego pola `license`;
- dotycza fontow lub assetow z odrebna licencja, jezeli nie zostala zaakceptowana polityka ich dystrybucji.

## Konkluzja

Stan na 2026-07-30:

- `pnpm` i `pnpm-lock.yaml` sa obecne i spojne z repo.
- `node_modules` istnieje, wiec instalacja nie jest teraz wymagana.
- W audytowanych bezposrednich zaleznosciach nie ma pakietow `GPL/AGPL/LGPL/SSPL/BUSL`.
- Jedyny obszar wymagajacy dodatkowej decyzji operacyjnej to pakiety fontowe na `OFL-1.1`.
