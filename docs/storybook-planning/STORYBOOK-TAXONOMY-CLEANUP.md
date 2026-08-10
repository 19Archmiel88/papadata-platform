# Storybook Taxonomy Cleanup — 2026-08-10

## Decyzja

Na podstawie akceptacji właściciela produktu aktywny Storybook nie pokazuje już niezaakceptowanych sekcji `10 Komponenty` i `20 Powłoka`.

## Co zostało usunięte z aktywnej nawigacji Storybooka

- `10 Komponenty/*` — legacy stories wyłączone przez zmianę rozszerzenia na `.stories.tsx.disabled`.
- `20 Powłoka/OverlayRoot i system warstw` — story wyłączone przez zmianę rozszerzenia na `.stories.tsx.disabled`.
- Sekcje `10` i `20` usunięte z `storybook-contract.json` oraz `catalog.generated.ts`.

## Co zostało zachowane

Nie skasowano runtime source komponentów. Zachowano komponenty jako kod produkcyjny/design-systemowy, a usunięto jedynie ich niezaakceptowane ekspozycje w Storybooku.

## Co przeniesiono do 00 Fundamenty

- `PapaDataBrand` → `00 Fundamenty/Marka`
- `Icon` → `00 Fundamenty/Ikony`
- `Button` / `TextAction` / `LinkAction` / `IconButton` → `00 Fundamenty/Przyciski i akcje`
- `FormFields` → `00 Fundamenty/Pola tekstowe i formularzowe`

## Docelowa kolejność widoczna w Storybooku

1. `00 Fundamenty`
2. `05 Laboratorium decyzji`
3. `15 Wykresy i dane`
4. `18 Wzorce interfejsu`

## Zakres poza tym patchem

- global light canvas,
- docelowe powierzchnie i głębia,
- PL/EN i martwe controls,
- focus polish,
- overflow audit,
- przebudowa albo usunięcie normatywnych dokumentów sekcji produktowej `20`.
