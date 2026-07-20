# Reprocessing

Reprocessing jest nowym jobem `ReprocessJob`.

Wymagane pola:

- tenant/workspace;
- dataset;
- range;
- reason;
- requestedBy;
- source i target rule versions;
- idempotency key;
- status;
- impact report ref.

Reprocessing nie nadpisuje po cichu poprzedniej wersji. Przed publikacją
powstaje `DataImpactReport` old/new z różnicami countów, kwot, readiness,
issues i exclusions.
