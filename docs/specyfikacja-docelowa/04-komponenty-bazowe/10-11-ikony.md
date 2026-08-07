---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-A2B8308E9147
status: accepted
updated_at: 2026-08-06T20:27:00+01:00
---

# Ikony

## Source of truth
`10.11` i runtime `Icon` są jedynym właścicielem pełnego katalogu ikon. `00.09` definiuje wyłącznie reguły języka ikon. `StatusIcon` i `ProviderLogo` nie są wymaganiami tej sekcji; provider branding jest osobną rodziną.

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 10.11 |
| Nazwa polska | Ikony |
| Nazwa techniczna | ikony |
| Typ dokumentu | kontrakt komponentu bazowego |
| Wersja | 1.1 |
| Status kontraktu | accepted |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Komponenty bazowe — M02 |
| Status implementacji | IMPLEMENTED |
| Status Storybooka | `10 Komponenty bazowe/Ikony` → `Ikony` |
| Plik Storybooka | `apps/web/src/design-system/icons/Icon.stories.tsx` |
| Status testów | PASSING — play oraz guard prezentacji |

## Cel i decyzja docelowa

`Icon` jest zamkniętym komponentem ikon systemowych. Ikona nie niesie własnego koloru; dziedziczy `currentColor`, a znaczenie wynika z roli komponentu, statusu lub kontekstu danych.

Story 10.11 używa dokładnie tego samego shellu prezentacyjnego co:

- `00 Fundamenty/Podstawy`;
- `05 Laboratorium decyzji/Tła i powierzchnie`;
- pozostałe zaakceptowane stories sekcji `10 Komponenty bazowe`.

Canvas, typografia, szerokość treści, guttery, rytm sekcji i separatory pochodzą z klas `pd-f0-*`. Story nie definiuje lokalnego `pageStyle`, gradientu canvasu ani własnej drabiny typograficznej strony. Lokalne style mogą służyć wyłącznie do układu próbek ikon wewnątrz `pd-f0-section__content`.

## Publiczny kontrakt

- `name` wybiera ikonę z zamkniętego katalogu;
- `size` przyjmuje `16`, `20` lub `24`;
- `label` nadaje nazwę dostępną ikonie informacyjnej;
- `decorative` ukrywa ikonę przed technologiami asystującymi;
- pozostałe bezpieczne atrybuty SVG są przekazywane bez zmiany geometrii systemowej.

## Geometria

- `viewBox="0 0 24 24"`;
- `strokeWidth="1.75"`;
- zakończenia linii są zaokrąglone;
- kolor jest dziedziczony przez `currentColor`;
- SVG ma `focusable="false"` i nie wchodzi samodzielnie do kolejności Tab.

## Role semantyczne

### Ikona dekoracyjna

- używana obok widocznej etykiety;
- ma `aria-hidden="true"`;
- nie ma `role="img"` ani dostępnej nazwy.

### Ikona informacyjna

- samodzielnie przekazuje znaczenie;
- ma `role="img"`;
- otrzymuje nazwę przez element `<title>` i `aria-labelledby`.

## Rozmiary

- `16 px` — metadane i informacje pomocnicze;
- `20 px` — przyciski, menu, listy i nawigacja;
- `24 px` — nagłówki paneli, landmarki i ważne punkty orientacyjne.

Te trzy rozmiary są demonstrowane wyłącznie przez ownera 10.11. Historie 05 i 15 mogą konsumować `Icon`, ale nie tworzą lokalnej sekcji rozmiarów. Akcje danych używają istniejącej roli `data`, a akcje Papa istniejącej roli `assistant`; widoczna etykieta nadal pozostaje źródłem dostępnej nazwy akcji.

## Katalog

Katalog grupuje ikony według zadania:

- nawigacja;
- analityka;
- integracje;
- operacje;
- status.

Grupa nie zmienia komponentu ani jego geometrii. Kolor grupy jest kontekstem demonstracyjnym opartym na tokenach semantycznych.

## Storybook i testy

Story `Ikony` pokazuje:

1. język ikon i parametry geometrii;
2. role dekoracyjną i informacyjną;
3. rozmiary `16`, `20`, `24`;
4. zamknięty katalog według zadań;
5. light/dark przez global Storybooka;
6. wspólny shell Fundamentów.

Play test sprawdza:

- `focusable="false"`;
- `role="img"` i `aria-labelledby` dla ikony informacyjnej;
- obecność dostępnego `<title>`;
- `stroke="currentColor"`;
- `aria-hidden="true"` i brak roli dla ikony dekoracyjnej;
- szerokości SVG dla rozmiarów `16`, `20`, `24`;
- obecność wszystkich ikon katalogu.

`check-storybook-presentation-contract.mjs` blokuje:

- lokalny `pageStyle`;
- lokalny gradient canvasu;
- brak importu wspólnego CSS Fundamentów;
- brak klas wspólnego shellu `pd-f0-*`.

## Kryteria akceptacji

1. Grafika, geometria, katalog i publiczne API ikon pozostają bez zmian przy korektach prezentacji Storybooka.
2. Tło, typografia i układ strony są identyczne z zaakceptowanym shellem Fundamentów.
3. Znaczenie ikon nie zależy wyłącznie od koloru.
4. Role dekoracyjne i informacyjne zachowują poprawną semantykę.
5. Play, axe, typecheck, build Storybooka i guard prezentacji przechodzą.
