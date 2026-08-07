---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: BrandLockup
---
# BrandLockup

## Cel i odpowiedzialność
`BrandLockup` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Runtime source of truth
Publiczne React API działającego komponentu jest własnością `apps/web/src/design-system/icons/PapaDataBrand.tsx`. Plik `contracts/components/brandlockup.ts` pozostaje kontraktem orkiestracyjnym/specyfikacyjnym dla ekranów i zdarzeń; nie jest kopią React Props.

## Anatomia
brandName; tagline; orientation; size.

## Kontrakt orkiestracyjny TypeScript
Kontrakt orkiestracyjny/specyfikacyjny: `contracts/components/brandlockup.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `brandName` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `tagline` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `orientation` | `'horizontal' | 'vertical'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `size` | `'sm' | 'md' | 'lg'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `30.01` — Widok główny

## Storybook i testy
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje kontrakt orkiestracyjny, a runtime Props kompilują się z implementacją komponentu.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
