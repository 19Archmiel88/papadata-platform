# Quality And Readiness

QualityAssessment Fali 3 obejmuje wymiary:

- completeness;
- freshness;
- schema;
- uniqueness;
- overlap;
- financial integrity;
- currency;
- status mapping;
- lineage.

Readiness jest wynikiem kontraktu, nie flagą UI. Statusy:

- `NO_DATA`;
- `INGESTING`;
- `PARTIAL`;
- `DELAYED`;
- `INVALID`;
- `PROCESSING`;
- `READY`;
- `RESYNC_REQUIRED`;
- `BLOCKED`.

`NO_DATA` nie zwraca zera. `READY` jest lokalne dla konkretnego
tenant/workspace, datasetu, okresu, waluty, strefy i wersji reguł.
