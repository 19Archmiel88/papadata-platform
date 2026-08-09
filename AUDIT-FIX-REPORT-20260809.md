# PapaData — raport poprawek po audycie ZIP

## Status

Paczka zawiera poprawki do błędów P0/P1 znalezionych w audycie UX/UI, kodu i dokumentacji. Lokalny walidator projektu zwraca `PASS / 0 błędów / 0 ostrzeżeń`.

## Zakres napraw

1. Walidacja i manifest
   - przebudowano `MANIFEST.json` na aktualny zestaw stabilnych plików projektu;
   - odświeżono `VALIDATION.json`, `VALIDATION-1.0.json`, `RAPORT-WALIDACJI.md`, `METRYKI-JAKOSCI.json`, `METRYKI-SEKCJI.csv` i `RAPORT-KOMPLETNOSCI-I-JAKOSCI.md`;
   - przebudowano `SHA256SUMS.txt` po wszystkich zmianach.

2. UX/UI mobile
   - ograniczono poziomy overflow dla `DataTable`, `FilterBar`, shelli Storybooka i laboratorium powierzchni danych;
   - mobile Drawer działa jako pełnoekranowa warstwa zamiast prawie pełnoekranowego panelu z widocznym paskiem tła;
   - wzmocniono tło warstwy overlay na mobile.

3. Storybook i design-system
   - zaktualizowano foundation baseline do aktualnego kontraktu Storybooka: 37 aktywnych entry stories i 23 aktywne pliki story;
   - naprawiono przenośność `check-cross-cutting-patterns-v1.mjs` dla paczek ZIP bez katalogu `.git`;
   - usunięto użycie nieistniejącego tokenu CSS `--pd-space-7`.

4. Dokumentacja i rejestry
   - znormalizowano owner/version dla promowanego `ShareChart`;
   - zsynchronizowano konsumentów `ShareChart` z macierzą ekran–komponent;
   - zsynchronizowano stany Storybooka dla 15.05 i 15.06 z fixtures;
   - wdrożone dokumenty 18.* oznaczono jako `review` zamiast `approved-target`, z jawną informacją o braku akceptacji właścicielskiej.

## Zmienione pliki

- `MANIFEST.json`
- `METRYKI-JAKOSCI.json`
- `METRYKI-SEKCJI.csv`
- `RAPORT-KOMPLETNOSCI-I-JAKOSCI.md`
- `RAPORT-WALIDACJI.md`
- `VALIDATION-1.0.json`
- `VALIDATION.json`
- `apps/web/src/design-system/component-system-v1.json`
- `apps/web/src/design-system/components/ComparisonChart/comparison-chart.css`
- `apps/web/src/design-system/components/Data/data.css`
- `apps/web/src/design-system/components/Filters/filters-showcase.css`
- `apps/web/src/design-system/components/Filters/filters.css`
- `apps/web/src/design-system/components/ForecastChart/forecast-chart.css`
- `apps/web/src/design-system/components/OverlayRoot/overlay.css`
- `apps/web/src/storybook-next/presentation/story-presentation.css`
- `apps/web/src/storybook-next/stories/05-surfaces/data-surface-laboratory.css`
- `apps/web/src/storybook-next/stories/15-data-visualizations/share-chart-showcase.css`
- `docs/specyfikacja-docelowa/05-wykresy-i-wizualizacje/15-05-struktura-i-udzial.md`
- `docs/specyfikacja-docelowa/05-wykresy-i-wizualizacje/komponenty/sharechart.md`
- `docs/specyfikacja-docelowa/21-stany-przekrojowe/18-01-uklad-strony-i-sekcji.md`
- `docs/specyfikacja-docelowa/21-stany-przekrojowe/18-02-empty-error-i-no-access.md`
- `docs/specyfikacja-docelowa/21-stany-przekrojowe/18-03-ladowanie-danych-i-operacje-w-tle.md`
- `docs/specyfikacja-docelowa/21-stany-przekrojowe/18-04-tabela-z-filtrami-i-akcjami.md`
- `docs/specyfikacja-docelowa/21-stany-przekrojowe/18-07-panele-szczegolow-dowodow-i-rekomendacji.md`
- `docs/specyfikacja-docelowa/21-stany-przekrojowe/18-08-status-danych-i-readiness.md`
- `docs/specyfikacja-docelowa/21-stany-przekrojowe/18-10-macierz-stanow-przekrojowych.md`
- `rejestry/storybook.csv`
- `scripts/check-cross-cutting-patterns-v1.mjs`

## Weryfikacja wykonana w paczce

```bash
python3 scripts/validate_all.py .
node scripts/check-storybook-catalog.mjs
node scripts/check-storybook-architecture.mjs
node scripts/check-storybook-taxonomy.mjs
node scripts/check-component-system-v1.mjs
node scripts/check-storybook-presentation-contract.mjs
node scripts/check-design-system-ownership.mjs
node scripts/check-analytics-system-v1.mjs
node scripts/check-foundation-system-v1.mjs
node scripts/check-cross-cutting-patterns-v1.mjs
node tools/verify-backend-release-scope.mjs
node tools/verify-backend-security-controls.mjs
sh tools/verify-migration-parity.sh
sha256sum -c SHA256SUMS.txt
```

## Ograniczenie

Pełne `pnpm verify`, `pnpm typecheck`, `pnpm test`, `pnpm build` i przebudowa Storybooka nie zostały wykonane w środowisku audytowym, ponieważ repozytorium wymaga Node 24.18.0 i pnpm 10.29.3. Te komendy trzeba uruchomić po wgraniu paczki do docelowego środowiska projektu.
