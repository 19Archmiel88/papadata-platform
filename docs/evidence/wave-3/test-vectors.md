# Test Vectors

Pokryte wektory:

- brak rekordów -> `NO_DATA`, bez zera;
- jawne zero -> `zeroEvidenceFields`;
- brak required field -> DataIssue i `INVALID`;
- nieprawidłowy typ liczby -> DataIssue i `INVALID`;
- nieznana waluta -> blokada agregacji finansowej;
- nieznany status -> `PARTIAL`;
- duplikat biznesowy -> jeden `CanonicalOrder`, `EXCLUDED` lineage;
- ten sam external ID w dwóch workspace -> dwa odrębne canonical facts;
- financial integrity poza tolerancją -> `INVALID`;
- reprocess tej samej wersji -> brak dodatkowego wkładu kanonicznego;
- deletion ledger verified -> restore respektuje ledger.

Implementacja testów:

- `dataQualityVectors.unit.test.ts`;
- `localDataQualityRuntime.integration.test.ts`;
- `dataQualityIsolation.security.test.ts`.
