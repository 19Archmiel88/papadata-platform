---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-GOV-039
updated_at: 2026-07-30T20:56:00+02:00
status: approved-target
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# 39. Raport zależności i licencji

Data audytu: 2026-07-30
Branch: `docs/docelowa-dokumentacja-1-0`
Zakres: bezpośrednie zależności z `package.json` w root oraz `apps/web/package.json`, z weryfikacją wersji i pól `license` na podstawie `pnpm-lock.yaml` oraz zainstalowanych manifestów w `node_modules`.

## Decyzje bazowe

- Nie instalujemy teraz nowych bibliotek.
- Obecne zależności na licencjach `MIT` i `Apache-2.0` są zaakceptowane.
- `@fontsource/inter` i `@fontsource/jetbrains-mono` na `OFL-1.1` są dopuszczone, ale wymagają świadomej akceptacji licencji fontowej.
- Każda nowa biblioteka wymaga osobnej decyzji przed instalacją.

## Package manager i lockfile

- Package manager: `pnpm@10.29.3`
- Lockfile: `pnpm-lock.yaml`
- `lockfileVersion`: `9.0`
- `node_modules`: istnieje
- `engines.node`: `24.18.0`
- Lokalny `node -v`: `v24.18.0`
- Zgodność lokalnego Node z `engines.node`: zgodna
- Komenda instalacji awaryjnej, gdyby trzeba było odtworzyć środowisko: `pnpm install --frozen-lockfile`

## Liczba zależności

| Manifest | dependencies | devDependencies |
| --- | ---: | ---: |
| `package.json` | 0 | 2 |
| `apps/web/package.json` | 4 | 10 |
| Suma wpisów | 4 | 12 |

Uwagi:
- Liczba unikalnych pakietów w audytowanym zakresie: 15.
- `typescript` występuje w root i w `apps/web`.

## Tabela bibliotek runtime

| Pakiet | Manifest | Specyfikator | Wersja zainstalowana | Licencja | Status | Uwagi |
| --- | --- | --- | --- | --- | --- | --- |
| `@fontsource/inter` | `apps/web/package.json` | `^5.3.0` | `5.3.0` | `OFL-1.1` | wymaga weryfikacji | Licencja fontowa, nie copyleft, ale ma odrębne warunki dla fontów i ich dystrybucji. |
| `@fontsource/jetbrains-mono` | `apps/web/package.json` | `^5.3.0` | `5.3.0` | `OFL-1.1` | wymaga weryfikacji | Jak wyżej; dotyczy osadzenia i redystrybucji plików fontów. |
| `react` | `apps/web/package.json` | `^19.2.8` | `19.2.8` | `MIT` | OK | Standardowa licencja permisywna. |
| `react-dom` | `apps/web/package.json` | `^19.2.8` | `19.2.8` | `MIT` | OK | Standardowa licencja permisywna. |

## Tabela bibliotek dev

| Pakiet | Manifest | Specyfikator | Wersja zainstalowana | Licencja | Status | Uwagi |
| --- | --- | --- | --- | --- | --- | --- |
| `turbo` | `package.json` | `2.10.5` | `2.10.5` | `MIT` | OK | Narzędzie build orchestration. |
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
| `vite` | `apps/web/package.json` | `^8.1.5` | `8.1.5` | `MIT` | OK | Narzędzie build/dev server. |

## Licencje

Bezpośrednie pakiety w audytowanym zakresie korzystają z następujących licencji:

| Licencja | Pakiety |
| --- | --- |
| `MIT` | `react`, `react-dom`, `turbo`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/react-vite`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `storybook`, `vite` |
| `Apache-2.0` | `typescript` |
| `OFL-1.1` | `@fontsource/inter`, `@fontsource/jetbrains-mono` |

## Wynik skanu ryzyk licencyjnych

- Nie wykryto bezpośrednich pakietów na licencjach `GPL`, `AGPL`, `LGPL`, `SSPL` ani `BUSL`.
- Nie wykryto pakietów oznaczonych jako `enterprise`, `commercial` albo `trial` w audytowanym zakresie bezpośrednich zależności.
- Dodatkowy skan zainstalowanego drzewa `pnpm` wykrył `0` pakietów z licencjami `GPL/AGPL/LGPL/SSPL/BUSL` wśród `686` unikalnych zainstalowanych pakietów.
- Dodatkowy skan zainstalowanego drzewa `pnpm` nie wykrył słów kluczowych `enterprise/commercial/trial` w polach `name`, `description`, `license`, `homepage` dla tych samych `686` pakietów.

## Ryzyka

- `@fontsource/inter` oraz `@fontsource/jetbrains-mono` są na licencji `OFL-1.1`, czyli nie są problemem copyleft, ale wymagają świadomej akceptacji zasad licencji fontowej.
- Audyt tabelaryczny obejmuje bezpośrednie zależności z root i `apps/web`. Przy dodawaniu nowych pakietów trzeba wykonywać ten sam przegląd dla pakietu i jego licencji przed instalacją.
- Skan słów kluczowych `enterprise/commercial/trial` ma charakter pomocniczy. Brak trafień nie jest formalną opinią prawną; oznacza tylko brak oczywistych sygnałów w metadanych npm.

## Rekomendacje

- Zostawić obecne pakiety na `MIT` i `Apache-2.0`: `react`, `react-dom`, `turbo`, `typescript`, pakiety `storybook`, pakiety `@types/*`, `@vitejs/plugin-react`, `vite`.
- Zostawić `@fontsource/inter` i `@fontsource/jetbrains-mono` tylko pod warunkiem akceptacji licencji `OFL-1.1` dla fontów samohostowanych.
- Nie dodawać nowych pakietów na licencjach `GPL`, `AGPL`, `LGPL`, `SSPL`, `BUSL`, `Elastic-2.0`, `Commons Clause`, `Polyform`, ani pakietów z `commercial`, `enterprise`, `trial` lub `EULA/custom license`, bez osobnej decyzji.
- Dla każdej nowej biblioteki wymagać przed instalacją: nazwy pakietu, wersji, licencji, linku do repozytorium oraz krótkiej noty o modelu komercyjnym.
- Jeżeli środowisko trzeba będzie odtworzyć, używać `pnpm install --frozen-lockfile`, żeby nie przesunąć wersji poza aktualny lockfile.

## Lista bibliotek, których nie wolno instalować bez decyzji

Aktualnie w audytowanym zakresie nie ma bezpośrednich pakietów oznaczonych jako `blokada do decyzji`.

Bez osobnej decyzji nie wolno instalować żadnych nowych pakietów, jeżeli:

- ich licencja to `GPL`, `AGPL`, `LGPL`, `SSPL`, `BUSL` albo inna licencja copyleft lub source-available z ograniczeniami dystrybucji;
- są oznaczone jako `commercial`, `enterprise`, `trial`, `EULA`, `custom license`;
- nie mają jednoznacznego pola `license`;
- dotyczą fontów lub assetów z odrębną licencją, jeżeli nie została zaakceptowana polityka ich dystrybucji.

## Konkluzja

Stan na 2026-07-30:

- `pnpm` i `pnpm-lock.yaml` są obecne i spójne z repo.
- `node_modules` istnieje, więc instalacja nie jest teraz wymagana.
- W audytowanych bezpośrednich zależnościach nie ma pakietów `GPL/AGPL/LGPL/SSPL/BUSL`.
- Jedyny obszar wymagający dodatkowej decyzji operacyjnej to pakiety fontowe na `OFL-1.1`.
